import { Header } from "@/components/navigation/header"
import { LandingHero } from "@/components/landing/hero"
import { LandingFeatures } from "@/components/landing/features"
import { LandingHowItWorks } from "@/components/landing/how-it-works"
import { LandingCTA } from "@/components/landing/cta"
import { LandingFooter } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingCTA />
      <LandingFooter />
    </main>
  )
}
