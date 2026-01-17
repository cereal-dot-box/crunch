import { buildASTSchema, parse } from 'graphql';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { resolvers } from '../graphql/resolvers';

// Read the GraphQL schema
const schemaPath = join(__dirname, '../graphql/schema.graphql');
const schemaSDL = readFileSync(schemaPath, 'utf-8');

// Parse and build the GraphQL schema from AST
const document = parse(schemaSDL);
const schema = buildASTSchema(document);

// Get the Query type
const queryType = schema.getQueryType();
if (!queryType) {
  throw new Error('No Query type found in schema');
}

// Type mapping from GraphQL to JSON Schema
const graphqlToJsonSchemaType: Record<string, string> = {
  'Int': 'number',
  'Float': 'number',
  'String': 'string',
  'Boolean': 'boolean',
  'ID': 'string',
};

// Helper to check if a type is non-null (required)
function isNonNull(type: any): boolean {
  return type?.constructor?.name === 'GraphQLNonNull';
}

// Helper to check if a type is a list
function isList(type: any): boolean {
  const unwrapped = isNonNull(type) ? type.ofType : type;
  return unwrapped?.constructor?.name === 'GraphQLList';
}

// Helper to get the named type (unwrap NonNull and List)
function getNamedType(type: any): any {
  let unwrapped = type;
  while (unwrapped && (unwrapped.ofType || unwrapped.constructor?.name === 'GraphQLNonNull' || unwrapped.constructor?.name === 'GraphQLList')) {
    unwrapped = unwrapped.ofType || unwrapped;
  }
  return unwrapped;
}

// Convert GraphQL type to JSON Schema type
function convertType(arg: any): { type: string; description?: string } {
  const argType = arg.type;
  const namedType = getNamedType(argType);
  const typeName = namedType?.name || 'String';
  const jsonType = graphqlToJsonSchemaType[typeName] || 'string';

  const result: { type: string; description?: string } = { type: jsonType };

  if (arg.description) {
    result.description = arg.description;
  }

  return result;
}

// Generate MCP tool from a GraphQL field
function generateToolFromField(field: any): Tool {
  const name = field.name;
  const args = field.args;

  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const arg of args) {
    const argType = arg.type;
    const requiredField = isNonNull(argType);

    properties[arg.name] = {
      ...convertType(arg),
      description: arg.description || `Argument ${arg.name}`,
    };

    if (requiredField) {
      required.push(arg.name);
    }
  }

  // Generate description from field name and existing descriptions
  let description = field.description || '';
  if (!description) {
    description = `GraphQL query: ${field.name}`;
    if (args.length > 0) {
      const argNames = args.map((a: any) => a.name).join(', ');
      description += `\nArguments: ${argNames}`;
    }
  }

  return {
    name: name.toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, ''),
    description,
    inputSchema: {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    },
  };
}

// Generate a handler that calls the GraphQL resolver
function generateHandler(fieldName: string) {
  const resolver = (resolvers as any).Query?.[fieldName];
  if (!resolver) {
    throw new Error(`No resolver found for query: ${fieldName}`);
  }

  return async (userId: string, args: any) => {
    // Create a mock GraphQL context
    const context = {
      isAuthenticated: true,
      serviceClient: 'mcp-server',
      // Add any other context properties your resolvers need
    };

    try {
      // Call the resolver with userId and context
      const result = await resolver({}, { userId, ...args }, context);

      // Format result as MCP content
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error calling ${fieldName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
}

// Generate all tools from GraphQL queries
export function generateGraphQLTools(): {
  tools: Tool[];
  toolHandlers: Record<string, (userId: string, args: any) => Promise<any>>;
  toolSchemas: Record<string, any>;
} {
  const tools: Tool[] = [];
  const toolHandlers: Record<string, (userId: string, args: any) => Promise<any>> = {};
  const toolSchemas: Record<string, any> = {};

  const fields = queryType.getFields();

  for (const [fieldName, field] of Object.entries(fields)) {
    const tool = generateToolFromField(field);
    tools.push(tool);

    const handler = generateHandler(fieldName);
    toolHandlers[tool.name] = handler;

    // Store the input schema for validation
    toolSchemas[tool.name] = tool.inputSchema;
  }

  return { tools, toolHandlers, toolSchemas };
}

// Log what we're generating
if (require.main === module) {
  const { tools } = generateGraphQLTools();
  console.log('Generated MCP tools from GraphQL queries:');
  console.log(tools.map((t) => `- ${t.name}: ${t.description.split('\n')[0]}`).join('\n'));
}
