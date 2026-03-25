"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"
import { getContracts } from "@/lib/supabase"
import type { Contract } from "@/lib/supabase"

export function LandingHero() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadContracts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getContracts()
        setContracts(data)
      } catch (err) {
        console.error("[v0] Failed to load contracts:", err)
        setError("Unable to load contract data")
        setContracts([])
      } finally {
        setLoading(false)
      }
    }
    loadContracts()
  }, [])

  const totalTransacted = contracts.reduce((sum, contract) => sum + (Number.parseFloat(contract.amount) || 0), 0)

  return (
    <section className="relative w-full pt-6 pb-10 sm:pt-12 sm:pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-border">
              <Shield className="w-3 h-3 text-foreground" />
              <span className="text-xs font-medium text-foreground">Secure. Trusted. Transparent.</span>
            </div>

            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-balance leading-tight">
                Trust-Based Financial Platform
              </h1>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Secure payments, trust scores, and blockchain settlement for freelancers, clients, and communities.
                Escrow protection for every transaction.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button size="sm" className="rounded-full text-xs sm:text-sm h-8 sm:h-10" asChild>
                <Link href="/signup" className="gap-1">
                  Get Started <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full bg-transparent text-xs sm:text-sm h-8 sm:h-10"
                asChild
              >
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
              <div>
                <div className="text-sm sm:text-lg font-bold text-foreground">
                  {loading ? "..." : `${contracts.length}+`}
                </div>
                <div className="text-xs text-muted-foreground">Contracts</div>
              </div>
              <div>
                <div className="text-sm sm:text-lg font-bold text-foreground">
                  ${loading ? "..." : totalTransacted.toLocaleString("en-US", { maximumFractionDigits: 0 })}+
                </div>
                <div className="text-xs text-muted-foreground">Transacted</div>
              </div>
              <div>
                <div className="text-sm sm:text-lg font-bold text-foreground">99.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative h-40 sm:h-64 lg:h-full min-h-40 sm:min-h-64">
            <div className="relative bg-card rounded-xl p-3 sm:p-4 border border-border h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Shield className="w-5 sm:w-7 h-5 sm:h-7 text-foreground" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Secure Escrow Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
