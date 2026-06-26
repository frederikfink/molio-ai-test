import { createMCPClient, type MCPClient } from "@ai-sdk/mcp"

import { getMolioMcpUrl, resolveMolioAccessToken } from "@/lib/molio-oauth"

export const createMolioClient = async (): Promise<MCPClient> => {
  const url = getMolioMcpUrl()
  const token = await resolveMolioAccessToken()

  try {
    return await createMCPClient({
      transport: {
        type: "http",
        url,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })
  } catch (error) {
    if (error instanceof Error && /401|unauthorized/i.test(error.message)) {
      throw new Error(
        "Molio MCP authentication failed. Log ind igen via «Forbind Molio».",
      )
    }

    throw error
  }
}

export const withMolioClient = async <T>(
  fn: (client: MCPClient) => Promise<T>,
): Promise<T> => {
  let client: MCPClient | undefined

  try {
    client = await createMolioClient()
    return await fn(client)
  } finally {
    await client?.close()
  }
}
