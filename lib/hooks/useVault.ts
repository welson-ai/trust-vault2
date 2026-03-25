"use client"

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { TRUST_VAULT_ABI, TRUST_VAULT_ADDRESS, USDC_ADDRESS } from '../contracts/vault'
import { useState } from 'react'

// USDC ABI for approval
const USDC_ABI = [
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

export function useVaultDeposit() {
  const [isDepositing, setIsDepositing] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const approveUSDC = async (amount: string) => {
    try {
      setIsApproving(true)
      const amountInWei = parseUnits(amount, 6) // USDC has 6 decimals
      
      await writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [TRUST_VAULT_ADDRESS, amountInWei],
      })
    } catch (error) {
      console.error('Approval error:', error)
      setIsApproving(false)
      throw error
    }
  }

  const deposit = async (amount: string) => {
    try {
      setIsDepositing(true)
      const amountInWei = parseUnits(amount, 6) // USDC has 6 decimals
      
      await writeContract({
        address: TRUST_VAULT_ADDRESS,
        abi: TRUST_VAULT_ABI,
        functionName: 'deposit',
        args: [amountInWei],
      })
    } catch (error) {
      console.error('Deposit error:', error)
      setIsDepositing(false)
      setIsApproving(false)
      throw error
    }
  }

  const depositWithApproval = async (amount: string) => {
    // First approve USDC spending
    await approveUSDC(amount)
    // Then deposit to vault
    await deposit(amount)
  }

  return {
    deposit: depositWithApproval,
    isDepositing: isDepositing || isPending || isApproving,
    isConfirming,
    isConfirmed,
    hash,
    error
  }
}

export function useVaultBalance(address: `0x${string}` | undefined) {
  const { data: balance, error, isLoading } = useReadContract({
    address: TRUST_VAULT_ADDRESS,
    abi: TRUST_VAULT_ABI,
    functionName: 'getBalance',
    args: address ? [address] : undefined,
  })

  return {
    balance,
    error,
    isLoading
  }
}

export function useVaultTotalBalance() {
  const { data: totalBalance, error, isLoading } = useReadContract({
    address: TRUST_VAULT_ADDRESS,
    abi: TRUST_VAULT_ABI,
    functionName: 'getTotalBalance',
  })

  return {
    totalBalance,
    error,
    isLoading
  }
}
