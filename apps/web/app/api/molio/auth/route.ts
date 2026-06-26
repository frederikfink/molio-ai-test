import { startMolioOAuth } from "@/lib/molio-oauth"

export const GET = async (request: Request) => {
  try {
    const origin = new URL(request.url).origin
    const redirectUri = `${origin}/api/molio/callback`
    const authorizeUrl = await startMolioOAuth(redirectUri)

    return Response.redirect(authorizeUrl)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Kunne ikke starte Molio-login."

    return Response.json({ error: message }, { status: 500 })
  }
}
