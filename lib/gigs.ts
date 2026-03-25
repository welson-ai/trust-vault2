import { getSupabaseClient } from "./supabase"
import type { 
  Gig, 
  GigPackage, 
  Order, 
  Escrow, 
  Review, 
  SellerProfile,
  GigFilter,
  CreateGigData,
  CreateOrderData,
  UpdateOrderData,
  GigCategory,
  OrderStatus,
  EscrowStatus
} from "./types/gigs"

// Gig Functions
export async function getGigs(filter?: GigFilter): Promise<Gig[]> {
  try {
    const client = getSupabaseClient()
    if (!client) return []

    let query = client
      .from("gigs")
      .select(`
        *,
        seller:seller_profiles(*),
        packages:gig_packages(*)
      `)
      .eq("status", "active")

    if (filter?.category) {
      query = query.eq("category", filter.category)
    }

    if (filter?.minPrice || filter?.maxPrice) {
      query = query
    }

    if (filter?.minRating) {
      query = query.gte("rating", filter.minRating)
    }

    if (filter?.searchQuery) {
      query = query.or(`title.ilike.%${filter.searchQuery}%,description.ilike.%${filter.searchQuery}%`)
    }

    const { data, error } = await query.order("rating", { ascending: false })

    if (error) {
      console.error("Error fetching gigs:", error)
      return []
    }

    // Filter by price range client-side since packages are nested
    let gigs = data || []
    if (filter?.minPrice || filter?.maxPrice) {
      gigs = gigs.filter((gig: any) => {
        const packagePrices = gig.packages?.map((pkg: any) => pkg.price) || []
        const minPackagePrice = Math.min(...packagePrices)
        const maxPackagePrice = Math.max(...packagePrices)
        
        if (filter.minPrice && maxPackagePrice < filter.minPrice) return false
        if (filter.maxPrice && minPackagePrice > filter.maxPrice) return false
        return true
      })
    }

    if (filter?.maxDeliveryDays) {
      gigs = gigs.filter((gig: any) => {
        const deliveryDays = gig.packages?.map((pkg: any) => pkg.delivery_days) || []
        const minDeliveryDays = Math.min(...deliveryDays)
        return minDeliveryDays <= filter.maxDeliveryDays!
      })
    }

    if (filter?.tags && filter.tags.length > 0) {
      gigs = gigs.filter((gig: any) => 
        filter.tags!.some(tag => gig.tags?.includes(tag))
      )
    }

    return gigs.map(transformGig)
  } catch (error) {
    console.error("Error in getGigs:", error)
    return []
  }
}

export async function getGigById(id: string): Promise<Gig | null> {
  try {
    const client = getSupabaseClient()
    if (!client) return null

    const { data, error } = await client
      .from("gigs")
      .select(`
        *,
        seller:seller_profiles(*),
        packages:gig_packages(*)
      `)
      .eq("id", id)
      .eq("status", "active")
      .single()

    if (error || !data) {
      console.error("Error fetching gig:", error)
      return null
    }

    return transformGig(data)
  } catch (error) {
    console.error("Error in getGigById:", error)
    return null
  }
}

export async function createGig(gigData: CreateGigData, sellerId: string): Promise<Gig | null> {
  try {
    const client = getSupabaseClient()
    if (!client) return null

    const { data: gig, error: gigError } = await client
      .from("gigs")
      .insert({
        title: gigData.title,
        description: gigData.description,
        category: gigData.category,
        seller_id: sellerId,
        tags: gigData.tags,
      })
      .select()
      .single()

    if (gigError || !gig) {
      console.error("Error creating gig:", gigError)
      return null
    }

    // Create packages
    const packages = gigData.packages.map(pkg => ({
      gig_id: gig.id,
      tier: pkg.tier,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      delivery_days: pkg.deliveryDays,
      revisions: pkg.revisions,
      features: pkg.features,
    }))

    const { error: packagesError } = await client
      .from("gig_packages")
      .insert(packages)

    if (packagesError) {
      console.error("Error creating packages:", packagesError)
      return null
    }

    return getGigById(gig.id)
  } catch (error) {
    console.error("Error in createGig:", error)
    return null
  }
}

