"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-accent/20">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 md:h-14">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-xs md:text-sm font-bold text-white">TV</span>
            </div>
            <span className="font-bold text-xs md:text-sm hidden sm:inline text-foreground">Trust Vault</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="#features" className="text-xs text-muted-foreground hover:text-foreground transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-xs text-muted-foreground hover:text-foreground transition">
              How it Works
            </Link>
            <Link href="#pricing" className="text-xs text-muted-foreground hover:text-foreground transition">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" asChild className="text-xs h-8 md:h-9 px-2 md:px-3">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="rounded-lg text-xs h-8 md:h-9 px-2 md:px-3">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
