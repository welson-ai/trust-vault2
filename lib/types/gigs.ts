export type GigCategory = "Design" | "Dev" | "Writing" | "Marketing" | "Video" | "Music" | "Business"

export type PackageTier = "Basic" | "Standard" | "Premium"

export type OrderStatus = "pending" | "in_progress" | "submitted" | "completed" | "disputed" | "cancelled"

export type EscrowStatus = "held" | "released" | "refunded" | "disputed"

export interface SellerProfile {
  id: string
  name: string
  avatar?: string
  rating: number
  completedJobs: number
  description?: string
  responseTime?: number
  languages?: string[]
  skills?: string[]
}

export interface GigPackage {
  id: string
  tier: PackageTier
  name: string
  description: string
  price: number
  deliveryDays: number
  revisions: number
  features: string[]
}

export interface Gig {
  id: string
  title: string
  description: string
  category: GigCategory
  sellerId: string
  seller: SellerProfile
  packages: GigPackage[]
  tags: string[]
  gallery: string[]
  rating: number
  reviewCount: number
  orderCount: number
  status: "active" | "paused" | "deleted"
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  gigId: string
  gig: Gig
  packageId: string
  package: GigPackage
  buyerId: string
  sellerId: string
  status: OrderStatus
  amount: number
  currency: string
  requirements?: string
  deliverables?: string[]
  deliveryDate?: string
  actualDeliveryDate?: string
  buyerApprovedAt?: string
  disputedAt?: string
  disputeReason?: string
  createdAt: string
  updatedAt: string
}

export interface Escrow {
  id: string
  orderId: string
  amount: number
  currency: string
  status: EscrowStatus
  heldAt: string
  releasedAt?: string
  refundedAt?: string
  disputedAt?: string
  disputeResolution?: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  orderId: string
  gigId: string
  buyerId: string
  sellerId: string
  rating: number
  comment: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface GigFilter {
  category?: GigCategory
  minPrice?: number
  maxPrice?: number
  maxDeliveryDays?: number
  minRating?: number
  tags?: string[]
  searchQuery?: string
}

export interface CreateGigData {
  title: string
  description: string
  category: GigCategory
  tags: string[]
  packages: Omit<GigPackage, "id">[]
}

export interface CreateOrderData {
  gigId: string
  packageId: string
  requirements?: string
}

export interface UpdateOrderData {
  status?: OrderStatus
  deliverables?: string[]
  disputeReason?: string
}
