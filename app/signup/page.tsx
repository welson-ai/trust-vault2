"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Zap, Mail, Chrome, Apple } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  
  // Check for environment variables on mount
  if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL is not set. Please configure Supabase.")
  }
  
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!agreed || !formData.name || !formData.email || !formData.password) {
      setError("Please fill all fields and agree to terms")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      try {
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("email")
          .eq("email", formData.email)
          .single()

        if (existingUser) {
          setError("Email already registered. Please sign in instead.")
          setLoading(false)
          return
        }
      } catch (checkErr: any) {
        // Continue signup even if email check fails due to network issues
        console.log("[v0] Email check failed, continuing with signup:", checkErr)
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.name,
          },
        },
      })

      if (authError) {
        if (authError.message?.includes("already registered")) {
          setError("Email already exists. Please sign in instead.")
        } else if (authError.message?.includes("fetch")) {
          setError("Network error. Please check your connection and try again.")
        } else {
          setError(authError.message || "Signup failed. Please try again.")
        }
        console.error("[v0] Signup error:", authError)
        setLoading(false)
        return
      }

      if (authData.user) {
        try {
          const { error: insertError } = await supabase.from("users").insert({
            id: authData.user.id,
            email: formData.email.toLowerCase(),
            name: formData.name,
            trusted: false,
          })

          if (insertError) {
            console.error("[v0] Error creating user profile:", insertError)
            // Check if it's a duplicate key error
            if (!insertError.message?.includes("duplicate")) {
              setError("Failed to create user profile. Please contact support.")
              setLoading(false)
              return
            }
          }
        } catch (profileErr) {
          console.error("[v0] Error creating profile:", profileErr)
        }

        setOtpSent(true)
        console.log("[v0] Signup successful, OTP sent to email")
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
      console.error("[v0] Signup error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError("")
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) throw error
    } catch (error: any) {
      if (error.message?.includes("fetch")) {
        setError("Network error. Please check your connection.")
      } else {
        setError(error.message || "Google signup failed")
      }
      console.error("[v0] Google signup error:", error)
      setLoading(false)
    }
  }

  const handleAppleSignup = async () => {
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
      if (error.message?.includes("fetch")) {
        setError("Network error. Please check your connection.")
      } else {
        setError(error.message || "Apple signup failed")
      }
      console.error("[v0] Apple signup error:", error)
      setLoading(false)
    }
  }

  if (otpSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />

        <div className="relative w-full max-w-md">
          <Card className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
              <p className="text-muted-foreground text-sm">
                We've sent a verification link to <span className="font-medium text-foreground">{formData.email}</span>
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the link in your email to verify your account and activate your Trust Vault profile.
              </p>

              <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                Back to Login
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Didn't receive an email? Check your spam folder or{" "}
                <button onClick={() => setOtpSent(false)} className="text-primary hover:underline">
                  try again
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold mb-2">Join Trust Vault</h1>
          <p className="text-muted-foreground">Start building your trust score today</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

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

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-600">{error}</div>
            )}

            {/* Agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded border-border cursor-pointer"
              />
              <label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={!agreed || !formData.name || !formData.email || !formData.password || loading}
              className="w-full rounded-lg"
            >
              {loading ? "Creating account..." : "Create Account"}
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
              <Button type="button" variant="outline" onClick={handleGoogleSignup} disabled={loading}>
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button type="button" variant="outline" onClick={handleAppleSignup} disabled={loading}>
                <Apple className="w-4 h-4 mr-2" />
                Apple
              </Button>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </Card>

        {/* Features list */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">0% Fee</div>
            <div className="text-xs text-muted-foreground">On first month</div>
          </div>
          <div>
            <div className="text-lg font-bold text-secondary">2 min</div>
            <div className="text-xs text-muted-foreground">Setup time</div>
          </div>
          <div>
            <div className="text-lg font-bold text-accent">24/7</div>
            <div className="text-xs text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </div>
  )
}
