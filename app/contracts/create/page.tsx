"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { ContractBasics } from "@/components/contracts/contract-basics"
import { ContractParticipants } from "@/components/contracts/contract-participants"
import { ContractPayment } from "@/components/contracts/contract-payment"
import { ContractReview } from "@/components/contracts/contract-review"
import { saveContract } from "@/lib/supabase"

export default function CreateContractPage() {
  const router = useRouter()
  const [step, setStep] = useState<"basics" | "participants" | "payment" | "review">("basics")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "freelance" as const,
    contractType: "one-off" as const,
    participants: [] as Array<{ email: string; role: "freelancer" | "client" | "member" }>,
    amount: "",
    currency: "USD",
    deadline: "",
    milestones: [] as Array<{ title: string; amount: string; dueDate: string }>,
  })
  const [error, setError] = useState("")

  const steps = [
    { id: "basics", label: "Basics", completed: !!formData.title },
    { id: "participants", label: "Participants", completed: formData.participants.length > 0 },
    { id: "payment", label: "Payment", completed: !!formData.amount },
    { id: "review", label: "Review", completed: false },
  ]

  const handleNext = useCallback(async () => {
    if (step === "participants") {
      if (formData.participants.length === 0) {
        setError("Please add at least one participant to continue")
        return
      }
    }

    if (step === "basics" && !formData.title) {
      setError("Please enter a contract title")
      return
    }

    if (step === "payment" && !formData.amount) {
      setError("Please enter an amount")
      return
    }

    setError("")

    const stepOrder: ("basics" | "participants" | "payment" | "review")[] = [
      "basics",
      "participants",
      "payment",
      "review",
    ]
    const nextIndex = stepOrder.indexOf(step) + 1
    if (nextIndex < stepOrder.length) {
      setStep(stepOrder[nextIndex])
    }
  }, [step, formData])

  const handlePrev = useCallback(() => {
    setError("")
    const stepOrder: ("basics" | "participants" | "payment" | "review")[] = [
      "basics",
      "participants",
      "payment",
      "review",
    ]
    const prevIndex = stepOrder.indexOf(step) - 1
    if (prevIndex >= 0) {
      setStep(stepOrder[prevIndex])
    }
  }, [step])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const contract = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        contract_type: formData.contractType,
        participants: formData.participants,
        amount: formData.amount,
        currency: formData.currency,
        deadline: formData.deadline,
        milestones: formData.milestones,
        status: "active" as const,
      }

      console.log("[v0] Submitting contract:", contract)
      const saved = await saveContract(contract)

      if (saved) {
        console.log("[v0] Contract saved successfully:", saved)
        router.push("/tasks")
      } else {
        setError("Failed to save contract. Please try again.")
        console.error("[v0] Contract save returned null")
      }
    } catch (err) {
      console.error("[v0] Error submitting contract:", err)
      setError("An error occurred while creating the contract. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Contract</h1>
            <p className="text-muted-foreground mt-1">Set up and manage your next contract</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => !isSubmitting && setStep(s.id as any)}
              className="flex flex-col items-center gap-2 group disabled:opacity-50"
              disabled={isSubmitting}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  step === s.id
                    ? "bg-primary text-white"
                    : s.completed
                      ? "bg-accent text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {s.completed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  step === s.id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-8 border-destructive/50 bg-destructive/5">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Content */}
        <Card className="p-8 mb-8">
          {step === "basics" && <ContractBasics formData={formData} setFormData={setFormData} />}
          {step === "participants" && <ContractParticipants formData={formData} setFormData={setFormData} />}
          {step === "payment" && <ContractPayment formData={formData} setFormData={setFormData} />}
          {step === "review" && <ContractReview formData={formData} />}
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === "basics" || isSubmitting}
            className="rounded-full bg-transparent"
          >
            Previous
          </Button>
          {step === "review" ? (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-full gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Contract
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isSubmitting} className="rounded-full">
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
