"use client"

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { TRUST_VAULT_ABI, TRUST_VAULT_ADDRESS } from '../contracts/vault'
import { useState } from 'react'

export function useVaultDeposit() {
  const [isDepositing, setIsDepositing] = useState(false)
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const deposit = async (amount: string) => {
    try {
      setIsDepositing(true)
      const amountInWei = parseEther(amount)
      
      await writeContract({
        address: TRUST_VAULT_ADDRESS,
        abi: TRUST_VAULT_ABI,
        functionName: 'deposit',
        value: amountInWei,
      })
    } catch (error) {
      console.error('Deposit error:', error)
      setIsDepositing(false)
      throw error
    }
  }

  return {
    deposit,
    isDepositing: isDepositing || isPending,
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
