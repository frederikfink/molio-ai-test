import { Suspense } from "react"

import { PlanValidator } from "@/components/plan-validator"
import { Skeleton } from "@workspace/ui/components/skeleton"

export default function Page() {
  return (
    <>
      <section className="molio-hero border-molio-border border-b px-6 py-12 md:py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <p className="text-molio-primary text-sm font-medium tracking-wide uppercase">
            Byggeplan Validator
          </p>
          <h1 className="max-w-3xl text-3xl font-medium tracking-tight md:text-4xl">
            Viden, du bygger på
          </h1>
          <p className="text-molio-muted-foreground max-w-2xl text-base leading-relaxed md:text-lg">
            Validér byggeplaner mod gældende danske standarder via Molio. Find
            afvigelser, få rettelsesforslag med kilder — og et stempel af kvalitet
            du kan dokumentere.
          </p>
        </div>
      </section>

      <main className="flex-1 px-6 py-10">
        <Suspense
          fallback={
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          }
        >
          <PlanValidator />
        </Suspense>
      </main>
    </>
  )
}
