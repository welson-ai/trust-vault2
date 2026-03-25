"use client"

import type React from "react"

import { useState } from "react"
import { X, Wallet, CreditCard, Smartphone } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

type WithdrawModalProps = {
  isOpen: boolean
  onClose: () => void
  userBalance: number
}

export function WithdrawModal({ isOpen, onClose, userBalance }: WithdrawModalProps) {
  const [method, setMethod] = useState<"crypto" | "visa" | "mpesa">("crypto")
  const [amount, setAmount] = useState("")
  const [destination, setDestination] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()

    const withdrawAmount = Number.parseFloat(amount)
    if (withdrawAmount <= 0 || withdrawAmount > userBalance) {
      alert("Invalid withdrawal amount")
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "withdrawal",
        amount: withdrawAmount,
        status: "completed",
        withdrawal_method: method,
        destination_address: destination,
      })

      if (txError) throw txError

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ wallet_balance: userBalance - withdrawAmount })
        .eq("id", user.id)

      if (profileError) throw profileError

      alert(`Withdrawal of $${withdrawAmount.toFixed(2)} via ${method.toUpperCase()} initiated!`)
      setAmount("")
      setDestination("")
      onClose()
    } catch (error: any) {
      console.error("[v0] Withdrawal error:", error)
      alert(error.message || "Failed to process withdrawal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full p-6 relative border border-border">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Withdraw Funds</h2>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground font-medium">Available Balance</p>
          <p className="text-3xl font-bold text-primary">${userBalance.toFixed(2)}</p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Withdrawal Method</label>
            <div className="space-y-2">
              {[
                { value: "crypto", label: "Crypto Wallet", desc: "Solana wallet transfer", icon: Wallet },
                { value: "visa", label: "Visa TAP", desc: "Credit to card", icon: CreditCard },
                { value: "mpesa", label: "M-Pesa", desc: "Mobile money", icon: Smartphone },
              ].map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value as any)}
                  className={`w-full flex items-center space-x-3 p-4 border-2 rounded-lg transition-all ${
                    method === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount (USD)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {method === "crypto" ? "Solana Address" : method === "visa" ? "Card Number" : "Phone Number"}
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={method === "crypto" ? "7xK..." : method === "visa" ? "4532..." : "+254..."}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-full">
            {loading ? "Processing..." : "Withdraw"}
          </Button>
        </form>
      </div>
    </div>
  )
}
