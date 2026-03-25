import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export function DashboardTrustScore() {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-xs font-semibold">Trust Score</h2>
        <Badge className="bg-accent/20 text-accent hover:bg-accent/30 text-xs">Excellent</Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(87 / 100) * 2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                strokeLinecap="round"
                className="text-secondary transition-all"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">87</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Completion</span>
              <span className="text-xs text-secondary">98%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "98%" }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Reliability</span>
              <span className="text-xs text-secondary">95%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: "95%" }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Communication</span>
              <span className="text-xs text-secondary">92%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "92%" }} />
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 pt-2 border-t border-border">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-accent text-accent" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">(128)</span>
        </div>
      </div>
    </Card>
  )
}
