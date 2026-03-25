import { createBrowserClient } from "@supabase/ssr"

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (typeof window === "undefined") return null

  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Supabase client init - URL:", supabaseUrl?.substring(0, 30) + "...", "Key present:", !!supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables:", {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    })
    return null
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  console.log("[v0] Supabase client created successfully")
  return supabaseInstance
}

export function getSupabase() {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error("Supabase client not initialized. Environment variables may be missing.")
  }
  return client
}

// Proxy object for backward compatibility with existing imports
export const supabase = {
  get auth() {
    const client = getSupabaseClient()
    if (!client) throw new Error("Supabase client not initialized")
    return client.auth
  },
  from(table: string) {
    const client = getSupabaseClient()
    if (!client) throw new Error("Supabase client not initialized")
    return client.from(table)
  },
}

export interface Contract {
  id: string
  title: string
  description: string
  type: "freelance"
  contract_type: "one-off" | "milestone"
  participants: Array<{ email: string; role: "freelancer" | "client"; status?: "pending" | "accepted" }>
  amount: string
  currency: string
  deadline: string
  milestones: Array<{ title: string; amount: string; dueDate: string }>
  status: "active" | "pending" | "completed" | "disputed"
  created_at: string
}

export async function getContracts(): Promise<Contract[]> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      console.warn("[v0] Supabase client not available - returning empty contracts")
      return []
    }

    console.log("[v0] Attempting to fetch contracts from Supabase...")
    const { data, error } = await client
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error fetching contracts:", error)
      return []
    }

    console.log("[v0] Successfully fetched contracts:", data?.length || 0)

    // Fetch participants for each contract
    const contractsWithParticipants = await Promise.all(
      (data || []).map(async (contract: any) => {
        const { data: participants, error: participantsError } = await client
          .from("participants")
          .select("email, role, status")
          .eq("contract_id", contract.id)

        return {
          ...contract,
          participants: participantsError ? [] : participants || [],
          amount: contract.amount.toString(),
          milestones: [],
        }
      }),
    )

    return contractsWithParticipants
  } catch (error) {
    console.error("[v0] Error in getContracts:", error instanceof Error ? error.message : error)
    return []
  }
}

export async function saveContract(contract: Omit<Contract, "id" | "created_at">): Promise<Contract | null> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      console.error("[v0] Supabase client not available")
      return null
    }

    const {
      data: { user },
    } = await client.auth.getUser()

    if (!user) {
      console.error("[v0] No authenticated user")
      return null
    }

    const { data: existingUser } = await client.from("users").select("id").eq("id", user.id).single()

    if (!existingUser) {
      console.log("[v0] User not found in users table, creating entry")
      const { error: userError } = await client.from("users").insert({
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        trusted: false,
      })

      if (userError) {
        console.error("[v0] Error creating user entry:", userError)
        return null
      }
    }

    const { data, error } = await client
      .from("contracts")
      .insert([
        {
          title: contract.title,
          description: contract.description,
          type: contract.type,
          amount: Number.parseFloat(contract.amount),
          currency: contract.currency,
          status: "active",
          created_by: user.id,
        },
      ])
      .select()
      .single()
    
    if (error) {
      console.error("[v0] Error saving contract:", error)
      return null
    }
    
    // Update the contract with optional fields
    if (contract.contract_type || contract.deadline) {
      const updateData: any = {}
      if (contract.contract_type) updateData.contract_type = contract.contract_type
      if (contract.deadline) updateData.deadline = contract.deadline
      
      await client
        .from("contracts")
        .update(updateData)
        .eq("id", data.id)
        .select()
        .single()
    }

    // Lookup user_ids for each participant and create insert data
    const participantInserts = await Promise.all(
      contract.participants.map(async (p) => {
        // Try to find existing user
        const { data: existingUser } = await client
          .from("users")
          .select("id")
          .eq("email", p.email.toLowerCase())
          .single()

        // If user doesn't exist, create one
        let userId = existingUser?.id
        if (!existingUser) {
          const { data: newUser, error: createError } = await client
            .from("users")
            .insert({
              email: p.email.toLowerCase(),
              name: p.email.split("@")[0],
              trusted: false,
            })
            .select()
            .single()

          if (createError) {
            console.error("[v0] Error creating user for participant:", createError)
            return null
          }
          userId = newUser?.id
        }

        return {
          contract_id: data.id,
          user_id: userId,
          email: p.email.toLowerCase(),
          role: p.role,
          status: "pending",
        }
      }),
    )

    // Filter out any null entries
    const validParticipants = participantInserts.filter(Boolean)

    if (validParticipants.length > 0) {
      const { error: participantsError } = await client.from("participants").insert(validParticipants)

      if (participantsError) {
        console.error("[v0] Error saving participants:", participantsError)
      }
    }

    // Save milestones
    if (contract.milestones.length > 0) {
      const milestoneInserts = contract.milestones.map((m) => ({
        contract_id: data.id,
        title: m.title,
        amount: Number.parseFloat(m.amount),
        due_date: m.dueDate,
      }))

      const { error: milestonesError } = await client.from("milestones").insert(milestoneInserts)

      if (milestonesError) {
        console.error("[v0] Error saving milestones:", milestonesError)
      }
    }

    console.log("[v0] Contract saved successfully:", data.id)
    return data
  } catch (error) {
    console.error("[v0] Error in saveContract:", error)
    return null
  }
}

export async function userExists(email: string): Promise<boolean> {
  try {
    const client = getSupabaseClient()
    if (!client) return false

    const { data, error } = await client.from("users").select("id").eq("email", email.toLowerCase()).single()

    if (error) {
      return false
    }

    return !!data
  } catch {
    return false
  }
}

export async function acceptContract(contractId: string, userEmail: string): Promise<boolean> {
  try {
    const client = getSupabaseClient()
    if (!client) return false

    const { error } = await client
      .from("participants")
      .update({ status: "accepted" })
      .eq("contract_id", contractId)
      .eq("email", userEmail)

    if (error) {
      console.error("[v0] Error accepting contract:", error)
      return false
    }

    console.log("[v0] Contract accepted successfully")
    return true
  } catch (error) {
    console.error("[v0] Error in acceptContract:", error)
    return false
  }
}

export async function getContractById(contractId: string): Promise<Contract | null> {
  try {
    const client = getSupabaseClient()
    if (!client) return null

    const { data: contract, error } = await client
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .single()

    if (error || !contract) {
      console.error("[v0] Error fetching contract:", error)
      return null
    }

    // Fetch participants
    const { data: participants, error: participantsError } = await client
      .from("participants")
      .select("email, role, status")
      .eq("contract_id", contractId)

    return {
      ...contract,
      participants: participantsError ? [] : participants || [],
      amount: contract.amount.toString(),
      milestones: [],
    }
  } catch (error) {
    console.error("[v0] Error in getContractById:", error)
    return null
  }
}

export function useContracts() {
  // This hook is now deprecate in favor of direct getContracts() calls
  // Use SWR or React Query for client-side state management
  return { contracts: [], loading: false }
}
