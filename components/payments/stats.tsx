"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Lock, TrendingUp, Wallet, DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function PaymentStats() {
  const [stats, setStats] = useState({
    escrowedAmount: 0,
    availableBalance: 0,
    totalProcessed: 0,
    pendingPayouts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).single()

      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount, status, transaction_type")
        .eq("user_id", user.id)

      const { data: milestones } = await supabase.from("milestones").select("amount, status")

      const escrowedAmount = milestones?.reduce((sum, m) => sum + (m.amount || 0), 0) || 0
      const totalProcessed = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
      const pendingPayouts =
        transactions?.filter((t) => t.status === "pending").reduce((sum, t) => sum + (t.amount || 0), 0) || 0

      setStats({
        escrowedAmount,
        availableBalance: profile?.wallet_balance || 0,
        totalProcessed,
        pendingPayouts,
      })
    } catch (error) {
      console.error("[v0] Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: "Escrowed Amount",
      value: stats.escrowedAmount,
      icon: Lock,
      gradient: "from-primary to-secondary",
    },
    {
      label: "Available Balance",
      value: stats.availableBalance,
      icon: Wallet,
      gradient: "from-secondary to-accent",
    },
    {
      label: "Total Processed",
      value: stats.totalProcessed,
      icon: DollarSign,
      gradient: "from-accent to-primary",
    },
    {
      label: "Pending Payouts",
      value: stats.pendingPayouts,
      icon: TrendingUp,
      gradient: "from-primary/50 to-secondary/50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold">${stat.value.toFixed(2)}</h3>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} p-2.5 flex-shrink-0`}>
                <Icon className="w-full h-full text-white" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
