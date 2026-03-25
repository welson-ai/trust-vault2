import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function LandingCTA() {
  return (
    <section className="w-full py-8 sm:py-12 bg-accent/5">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3">Ready to Get Started?</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Join thousands of freelancers and communities building trust-based financial relationships.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <Button size="sm" className="rounded-full text-xs sm:text-sm h-8 sm:h-9" asChild>
            <Link href="/signup" className="gap-1">
              Create Account <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full bg-transparent text-xs sm:text-sm h-8 sm:h-9"
            asChild
          >
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
