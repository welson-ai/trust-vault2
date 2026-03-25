import { Card } from "@/components/ui/card"
import { Shield, Zap, TrendingUp, Lock, Blocks, Bell } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Verified Freelancers",
    description: "Trust scores and reputation system to find reliable freelance professionals.",
  },
  {
    icon: Lock,
    title: "Secure Contracts",
    description: "Legally binding contracts with milestone-based payment protection.",
  },
  {
    icon: Zap,
    title: "Quick Onboarding",
    description: "Create and sign contracts in minutes, not days.",
  },
  {
    icon: TrendingUp,
    title: "Project Tracking",
    description: "Monitor milestones, deliverables, and project progress in real-time.",
  },
  {
    icon: Blocks,
    title: "Payment Management",
    description: "Flexible payment options with secure fund handling.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "Real-time updates on contract acceptance, milestones, and payments.",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="w-full py-8 sm:py-12 bg-accent/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold">Freelance Contract Features</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Everything you need to manage freelance work contracts securely
          </p>
        </div>

        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <Card
                key={idx}
                className="p-3 sm:p-4 bg-white border-accent/20 hover:border-accent/50 hover:shadow-md transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 p-1.5 mb-2 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-full h-full text-accent" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            )
          })}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="lg:hidden overflow-x-auto pb-2 -mx-3 px-3 snap-x snap-mandatory">
          <div className="flex gap-3 min-w-min">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="flex-shrink-0 w-56 snap-start">
                  <Card className="p-3 h-full bg-white border-accent/20 hover:border-accent/50 hover:shadow-md transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 p-1.5 mb-2 group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-full h-full text-accent" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
