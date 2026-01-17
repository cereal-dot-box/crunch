import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { streamText, stepCountIs } from 'ai'
import { createZhipu } from 'zhipu-ai-provider'
import { mcpLocalhostTools } from './mcp-tools'
import { authClient } from '../lib/auth-client'

const log = (msg: string, ...args: any[]) => console.log(`[${Date.now()}] [Backend] ${msg}`, ...args)

// Get API key from environment
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || process.env.ZAI_API_KEY || ''

// Create Zhipu provider instance
const zhipu = createZhipu({
  apiKey: ZHIPU_API_KEY,
  baseURL: 'https://api.z.ai/api/coding/paas/v4',
})

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  toolCallId: z.string().optional(),
  toolCalls: z.array(z.any()).optional(),
})

/**
 * Chat with AI using GLM model with automatic tool calling
 *
 * This uses the AI SDK's streamText with the Zhipu provider for GLM models.
 * Tool calling is automatic - the AI SDK handles tool detection, execution,
 * and response generation without manual intervention.
 *
 * The returned stream yields chunks compatible with the assistant-ui adapter:
 * - reasoning: Model's reasoning content
 * - text: Final text response
 * - tool_calls: (Legacy - no longer used, kept for compatibility)
 */
export const chatWithAi = createServerFn({ method: 'POST' })
  .inputValidator(
    zodValidator(
      z.object({
        messages: z.array(messageSchema),
      })
    )
  )
  .handler(async function* ({ data }) {
    log('[Backend] chatWithAi called with', data.messages.length, 'messages')

    if (!ZHIPU_API_KEY) {
      throw new Error('ZHIPU_API_KEY is not configured')
    }

    // Check authentication server-side
    const request = getRequest()
    const cookieHeader = request?.headers.get('cookie') || ''
    const { data: session } = await authClient.getSession({
      fetchOptions: { headers: { Cookie: cookieHeader } },
    })
    if (!session?.user?.id) {
      throw new Error('Please sign in to use the AI chat')
    }

    // Use generated MCP tools (they handle authentication via client.ts)
    const mcpTools = mcpLocalhostTools
    log('[Backend] Loaded', Object.keys(mcpTools).length, 'MCP tools')

    // Build messages array with system prompt
    const messages: any[] = [
      {
        role: 'system',
        content: `Answer briefly and directly. No emojis, no greetings, no filler. Get straight to the point.`,
      },
      ...data.messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
        ...(m.toolCalls ? { tool_calls: m.toolCalls } : {}),
      })),
    ]

    // Use streamText with GLM model and automatic tool calling
    // Set stopWhen to a higher step count to allow automatic tool continuation
    const result = streamText({
      model: zhipu('glm-4.7'),
      messages,
      tools: mcpTools,
      temperature: 0.7,
      stopWhen: stepCountIs(10), // Allow up to 10 steps for automatic tool continuation
    })

    // Stream the response
    // The AI SDK handles tool calling automatically, so we just need to stream the final output
    let accumulatedReasoning = ''
    let accumulatedText = ''

    for await (const chunk of result.fullStream) {
      // Log all chunk types for debugging
      log('[Backend] Chunk type:', chunk.type, JSON.stringify(chunk).slice(0, 200))

      if (chunk.type === 'reasoning-delta') {
        accumulatedReasoning += chunk.text
        yield { type: 'reasoning', content: chunk.text }
      } else if (chunk.type === 'text-delta') {
        accumulatedText += chunk.text
        yield { type: 'text', content: chunk.text }
      } else if (chunk.type === 'tool-call') {
        log('[Backend] Tool call:', chunk.toolName, chunk.input)
        // Tool calls are handled automatically by AI SDK
        // Just log for debugging
      } else if (chunk.type === 'tool-result') {
        log('[Backend] Tool result:', chunk.toolCallId, chunk.output)
        // Tool results are handled automatically by AI SDK
      } else if (chunk.type === 'error') {
        log('[Backend] Stream error:', chunk.error)
      } else if (chunk.type === 'finish') {
        log('[Backend] Stream finish:', chunk.finishReason, chunk.totalUsage)
      }
    }

    log('[Backend] Stream complete')
  })
