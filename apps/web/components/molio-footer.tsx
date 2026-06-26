import Link from "next/link"

import { MolioLogo } from "@/components/molio-logo"

export const MolioFooter = () => {
  return (
    <footer className="bg-molio-muted text-foreground mt-auto">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-10 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Link href="/" className="block w-28">
            <span className="sr-only">Molio</span>
            <MolioLogo className="h-auto w-full" />
          </Link>
          <p className="text-molio-muted-foreground max-w-xs text-sm leading-relaxed">
            Viden, du bygger på. Validér byggeplaner mod gældende danske standarder.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <p className="font-medium">Værktøj</p>
          <Link href="/" className="text-molio-muted-foreground hover:text-foreground transition-colors">
            Byggeplan Validator
          </Link>
          <Link
            href="/campaign"
            className="text-molio-muted-foreground hover:text-foreground transition-colors"
          >
            Kampagne-materiale
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium">Molio</p>
          <p className="text-molio-muted-foreground">Lyskær 1, 2730 Herlev</p>
          <a
            href="tel:70120600"
            className="text-molio-muted-foreground hover:text-foreground transition-colors"
          >
            7012 0600
          </a>
          <a
            href="mailto:molio@molio.dk"
            className="text-molio-muted-foreground hover:text-foreground transition-colors"
          >
            molio@molio.dk
          </a>
          <a
            href="https://molio.dk/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-molio-primary hover:text-molio-primary-dark mt-1 font-medium transition-colors"
          >
            Besøg molio.dk →
          </a>
        </div>
      </div>
    </footer>
  )
}
