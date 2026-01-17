import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { graphqlRequest, getUserIdFromSession } from './graphql'
import { loggers } from '../lib/logger'

const log = loggers.oauth

/**
 * Server function to get Splitwise OAuth authorization URL
 * Calls GraphQL backend to generate OAuth state and build the authorize URL
 *
 * The client should redirect the user to the returned URL
 */
export const initiateSplitwiseOAuth = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()

    if (!userId) {
      throw new Error('User not authenticated')
    }

    log.info('Initiating Splitwise OAuth for user:', userId)

    try {
      const result = await graphqlRequest<{
        splitwise_authorize_url: { url: string }
      }>(
        `query SplitwiseAuthorizeUrl($userId: ID!) {
          splitwise_authorize_url(userId: $userId) {
            url
          }
        }`,
        { userId }
      )

      log.info('Splitwise authorize URL generated')

      return {
        authorize_url: result.splitwise_authorize_url.url,
      }
    } catch (error) {
      log.error('Failed to get Splitwise authorize URL:', error)
      throw new Error('Failed to initiate OAuth flow')
    }
  })

/**
 * Server function to complete Splitwise OAuth flow
 * Forwards the authorization code and state to GraphQL backend for token exchange
 *
 * Note: In production, this should be called from a dedicated callback route
 * that receives the code directly from Splitwise's redirect
 */
export const completeSplitwiseOAuth = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({
    code: z.string().min(1),
    state: z.string().min(1),
  })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()

    if (!userId) {
      throw new Error('User not authenticated')
    }

    log.info('Completing Splitwise OAuth for user:', userId)

    try {
      const result = await graphqlRequest<{
        splitwise_complete_oauth: {
          id: number
          user_id: string
          splitwise_user_id: string
          created_at: string
          updated_at: string
        }
      }>(
        `mutation SplitwiseCompleteOAuth($userId: ID!, $code: String!, $state: String!) {
          splitwise_complete_oauth(userId: $userId, code: $code, state: $state) {
            id
            user_id
            splitwise_user_id
            created_at
            updated_at
          }
        }`,
        { userId, code: data.code, state: data.state }
      )

      log.info('Splitwise OAuth completed successfully for user:', userId)

      return {
        success: true,
        credential: result.splitwise_complete_oauth,
      }
    } catch (error) {
      log.error('Failed to complete Splitwise OAuth:', error)
      throw new Error('Failed to complete OAuth flow')
    }
  })

/**
 * Server function to get current Splitwise connection status
 */
export const getSplitwiseCredential = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()

    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {
      const result = await graphqlRequest<{
        splitwise_credential: {
          id: number
          user_id: string
          splitwise_user_id: string
          created_at: string
          updated_at: string
        } | null
      }>(
        `query SplitwiseCredential($userId: ID!) {
          splitwise_credential(userId: $userId) {
            id
            user_id
            splitwise_user_id
            created_at
            updated_at
          }
        }`,
        { userId }
      )

      return {
        connected: !!result.splitwise_credential,
        credential: result.splitwise_credential,
      }
    } catch (error) {
      log.error('Failed to get Splitwise credential:', error)
      throw new Error('Failed to get connection status')
    }
  })

/**
 * Server function to disconnect Splitwise
 */
export const disconnectSplitwise = createServerFn({ method: 'POST' })
  .handler(async () => {
    const userId = await getUserIdFromSession()

    if (!userId) {
      throw new Error('User not authenticated')
    }

    log.info('Disconnecting Splitwise for user:', userId)

    try {
      await graphqlRequest<{
        splitwise_disconnect: boolean
      }>(
        `mutation SplitwiseDisconnect($userId: ID!) {
          splitwise_disconnect(userId: $userId)
        }`,
        { userId }
      )

      log.info('Splitwise disconnected successfully for user:', userId)

      return { success: true }
    } catch (error) {
      log.error('Failed to disconnect Splitwise:', error)
      throw new Error('Failed to disconnect Splitwise')
    }
  })

/**
 * Server function to fetch Splitwise groups
 */
export const getSplitwiseGroups = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()

    if (!userId) {
      throw new Error('User not authenticated')
    }

    log.info('Fetching Splitwise groups for user:', userId)

    try {
      const result = await graphqlRequest<{
        splitwise_groups: Array<{
          id: number
          name: string
          updated_at: string
          members: Array<{
            id: number
            first_name: string
            last_name: string | null
            email: string
          }>
        }>
      }>(
        `query SplitwiseGroups($userId: ID!) {
          splitwise_groups(userId: $userId) {
            id
            name
            updated_at
            members {
              id
              first_name
              last_name
              email
            }
          }
        }`,
        { userId }
      )

      log.info(`Fetched ${result.splitwise_groups.length} groups from Splitwise`)

      return { groups: result.splitwise_groups }
    } catch (error) {
      log.error('Failed to fetch Splitwise groups:', error)
      throw new Error('Failed to fetch groups from Splitwise')
    }
  })

/**
 * Server function to get Splitwise settings for the current user
 * Returns the settings or creates defaults if none exist
 */
export const getSplitwiseSettings = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()

    if (!userId) {
      throw new Error('User not authenticated')
    }

    log.info('Fetching Splitwise settings for user:', userId)

    try {
      const result = await graphqlRequest<{
        splitwise_settings: {
          id: number
          user_id: string
          included_group_ids: number[]
          auto_sync_enabled: boolean
          created_at: string
          updated_at: string
        }
      }>(
        `query SplitwiseSettings($userId: ID!) {
          splitwise_settings(userId: $userId) {
            id
            user_id
            included_group_ids
            auto_sync_enabled
            created_at
            updated_at
          }
        }`,
        { userId }
      )

      return { settings: result.splitwise_settings }
    } catch (error) {
      log.error('Failed to get Splitwise settings:', error)
      throw new Error('Failed to get Splitwise settings')
    }
  })

/**
 * Server function to update Splitwise settings
 */
export const updateSplitwiseSettings = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({
    included_group_ids: z.array(z.number()).optional(),
    auto_sync_enabled: z.boolean().optional(),
  })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()

    if (!userId) {
      throw new Error('User not authenticated')
    }

    log.info('Updating Splitwise settings for user:', userId, data)

    try {
      const result = await graphqlRequest<{
        splitwise_update_settings: {
          id: number
          user_id: string
          included_group_ids: number[]
          auto_sync_enabled: boolean
          created_at: string
          updated_at: string
        }
      }>(
        `mutation SplitwiseUpdateSettings($userId: ID!, $input: UpdateSplitwiseSettingsInput!) {
          splitwise_update_settings(userId: $userId, input: $input) {
            id
            user_id
            included_group_ids
            auto_sync_enabled
            created_at
            updated_at
          }
        }`,
        { userId, input: data }
      )

      log.info('Splitwise settings updated successfully for user:', userId)

      return { settings: result.splitwise_update_settings }
    } catch (error) {
      log.error('Failed to update Splitwise settings:', error)
      throw new Error('Failed to update Splitwise settings')
    }
  })
