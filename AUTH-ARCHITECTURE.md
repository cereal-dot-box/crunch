# Auth Architecture

## Overview

The authentication system uses two separate mechanisms:
1. **User Authentication** (Browser ↔ Auth Service): Better Auth sessions with HttpOnly cookies
2. **Service Authentication** (Frontend Server ↔ Backend): OAuth2 Client Credentials flow with userId passed as GraphQL variable

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Auth Service (port 4000)                             │
│  - Better Auth for user sessions                                            │
│  - OAuth2 Client Credentials endpoint for service tokens                    │
│  - SQLite: auth-service/data/auth.db                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Service Interaction (Crunch)

```
┌──────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────┐
│  Browser │      │ frontend-retro  │      │     backend     │      │    auth     │
│          │      │  (Nitro SSR)    │      │    (GraphQL)    │      │  (Better    │
│          │      │   port 3000     │      │    port 3001    │      │   Auth)     │
│          │      │                 │      │                 │      │  port 4000  │
└────┬─────┘      └────────┬────────┘      └────────┬────────┘      └──────┬──────┘
     │                     │                        │                      │
     │ 1. Login form       │                        │                      │
     │────────────────────>│                        │                      │
     │                     │                        │                      │
     │                     │ 2. POST /api/auth/sign-in/email               │
     │                     │──────────────────────────────────────────────>│
     │                     │                        │                      │
     │                     │ 3. Set-Cookie: session_token (7 days)         │
     │                     │<──────────────────────────────────────────────│
     │                     │                        │                      │
     │ 4. Set-Cookie forwarded to browser          │                      │
     │<────────────────────│                        │                      │
     │                     │                        │                      │
     │ 5. Page request     │                        │                      │
     │────────────────────>│                        │                      │
     │                     │                        │                      │
     │                     │ 6. getSession() to verify user                │
     │                     │──────────────────────────────────────────────>│
     │                     │<──────────────────────────────────────────────│
     │                     │ userId extracted from session                 │
     │                     │                        │                      │
     │                     │ 7. POST /oauth/token (client credentials)     │
     │                     │──────────────────────────────────────────────>│
     │                     │                        │                      │
     │                     │ 8. { access_token: "service-jwt" }            │
     │                     │<──────────────────────────────────────────────│
     │                     │                        │                      │
     │                     │ 9. GraphQL query with:                        │
     │                     │    - Authorization: Bearer <service-jwt>      │
     │                     │    - variables: { userId: "user-uuid" }       │
     │                     │───────────────────────>│                      │
     │                     │                        │                      │
     │                     │                        │ 10. Verify service JWT
     │                     │                        │     (HS256 shared secret)
     │                     │                        │                      │
     │                     │ 11. Data for userId    │                      │
     │                     │<───────────────────────│                      │
     │                     │                        │                      │
     │ 12. Rendered page   │                        │                      │
     │<────────────────────│                        │                      │
```

## Key Concepts

**User Session vs Service Token:**
- Session cookie (`better-auth.session_token`): Long-lived (7 days), identifies the logged-in user
- Service JWT: Short-lived (1 hour), authenticates the frontend server to the backend

**Why this separation?**
- User sessions are managed by Better Auth - handles login, logout, session revocation
- Service tokens authenticate trusted services (frontend server) to backend
- userId passed explicitly in GraphQL variables - clear, auditable, no token parsing needed

**Security Benefits:**
- Backend never sees user credentials or session cookies
- Service secret never leaves server-side code
- userId is explicit in every request - easy to audit and log
- Service tokens can be cached (1 hour) - minimal auth service calls

## Tokens

| Token | Where | Duration | Purpose |
|-------|-------|----------|---------|
| `session_token` | HttpOnly cookie | 7 days | User authentication (browser ↔ auth) |
| Service JWT | Server memory (cached) | 1 hour | Service authentication (frontend ↔ backend) |

## Auth Service

### User Authentication (Better Auth)

```typescript
// POST /api/auth/sign-in/email
// POST /api/auth/sign-up/email
// POST /api/auth/sign-out
// GET  /api/auth/get-session
```

