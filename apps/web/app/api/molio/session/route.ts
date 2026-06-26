import { getMolioSession } from "@/lib/molio-oauth"

export const GET = async () => {
  const session = await getMolioSession()
  return Response.json(session)
}
