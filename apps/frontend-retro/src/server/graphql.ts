import { getRequest } from '@tanstack/react-start/server'
import { authClient } from '../lib/auth-client'
import { getServiceToken } from './service-auth'
import { print } from 'graphql'
import type { DocumentNode } from 'graphql'

const API_URL = import.meta.env.VITE_API_URL ?? ''

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

type DocumentLike = string | DocumentNode

function extractQueryString(document: DocumentLike): string {
  if (typeof document === 'string') {
    return document
  }
  return print(document)
}

export async function graphqlRequest<T>(
  query: DocumentLike,
  variables?: Record<string, unknown>
): Promise<T> {
  // Get service token (cached)
  const serviceToken = await getServiceToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${serviceToken}`,
  }

  const queryString = extractQueryString(query)

  const response = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: queryString, variables }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: GraphQLResponse<T> = await response.json()

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL error')
  }

  if (!result.data) {
    throw new Error('No data returned from GraphQL')
  }

  return result.data
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
