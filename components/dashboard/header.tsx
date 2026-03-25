"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export function DashboardHeader() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    checkWalletConnection()
    
    if (window.ethereum) {
      try {
        window.ethereum.on("accountsChanged", handleAccountsChanged)
      } catch (error) {
        console.error("[v0] Error setting up ethereum listener:", error)
      }
    }
    
    return () => {
      if (window.ethereum) {
        try {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        } catch (error) {
          console.error("[v0] Error removing ethereum listener:", error)
        }
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

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl md:text-3xl font-bold">Welcome back!</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">Your financial overview</p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2">
        {isConnected && walletAddress ? (
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg gap-2 text-xs h-8 bg-transparent"
            onClick={disconnectWallet}
          >
            <Wallet className="w-3 h-3" />
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </Button>
        ) : (
          <Button onClick={connectMetaMask} disabled={isConnecting} size="sm" className="rounded-lg gap-2 text-xs h-8">
            <Wallet className="w-3 h-3" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </div>
    </div>
  )
}
