import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { getAvailableTools, callMCPTool } from './mcp'

const ZAI_API_KEY = process.env.ZAI_API_KEY || ''
const ZAI_API_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions'

const log = (msg: string, ...args: any[]) => console.log(`[${Date.now()}] [Backend] ${msg}`, ...args)

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  toolCallId: z.string().optional(),
  toolCalls: z.array(z.any()).optional(),
})

const TARGET_CHUNK_SIZE = 80

async function* streamResponse(response: Response): AsyncGenerator<{ type: 'reasoning' | 'text' | 'tool_calls'; content: string | any[] }> {
  if (!response.body) {
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  // Buffering state
  let bufferedReasoning = ''
  let bufferedText = ''
  let currentType: 'reasoning' | 'text' | null = null

  // Accumulated tool calls
  let accumulatedToolCalls: any[] = []

  log('Starting to read stream...')

  const yieldIfReady = function* (
    type: 'reasoning' | 'text',
    content: string
  ): Generator<{ type: 'reasoning' | 'text'; content: string }> {
    if (!content) return

    // Type switched or buffer is full enough - yield what we have
    if (currentType && currentType !== type) {
      if (currentType === 'reasoning' && bufferedReasoning) {
        yield { type: 'reasoning', content: bufferedReasoning }
        bufferedReasoning = ''
      } else if (currentType === 'text' && bufferedText) {
        yield { type: 'text', content: bufferedText }
        bufferedText = ''
      }
    }

    currentType = type
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        // Flush remaining buffers
        if (bufferedReasoning) {
          yield { type: 'reasoning', content: bufferedReasoning }
        }
        if (bufferedText) {
          yield { type: 'text', content: bufferedText }
        }
        // Yield any accumulated tool calls
        if (accumulatedToolCalls.length > 0) {
          yield { type: 'tool_calls', content: accumulatedToolCalls }
        }
        log('Stream complete')
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta

          // Handle tool calls
          if (delta?.tool_calls) {
            for (const toolCall of delta.tool_calls) {
              const index = toolCall.index

              // Ensure we have a tool call at this index
              while (accumulatedToolCalls.length <= index) {
                accumulatedToolCalls.push({ id: '', type: 'function', function: { name: '', arguments: '' } })
              }

              if (toolCall.id) {
                accumulatedToolCalls[index].id = toolCall.id
              }

              if (toolCall.type) {
                accumulatedToolCalls[index].type = toolCall.type
              }

              if (toolCall.function) {
                if (toolCall.function.name) {
                  accumulatedToolCalls[index].function.name = toolCall.function.name
                }
                if (toolCall.function.arguments) {
                  accumulatedToolCalls[index].function.arguments += toolCall.function.arguments
                }
              }
            }
          }
          // Handle reasoning content
          else if (delta?.reasoning_content) {
            bufferedReasoning += delta.reasoning_content

            // Yield if we've accumulated enough or type changed
            yield* yieldIfReady('reasoning', bufferedReasoning)

            if (bufferedReasoning.length >= TARGET_CHUNK_SIZE) {
              yield { type: 'reasoning' as const, content: bufferedReasoning }
              bufferedReasoning = ''
            }
          }
          // Handle regular content
          else if (delta?.content) {
            bufferedText += delta.content

            // Yield if we've accumulated enough or type changed
            yield* yieldIfReady('text', bufferedText)

            if (bufferedText.length >= TARGET_CHUNK_SIZE) {
              yield { type: 'text' as const, content: bufferedText }
              bufferedText = ''
            }
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export const chatWithAi = createServerFn({ method: 'POST' })
  .inputValidator(
    zodValidator(
      z.object({
        messages: z.array(messageSchema),
        userId: z.string(),
      })
    )
  )
  .handler(async function* ({ data }) {
    log('[Backend] chatWithAi called with', data.messages.length, 'messages')

    if (!ZAI_API_KEY) {
      throw new Error('ZAI_API_KEY is not configured')
    }

    // Fetch available MCP tools
    let tools: any[] = []
    try {
      tools = await getAvailableTools()
      log('[Backend] Loaded', tools.length, 'MCP tools')
    } catch (error) {
      log('[Backend] Failed to load MCP tools:', error)
    }

    // Build messages array
    const messages: any[] = [
      {
        role: 'system',
        content: 'You are a helpful financial assistant. Help users understand their spending patterns, budgets, and provide financial advice. When you need financial data to answer a question, use the available tools to fetch it.',
      },
      ...data.messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
        ...(m.toolCalls ? { tool_calls: m.toolCalls } : {}),
      })),
    ]

    const response = await fetch(ZAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ZAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4.7',
        messages,
        tools: tools.length > 0 ? tools : undefined,
        temperature: 0.7,
        stream: true,
      }),
    })

    log('[Backend] Fetch response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('[Backend] Z.ai API error:', error)
      throw new Error(`Z.ai API error: ${error}`)
    }

    // Stream responses as they arrive
    for await (const chunk of streamResponse(response)) {
      yield chunk
    }

    log('[Backend] Generator function complete')
  })

export const executeMCPTool = createServerFn({ method: 'POST' })
  .inputValidator(
    zodValidator(
      z.object({
        toolName: z.string(),
        args: z.record(z.string(), z.any()),
        userId: z.string(),
      })
    )
  )
  .handler(async ({ data }) => {
    log('[Backend] executeMCPTool called:', data.toolName, data.args)

    try {
      // Add userId to args
      const argsWithUserId = { ...data.args, userId: data.userId }

      const result = await callMCPTool(data.toolName, argsWithUserId)

      log('[Backend] Tool result length:', result.length)

      return {
        success: true,
        result,
      }
    } catch (error) {
      log('[Backend] Tool execution error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  })
