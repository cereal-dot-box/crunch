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

  // Request new token
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
    const text = await response.text()
    throw new Error(`Failed to get service token: ${response.status} ${text}`)
  }

  const data = await response.json()

  // Cache token
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return tokenCache.token
}
