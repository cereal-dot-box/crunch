import {
  useLocalRuntime,
  AssistantRuntimeProvider,
  type ChatModelAdapter,
} from '@assistant-ui/react'
import { chatWithAi } from '../server'
import { Thread } from '@/components/assistant-ui/thread'

const TYPE_DELAY_MS = 15 // Delay per character for typewriter effect
const CHARS_PER_YIELD = 3 // How many chars to reveal per delay

const glmAdapter: ChatModelAdapter = {
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

    log('glmAdapter.run called with', formattedMessages.length, 'messages')

    try {
      log('Calling chatWithAi...')

      // Accumulate content for streaming
      let accumulatedReasoning = ''
      let accumulatedText = ''
      let chunkCount = 0

      // Consume the stream directly from the server function
      // Tool calling is now automatic - handled by the AI SDK backend
      for await (const chunk of await chatWithAi({ data: { messages: formattedMessages } })) {
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
        }
      }

      log('Stream consumption complete, total chunks:', chunkCount)
    } catch (error) {
      console.error('[Frontend] Error in glmAdapter:', error)
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
  const runtime = useLocalRuntime(glmAdapter)

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="border border-black bg-white h-[800px]">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  )
}
