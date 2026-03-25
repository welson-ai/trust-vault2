"use client"

import { useState, useEffect } from "react"

export interface Contract {
  id: string
  title: string
  description: string
  type: "freelance" | "chama" | "purchase"
  contractType: "one-off" | "milestone"
  participants: Array<{ email: string; role: "freelancer" | "client" | "member" }>
  amount: string
  currency: string
  deadline: string
  milestones: Array<{ title: string; amount: string; dueDate: string }>
  status: "active" | "pending" | "completed" | "disputed"
  createdAt: string
}

// Mock user database for MVP
export const mockUserDatabase = [
  { id: "1", email: "metanexus@gmail.com", name: "Metanexus", trusted: true },
  { id: "2", email: "freelancer@gmail.com", name: "John Freelancer", trusted: true },
  { id: "3", email: "client@gmail.com", name: "Jane Client", trusted: true },
  { id: "4", email: "jahnetkiminza@gmail.com", name: "Jahnet Kiminza", trusted: true },
]

export function getContracts(): Contract[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("trust_vault_contracts")
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveContract(contract: Contract): void {
  if (typeof window === "undefined") return
  const contracts = getContracts()
  contracts.push(contract)
  localStorage.setItem("trust_vault_contracts", JSON.stringify(contracts))
}

export function userExists(email: string): boolean {
  return mockUserDatabase.some((user) => user.email.toLowerCase() === email.toLowerCase())
}

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setContracts(getContracts())
    setLoading(false)
  }, [])

  return { contracts, loading }
}
