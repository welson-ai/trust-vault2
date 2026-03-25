"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Zap, Chrome, Apple } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please enter email and password")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.")
        } else if (error.message.includes("fetch") || error.message.includes("network")) {
          setError("Network error. Please check your connection and try again.")
        } else {
          setError(error.message || "Login failed")
        }
        console.error("[v0] Login error:", error)
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      if (error.message?.includes("fetch") || error.message?.includes("network")) {
        setError("Network error. Please check your connection.")
      } else {
        setError(error.message || "Google login failed")
      }
      console.error("[v0] Google login error:", error)
      setLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setError("")
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      if (error.message?.includes("fetch") || error.message?.includes("network")) {
        setError("Network error. Please check your connection.")
      } else {
        setError(error.message || "Apple login failed")
      }
      console.error("[v0] Apple login error:", error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to home</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your Trust Vault account</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-600">{error}</div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={!formData.email || !formData.password || loading}
              className="w-full rounded-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={loading}>
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button type="button" variant="outline" onClick={handleAppleLogin} disabled={loading}>
                <Apple className="w-4 h-4 mr-2" />
                Apple
              </Button>
            </div>

            {/* Signup Link */}
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </p>
          </form>
        </Card>

        {/* Features list */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">Secure</div>
            <div className="text-xs text-muted-foreground">Bank-grade</div>
          </div>
          <div>
            <div className="text-lg font-bold text-secondary">Fast</div>
            <div className="text-xs text-muted-foreground">Instant setup</div>
          </div>
          <div>
            <div className="text-lg font-bold text-accent">Trusted</div>
            <div className="text-xs text-muted-foreground">By thousands</div>
          </div>
        </div>
      </div>
    </div>
  )
}
