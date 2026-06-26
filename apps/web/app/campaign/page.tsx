import Image from "next/image"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"

const campaignItems = [
  {
    image: "/campaign/hallucinated-building.png",
    headline: "Sådan ser det ud, når AI hallucinerer din byggeplan",
    tagline:
      "ChatGPT kender ikke de nyeste standarder. Molio gør. Validér før du bygger.",
  },
  {
    image: "/campaign/trust-comparison.png",
    headline: "Arbejd frit — validér sikkert",
    tagline:
      "Brug de værktøjer du vil. Krydstjek med Molio, før det bliver dyrt.",
  },
  {
    image: "/campaign/molio-stamp.png",
    headline: "Få dit Molio-stempel i dag",
    tagline:
      "Tillid, der kan dokumenteres. Valideret mod gældende danske byggestandarder.",
  },
] as const

export default function CampaignPage() {
  return (
    <>
      <section className="molio-hero border-molio-border border-b px-6 py-12 md:py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <p className="text-molio-primary text-sm font-medium tracking-wide uppercase">
            Kampagne
          </p>
          <h1 className="max-w-3xl text-3xl font-medium tracking-tight md:text-4xl">
            Kampagne-materiale
          </h1>
          <p className="text-molio-muted-foreground max-w-2xl text-base leading-relaxed md:text-lg">
            Visuelle koncepter der kommunikerer risikoen ved ukontrolleret AI og
            værdien af Molio-validering.
          </p>
          <Button asChild variant="outline" className="mt-2 w-fit rounded-sm border-[#e7e7e8]">
            <Link href="/">Tilbage til validatoren</Link>
          </Button>
        </div>
      </section>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaignItems.map((item) => (
            <Card
              key={item.headline}
              className="overflow-hidden rounded-sm pt-0 shadow-none ring-1 ring-[#e7e7e8]"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={item.image}
                  alt={item.headline}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-base font-medium">{item.headline}</CardTitle>
                <CardDescription>{item.tagline}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-molio-muted-foreground text-xs">
                  Kampagne-koncept · Molio Byggeplan Validator
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
