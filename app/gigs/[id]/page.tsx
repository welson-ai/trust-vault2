"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, Clock, Package, User, CheckCircle } from "lucide-react"
import { getGigById, getReviewsByGig } from "@/lib/gigs"
import type { Gig, Review, GigPackage } from "@/lib/types/gigs"
import Link from "next/link"

export default function GigDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [gig, setGig] = useState<Gig | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<GigPackage | null>(null)

  useEffect(() => {
    if (params.id) {
      loadGig(params.id as string)
    }
  }, [params.id])

  const loadGig = async (gigId: string) => {
    setLoading(true)
    try {
      const [gigData, reviewsData] = await Promise.all([
        getGigById(gigId),
        getReviewsByGig(gigId)
      ])
      
      setGig(gigData)
      setReviews(reviewsData)
      
      // Select basic package by default
      if (gigData?.packages.length) {
        const basicPackage = gigData.packages.find(pkg => pkg.tier === "Basic") || gigData.packages[0]
        setSelectedPackage(basicPackage)
      }
    } catch (error) {
      console.error("Failed to load gig:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderNow = () => {
    if (!selectedPackage || !gig) return
    
    // Navigate to order page with gig and package info
    router.push(`/orders/create?gig=${gig.id}&package=${selectedPackage.id}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!gig) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Gig Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The gig you're looking for doesn't exist or has been removed.
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
        <Badge variant="secondary" className="mb-2">
          {gig.category}
        </Badge>
        <h1 className="text-3xl font-bold mb-2">{gig.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{gig.rating.toFixed(1)}</span>
            <span>({gig.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>{gig.orderCount} orders</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          {gig.gallery.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gig.gallery.map((image, index) => (
                    <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${gig.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Gig</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{gig.description}</p>
            </CardContent>
          </Card>

          {/* Tags */}
          {gig.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {gig.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Seller</CardTitle>
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
                  <h3 className="font-semibold text-lg mb-1">{gig.seller.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
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
                  {gig.seller.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {gig.seller.description}
                    </p>
                  )}
                  {gig.seller.skills && gig.seller.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {gig.seller.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Package Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gig.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPackage?.id === pkg.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{pkg.name}</h4>
                    <Badge variant={pkg.tier === "Premium" ? "default" : "secondary"}>
                      {pkg.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Delivery:</span>
                      <span>{pkg.deliveryDays} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Revisions:</span>
                      <span>{pkg.revisions}</span>
                    </div>
                  </div>
                  {pkg.features.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <ul className="text-sm space-y-1">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(pkg.price)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Order Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleOrderNow}
            disabled={!selectedPackage}
          >
            Continue to Order ({selectedPackage ? formatPrice(selectedPackage.price) : "Select Package"})
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Funds held in escrow until work is completed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
