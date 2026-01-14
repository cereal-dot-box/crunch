import {
  useLocalRuntime,
  AssistantRuntimeProvider,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  type ChatModelAdapter,
} from '@assistant-ui/react'
import { chatWithAi, executeMCPTool } from '../server'
import { Reasoning, ReasoningGroup } from '@/components/assistant-ui/reasoning'
import { authClient } from '@/lib/auth-client'

const TYPE_DELAY_MS = 15 // Delay per character for typewriter effect
const CHARS_PER_YIELD = 3 // How many chars to reveal per delay

const zaiAdapter: ChatModelAdapter = {
  async *run({ messages }) {
    const log = (msg: string, ...args: any[]) => console.log(`[${Date.now()}] [Frontend] ${msg}`, ...args)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    // Convert messages to the format expected by the server
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system' | 'tool',
      content: msg.content
        .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map((part) => part.text)
        .join(' '),
      toolCallId: (msg as any).toolCallId,
      toolCalls: (msg as any).toolCalls,
    }))

    log('zaiAdapter.run called with', formattedMessages.length, 'messages')

    // Get current user session
    let userId = ''
    try {
      const session = await authClient.getSession()
      userId = session.data?.user?.id || ''
      log('Got userId:', userId)
    } catch (error) {
      log('Failed to get userId:', error)
    }

    if (!userId) {
      yield {
        content: [
          {
            type: 'text' as const,
            text: 'Please sign in to use the AI chat.',
          },
        ],
      }
      return
    }

    try {
      log('Calling chatWithAi...')

      // Accumulate content for streaming
      let accumulatedReasoning = ''
      let accumulatedText = ''
      let chunkCount = 0
      let receivedToolCalls: any[] | null = null

      // Consume the stream directly from the server function
      for await (const chunk of await chatWithAi({ data: { messages: formattedMessages, userId } })) {
        chunkCount++
        log('Received chunk', chunkCount, ':', chunk.type, 'content length:', chunk.content.length)

        if (chunk.type === 'reasoning') {
          const previousLength = accumulatedReasoning.length
          accumulatedReasoning += chunk.content
          const newContent = accumulatedReasoning.slice(previousLength)

          // Type out only the new portion
          for (let i = 0; i < newContent.length; i += CHARS_PER_YIELD) {
            const revealedSoFar = accumulatedReasoning.slice(0, previousLength + i + CHARS_PER_YIELD)
            log('Typing reasoning, total length:', revealedSoFar.length)

            const contentParts = [{ type: 'reasoning' as const, text: revealedSoFar }]
            yield { content: contentParts }
            await delay(TYPE_DELAY_MS)
          }
        } else if (chunk.type === 'text') {
          const previousLength = accumulatedText.length
          accumulatedText += chunk.content
          const newContent = accumulatedText.slice(previousLength)

          // Type out only the new portion
          for (let i = 0; i < newContent.length; i += CHARS_PER_YIELD) {
            const revealedSoFar = accumulatedText.slice(0, previousLength + i + CHARS_PER_YIELD)
            log('Typing text, total length:', revealedSoFar.length)

            const contentParts = []
            if (accumulatedReasoning) {
              contentParts.push({ type: 'reasoning' as const, text: accumulatedReasoning })
            }
            contentParts.push({ type: 'text' as const, text: revealedSoFar })
            yield { content: contentParts }
            await delay(TYPE_DELAY_MS)
          }
        } else if (chunk.type === 'tool_calls') {
          // Store tool calls for execution
          receivedToolCalls = chunk.content as any[]
          log('Tool calls received:', receivedToolCalls)
        }
      }

      log('Stream consumption complete, total chunks:', chunkCount)

      // If we received tool calls, execute them and get final response
      if (receivedToolCalls && receivedToolCalls.length > 0) {
        log('Executing', receivedToolCalls.length, 'tool calls')

        // Execute each tool call
        const toolMessages: any[] = []
        for (const toolCall of receivedToolCalls) {
          try {
            // Parse arguments
            let args: Record<string, any> = {}
            if (toolCall.function?.arguments) {
              args = JSON.parse(toolCall.function.arguments)
            }

            log('Executing tool:', toolCall.function?.name, 'with args:', args)

            const result = await executeMCPTool({
              data: {
                toolName: toolCall.function.name,
                args,
                userId,
              },
            })

            log('Tool result:', result)

            toolMessages.push({
              role: 'tool' as const,
              content: result.result || result.error || 'No result',
              toolCallId: toolCall.id,
            })
          } catch (error) {
            log('Tool execution error:', error)
            toolMessages.push({
              role: 'tool' as const,
              content: `Error: ${error instanceof Error ? error.message : String(error)}`,
              toolCallId: toolCall.id,
            })
          }
        }

        // Send tool results back to AI
        log('Sending tool results back to AI')

        const followUpMessages = [
          ...formattedMessages,
          // Add the assistant message with tool calls
          {
            role: 'assistant' as const,
            content: accumulatedText || '',
            toolCalls: receivedToolCalls,
          },
          ...toolMessages,
        ]

        // Get final response from AI
        accumulatedReasoning = ''
        accumulatedText = ''
        chunkCount = 0

        for await (const chunk of await chatWithAi({ data: { messages: followUpMessages, userId } })) {
          chunkCount++
          log('Received follow-up chunk', chunkCount, ':', chunk.type)

          if (chunk.type === 'reasoning') {
            const previousLength = accumulatedReasoning.length
            accumulatedReasoning += chunk.content
            const newContent = accumulatedReasoning.slice(previousLength)

            for (let i = 0; i < newContent.length; i += CHARS_PER_YIELD) {
              const revealedSoFar = accumulatedReasoning.slice(0, previousLength + i + CHARS_PER_YIELD)
              const contentParts = [{ type: 'reasoning' as const, text: revealedSoFar }]
              yield { content: contentParts }
              await delay(TYPE_DELAY_MS)
            }
          } else if (chunk.type === 'text') {
            const previousLength = accumulatedText.length
            accumulatedText += chunk.content
            const newContent = accumulatedText.slice(previousLength)

            for (let i = 0; i < newContent.length; i += CHARS_PER_YIELD) {
              const revealedSoFar = accumulatedText.slice(0, previousLength + i + CHARS_PER_YIELD)
              const contentParts = []
              if (accumulatedReasoning) {
                contentParts.push({ type: 'reasoning' as const, text: accumulatedReasoning })
              }
              contentParts.push({ type: 'text' as const, text: revealedSoFar })
              yield { content: contentParts }
              await delay(TYPE_DELAY_MS)
            }
          }
        }

        log('Follow-up response complete')
      }
    } catch (error) {
      console.error('[Frontend] Error in zaiAdapter:', error)
      yield {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
          },
        ],
      }
    }
  },
}

