import { createServerFn } from '@tanstack/react-start'
import { getRequest, setCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { authClient } from '../lib/auth-client'
import { loggers } from '../lib/logger'

const log = loggers.auth

const AUTH_URL = import.meta.env.VITE_AUTH_URL ?? 'http://localhost:4000'
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL ?? 'http://localhost:3000'

export interface CheckStatusResponse {
  isSetup: boolean
  isAuthenticated: boolean
  user?: {
    id: string
    email: string
    name: string
  }
}

export const checkStatus = createServerFn({ method: 'GET' })
  .handler(async (): Promise<CheckStatusResponse> => {
    const request = getRequest()
    const cookieHeader = request?.headers.get('cookie') || ''

    log.debug('checkStatus - Cookie header received:', cookieHeader)

    // Use Better Auth client to get session
    const { data, error } = await authClient.getSession({
      fetchOptions: {
        headers: {
          Cookie: cookieHeader,
        },
      },
    })

    log.debug('checkStatus - getSession result:', { data, error })

    return {
      isSetup: true,
      isAuthenticated: !!data?.user,
      user: data?.user ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      } : undefined,
    }
  })

export const login = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ email: z.string(), password: z.string() })))
  .handler(async ({ data }) => {
    const request = getRequest()
    const cookieHeader = request?.headers.get('cookie') || ''

    log.info('Login started for:', data.email)

    // Use Better Auth client
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      fetchOptions: {
        headers: {
          Cookie: cookieHeader,
          Origin: FRONTEND_URL,
        },
        onSuccess: (ctx) => {
          // Forward Set-Cookie headers from auth service to browser
          const setCookieHeader = ctx.response.headers.get('set-cookie')
          log.debug('Raw Set-Cookie header:', setCookieHeader)
          if (setCookieHeader) {
            // Parse and forward each cookie
            for (const cookie of setCookieHeader.split(', ')) {
              log.debug('Parsing cookie:', cookie)
              const [nameValue, ...attrs] = cookie.split('; ')
              const [name, ...valueParts] = nameValue.split('=')
              const value = decodeURIComponent(valueParts.join('='))
              const options: Record<string, unknown> = { path: '/' }

              for (const attr of attrs) {
                const [key, val] = attr.split('=')
                const lowerKey = key.toLowerCase()
                if (lowerKey === 'max-age') options.maxAge = parseInt(val)
                else if (lowerKey === 'httponly') options.httpOnly = true
                else if (lowerKey === 'secure') options.secure = true
                else if (lowerKey === 'samesite') options.sameSite = val.toLowerCase() as 'lax' | 'strict' | 'none'
                else if (lowerKey === 'path') options.path = val
              }

              log.debug('Setting cookie:', { name, value: '***', options })
              setCookie(name, value, options)
            }
          }
        },
      },
    })

    if (result.error) {
      log.error('Login failed:', result.error.message)
      throw new Error(result.error.message || 'Login failed')
    }

    log.info('Login successful, userId:', result.data?.user?.id)

    // NOTE: We skip JWT fetch here because the session cookie hasn't propagated to browser yet.
    // The JWT will be fetched on-demand in graphql.ts when needed, using the valid session cookie.
    // This is actually more efficient - JWT is only fetched when GraphQL is actually used.

    log.debug('Login complete')

    return {
      message: 'Login successful',
      userId: result.data?.user?.id,
    }
  })

export const register = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ email: z.string(), password: z.string(), name: z.string().optional() })))
  .handler(async ({ data }) => {
    const request = getRequest()
    const cookieHeader = request?.headers.get('cookie') || ''

    // Use Better Auth client
    const result = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name || data.email.split('@')[0],
      fetchOptions: {
        headers: {
          Cookie: cookieHeader,
          Origin: FRONTEND_URL,
        },
        onSuccess: (ctx) => {
          // Forward Set-Cookie headers from auth service to browser
          const setCookieHeader = ctx.response.headers.get('set-cookie')
          if (setCookieHeader) {
            for (const cookie of setCookieHeader.split(', ')) {
              const [nameValue, ...attrs] = cookie.split('; ')
              const [name, ...valueParts] = nameValue.split('=')
              const value = decodeURIComponent(valueParts.join('='))
              const options: Record<string, unknown> = { path: '/' }

              for (const attr of attrs) {
                const [key, val] = attr.split('=')
                const lowerKey = key.toLowerCase()
                if (lowerKey === 'max-age') options.maxAge = parseInt(val)
                else if (lowerKey === 'httponly') options.httpOnly = true
                else if (lowerKey === 'secure') options.secure = true
                else if (lowerKey === 'samesite') options.sameSite = val.toLowerCase() as 'lax' | 'strict' | 'none'
                else if (lowerKey === 'path') options.path = val
              }

              setCookie(name, value, options)
            }
          }
        },
      },
    })

    if (result.error) {
      throw new Error(result.error.message || 'Registration failed')
    }

    // NOTE: JWT will be fetched on-demand in graphql.ts when needed

    return {
      message: 'Registration successful',
      userId: result.data?.user?.id,
    }
  })

export const logout = createServerFn({ method: 'POST' })
  .handler(async () => {
    const request = getRequest()
    const cookieHeader = request?.headers.get('cookie') || ''

    // Use Better Auth client
    await authClient.signOut({
      fetchOptions: {
        headers: {
          Cookie: cookieHeader,
          Origin: FRONTEND_URL,
        },
      },
    })

    // Also explicitly clear cookies on our end
    setCookie('better-auth.session_token', '', {
      maxAge: 0,
      path: '/',
    })

    setCookie('access_token', '', {
      maxAge: 0,
      path: '/',
    })

    return { message: 'Logged out' }
  })
