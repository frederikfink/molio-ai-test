import Link from "next/link"

import { MolioLogo } from "@/components/molio-logo"

export const MolioHeader = () => {
  return (
    <header className="border-molio-border bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-foreground block w-28 shrink-0 md:w-36">
          <span className="sr-only">Molio</span>
          <MolioLogo className="h-auto w-full" />
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/campaign"
            className="text-foreground hover:text-molio-primary hidden transition-colors sm:inline"
          >
            Kampagne
          </Link>
          <a
            href="https://molio.dk/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-molio-primary transition-colors"
          >
            molio.dk
          </a>
        </nav>
      </div>
    </header>
  )
}
