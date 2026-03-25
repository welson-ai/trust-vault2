"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Lock, CheckCircle2, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"

type EscrowTransaction = {
  id: string
  title: string
  amount: number
  date: string
  status: "held" | "released"
  released: number
  milestone: string
}

type PaymentTransaction = {
  id: string
  type: "received" | "sent" | "pending"
  title: string
  amount: number
  date: string
  status: "completed" | "pending"
  method: string
}

export function PaymentsTabs() {
  const [activeTab, setActiveTab] = useState<"escrow" | "history">("escrow")
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.log("[v0] No authenticated user for transactions")
        setLoading(false)
        return
      }

      const { data: contracts } = await supabase
        .from("contracts")
        .select(
          `
          id,
          title,
          amount,
          deadline,
          status,
          milestones (
            id,
            title,
            amount,
            due_date,
            status
          )
        `,
        )
        .order("created_at", { ascending: false })

      const escrow: EscrowTransaction[] = []

      if (contracts) {
        contracts.forEach((contract: any) => {
          if (contract.milestones && Array.isArray(contract.milestones)) {
            contract.milestones.forEach((m: any) => {
              escrow.push({
                id: m.id,
                title: `${contract.title} - ${m.title}`,
                amount: m.amount || 0,
                date: new Date(m.due_date).toLocaleDateString(),
                status: m.status === "completed" ? "released" : "held",
                released: m.status === "completed" ? 100 : 50,
                milestone: m.title,
              })
            })
          }
        })
      }

      const { data: payments } = await supabase
        .from("payments")
        .select("id, transaction_type, amount, created_at, status")
        .order("created_at", { ascending: false })
        .limit(20)

      const paymentList: PaymentTransaction[] = (payments || []).map((t: any) => ({
        id: t.id,
        type: t.transaction_type === "payment" ? "sent" : "received",
        title: t.transaction_type === "withdrawal" ? "Withdrawal" : "Payment",
        amount: t.amount || 0,
        date: new Date(t.created_at).toLocaleDateString(),
        status: t.status === "completed" ? "completed" : "pending",
        method: "Direct Transfer",
      }))

      setEscrowTransactions(escrow)
      setPaymentHistory(paymentList)
    } catch (error) {
      console.error("[v0] Error loading transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading transactions...</div>
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("escrow")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "escrow"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Escrow Accounts ({escrowTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Payment History ({paymentHistory.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "escrow" && (
        <div className="space-y-4">
          {escrowTransactions.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">No escrow accounts yet</Card>
          ) : (
            escrowTransactions.map((tx) => (
              <Card key={tx.id} className="p-6 hover:border-secondary/50 transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-accent" />
                        <h3 className="font-semibold">{tx.title}</h3>
                        <Badge
                          className={tx.status === "held" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}
                        >
                          {tx.status === "held" ? "Held in Escrow" : "Released"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Milestone: {tx.milestone}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${tx.amount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{tx.date}</div>
                    </div>
                  </div>
                  <div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${tx.released}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {paymentHistory.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">No payment history yet</Card>
          ) : (
            paymentHistory.map((payment) => {
              const isReceived = payment.type === "received"
              const Icon = isReceived ? ArrowDown : ArrowUp
              return (
                <Card key={payment.id} className="p-6 hover:border-secondary/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isReceived ? "bg-accent/20" : "bg-primary/20"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isReceived ? "text-accent" : "text-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{payment.title}</h3>
                        <p className="text-sm text-muted-foreground">{payment.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isReceived ? "text-accent" : "text-foreground"}`}>
                        ${payment.amount.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {payment.status === "completed" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-accent" />
                            <span className="text-xs text-muted-foreground">{payment.date}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-xs text-primary">{payment.date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
