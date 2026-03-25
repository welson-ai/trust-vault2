"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, Package, CheckCircle, Shield } from "lucide-react"
import { getGigById, createOrder } from "@/lib/gigs"
import type { Gig, GigPackage } from "@/lib/types/gigs"
import Link from "next/link"

export default function CreateOrderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [gig, setGig] = useState<Gig | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<GigPackage | null>(null)
  const [requirements, setRequirements] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const gigId = searchParams.get("gig")
    const packageId = searchParams.get("package")
    
    if (gigId) {
      loadGig(gigId, packageId)
    }
  }, [searchParams])

  const loadGig = async (gigId: string, packageId?: string | null) => {
    setLoading(true)
    try {
      const gigData = await getGigById(gigId)
      setGig(gigData)
      
      if (gigData?.packages.length) {
        const pkg = packageId 
          ? gigData.packages.find(p => p.id === packageId)
          : gigData.packages.find(p => p.tier === "Basic") || gigData.packages[0]
        
        setSelectedPackage(pkg || null)
      }
    } catch (error) {
      console.error("Failed to load gig:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitOrder = async () => {
    if (!gig || !selectedPackage) return

    setSubmitting(true)
    try {
      // In a real app, you'd get the buyer ID from auth
      const buyerId = "current-user-id" // Placeholder
      
      const order = await createOrder({
        gigId: gig.id,
        packageId: selectedPackage.id,
        requirements: requirements.trim() || undefined,
      }, buyerId)

      if (order) {
        router.push(`/orders/${order.id}`)
      } else {
        alert("Failed to create order. Please try again.")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Failed to create order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USDC",
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!gig || !selectedPackage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The gig or package you're looking for doesn't exist.
          </p>
          <Link href="/gigs">
            <Button>Browse Gigs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/gigs/${gig.id}`} className="text-muted-foreground hover:text-foreground mb-2 inline-block">
          ← Back to Gig
        </Link>
        <h1 className="text-3xl font-bold">Complete Your Order</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={gig.seller.avatar} />
                  <AvatarFallback>
                    {gig.seller.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{gig.title}</h3>
                  <p className="text-muted-foreground mb-2">by {gig.seller.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{gig.seller.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{gig.seller.completedJobs} completed</span>
                    </div>
                    {gig.seller.responseTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{gig.seller.responseTime}h response</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <Badge variant="secondary" className="mb-2">
                  {selectedPackage.name}
                </Badge>
                <p className="text-sm text-muted-foreground mb-3">{selectedPackage.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Delivery Time:</span>
                    <span>{selectedPackage.deliveryDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Revisions:</span>
                    <span>{selectedPackage.revisions}</span>
                  </div>
                </div>
                {selectedPackage.features.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Included:</p>
                    <ul className="text-sm space-y-1">
                      {selectedPackage.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Project Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Please describe what you need done. Be as specific as possible about your requirements, expectations, and any files or information you'll provide..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Detailed requirements help the seller deliver exactly what you need.
              </p>
            </CardContent>
          </Card>

          {/* Escrow Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold">Escrow Protection</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Your payment is held securely in escrow</p>
                <p>• Funds are only released when you approve the work</p>
                <p>• Full refund available if work isn't delivered</p>
                <p>• Dispute resolution support available</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{selectedPackage.name} Package</span>
                <span>{formatPrice(selectedPackage.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service Fee</span>
                <span>{formatPrice(selectedPackage.price * 0.05)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(selectedPackage.price * 1.05)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmitOrder}
            disabled={submitting}
          >
            {submitting ? "Creating Order..." : `Pay ${formatPrice(selectedPackage.price * 1.05)}`}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>By placing this order, you agree to our</p>
            <div className="flex justify-center gap-2">
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              <span>&</span>
              <Link href="/refund-policy" className="text-primary hover:underline">
                Refund Policy
              </Link>
            </div>
          </div>

          {/* Delivery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Seller Starts Work</p>
                    <p className="text-sm text-muted-foreground">Within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Work Delivered</p>
                    <p className="text-sm text-muted-foreground">Within {selectedPackage.deliveryDays} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Your Review & Approval</p>
                    <p className="text-sm text-muted-foreground">3 days to review</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
