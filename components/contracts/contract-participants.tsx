"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Plus, Search, AlertCircle, CheckCircle2 } from "lucide-react"
import { userExists } from "@/lib/supabase"

export function ContractParticipants({ formData, setFormData }: any) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"freelancer" | "client">("freelancer")
  const [validationError, setValidationError] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)

  const validateEmail = async (emailValue: string) => {
    if (!emailValue) {
      setEmailValid(null)
      setValidationError("")
      return
    }

    setIsValidating(true)
    try {
      const exists = await userExists(emailValue)
      setEmailValid(exists)
      if (!exists) {
        setValidationError("Email does not exist in the system")
      } else {
        setValidationError("")
      }
    } catch (error) {
      setValidationError("Error validating email")
      setEmailValid(false)
    } finally {
      setIsValidating(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    validateEmail(value)
  }

  const addParticipant = async () => {
    if (!email || !emailValid) {
      setValidationError("Please enter a valid email that exists in the system")
      return
    }

    if (formData.participants.find((p: any) => p.email === email)) {
      setValidationError("This participant is already added")
      return
    }

    setFormData({
      ...formData,
      participants: [...formData.participants, { email, role }],
    })
    setEmail("")
    setEmailValid(null)
    setValidationError("")
  }

  const removeParticipant = (emailToRemove: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((p: any) => p.email !== emailToRemove),
    })
  }

  const getRoleOptions = () => {
    return [
      { value: "freelancer", label: "Freelancer" },
      { value: "client", label: "Client" },
    ]
  }

  const getParticipantLabel = () => {
    return "Add Freelancers & Clients"
  }

  const roleOptions = getRoleOptions()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">{getParticipantLabel()}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Search and add freelancers and clients to this contract
        </p>

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addParticipant()}
                placeholder="Search by email..."
                className={`w-full pl-9 pr-4 py-2 rounded-lg border bg-muted/30 focus:outline-none focus:ring-2 transition-all ${
                  emailValid === true
                    ? "border-green-500 focus:ring-green-500/20"
                    : emailValid === false
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-muted focus:ring-primary/20"
                }`}
              />
              {email && (
                <div className="absolute right-3 top-2.5">
                  {isValidating ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : emailValid === true ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : emailValid === false ? (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  ) : null}
                </div>
              )}
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button onClick={addParticipant} disabled={!emailValid || isValidating} className="rounded-lg gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {validationError}
            </div>
          )}
        </div>
      </div>

      {formData.participants.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Participants ({formData.participants.length})</h3>
          <div className="space-y-2">
            {formData.participants.map((p: any) => (
              <Card key={p.email} className="p-3 flex items-center justify-between bg-primary/5 border-primary/20">
                <div>
                  <p className="font-medium text-sm">{p.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {roleOptions.find((opt) => opt.value === p.role)?.label || p.role}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeParticipant(p.email)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