// Order Functions
export async function createOrder(orderData: CreateOrderData, buyerId: string): Promise<Order | null> {
  try {
    const client = getSupabaseClient()
    if (!client) return null

    // Get gig and package details
    const { data: gig, error: gigError } = await client
      .from("gigs")
      .select("seller_id, title")
      .eq("id", orderData.gigId)
      .single()

    const { data: pkg, error: pkgError } = await client
      .from("gig_packages")
      .select("*")
      .eq("id", orderData.packageId)
      .single()

    if (gigError || pkgError || !gig || !pkg) {
      console.error("Error fetching gig/package:", gigError || pkgError)
      return null
    }

    // Calculate delivery date
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + pkg.delivery_days)

    const { data: order, error: orderError } = await client
      .from("orders")
      .insert({
        gig_id: orderData.gigId,
        package_id: orderData.packageId,
        buyer_id: buyerId,
        seller_id: gig.seller_id,
        amount: pkg.price,
        delivery_date: deliveryDate.toISOString(),
        requirements: orderData.requirements,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error("Error creating order:", orderError)
      return null
    }

    // Create escrow record
    const { error: escrowError } = await client
      .from("escrows")
      .insert({
        order_id: order.id,
        amount: pkg.price,
      })

    if (escrowError) {
      console.error("Error creating escrow:", escrowError)
    }

    return getOrderById(order.id)
  } catch (error) {
    console.error("Error in createOrder:", error)
    return null
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const client = getSupabaseClient()
    if (!client) return null

    const { data, error } = await client
      .from("orders")
      .select(`
        *,
        gig:gigs(*),
        package:gig_packages(*),
        escrow:escrows(*)
      `)
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("Error fetching order:", error)
      return null
    }

    return transformOrder(data)
  } catch (error) {
    console.error("Error in getOrderById:", error)
    return null
  }
}

export async function getOrdersByBuyer(buyerId: string): Promise<Order[]> {
  try {
    const client = getSupabaseClient()
    if (!client) return []

    const { data, error } = await client
      .from("orders")
      .select(`
        *,
        gig:gigs(*),
        package:gig_packages(*),
        escrow:escrows(*)
      `)
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching buyer orders:", error)
      return []
    }

    return (data || []).map(transformOrder)
  } catch (error) {
    console.error("Error in getOrdersByBuyer:", error)
    return []
  }
}

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  try {
    const client = getSupabaseClient()
    if (!client) return []

    const { data, error } = await client
      .from("orders")
      .select(`
        *,
        gig:gigs(*),
        package:gig_packages(*),
        escrow:escrows(*)
      `)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching seller orders:", error)
      return []
    }

    return (data || []).map(transformOrder)
  } catch (error) {
    console.error("Error in getOrdersBySeller:", error)
    return []
  }
}

export async function updateOrder(id: string, updateData: UpdateOrderData): Promise<Order | null> {
  try {
    const client = getSupabaseClient()
    if (!client) return null

    const updateFields: any = {}
    if (updateData.status) updateFields.status = updateData.status
    if (updateData.deliverables) updateFields.deliverables = updateData.deliverables
    if (updateData.disputeReason) updateFields.disputeReason = updateData.disputeReason

    if (updateData.status === "submitted") {
      updateFields.actual_delivery_date = new Date().toISOString()
    } else if (updateData.status === "completed") {
      updateFields.buyer_approved_at = new Date().toISOString()
    } else if (updateData.status === "disputed") {
      updateFields.disputed_at = new Date().toISOString()
    }

    const { data, error } = await client
      .from("orders")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single()

    if (error || !data) {
      console.error("Error updating order:", error)
      return null
    }

    // Update escrow status if needed
    if (updateData.status === "completed") {
      await releaseEscrow(data.id)
    } else if (updateData.status === "disputed") {
      await disputeEscrow(data.id)
    }

    return getOrderById(id)
  } catch (error) {
    console.error("Error in updateOrder:", error)
    return null
  }
}

// Escrow Functions
export async function releaseEscrow(orderId: string): Promise<boolean> {
  try {
    const client = getSupabaseClient()
    if (!client) return false

    const { error } = await client
      .from("escrows")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)

    if (error) {
      console.error("Error releasing escrow:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in releaseEscrow:", error)
    return false
  }
}

