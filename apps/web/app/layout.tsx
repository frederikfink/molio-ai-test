import type { Metadata } from "next"

import "@workspace/ui/globals.css"
import { MolioShell } from "@/components/molio-shell"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Molio Byggeplan Validator",
  description:
    "Validér byggeplaner mod gældende danske standarder med Molio-kilder, rettelsesforslag og tillidsscore.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="da">
      <body>
        <ThemeProvider>
          <MolioShell>{children}</MolioShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
