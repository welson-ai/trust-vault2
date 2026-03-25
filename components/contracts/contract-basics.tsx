"use client"

import { Card } from "@/components/ui/card"

const contractTypes = [
  { id: "freelance", label: "Freelance Work", description: "Hire freelancers for specific tasks" },
  { id: "chama", label: "Group Savings", description: "Pool funds with group members" },
  { id: "purchase", label: "Online Purchase", description: "Buy and verify delivery" },
]

export function ContractBasics({ formData, setFormData }: any) {
  const renderBasicsByType = () => {
    switch (formData.type) {
      case "freelance":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Project Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Website Redesign for RetailCo"
                className="w-full px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Project Description & Deliverables</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the work, deliverables, timeline, and acceptance criteria..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Payment Structure</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "one-off", label: "One-Time Payment", description: "Single payment upon completion" },
                  { id: "milestone", label: "Milestone-Based", description: "Payments at different stages" },
                ].map((structure) => (
                  <Card
                    key={structure.id}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      formData.contractType === structure.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({ ...formData, contractType: structure.id })}
                  >
                    <h3 className="font-semibold mb-1">{structure.label}</h3>
                    <p className="text-sm text-muted-foreground">{structure.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case "chama":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Group Name</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Women's Savings Circle Q4 2024"
                className="w-full px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Group Purpose & Rules</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the group's savings goal, contribution amounts, distribution method, and any group rules..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Distribution Method</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "one-off", label: "Lump Sum", description: "All funds paid out at end" },
                  { id: "milestone", label: "Rotating Payout", description: "Members receive funds in turns" },
                ].map((structure) => (
                  <Card
                    key={structure.id}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      formData.contractType === structure.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({ ...formData, contractType: structure.id })}
                  >
                    <h3 className="font-semibold mb-1">{structure.label}</h3>
                    <p className="text-sm text-muted-foreground">{structure.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case "purchase":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Product Name</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Samsung 55-inch Smart TV"
                className="w-full px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Product Details & Specifications</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the product, quantity, specifications, condition, color, size, and any special requirements..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-muted bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Delivery & Verification</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "one-off", label: "Instant Delivery", description: "Immediate handover" },
                  { id: "milestone", label: "Scheduled", description: "Delivery at specific date" },
                ].map((structure) => (
                  <Card
                    key={structure.id}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      formData.contractType === structure.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({ ...formData, contractType: structure.id })}
                  >
                    <h3 className="font-semibold mb-1">{structure.label}</h3>
                    <p className="text-sm text-muted-foreground">{structure.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Contract Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contractTypes.map((type) => (
            <Card
              key={type.id}
              className={`p-4 cursor-pointer transition-all border-2 ${
                formData.type === type.id ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
              }`}
              onClick={() =>
                setFormData({
                  ...formData,
                  type: type.id,
                  contractType: type.id === "chama" ? "one-off" : "one-off",
                })
              }
            >
              <h3 className="font-semibold mb-1">{type.label}</h3>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {renderBasicsByType()}
    </div>
  )
}
