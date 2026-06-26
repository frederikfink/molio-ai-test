import { createHash, randomBytes } from "node:crypto"

import { cookies } from "next/headers"

const COOKIE_ACCESS = "molio_access_token"
const COOKIE_REFRESH = "molio_refresh_token"
const COOKIE_EXPIRES = "molio_token_expires"
const COOKIE_VERIFIER = "molio_oauth_verifier"
const COOKIE_CLIENT_ID = "molio_oauth_client_id"
const COOKIE_STATE = "molio_oauth_state"

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

type MolioTokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export const getMolioMcpUrl = () =>
  process.env.MOLIO_MCP_URL?.replace(/\/$/, "") ?? "https://mcp.molio.dk/api/mcp"

export const getMolioOrigin = () => {
  const mcpUrl = getMolioMcpUrl()
  return mcpUrl.replace(/\/api\/mcp$/, "")
}

export const generatePkce = () => {
  const verifier = randomBytes(32).toString("base64url")
  const challenge = createHash("sha256").update(verifier).digest("base64url")

  return { verifier, challenge }
}

export const registerMolioOAuthClient = async (redirectUri: string) => {
  const response = await fetch(`${getMolioOrigin()}/api/oauth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "Molio Byggeplan Validator",
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }),
  })

  if (!response.ok) {
    throw new Error("Kunne ikke registrere OAuth-klient hos Molio.")
  }

  const data = (await response.json()) as { client_id: string }
  return data.client_id
}

export const exchangeMolioCode = async ({
  code,
  codeVerifier,
  redirectUri,
  clientId,
}: {
  code: string
  codeVerifier: string
  redirectUri: string
  clientId: string
}) => {
  const response = await fetch(`${getMolioOrigin()}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      client_id: clientId,
    }),
  })

  if (!response.ok) {
    throw new Error("Molio OAuth-tokenudveksling fejlede.")
  }

  return (await response.json()) as MolioTokenResponse
}

export const refreshMolioTokens = async (refreshToken: string) => {
  const response = await fetch(`${getMolioOrigin()}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error("Molio-session udløbet. Log ind igen.")
  }

  return (await response.json()) as MolioTokenResponse
}

export const persistMolioTokens = async (tokens: MolioTokenResponse) => {
  const store = await cookies()

  store.set(COOKIE_ACCESS, tokens.access_token, cookieOptions)
  store.set(COOKIE_REFRESH, tokens.refresh_token, cookieOptions)
  store.set(
    COOKIE_EXPIRES,
    String(Date.now() + tokens.expires_in * 1000),
    cookieOptions,
  )
}

export const clearMolioOAuthState = async () => {
  const store = await cookies()

  store.delete(COOKIE_VERIFIER)
  store.delete(COOKIE_CLIENT_ID)
  store.delete(COOKIE_STATE)
}

export const clearMolioSession = async () => {
  const store = await cookies()

  store.delete(COOKIE_ACCESS)
  store.delete(COOKIE_REFRESH)
  store.delete(COOKIE_EXPIRES)
  await clearMolioOAuthState()
}

export const startMolioOAuth = async (redirectUri: string) => {
  const { verifier, challenge } = generatePkce()
  const state = randomBytes(16).toString("hex")
  const clientId = await registerMolioOAuthClient(redirectUri)
  const store = await cookies()

  store.set(COOKIE_VERIFIER, verifier, { ...cookieOptions, maxAge: 600 })
  store.set(COOKIE_CLIENT_ID, clientId, { ...cookieOptions, maxAge: 600 })
  store.set(COOKIE_STATE, state, { ...cookieOptions, maxAge: 600 })

  const authorizeUrl = new URL(`${getMolioOrigin()}/oauth/authorize`)
  authorizeUrl.searchParams.set("client_id", clientId)
  authorizeUrl.searchParams.set("redirect_uri", redirectUri)
  authorizeUrl.searchParams.set("response_type", "code")
  authorizeUrl.searchParams.set("state", state)
  authorizeUrl.searchParams.set("code_challenge", challenge)
  authorizeUrl.searchParams.set("code_challenge_method", "S256")

  return authorizeUrl.toString()
}

export const completeMolioOAuth = async ({
  code,
  state,
  redirectUri,
}: {
  code: string
  state: string | null
  redirectUri: string
}) => {
  const store = await cookies()
  const expectedState = store.get(COOKIE_STATE)?.value
  const verifier = store.get(COOKIE_VERIFIER)?.value
  const clientId = store.get(COOKIE_CLIENT_ID)?.value

  if (!expectedState || !verifier || !clientId || state !== expectedState) {
    throw new Error("Ugyldig OAuth-tilstand. Prøv at logge ind igen.")
  }

  const tokens = await exchangeMolioCode({
    code,
    codeVerifier: verifier,
    redirectUri,
    clientId,
  })

  await persistMolioTokens(tokens)
  await clearMolioOAuthState()

  return tokens
}

export const getMolioSession = async () => {
  const store = await cookies()
  const refreshToken = store.get(COOKIE_REFRESH)?.value

  return {
    connected: Boolean(refreshToken || process.env.MOLIO_MCP_TOKEN?.trim()),
  }
}

export const resolveMolioAccessToken = async (): Promise<string> => {
  const envToken = process.env.MOLIO_MCP_TOKEN?.trim()
  if (envToken) {
    return envToken
  }

  const store = await cookies()
  const accessToken = store.get(COOKIE_ACCESS)?.value
  const refreshToken = store.get(COOKIE_REFRESH)?.value
  const expiresAt = Number(store.get(COOKIE_EXPIRES)?.value ?? 0)

  if (accessToken && expiresAt > Date.now() + 60_000) {
    return accessToken
  }

  if (!refreshToken) {
    throw new Error(
      "Log ind med Molio for at validere byggeplaner. Klik «Forbind Molio» øverst.",
    )
  }

  const tokens = await refreshMolioTokens(refreshToken)
  await persistMolioTokens(tokens)

  return tokens.access_token
}
