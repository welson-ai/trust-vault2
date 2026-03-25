"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X, Wallet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useAccount, useSwitchChain, useBalance, useReadContract, useChainId } from "wagmi"
import { baseSepolia, base } from "wagmi/chains"
import { parseUnits, formatUnits } from "viem"
import { useVaultDeposit } from "@/lib/hooks/useVault"
import { USDC_ADDRESS, USDC_ADDRESS_SEPOLIA, USDC_ADDRESS_MAINNET } from "@/lib/contracts/vault"

// Direct ERC20 balance check (alternative method)
const useERC20Balance = (contractAddress: string, walletAddress: string | undefined) => {
  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: [
      {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress] : undefined,
    enabled: !!walletAddress && !!contractAddress,
  })
}

// Get appropriate USDC address based on current network
const getUSDCAddress = (chainId: number) => {
  switch (chainId) {
    case base.id:
      return USDC_ADDRESS_MAINNET
    case baseSepolia.id:
      return USDC_ADDRESS_SEPOLIA
    default:
      console.log("⚠️ Unknown chain, defaulting to Sepolia USDC")
      return USDC_ADDRESS_SEPOLIA
  }
}

// Try multiple USDC addresses for debugging
const ALL_USDC_ADDRESSES = [
  "0x7169D38820dfd117C3FA1f22a697dBA58d90BA069", // Base Sepolia
  "0xd9aAEc86BC6510E7020C6d87d3661f6a95bA", // Base Mainnet
  "0x036CbD5b381b824e568Ff7c85cE36985D8B764a", // Old Base Sepolia
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA028", // Another possible address
]
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
  const currentUSDCAddress = getUSDCAddress(chainId || baseSepolia.id)
  
  console.log("🔍 Debug Info:")
  console.log("- Connected Address:", address)
  console.log("- Chain ID:", chainId)
  console.log("- Current USDC Address:", currentUSDCAddress)
  
  const { data: usdcBalance, error: balanceError, isLoading: balanceLoading } = useReadContract({
    address: currentUSDCAddress,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!currentUSDCAddress,
    }
  })
  
  console.log("- USDC Balance Raw:", usdcBalance)
  console.log("- Balance Error:", balanceError)
  console.log("- Balance Loading:", balanceLoading)
  console.log("- Balance Error Message:", balanceError?.message)
  console.log("- Balance Error Code:", balanceError?.code)
  
  // Try multiple USDC addresses if primary fails
  const [fallbackBalance, setFallbackBalance] = useState<any>(null)
  
  // Read from all possible USDC addresses for debugging
  const { data: debugBalance1 } = useERC20Balance(ALL_USDC_ADDRESSES[0], address)
  const { data: debugBalance2 } = useERC20Balance(ALL_USDC_ADDRESSES[1], address)
  const { data: debugBalance3 } = useERC20Balance(ALL_USDC_ADDRESSES[2], address)
  const { data: debugBalance4 } = useERC20Balance(ALL_USDC_ADDRESSES[3], address)
  
  console.log("- Debug Balance 1:", debugBalance1)
  console.log("- Debug Balance 2:", debugBalance2)
  console.log("- Debug Balance 3:", debugBalance3)
  console.log("- Debug Balance 4:", debugBalance4)
  
  // Use working balance or fallback
  const workingBalance = usdcBalance || debugBalance1 || debugBalance2 || debugBalance3 || debugBalance4 || fallbackBalance
  console.log("- Working Balance:", workingBalance)
  
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
    if (chainId !== baseSepolia.id && chainId !== base.id) {
      try {
        // Prefer Base Sepolia for testing, fallback to Base Mainnet
        await switchChain({ chainId: baseSepolia.id })
      } catch (error) {
        console.error("Failed to switch chain:", error)
        alert("Please switch to Base Sepolia or Base Mainnet network")
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

  {/* Error Display */}
  {balanceError && (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <div>
          <p className="font-semibold text-red-500">Balance Reading Error</p>
          <p className="text-sm text-red-600">Error: {balanceError.message}</p>
          <p className="text-xs text-red-500">Code: {balanceError.code || 'UNKNOWN'}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Trying alternative addresses... Check console for details.
          </p>
        </div>
      </div>
    </div>
  )}

  {/* Debug Info Panel */}
  {process.env.NODE_ENV === 'development' && (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
      <p className="font-semibold text-blue-500 mb-2">🔍 Debug Information</p>
      <div className="text-xs space-y-1">
        <p><strong>Network:</strong> {chainId === base.id ? 'Base Mainnet' : chainId === baseSepolia.id ? 'Base Sepolia' : 'Unknown'}</p>
        <p><strong>USDC Address:</strong> {currentUSDCAddress}</p>
        <p><strong>Wallet Address:</strong> {address || 'Not connected'}</p>
        <p><strong>Working Balance:</strong> {workingBalance ? formatUnits(workingBalance, 6) : 'Not found'}</p>
      </div>
    </div>
  )}

  {formData.type === "freelance" && (
    <div className="space-y-8">
      {formData.contractType === "one-off" ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Project Budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Total Amount (USDC)</label>
              <div className="flex gap-2">
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
                  Current balance: {workingBalance ? formatUnits(workingBalance, 6) : "Loading..."} USDC
                  {balanceError && <span className="text-destructive ml-2">❌ Balance Error</span>}
                  {balanceLoading && <span className="text-muted-foreground ml-2">⏳ Loading...</span>}
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
              <p className="font-semibold">
                {workingBalance ? formatUnits(workingBalance, 6) : "Loading..."} USDC
                {balanceError && <span className="text-destructive ml-2">❌</span>}
                {balanceLoading && <span className="text-muted-foreground ml-2">⏳</span>}
              </p>
            </div>
          </div>

          {workingBalance && (workingBalance < parseUnits(totalAmount.toString(), 6)) && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">
                Insufficient USDC balance. You need ${totalAmount.toFixed(2)} USDC but have {formatUnits(workingBalance, 6)} USDC
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
              disabled={isDepositing || isConfirming || !totalAmount || !workingBalance || (workingBalance < parseUnits(totalAmount.toString(), 6))}
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