export async function disputeEscrow(orderId: string): Promise<boolean> {
  try {
    const client = getSupabaseClient()
    if (!client) return false

    const { error } = await client
      .from("escrows")
      .update({
        status: "disputed",
        disputed_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)

    if (error) {
      console.error("Error disputing escrow:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in disputeEscrow:", error)
    return false
  }
}

// Review Functions
export async function createReview(
  orderId: string,
  rating: number,
  comment?: string
): Promise<Review | null> {
  try {
    const client = getSupabaseClient()
    if (!client) return null

    // Get order details
    const { data: order, error: orderError } = await client
      .from("orders")
      .select("gig_id, seller_id")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order for review:", orderError)
      return null
    }

    const { data: review, error } = await client
      .from("reviews")
      .insert({
        order_id: orderId,
        gig_id: order.gig_id,
        seller_id: order.seller_id,
        rating,
        comment,
      })
      .select()
      .single()

    if (error || !review) {
      console.error("Error creating review:", error)
      return null
    }

    return transformReview(review)
  } catch (error) {
    console.error("Error in createReview:", error)
    return null
  }
}

export async function getReviewsByGig(gigId: string): Promise<Review[]> {
  try {
    const client = getSupabaseClient()
    if (!client) return []

    const { data, error } = await client
      .from("reviews")
      .select("*")
      .eq("gig_id", gigId)
      .eq("is_public", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reviews:", error)
      return []
    }

    return (data || []).map(transformReview)
  } catch (error) {
    console.error("Error in getReviewsByGig:", error)
    return []
  }
}

// Seller Profile Functions
export async function getSellerProfile(userId: string): Promise<SellerProfile | null> {
  try {
    const client = getSupabaseClient()
    if (!client) return null

    const { data, error } = await client
      .from("seller_profiles")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error || !data) {
      console.error("Error fetching seller profile:", error)
      return null
    }

    return transformSellerProfile(data)
  } catch (error) {
    console.error("Error in getSellerProfile:", error)
    return null
  }
}

export async function createSellerProfile(userId: string, profileData: Partial<SellerProfile>): Promise<SellerProfile | null> {
  try {
    const client = getSupabaseClient()
    if (!client) return null

    const { data, error } = await client
      .from("seller_profiles")
      .insert({
        user_id: userId,
        name: profileData.name || "",
        description: profileData.description,
        response_time: profileData.responseTime,
        languages: profileData.languages,
        skills: profileData.skills,
      })
      .select()
      .single()

    if (error || !data) {
      console.error("Error creating seller profile:", error)
      return null
    }

    return transformSellerProfile(data)
  } catch (error) {
    console.error("Error in createSellerProfile:", error)
    return null
  }
}

// Transform functions
function transformGig(data: any): Gig {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    sellerId: data.seller_id,
    seller: transformSellerProfile(data.seller),
    packages: (data.packages || []).map(transformPackage),
    tags: data.tags || [],
    gallery: data.gallery || [],
    rating: data.rating || 0,
    reviewCount: data.review_count || 0,
    orderCount: data.order_count || 0,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function transformPackage(data: any): GigPackage {
  return {
    id: data.id,
    tier: data.tier,
    name: data.name,
    description: data.description,
    price: data.price,
    deliveryDays: data.delivery_days,
    revisions: data.revisions,
    features: data.features || [],
  }
}

function transformOrder(data: any): Order {
  return {
    id: data.id,
    gigId: data.gig_id,
    gig: data.gig ? transformGig(data.gig) : undefined as any,
    packageId: data.package_id,
    package: data.package ? transformPackage(data.package) : undefined as any,
    buyerId: data.buyer_id,
    sellerId: data.seller_id,
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    requirements: data.requirements,
    deliverables: data.deliverables,
    deliveryDate: data.delivery_date,
    actualDeliveryDate: data.actual_delivery_date,
    buyerApprovedAt: data.buyer_approved_at,
    disputedAt: data.disputed_at,
    disputeReason: data.dispute_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function transformEscrow(data: any): Escrow {
  return {
    id: data.id,
    orderId: data.order_id,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    heldAt: data.held_at,
    releasedAt: data.released_at,
    refundedAt: data.refunded_at,
    disputedAt: data.disputed_at,
    disputeResolution: data.dispute_resolution,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function transformReview(data: any): Review {
  return {
    id: data.id,
    orderId: data.order_id,
    gigId: data.gig_id,
    buyerId: data.buyer_id,
    sellerId: data.seller_id,
    rating: data.rating,
    comment: data.comment,
    isPublic: data.is_public,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function transformSellerProfile(data: any): SellerProfile {
  return {
    id: data.id,
    name: data.name,
    avatar: data.avatar,
    rating: data.rating || 0,
    completedJobs: data.completed_jobs || 0,
    description: data.description,
    responseTime: data.response_time,
    languages: data.languages,
    skills: data.skills,
  }
}
