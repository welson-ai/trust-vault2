"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Wallet, LogOut } from "lucide-react"
import { WithdrawModal } from "./withdraw-modal"
import { supabase } from "@/lib/supabase"

export function PaymentsHeader() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkWalletConnection()
    loadUserData()
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
    }
    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window === "undefined" || !window.ethereum) return
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)
      }
    } catch (error) {
      console.error("[v0] Error checking wallet:", error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false)
      setWalletAddress("")
    } else {
      setWalletAddress(accounts[0])
      setIsConnected(true)
    }
  }

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).single()

      if (profile) {
        setUserBalance(profile.wallet_balance || 0)
      }
    } catch (error) {
      console.error("[v0] Error loading user data:", error)
    }
  }

  const connectMetaMask = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask is not installed. Please install it to continue.")
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)
      }
    } catch (error) {
      console.error("[v0] Failed to connect MetaMask:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Payments & Escrow</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Track all transactions and escrow accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2 bg-transparent text-xs">
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          {isConnected && walletAddress ? (
            <Button
              variant="outline"
              className="rounded-full gap-2 bg-transparent text-xs"
              onClick={handleDisconnectWallet}
            >
              <LogOut className="w-3 h-3" />
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Button>
          ) : (
            <Button onClick={connectMetaMask} disabled={isConnecting} className="rounded-full gap-2 text-xs">
              <Wallet className="w-3 h-3" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}

          <Button
            onClick={() => setIsWithdrawOpen(true)}
            className="rounded-full gap-2 bg-accent hover:bg-accent/90 text-xs"
          >
            Withdraw
          </Button>
        </div>
      </div>

      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} userBalance={userBalance} />
    </>
  )
}
