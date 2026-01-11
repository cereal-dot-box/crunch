import { createServerFn } from '@tanstack/react-start'
import { getRequest, setCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'

const API_URL = import.meta.env.VITE_API_URL ?? ''

function forwardCookies(response: Response) {
  const setCookieHeader = response.headers.get('set-cookie')
  if (setCookieHeader) {
    // Parse and forward each cookie, decoding the value to avoid double-encoding
    const cookies = setCookieHeader.split(/,(?=\s*\w+=)/)
    for (const cookie of cookies) {
      const parts = cookie.split(';')
      const [nameValue, ...optionParts] = parts
      const eqIndex = nameValue.indexOf('=')
      if (eqIndex === -1) continue

      const name = nameValue.slice(0, eqIndex).trim()
      const rawValue = nameValue.slice(eqIndex + 1).trim()
      // Decode the value to prevent double-encoding
      const value = decodeURIComponent(rawValue)

      // Parse cookie options
      const options: Record<string, any> = {}
      for (const part of optionParts) {
        const [key, val] = part.split('=').map(s => s.trim())
        const lowerKey = key.toLowerCase()
        if (lowerKey === 'max-age') options.maxAge = parseInt(val, 10)
        else if (lowerKey === 'path') options.path = val
        else if (lowerKey === 'domain') options.domain = val
        else if (lowerKey === 'httponly') options.httpOnly = true
        else if (lowerKey === 'secure') options.secure = true
        else if (lowerKey === 'samesite') options.sameSite = val.toLowerCase()
      }

      setCookie(name, value, options)
    }
  }
}

export interface CheckStatusResponse {
  isSetup: boolean
  isAuthenticated: boolean
}

interface LoginResponse {
  message: string
  userId: number
}

interface RegisterResponse {
  message: string
  userId: number
}

interface LogoutResponse {
  message?: string
}

export const checkStatus = createServerFn({ method: 'GET' })
  .handler(async () => {
    console.log('[checkStatus] ========= CALLED =========')
    const request = getRequest()
    console.log('[checkStatus] request exists:', !!request)
    const cookieHeader = request?.headers.get('cookie') || ''

    console.log('[checkStatus] Cookie header:', cookieHeader || '(empty)')

    const response = await fetch(`${API_URL}/api/auth/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    })

    console.log('[checkStatus] Response status:', response.status)

    if (!response.ok) {
      return { isSetup: false, isAuthenticated: false }
    }

    const data = await response.json() as CheckStatusResponse
    console.log('[checkStatus] Response data:', data)
    return data
  })

export const login = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ email: z.string(), password: z.string() })))
  .handler(async ({ data }) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(error.message || 'Login failed')
    }

    // Forward cookies from backend to browser
    forwardCookies(response)

    const result = await response.json() as LoginResponse
    return result
  })

export const register = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ email: z.string(), password: z.string() })))
  .handler(async ({ data }) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }))
      throw new Error(error.message || 'Registration failed')
    }

    // Forward cookies from backend to browser
    forwardCookies(response)

    const result = await response.json() as RegisterResponse
    return result
  })

export const logout = createServerFn({ method: 'POST' })
  .handler(async () => {
    const request = getRequest()
    const cookieHeader = request?.headers.get('cookie') || ''

    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify({}),
    })

    // Forward cookies (e.g., to clear the session cookie)
    forwardCookies(response)

    const result = await response.json().catch(() => ({})) as LogoutResponse
    return result
  })
