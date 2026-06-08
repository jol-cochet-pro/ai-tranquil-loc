import type { ReactNode } from "react"
import { CitySkyline } from "./CitySkyline"

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <CitySkyline />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
