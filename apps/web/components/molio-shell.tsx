import { MolioFooter } from "@/components/molio-footer"
import { MolioHeader } from "@/components/molio-header"

type Props = {
  children: React.ReactNode
}

export const MolioShell = ({ children }: Props) => {
  return (
    <div className="flex min-h-svh flex-col">
      <MolioHeader />
      {children}
      <MolioFooter />
    </div>
  )
}
