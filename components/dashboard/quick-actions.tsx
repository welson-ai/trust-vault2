"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Send, Download } from "lucide-react"

export function DashboardQuickActions() {
  const router = useRouter()
  const [canExport, setCanExport] = useState(false)

  useEffect(() => {
    // Check if contracts exist in localStorage
    const contracts = localStorage.getItem("trust-vault-contracts")
    setCanExport(!!contracts)
  }, [])

  const handleExportReport = () => {
    if (typeof window === "undefined") return
    
    const contracts = localStorage.getItem("trust-vault-contracts")
    if (contracts) {
      const data = JSON.parse(contracts)
      const csv = [
        ["Title", "Type", "Amount", "Status", "Created"],
        ...data.map((c: any) => [c.title, c.type, c.amount, c.status || "Active", c.createdAt]),
      ]
        .map((row) => row.join(","))
        .join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "contracts-report.csv"
      a.click()
    }
  }

  return (
    <Card className="p-3 sm:p-4 bg-accent/5 border-accent/20">
      <h2 className="text-sm sm:text-base font-semibold mb-3 text-foreground">Quick Actions</h2>
      <div className="space-y-2">
        <Button
          className="w-full justify-start gap-2 text-xs sm:text-sm h-8 sm:h-9"
          size="sm"
          onClick={() => router.push("/contracts/create")}
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          New Contract
        </Button>
        <Button
          className="w-full justify-start gap-2 text-xs sm:text-sm h-8 sm:h-9"
          size="sm"
          onClick={() => router.push("/payments")}
          variant="outline"
        >
          <Send className="w-3 h-3 sm:w-4 sm:h-4" />
          Send Payment
        </Button>
        <Button
          className="w-full justify-start gap-2 text-xs sm:text-sm h-8 sm:h-9 bg-transparent"
          size="sm"
          onClick={handleExportReport}
          variant="outline"
          disabled={!canExport}
        >
          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          Export Report
        </Button>
      </div>
    </Card>
  )
}
