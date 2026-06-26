import { z } from "zod"

export const issueSeveritySchema = z.enum(["high", "medium", "low"])
export const issueConfidenceSchema = z.enum(["high", "medium", "low"])

export const sourceSchema = z.object({
  title: z.string().describe("Titel på kilden fra Molio."),
  ref: z.string().describe("Reference, kode eller link til kilden."),
})

export const issueSchema = z.object({
  problem: z.string().describe("Beskrivelse af problemet i byggeplanen."),
  severity: issueSeveritySchema,
  whyItMatters: z
    .string()
    .describe("Hvorfor problemet er vigtigt for sikkerhed, compliance eller omkostninger."),
  suggestedFix: z
    .string()
    .describe("Konkret forslag til korrektion eller forbedring baseret på Molio-kilder."),
  sources: z
    .array(sourceSchema)
    .describe("Molio-kilder der understøtter forslaget. Tom hvis manuel gennemgang kræves."),
  confidence: issueConfidenceSchema,
})

export const validationReportSchema = z.object({
  summary: z.string().describe("Kort opsummering af valideringsresultatet på dansk."),
  issues: z.array(issueSchema),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Samlet tillidsscore for byggeplanen fra 0-100."),
  stamp: z
    .boolean()
    .describe("Om planen kvalificerer sig til Molio-stemplet."),
})

export type IssueSeverity = z.infer<typeof issueSeveritySchema>
export type IssueConfidence = z.infer<typeof issueConfidenceSchema>
export type Source = z.infer<typeof sourceSchema>
export type Issue = z.infer<typeof issueSchema>
export type ValidationReport = z.infer<typeof validationReportSchema>

export const computeStamp = (report: Omit<ValidationReport, "stamp">): boolean => {
  const hasHighSeverity = report.issues.some((issue) => issue.severity === "high")
  return !hasHighSeverity && report.confidenceScore >= 80
}
