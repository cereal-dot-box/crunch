import { getRequest } from '@tanstack/react-start/server'
import { authClient } from '../lib/auth-client'
import { getServiceToken } from './service-auth'
import { loggers } from '../lib/logger'

const log = loggers.mcp

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'

interface MCPRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: any
}

interface MCPResponse {
  jsonrpc: '2.0'
  id: string | number | null
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
}

interface Tool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
}

/**
 * MCP Client for communicating with the backend MCP server
 */
class MCPClient {
  private userId: string | null = null
  private serviceToken: string | null = null
  private sessionId: string

  constructor() {
    this.sessionId = `mcp-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  /**
   * Initialize the client with user session and service token
   */
  async initialize(): Promise<void> {
    const request = getRequest()
    const cookieHeader = request?.headers.get('cookie') || ''

    // Get user session
    const { data } = await authClient.getSession({
      fetchOptions: {
        headers: {
          Cookie: cookieHeader,
        },
      },
    })

    if (!data?.user?.id) {
      throw new Error('User not authenticated')
    }

    this.userId = data.user.id

    // Get service token for backend authentication
    this.serviceToken = await getServiceToken()

    log.debug({ userId: this.userId, sessionId: this.sessionId }, 'MCP client initialized')
  }

  /**
   * List all available MCP tools
   */
  async listTools(): Promise<Tool[]> {
    await this.ensureInitialized()

    const response = await this.sendRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    })

    return response.result?.tools || []
  }

  /**
   * Call an MCP tool
   */
  async callTool(name: string, args: Record<string, any> = {}): Promise<any> {
    await this.ensureInitialized()

    log.debug({ tool: name, args }, 'Calling MCP tool')

    const response = await this.sendRequest({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name,
        arguments: args,
      },
    })

    if (response.error) {
      log.error({ tool: name, error: response.error }, 'MCP tool error')
      throw new Error(response.error.message || 'Tool call failed')
    }

    return response.result
  }

  /**
   * Send a JSON-RPC request to the MCP endpoint
   */
  private async sendRequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.userId || !this.serviceToken) {
      throw new Error('MCP client not initialized')
    }

    const response = await fetch(`${BACKEND_URL}/mcp/sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.serviceToken}`,
        'X-User-Id': this.userId,
        'MCP-Session-Id': this.sessionId,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Ensure the client is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.userId || !this.serviceToken) {
      await this.initialize()
    }
  }
}

/**
 * Get available MCP tools in OpenAI function calling format
 *
 * Fetches the list of available tools from the MCP server
 * and formats them for OpenAI-compatible function calling
 * Note: userId is auto-injected and not exposed to the AI
 */
export async function getAvailableTools(): Promise<any[]> {
  try {
    const client = new MCPClient()
    await client.initialize()

    const tools = await client.listTools()

    // Convert MCP tools to OpenAI function format
    return tools.map(tool => {
      const properties: Record<string, any> = {}
      const required: string[] = []

      // Convert input schema properties to OpenAI format
      // Skip userId since it will be auto-injected
      if (tool.inputSchema.properties) {
        for (const [propName, propDef] of Object.entries(tool.inputSchema.properties)) {
          // Skip userId - it will be auto-injected from the session
          if (propName === 'userId') continue

          properties[propName] = {
            type: (propDef as any).type,
            description: (propDef as any).description || `Property ${propName}`,
          }

          // Track required params (excluding userId)
          if (tool.inputSchema.required?.includes(propName)) {
            required.push(propName)
          }
        }
      }

      return {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined,
          },
        },
      }
    })
  } catch (error) {
    log.error({ err: error }, 'Failed to fetch available tools')
    return []
  }
}

/**
 * Call an MCP tool by name
 *
 * Generic function to call any MCP tool
 */
export async function callMCPTool(toolName: string, args: Record<string, any> = {}): Promise<string> {
  const client = new MCPClient()
  await client.initialize()
  const result = await client.callTool(toolName, args)

  // Return the text content from the result
  if (result.content?.[0]?.type === 'text') {
    return result.content[0].text
  }

  return JSON.stringify(result)
}

/**
 * Fetch financial context for AI using MCP tools
 *
 * This provides available tools to the AI but doesn't pre-fetch data.
 * The AI can request specific tools to be called if needed.
 */
export async function getFinancialContext(_userQuery: string): Promise<string> {
  // This is now handled via function calling
  return ''
}
