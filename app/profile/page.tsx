"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, User, Mail, Shield, LogOut, Edit2, Briefcase } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  name: string
  email: string
  trusted: boolean
  created_at: string
  wallet_address?: string
}

interface Vault {
  id: string
  contract_id: string
  user_id: string
  role: string
  contract: {
    title: string
    type: string
    amount: number
    status: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [vaults, setVaults] = useState<Vault[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: "" })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data: profileByEmail, error: emailError } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email || "")
          .limit(1)

        let userProfile

        if (!emailError && profileByEmail && profileByEmail.length > 0) {
          // User exists by email, use that profile
          userProfile = profileByEmail[0]
        } else {
          // Try by id
          const { data: profileData, error } = await supabase.from("users").select("*").eq("id", user.id).limit(1)

          if (error || !profileData || profileData.length === 0) {
            // User doesn't exist, try to create one
            const newUser = {
              id: user.id,
              email: user.email || "",
              name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
              trusted: false,
            }

            const { data: createdUser, error: createError } = await supabase
              .from("users")
              .insert([newUser])
              .select()
              .single()

            if (createError) {
              // If still error (duplicate email), try fetching by email one more time
              const { data: retryData } = await supabase
                .from("users")
                .select("*")
                .eq("email", user.email || "")
                .limit(1)

              if (retryData && retryData.length > 0) {
                userProfile = retryData[0]
              } else {
                console.error("[v0] Error creating user profile:", createError)
                router.push("/dashboard")
                return
              }
            } else {
              userProfile = createdUser
            }
          } else {
            userProfile = profileData[0]
          }
        }

        setProfile(userProfile)
        setFormData({ name: userProfile.name })

        const { data: vaultsData, error: vaultsError } = await supabase
          .from("participants")
          .select(
            `
          id,
          contract_id,
          user_id,
          role,
          contracts:contract_id (
            id,
            title,
            type,
            amount,
            status
          )
        `,
          )
          .eq("email", userProfile.email)

        if (!vaultsError && vaultsData && Array.isArray(vaultsData)) {
          setVaults(vaultsData as any)
        }
      } catch (error) {
        console.error("[v0] Error fetching profile:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, router])

  const handleUpdateProfile = async () => {
    if (!profile) return

    try {
      const { error } = await supabase.from("users").update({ name: formData.name }).eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, name: formData.name })
      setIsEditing(false)
      console.log("[v0] Profile updated successfully")
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("[v0] Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <h1 className="text-xl font-bold">My Profile</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          {/* Edit Mode */}
          {isEditing && (
            <div className="space-y-4 border-t border-border pt-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <Button onClick={handleUpdateProfile} className="w-full">
                Save Changes
              </Button>
            </div>
          )}

          {/* Profile Info */}
          {!isEditing && (
            <div className="grid grid-cols-2 gap-6 border-t border-border pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Status
                </p>
                <p className="font-medium">
                  {profile.trusted ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-amber-600">Pending Verification</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </Card>

        {vaults.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">My Vaults ({vaults.length})</h3>
            </div>
            <div className="grid gap-3">
              {vaults.map((vault: any) => (
                <Card key={vault.id} className="p-4 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{vault.contracts?.title || "Contract"}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="capitalize">{vault.role}</span>
                        <span className="capitalize">{vault.contracts?.type || "N/A"}</span>
                        <span className="capitalize bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {vault.contracts?.status || "pending"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {vault.contracts?.amount ? `$${vault.contracts.amount}` : "N/A"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Account Actions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Account Actions</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
