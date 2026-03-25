import { Card } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    title: "Create Profile",
    description: "Sign up and complete identity verification. Build your trust score from day one.",
  },
  {
    number: "02",
    title: "Connect Wallet",
    description: "Link your Solana wallet or use our managed account for easy transactions.",
  },
  {
    number: "03",
    title: "Initiate Transaction",
    description: "Create a contract or task with clear terms, timeline, and escrow amount.",
  },
  {
    number: "04",
    title: "Secure Escrow",
    description: "Funds are locked in smart escrow. Both parties confirm and complete.",
  },
  {
    number: "05",
    title: "Instant Settlement",
    description: "Upon completion, funds settle instantly to fiat or crypto wallet.",
  },
  {
    number: "06",
    title: "Build Trust",
    description: "Ratings and reviews update your trust score and reputation permanently.",
  },
]

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold">How It Works</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Simple, secure, and transparent</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <Card className="p-3 sm:p-4 h-full bg-white border-accent/20">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent text-xs sm:text-sm font-bold">
                    {step.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-tight">{step.description}</p>
                  </div>
                </div>
              </Card>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 w-4 h-px bg-accent/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
