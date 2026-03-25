"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { getContracts } from "@/lib/supabase"
import type { Contract } from "@/lib/supabase"

const statusConfig = {
  completed: { icon: CheckCircle2, badge: "bg-primary/20 text-primary", text: "Completed" },
  active: { icon: Clock, badge: "bg-secondary/20 text-secondary", text: "Active" },
  pending: { icon: AlertCircle, badge: "bg-muted/20 text-muted-foreground", text: "Pending" },
}

export function DashboardRecentActivity() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const loadContracts = async () => {
      try {
        setIsLoading(true)
        const data = await getContracts()
        setContracts(data || [])
        setError(null)
      } catch (err) {
        console.error("[v0] Error loading contracts:", err)
        setError("Failed to load contracts")
        setContracts([])
      } finally {
        setIsLoading(false)
      }
    }
    loadContracts()
  }, [])

  if (contracts.length === 0) {
    return (
      <Card className="p-3 md:p-4">
        <h2 className="text-sm md:text-base font-semibold mb-3">Recent Activity</h2>
        <div className="text-center py-6">
          <p className="text-xs md:text-sm text-muted-foreground">No contracts yet. Create one to get started!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-3 md:p-4">
      <h2 className="text-sm md:text-base font-semibold mb-3">Recent Activity</h2>
      <div className="space-y-2">
        {contracts
          .slice()
          .reverse()
          .slice(0, 5)
          .map((contract) => {
            const config = statusConfig[contract.status as keyof typeof statusConfig] || statusConfig.pending
            const Icon = config.icon
            const createdDate = new Date(contract.created_at)
            const timeAgo = Math.floor((Date.now() - createdDate.getTime()) / 1000)
            const formattedTime =
              timeAgo < 60 ? "now" : timeAgo < 3600 ? `${Math.floor(timeAgo / 60)}m` : `${Math.floor(timeAgo / 3600)}h`

            return (
              <div
                key={contract.id}
                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.badge}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs md:text-sm font-medium truncate">{contract.title}</h3>
                  <p className="text-xs text-muted-foreground">{contract.type}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs md:text-sm font-semibold">
                    ${Number.parseFloat(contract.amount).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">{formattedTime}</span>
                </div>
              </div>
            )
          })}
      </div>
    </Card>
  )
}
