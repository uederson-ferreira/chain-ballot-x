"use client"

import type React from "react"
import Header from "@/components/Header"

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
    </div>
  )
}
