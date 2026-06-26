"use client"

import { experimental_useObject as useObject } from "@ai-sdk/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Textarea } from "@workspace/ui/components/textarea"
import { ShieldCheckIcon } from "lucide-react"

import { ValidationWaitingGame } from "@/components/validation-waiting-game"
import { ValidationReportView } from "@/components/validation-report"
import { validationReportSchema } from "@/lib/schemas/validation-report"

const samplePlan = `Projekt: Ombygning af lejlighed, København

Brandkrav:
- Flugtveje dimensioneres efter BR18 kap. 11
- Døre i flugtvej skal have EI30 brandmodstand

Konstruktion:
- Bærende væg i stueetage fjernes for at skabe åbent køkken-alrum
- Nyt vinduesparti (3,2 m bredt) i bærende facade mod gården

VVS:
- Nye radiatorer monteres uden termostatventiler

Energi:
- U-værdi for nye vinduer: 1,4 W/m²K`

export const PlanValidator = () => {
  const searchParams = useSearchParams()
  const [planText, setPlanText] = useState("")
  const [requestError, setRequestError] = useState<string | null>(null)
  const [molioConnected, setMolioConnected] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/molio/session")
      .then((response) => response.json())
      .then((data: { connected?: boolean }) => {
        setMolioConnected(Boolean(data.connected))
      })
      .catch(() => {
        setMolioConnected(false)
      })
  }, [])

  useEffect(() => {
    const molioError = searchParams.get("molio_error")
    const molioConnectedParam = searchParams.get("molio_connected")

    if (molioError) {
      setRequestError(decodeURIComponent(molioError))
    }

    if (molioConnectedParam) {
      setMolioConnected(true)
    }
  }, [searchParams])

  const { object, submit, isLoading, error } = useObject({
    api: "/api/validate",
    schema: validationReportSchema,
    onError: (err) => {
      setRequestError(err.message)
    },
  })

  const handleSubmit = () => {
    setRequestError(null)

    if (!planText.trim()) {
      setRequestError("Indsæt venligst en byggeplan før validering.")
      return
    }

    submit({ planText })
  }

  const displayError = requestError ?? error?.message

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        {molioConnected === false && (
          <Button asChild size="lg">
            <a href="/api/molio/auth">Forbind Molio</a>
          </Button>
        )}
        {molioConnected === true && (
          <span className="bg-molio-muted text-molio-muted-foreground inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm">
            <ShieldCheckIcon className="text-molio-primary size-4" />
            Molio forbundet
          </span>
        )}
        <Link
          href="/campaign"
          className="text-molio-primary hover:text-molio-primary-dark text-sm font-medium underline-offset-4 transition-colors hover:underline"
        >
          Se kampagne-materiale
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-sm shadow-none ring-1 ring-[#e7e7e8]">
          <CardHeader>
            <CardTitle className="text-lg">Byggeplan</CardTitle>
            <CardDescription>
              Indsæt tekst fra din specifikation, beskrivelse eller AI-udkast.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea
              value={planText}
              onChange={(event) => setPlanText(event.target.value)}
              placeholder="Indsæt din byggeplan her..."
              className="min-h-80 resize-y font-mono text-sm"
            />
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || molioConnected === false}
                size="lg"
                className="rounded-sm px-10 text-base font-medium"
              >
                {isLoading ? "Validerer..." : "Validér mod Molio-standarder"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPlanText(samplePlan)}
                disabled={isLoading}
                size="lg"
                className="rounded-sm border-[#e7e7e8] px-8 text-base font-medium"
              >
                Brug eksempel
              </Button>
            </div>
            {displayError && (
              <p className="text-destructive text-sm">{displayError}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {isLoading && <ValidationWaitingGame active={isLoading} />}
          <ValidationReportView report={object} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
