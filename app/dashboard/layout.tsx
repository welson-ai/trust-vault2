"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Sidebar } from "@/components/navigation/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 md:ml-48">
        <div className="sticky top-0 bg-background border-b border-border px-3 md:px-6 py-2 md:py-3 flex items-center gap-2 z-10 md:hidden">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">Back</span>
        </div>
        <div className="p-3 md:p-6 pb-20 md:pb-6 space-y-4">{children}</div>
      </main>
    </div>
  )
}
