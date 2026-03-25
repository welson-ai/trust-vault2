"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, User, LogOut, Briefcase } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/contracts", icon: FileText, label: "Contracts" },
  { href: "/gigs", icon: Briefcase, label: "Gigs Marketplace" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("[v0] Failed to get user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [supabase])

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-sidebar border-t border-sidebar-border flex items-center justify-around h-16 z-40">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 p-2 h-auto ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          )
        })}
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = "/login"
          }}
          className="flex-1 flex flex-col items-center gap-1 p-2 text-destructive"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Logout</span>
        </button>
      </nav>

      <aside className="hidden md:flex w-48 bg-sidebar border-r border-sidebar-border h-screen flex-col fixed left-0 top-0 pt-16">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start gap-2 text-sm">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 space-y-1 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm text-destructive"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = "/login"
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}
