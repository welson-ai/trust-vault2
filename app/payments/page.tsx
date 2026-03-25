"use client"

import { PaymentsHeader } from "@/components/payments/header"
import { PaymentStats } from "@/components/payments/stats"
import { PaymentsTabs } from "@/components/payments/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PaymentsPage() {
  const router = useRouter()
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>
      <PaymentsHeader />
      <PaymentStats />
      <PaymentsTabs />
    </div>
  )
}
