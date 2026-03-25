"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

export function ContractPayment({ formData, setFormData }: any) {
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

  if (formData.type === "freelance") {
    return (
      <div className="space-y-8">
        {formData.contractType === "one-off" ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Budget</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Total Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="flex-1 px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="KES">KES</option>
                  </select>
                </div>
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
                        <label className="text-xs font-semibold mb-1 block">Amount</label>
                        <input
                          type="number"
                          value={milestone.amount}
                          onChange={(e) => handleUpdateMilestone(idx, "amount", e.target.value)}
                          placeholder="0.00"
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
                  {formData.currency} {totalMilestones.toFixed(2)}
                </p>
              </Card>
            )}
          </div>
        )}

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-accent mb-1">Escrow Protection</p>
          <p className="text-xs text-muted-foreground">
            All funds are held in escrow. Payments released only after milestone completion verification.
          </p>
        </div>
      </div>
    )
  }

  if (formData.type === "chama") {
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold mb-4">Contribution Schedule</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Monthly Contribution Per Member</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="flex-1 px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="KES">KES</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Duration (Months)</label>
            <input
              type="number"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              placeholder="e.g., 12"
              className="w-full px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {formData.contractType === "milestone" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Payout Schedule</h3>
              <Button onClick={handleAddMilestone} className="rounded-full gap-2" size="sm">
                <Plus className="w-4 h-4" />
                Add Payout
              </Button>
            </div>

            {formData.milestones.length > 0 && (
              <div className="space-y-3">
                {formData.milestones.map((milestone: any, idx: number) => (
                  <Card key={idx} className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                          placeholder="Member name or turn number"
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
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Payout Month</label>
                      <input
                        type="date"
                        value={milestone.dueDate}
                        onChange={(e) => handleUpdateMilestone(idx, "dueDate", e.target.value)}
                        className="w-full px-3 py-2 rounded border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-secondary mb-1">Group Savings Protected</p>
          <p className="text-xs text-muted-foreground">
            All contributions held in escrow until payout schedule is reached. Fair distribution enforced by smart
            contracts.
          </p>
        </div>
      </div>
    )
  }

  if (formData.type === "purchase") {
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold mb-4">Purchase Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Item Price</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="flex-1 px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="KES">KES</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Expected Delivery Date</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Quantity</label>
          <input
            type="number"
            defaultValue={1}
            min={1}
            className="w-full px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-primary mb-1">Verified Delivery</p>
          <p className="text-xs text-muted-foreground">
            Payment held until buyer confirms delivery and product condition. Seller funds released after verification.
          </p>
        </div>
      </div>
    )
  }

  return null
}
