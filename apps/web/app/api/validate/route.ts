import { gateway } from "@ai-sdk/gateway"
import { createTextStreamResponse, Output, stepCountIs, streamText, toTextStream } from "ai"

import { createMolioClient } from "@/lib/molio-mcp"
import { validationReportSchema } from "@/lib/schemas/validation-report"
import {
  buildValidationPrompt,
  VALIDATION_SYSTEM_PROMPT,
} from "@/lib/validation-prompt"

export const maxDuration = 120

export const POST = async (request: Request) => {
  let client: Awaited<ReturnType<typeof createMolioClient>> | undefined

  try {
    const body = (await request.json()) as { planText?: string }
    const planText = body.planText?.trim()

    if (!planText) {
      return Response.json(
        { error: "Indsæt venligst en byggeplan før validering." },
        { status: 400 },
      )
    }

    client = await createMolioClient()
    const tools = await client.tools()

    const result = streamText({
      model: gateway("anthropic/claude-sonnet-4"),
      system: VALIDATION_SYSTEM_PROMPT,
      tools,
      stopWhen: stepCountIs(12),
      output: Output.object({
        schema: validationReportSchema,
      }),
      prompt: buildValidationPrompt(planText),
      onFinish: async () => {
        await client?.close()
      },
    })

    return createTextStreamResponse({
      stream: toTextStream({ stream: result.stream }),
    })
  } catch (error) {
    await client?.close()

    const message =
      error instanceof Error
        ? error.message
        : "Validering fejlede. Prøv igen senere."

    const status = /authentication failed|401|unauthorized/i.test(message)
      ? 401
      : 500

    return Response.json({ error: message }, { status })
  }
}