### Service Authentication (OAuth2 Client Credentials)

```typescript
// POST /oauth/token
app.post('/oauth/token', async (request, reply) => {
  const { grant_type, client_id, client_secret } = request.body

  if (grant_type !== 'client_credentials') {
    return reply.status(400).send({ error: 'unsupported_grant_type' })
  }

  const client = SERVICE_CLIENTS[client_id]
  if (!client || client.secret !== client_secret) {
    return reply.status(401).send({ error: 'invalid_client' })
  }

  // Generate service JWT (HS256)
  const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET)
  const token = await new SignJWT({
    sub: client_id,
    name: client.name,
    type: 'service'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('auth-service')
    .setExpirationTime('1h')
    .sign(secret)

  return reply.send({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 3600
  })
})
```

### Registered Service Clients

```typescript
// auth-service/src/index.ts
const SERVICE_CLIENTS: Record<string, { secret: string; name: string }> = {
  'nitro-frontend': {
    secret: process.env.NITRO_CLIENT_SECRET!,
    name: 'Nitro Frontend Server'
  }
}
```

## Frontend (Nitro SSR)

### Service Token Client

```typescript
// frontend-retro/src/server/service-auth.ts
const AUTH_URL = process.env.VITE_AUTH_URL ?? 'http://localhost:4000'
const CLIENT_ID = 'nitro-frontend'
const CLIENT_SECRET = process.env.NITRO_CLIENT_SECRET

interface TokenCache {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

export async function getServiceToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
    return tokenCache.token
  }

  const response = await fetch(`${AUTH_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get service token')
  }

  const data = await response.json()

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return tokenCache.token
}
```

### GraphQL Client

```typescript
// frontend-retro/src/server/graphql.ts
import { getServiceToken } from './service-auth'

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const serviceToken = await getServiceToken()

  const response = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceToken}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  // ... handle response
}

// Helper to get userId from session
export async function getUserIdFromSession(): Promise<string | null> {
  const request = getRequest()
  const cookieHeader = request?.headers.get('cookie') || ''

  const { data } = await authClient.getSession({
    fetchOptions: { headers: { Cookie: cookieHeader } },
  })

  return data?.user?.id ?? null
}
```

### Server Functions (Example)

```typescript
// frontend-retro/src/server/accounts.ts
export const listAccounts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const data = await graphqlRequest<{ accounts: Account[] }>(`
      query Accounts($userId: ID!) {
        accounts(userId: $userId) {
          id
          name
          bank
          ...
        }
      }
    `, { userId })

    return { accounts: data.accounts }
  })
```

## Backend (GraphQL)

### Service Token Verification

```typescript
// backend/src/lib/jwks.ts
import { jwtVerify } from 'jose'

const AUTH_SECRET = process.env.BETTER_AUTH_SECRET

export interface ServiceTokenPayload {
  sub: string      // client_id (e.g., 'nitro-frontend')
  name: string     // client name
  type: 'service'
}

export async function verifyServiceToken(token: string): Promise<ServiceTokenPayload> {
  if (!AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET not configured')
  }

  const secret = new TextEncoder().encode(AUTH_SECRET)
  const { payload } = await jwtVerify(token, secret, {
    issuer: 'auth-service'
  })

  if (payload.type !== 'service') {
    throw new Error('Invalid token type')
  }

  return payload as unknown as ServiceTokenPayload
}

export function extractToken(authHeader: string | undefined): string | null {
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return null
}
```

### GraphQL Context

```typescript
// backend/src/index.ts
interface Context {
  isAuthenticated: boolean
  serviceClient?: string  // e.g., 'nitro-frontend'
}

// Mercurius setup
context: async (request) => {
  const token = extractToken(request.headers.authorization)
  if (!token) {
    return { isAuthenticated: false }
  }

  try {
    const payload = await verifyServiceToken(token)
    return {
      isAuthenticated: true,
      serviceClient: payload.sub
    }
  } catch {
    return { isAuthenticated: false }
  }
}
```

### GraphQL Schema

All queries and mutations include `userId: ID!` as a required argument:

```graphql
type Query {
  accounts(userId: ID!): [Account!]!
  transactions(userId: ID!, limit: Int, offset: Int): TransactionListResponse!
  budget_buckets(userId: ID!): [BudgetBucket!]!
  monthly_periods(userId: ID!): [MonthlyPeriod!]!
  # ... etc
}

