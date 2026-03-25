"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, AlertCircle, Eye, Plus } from "lucide-react"
import { getContracts } from "@/lib/supabase"
import type { Contract } from "@/lib/supabase"

const statusConfig = {
  active: { icon: CheckCircle2, badge: "bg-secondary/20 text-secondary", text: "Active" },
  pending: { icon: Clock, badge: "bg-primary/20 text-primary", text: "Pending" },
  completed: { icon: CheckCircle2, badge: "bg-accent/20 text-accent", text: "Completed" },
  disputed: { icon: AlertCircle, badge: "bg-destructive/20 text-destructive", text: "Disputed" },
}

export function TasksList() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadContracts = async () => {
      const data = await getContracts()
      setContracts(data)
      setLoading(false)
    }
    loadContracts()
  }, [])

  if (loading) {
    return (
      <Card className="p-16 text-center">
        <p className="text-muted-foreground">Loading contracts...</p>
      </Card>
    )
  }

  if (contracts.length === 0) {
    return (
      <Card className="p-16 text-center">
        <div className="space-y-4">
          <div className="inline-block p-3 bg-primary/10 rounded-full">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No contracts yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Create your first contract to get started. Assign work, set deadlines, and manage payments with Trust Vault.
          </p>
          <Link href="/contracts/create">
            <Button className="rounded-full gap-2 mt-4">
              <Plus className="w-4 h-4" />
              Create Contract
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {contracts.map((contract) => {
        const config = statusConfig[contract.status as keyof typeof statusConfig]
        const Icon = config.icon
        return (
          <Card key={contract.id} className="p-6 hover:border-secondary/50 transition-all">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{contract.title}</h3>
                    <Badge className={config.badge}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.text}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{contract.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-primary">
                    {contract.currency} {contract.amount}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Escrow</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Type</span>
                  <span className="text-sm text-muted-foreground capitalize">{contract.contract_type}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Participants: </span>
                    <span className="font-medium">{contract.participants.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deadline: </span>
                    <span className="font-medium">{new Date(contract.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
