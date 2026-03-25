"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2 } from "lucide-react"

export function ContractReview({ formData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Review Your Contract</h2>
        <p className="text-sm text-muted-foreground mb-4">Please review all details before creating</p>
      </div>

      <Card className="p-6 space-y-6 border-primary/20 bg-primary/5">
        {/* Basics */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            Contract Details
          </h3>
          <div className="space-y-2 ml-7 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{formData.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Structure:</span>
              <span className="font-medium capitalize">{formData.contractType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Title:</span>
              <span className="font-medium">{formData.title}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Participants */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            Participants ({formData.participants.length})
          </h3>
          <div className="space-y-2 ml-7">
            {formData.participants.map((p: any) => (
              <div key={p.email} className="flex items-center justify-between text-sm">
                <span>{p.email}</span>
                <Badge variant="secondary" className="capitalize">
                  {p.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Payment */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            Payment
          </h3>
          <div className="space-y-2 ml-7 text-sm">
            {formData.contractType === "one-off" ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {formData.currency} {formData.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-medium">{formData.deadline}</span>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  {formData.milestones.map((m: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span>{m.title}</span>
                      <span>
                        {formData.currency} {m.amount} - Due {m.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-xs">
          <p className="font-semibold text-accent mb-1">Ready to Create</p>
          <p className="text-muted-foreground">All details verified. Click Create Contract to proceed.</p>
        </div>
      </Card>
    </div>
  )
}