type Mutation {
  add_account(userId: ID!, input: AddAccountInput!): Account!
  update_budget_bucket(userId: ID!, bucket_id: String!, input: UpdateBudgetBucketInput!): BudgetBucket!
  # ... etc
}
```

### Resolvers

```typescript
// backend/src/graphql/resolvers.ts
const resolvers = {
  Query: {
    accounts: async (_parent, { userId }, context: Context) => {
      if (!context.isAuthenticated) {
        throw new Error('Unauthorized')
      }
      return Account.getByUserId(userId)
    },
    // ... etc
  }
}
```

## Environment Variables

### Auth Service (.env)

```env
BETTER_AUTH_SECRET=<32+ char secret>
NITRO_CLIENT_SECRET=<service client secret>
DATABASE_URL=data/auth.db
PORT=4000
```

### Backend (.env)

```env
BETTER_AUTH_SECRET=<same secret as auth service>
DATABASE_URL=data/crunch.db
PORT=3001
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_AUTH_URL=http://localhost:4000
NITRO_CLIENT_SECRET=<same secret as auth service>
```

## Flow Summary

### Login

```
Browser → Frontend → Auth Service (sign-in/email)
         ←          ← Set-Cookie: session_token
         ← Forward cookie to browser
```

### Authenticated Page Load

```
Browser → Frontend (with session cookie)
         → Auth Service (getSession) → userId
         → Auth Service (client credentials) → service token (cached)
         → Backend (service token + userId in query)
         ← Data
← Rendered page
```

### Logout

```
Browser → Frontend → Auth Service (sign-out)
         ←          ← Clear session cookie
         ← Forward to browser
```

## Endpoints

### Auth Service (port 4000)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/sign-up/email` | Register |
| POST | `/api/auth/sign-in/email` | Login |
| POST | `/api/auth/sign-out` | Logout |
| GET | `/api/auth/get-session` | Get session/user info |
| POST | `/oauth/token` | Get service token (client credentials) |

### Backend (port 3001)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/graphql` | GraphQL API (requires service token) |

## Run

```bash
# Auth service
cd auth-service && bun run dev

# Crunch backend
cd crunch/backend && bun run dev

# Crunch frontend
cd crunch/frontend-retro && bun run dev
```

## Security Considerations

- **HttpOnly session cookies** - Prevent XSS access to session
- **Server-side only service secret** - Never exposed to browser
- **Short service token expiry** - 1 hour with 5 min refresh buffer
- **Explicit userId** - Every request logs which user's data is accessed
- **Separation of concerns** - User auth (sessions) vs service auth (client credentials)
- **HS256 shared secret** - Simple, fast verification for trusted services
- **No user tokens in backend** - Backend only sees service tokens + userId

## Database Architecture

### User Storage

The **auth service is the source of truth for users**. The backend does **NOT** maintain its own User table.

**Why no User table in the backend?**
- Eliminates sync issues between auth service and backend
- No foreign key constraint failures when auth service has users the backend doesn't know about
- Simpler architecture - single source of truth

**Implementation:**
- Migration 015 (`remove_user_table`) dropped the backend's User table
- All tables (Account, Transaction, etc.) have `user_id` as a plain TEXT field
- No foreign key constraints on `user_id` - it's just a UUID string from the auth service
- The backend trusts that any valid UUID from the auth service is a legitimate user

**Table schema example (Account):**
```sql
CREATE TABLE "Account" (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT NOT NULL,  -- ← UUID from auth service, no FK constraint
  name            TEXT NOT NULL,
  bank            TEXT,
  type            TEXT,
  ...
)
```

**Benefits:**
- Can create accounts/transactions for any userId from auth service
- No migration needed when auth service adds new users
- Simpler database schema without redundant user data
