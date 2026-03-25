"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X, Wallet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useAccount, useSwitchChain, useBalance, useReadContract, useChainId } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import { parseUnits, formatUnits } from "viem"
import { useVaultDeposit } from "@/lib/hooks/useVault"

// USDC Contract on Base Sepolia (correct address)
const USDC_ADDRESS = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA069" as const
const USDC_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export function Web3ContractPayment({ formData, setFormData, onDepositComplete }: any) {
  const { address, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()
  const { data: ethBalance } = useBalance({ address })
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  
  const { deposit, isDepositing, isConfirming, isConfirmed, hash, error } = useVaultDeposit()

  const handleAddMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { title: "", amount: "", dueDate: "" }],
    })
  }

  const handleUpdateMilestone = (idx: number, field: string, value: string) => {
    const updated = [...formData.milestones]
    updated[idx] = { ...updated[idx], [field]: value }
    setFormData({ ...formData, milestones: updated })
  }

  const handleRemoveMilestone = (idx: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_: any, i: number) => i !== idx),
    })
  }

  const totalMilestones = formData.milestones.reduce(
    (sum: number, m: any) => sum + (Number.parseFloat(m.amount) || 0),
    0,
  )

  const totalAmount = formData.contractType === "one-off" 
    ? Number.parseFloat(formData.amount) || 0 
    : totalMilestones

  const handleDeposit = async () => {
    if (!address) {
      alert("Please connect your wallet first")
      return
    }

    // Check if on correct chain
    if (chainId !== baseSepolia.id) {
      try {
        await switchChain({ chainId: baseSepolia.id })
      } catch (error) {
        console.error("Failed to switch chain:", error)
        alert("Please switch to Base Sepolia network")
        return
      }
    }

    // Check if user has sufficient USDC balance
    const userBalance = usdcBalance || (0 as any)
    const requiredAmount = parseUnits(totalAmount.toString(), 6) // USDC has 6 decimals
    
    if (userBalance < requiredAmount) {
      const userBalanceFormatted = formatUnits(userBalance, 6)
      alert(`Insufficient USDC balance. You need ${totalAmount} USDC but have ${userBalanceFormatted} USDC`)
      return
    }

    try {
      await deposit(totalAmount.toString())
      if (isConfirmed) {
        onDepositComplete(hash)
      }
    } catch (error) {
      console.error("Deposit failed:", error)
      alert("Deposit failed. Please try again.")
    }
  }

  if (!isConnected) {
    return (
      <Card className="p-6 text-center">
        <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect Wallet Required</h3>
        <p className="text-muted-foreground mb-4">
          Please connect your wallet to create a contract with escrow protection
        </p>
        <Button className="rounded-full">
          Connect Wallet
        </Button>
      </Card>
    )
  }

  if (formData.type === "freelance") {
    return (
      <div className="space-y-8">
        {formData.contractType === "one-off" ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Budget</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Total Amount (USDC)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className="flex-1 px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="px-4 py-2 rounded-lg border border-muted bg-muted/30 flex items-center">
                    USDC
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current balance: {usdcBalance ? formatUnits(usdcBalance, 6) : "0"} USDC
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Project Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Payment Milestones</h2>
              <Button onClick={handleAddMilestone} className="rounded-full gap-2" size="sm">
                <Plus className="w-4 h-4" />
                Add Milestone
              </Button>
            </div>

            {formData.milestones.length > 0 && (
              <div className="space-y-3 mb-6">
                {formData.milestones.map((milestone: any, idx: number) => (
                  <Card key={idx} className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                          placeholder="Milestone name (e.g., Design Phase, Development)"
                          className="w-full px-3 py-2 rounded border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold mb-1 block">Amount (USDC)</label>
                        <input
                          type="number"
                          value={milestone.amount}
                          onChange={(e) => handleUpdateMilestone(idx, "amount", e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full px-3 py-2 rounded border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1 block">Due Date</label>
                        <input
                          type="date"
                          value={milestone.dueDate}
                          onChange={(e) => handleUpdateMilestone(idx, "dueDate", e.target.value)}
                          className="w-full px-3 py-2 rounded border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {formData.milestones.length > 0 && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-sm font-semibold">Total Project Value</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  ${totalMilestones.toFixed(2)} USDC
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Web3 USDC Deposit Section */}
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                USDC Escrow Deposit Required
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Deposit ${totalAmount.toFixed(2)} USDC to smart contract vault for escrow protection
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your USDC Balance</p>
              <p className="font-semibold">{usdcBalance ? formatUnits(usdcBalance, 6) : "0"} USDC</p>
            </div>
          </div>

          {usdcBalance && (usdcBalance < parseUnits(totalAmount.toString(), 6)) && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">
                Insufficient USDC balance. You need ${totalAmount.toFixed(2)} USDC but have {formatUnits(usdcBalance, 6)} USDC
              </p>
            </div>
          )}

          {isConfirmed ? (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-green-500">Deposit Confirmed!</p>
                <p className="text-xs text-muted-foreground">Transaction: {hash?.slice(0, 10)}...{hash?.slice(-8)}</p>
              </div>
            </div>
          ) : (
            <Button 
              onClick={handleDeposit}
              disabled={isDepositing || isConfirming || !totalAmount || (usdcBalance || (0 as any)) < parseUnits(totalAmount.toString(), 6)}
              className="w-full rounded-full"
            >
              {isDepositing || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isConfirming ? "Confirming..." : "Depositing..."}
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Deposit ${totalAmount.toFixed(2)} USDC to Escrow
                </>
              )}
            </Button>
          )}

          {error && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
              <p className="text-xs text-destructive">Deposit failed: {error.message}</p>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return <div>Other contract types coming soon...</div>
}
