import { completeMolioOAuth } from "@/lib/molio-oauth"

export const GET = async (request: Request) => {
  const url = new URL(request.url)
  const origin = url.origin
  const redirectUri = `${origin}/api/molio/callback`
  const error = url.searchParams.get("error")

  if (error) {
    return Response.redirect(
      `${origin}/?molio_error=${encodeURIComponent(error)}`,
    )
  }

  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")

  if (!code) {
    return Response.redirect(`${origin}/?molio_error=missing_code`)
  }

  try {
    await completeMolioOAuth({ code, state, redirectUri })
    return Response.redirect(`${origin}/?molio_connected=1`)
  } catch (callbackError) {
    const message =
      callbackError instanceof Error
        ? callbackError.message
        : "Molio-login fejlede."

    return Response.redirect(
      `${origin}/?molio_error=${encodeURIComponent(message)}`,
    )
  }
}
