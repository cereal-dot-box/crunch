import { createAuthClient } from 'better-auth/client'

const AUTH_URL = import.meta.env.VITE_AUTH_URL ?? 'http://localhost:4000'

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
})
