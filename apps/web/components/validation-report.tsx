"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { Separator } from "@workspace/ui/components/separator"
import { type DeepPartial } from "ai"
import { CheckCircle2Icon, AlertTriangleIcon } from "lucide-react"

import {
  type ValidationReport,
} from "@/lib/schemas/validation-report"

type Props = {
  report: DeepPartial<ValidationReport> | undefined
  isLoading?: boolean
}

const severityLabels = {
  high: "Høj",
  medium: "Medium",
  low: "Lav",
} as const

const severityVariants = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const

const confidenceLabels = {
  high: "Høj",
  medium: "Medium",
  low: "Lav",
} as const

const confidenceStyles = {
  high: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-border bg-muted/50 text-muted-foreground",
} as const

export const ValidationReportView = ({ report, isLoading }: Props) => {
  if (!report && !isLoading) {
    return null
  }

  const confidenceScore = report?.confidenceScore ?? 0
  const issues = report?.issues ?? []
  const stamp =
    report?.summary &&
    report.confidenceScore !== undefined &&
    !issues.some((issue) => issue?.severity === "high") &&
    report.confidenceScore >= 80

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-sm shadow-none ring-1 ring-[#e7e7e8]">
        <CardHeader>
          <CardTitle className="text-lg">Valideringsresultat</CardTitle>
          <CardDescription>
            {report?.summary ??
              (isLoading
                ? "Analyserer byggeplan mod Molio-standarder..."
                : "Ingen resultater endnu.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tillidsscore</span>
              <span className="font-medium">{confidenceScore}/100</span>
            </div>
            <Progress value={confidenceScore} className="h-2" />
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            {stamp ? (
              <>
                <CheckCircle2Icon className="text-[#7fb439] size-5" />
                <div>
                  <p className="font-medium">Molio-stempel tildelt</p>
                  <p className="text-muted-foreground text-sm">
                    Planen opfylder gældende standarder uden kritiske afvigelser.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangleIcon className="text-muted-foreground size-5" />
                <div>
                  <p className="font-medium">
                    {isLoading ? "Validerer..." : "Intet Molio-stempel endnu"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {isLoading
                      ? "Vent mens vi krydstjekker mod Molio-kilder."
                      : "Ret fundne problemer for at opnå godkendelse."}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {issues.length > 0 && (
        <Card className="rounded-sm shadow-none ring-1 ring-[#e7e7e8]">
          <CardHeader>
            <CardTitle className="text-lg">Fundne problemer ({issues.length})</CardTitle>
            <CardDescription>
              Hver anbefaling er baseret på Molio-kilder, hvor det er muligt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {issues.map((issue, index) => {
                if (!issue?.problem) return null

                const severity = issue.severity ?? "medium"

                return (
                  <AccordionItem key={`${issue.problem}-${index}`} value={`issue-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex flex-col gap-1 pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={severityVariants[severity]}>
                            Alvor: {severityLabels[severity]}
                          </Badge>
                          {issue.confidence && (
                            <Badge
                              variant="outline"
                              className={confidenceStyles[issue.confidence]}
                            >
                              {issue.confidence === "high" && (
                                <CheckCircle2Icon className="size-3" />
                              )}
                              Tillid: {confidenceLabels[issue.confidence]}
                            </Badge>
                          )}
                        </div>
                        <span>{issue.problem}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-3 pt-1">
                        {issue.whyItMatters && (
                          <div>
                            <p className="mb-1 text-sm font-medium">Hvorfor det betyder noget</p>
                            <p className="text-muted-foreground text-sm">{issue.whyItMatters}</p>
                          </div>
                        )}
                        {issue.suggestedFix && (
                          <div>
                            <p className="mb-1 text-sm font-medium">Foreslået rettelse</p>
                            <p className="text-sm">{issue.suggestedFix}</p>
                          </div>
                        )}
                        {issue.sources && issue.sources.length > 0 && (
                          <div>
                            <p className="mb-2 text-sm font-medium">Molio-kilder</p>
                            <ul className="flex flex-col gap-2">
                              {issue.sources.map((source, sourceIndex) => {
                                if (!source?.title) return null

                                return (
                                  <li
                                    key={`${source.title}-${sourceIndex}`}
                                    className="bg-muted/50 rounded-lg border px-3 py-2 text-sm"
                                  >
                                    <p className="font-medium">{source.title}</p>
                                    {source.ref && (
                                      <p className="text-muted-foreground mt-1 font-mono text-xs">
                                        {source.ref}
                                      </p>
                                    )}
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