export function AiChat() {
  const runtime = useLocalRuntime(zaiAdapter)

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <style>{`
        /* Replace the running dot with "thinking..." */
        span[data-status="running"] + span[style*="font-family: revert"] {
          font-size: 0 !important;
        }
        span[data-status="running"] + span[style*="font-family: revert"]::after {
          content: "thinking...";
          font-size: 14px;
          color: #9ca3af;
        }
      `}</style>
      <div className="border border-black bg-white">
        <ThreadPrimitive.Root className="flex flex-col h-[400px]">
          <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4">
            <ThreadPrimitive.Empty>
              <div className="text-gray-500 text-center py-8">
                Ask me anything about your finances!
              </div>
            </ThreadPrimitive.Empty>

            <ThreadPrimitive.Messages
              components={{
                UserMessage: UserMessage,
                AssistantMessage: AssistantMessage,
              }}
            />

            <ThreadPrimitive.If running>
              <div className="flex gap-1 px-4 py-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </ThreadPrimitive.If>
          </ThreadPrimitive.Viewport>

          <div className="border-t border-black p-3">
            <ComposerPrimitive.Root className="flex gap-2">
              <ComposerPrimitive.Input
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-black focus:outline-none focus:border-[#0000EE]"
              />
              <ComposerPrimitive.Send className="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50">
                Send
              </ComposerPrimitive.Send>
            </ComposerPrimitive.Root>
          </div>
        </ThreadPrimitive.Root>
      </div>
    </AssistantRuntimeProvider>
  )
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-end">
      <div className="bg-[#0000EE] text-white px-3 py-2 max-w-[80%]">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-start">
      <div className="bg-gray-100 border border-black px-3 py-2 max-w-[80%]">
        <MessagePrimitive.Parts
          components={{
            Reasoning: Reasoning,
            ReasoningGroup: ReasoningGroup,
          }}
        />
      </div>
    </MessagePrimitive.Root>
  )
}
