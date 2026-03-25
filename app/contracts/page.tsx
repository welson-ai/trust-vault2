"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase, getContracts, acceptContract } from "@/lib/supabase"
import type { Contract } from "@/lib/supabase"
import { CheckCircle2, Clock, AlertCircle, ArrowLeft, X } from "lucide-react"
import Link from "next/link"

const statusConfig = {
  completed: { icon: CheckCircle2, badge: "bg-primary/20 text-primary", text: "Completed" },
  active: { icon: Clock, badge: "bg-secondary/20 text-secondary", text: "Active" },
  pending: { icon: AlertCircle, badge: "bg-muted/20 text-muted-foreground", text: "Pending" },
}

export default function ContractsPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [userEmail, setUserEmail] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        setUserEmail(user.email || "")

        const contractsData = await getContracts()
        setContracts(contractsData)
      } catch (error) {
        console.error("[v0] Error loading contracts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleAcceptContract = async (contractId: string) => {
    if (!userEmail) return

    setAcceptingId(contractId)
    const success = await acceptContract(contractId, userEmail)

    if (success) {
      // Reload contracts to show updated status
      const contractsData = await getContracts()
      setContracts(contractsData)
    }
    setAcceptingId(null)
  }

  const getParticipantStatus = (contract: Contract) => {
    const participant = contract.participants.find((p) => p.email === userEmail)
    return participant?.status || "pending"
  }

  const isParticipant = (contract: Contract) => {
    return contract.participants.some((p) => p.email === userEmail)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading contracts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Freelance Contracts</h1>
            <p className="text-muted-foreground mt-1">Manage and accept freelance contracts</p>
          </div>
        </div>
        <Link href="/contracts/create">
          <Button>Create Contract</Button>
        </Link>
      </div>

      {contracts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No contracts yet</p>
          <Link href="/contracts/create">
            <Button variant="outline">Create your first contract</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => {
            const config = statusConfig[contract.status as keyof typeof statusConfig] || statusConfig.pending
            const Icon = config.icon
            const isUserParticipant = isParticipant(contract)
            const userStatus = getParticipantStatus(contract)
            const createdDate = new Date(contract.created_at)
            const formattedDate = createdDate.toLocaleDateString()

            return (
              <Card 
                key={contract.id} 
                className="p-4 md:p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedContract(contract)}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.badge}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1">{contract.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{contract.description}</p>
                      <p className="text-xs text-muted-foreground">Created: {formattedDate}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold">${Number.parseFloat(contract.amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{contract.currency}</p>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">Participants</h4>
                  <div className="space-y-2">
                    {contract.participants.map((p) => (
                      <div key={p.email} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {p.email} <span className="capitalize">({p.role})</span>
                        </span>
                        {p.status === "accepted" && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            Validated
                          </span>
                        )}
                        {p.status === "pending" && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                            Pending
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {isUserParticipant && userStatus === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAcceptContract(contract.id)}
                      disabled={acceptingId === contract.id}
                      className="flex-1"
                    >
                      {acceptingId === contract.id ? "Accepting..." : "Accept Contract"}
                    </Button>
                  </div>
                )}

                {isUserParticipant && userStatus === "accepted" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 font-semibold">✓ Contract Validated</p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Contract Details Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background">
              <h2 className="text-xl font-bold">{selectedContract.title}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedContract(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedContract.description}</p>
              </div>

              {/* Contract Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold">${Number.parseFloat(selectedContract.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="text-lg font-semibold">{selectedContract.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-lg font-semibold capitalize">{selectedContract.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold capitalize">{selectedContract.status}</p>
                </div>
              </div>

              {/* Participants */}
              <div>
                <h3 className="font-semibold mb-3">All Participants</h3>
                <div className="space-y-2">
                  {selectedContract.participants.map((p) => (
                    <div key={p.email} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{p.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.role}</p>
                      </div>
                      {p.status === "accepted" && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          ✓ Validated
                        </span>
                      )}
                      {p.status === "pending" && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                          Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {selectedContract.participants.some(p => p.email === userEmail) && 
                selectedContract.participants.find(p => p.email === userEmail)?.status === "pending" && (
                <Button
                  onClick={() => {
                    handleAcceptContract(selectedContract.id)
                    setSelectedContract(null)
                  }}
                  disabled={acceptingId === selectedContract.id}
                  className="w-full"
                >
                  {acceptingId === selectedContract.id ? "Accepting..." : "Accept Contract"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
