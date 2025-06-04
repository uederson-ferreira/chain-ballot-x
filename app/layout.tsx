import type React from "react"
import "@/styles/globals.css"
import { Providers } from "./providers"
import Header from "@/components/Header"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Providers>
          <div className="min-h-screen">
            <Header />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}