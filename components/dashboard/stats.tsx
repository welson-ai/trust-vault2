"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, CheckCircle2, Clock } from "lucide-react"
import { getContracts } from "@/lib/supabase"
import type { Contract } from "@/lib/supabase"

export function DashboardStats() {
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

  const totalAmount = contracts.reduce((sum, contract) => sum + (Number.parseFloat(contract.amount) || 0), 0)
  const activeContracts = contracts.filter((c) => c.status === "active").length
  const completedContracts = contracts.filter((c) => c.status === "completed").length
  const pendingPayouts = contracts
    .filter((c) => c.status === "active")
    .reduce((sum, contract) => sum + (Number.parseFloat(contract.amount) || 0), 0)

  const stats = [
    {
      label: "Total Transacted",
      value: `$${totalAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      change: `${contracts.length} contracts`,
      icon: DollarSign,
    },
    {
      label: "Active",
      value: activeContracts.toString(),
      change: "In progress",
      icon: Clock,
    },
    {
      label: "Completed",
      value: completedContracts.toString(),
      change: "Finished",
      icon: CheckCircle2,
    },
    {
      label: "Pending",
      value: `$${pendingPayouts.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      change: "In escrow",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className="p-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground line-clamp-1">{stat.label}</p>
                <Icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </div>
              <h3 className="text-xs font-bold line-clamp-1">{stat.value}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{stat.change}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
