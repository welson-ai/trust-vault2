"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  Star, 
  Clock, 
  Package, 
  CheckCircle, 
  Shield, 
  Upload,
  AlertCircle,
  MessageSquare,
  Calendar
} from "lucide-react"
import { getOrderById, updateOrder, createReview } from "@/lib/gigs"
import type { Order, Review } from "@/lib/types/gigs"
import Link from "next/link"

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [deliverables, setDeliverables] = useState<string[]>([])

  useEffect(() => {
    if (params.id) {
      loadOrder(params.id as string)
    }
  }, [params.id])

  const loadOrder = async (orderId: string) => {
    setLoading(true)
    try {
      const orderData = await getOrderById(orderId)
      setOrder(orderData)
      if (orderData?.deliverables) {
        setDeliverables(orderData.deliverables)
      }
    } catch (error) {
      console.error("Failed to load order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsCompleted = async () => {
    if (!order) return

    setSubmitting(true)
    try {
      await updateOrder(order.id, {
        status: "submitted",
        deliverables: deliverables
      })
      await loadOrder(order.id)
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Failed to update order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveWork = async () => {
    if (!order) return

    setSubmitting(true)
    try {
      await updateOrder(order.id, { status: "completed" })
      await loadOrder(order.id)
    } catch (error) {
      console.error("Error approving work:", error)
      alert("Failed to approve work. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!order || !reviewText.trim()) return

    setSubmitting(true)
    try {
      await createReview(order.id, reviewRating, reviewText.trim())
      setReviewText("")
      await loadOrder(order.id)
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Failed to submit review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestRevision = async () => {
    if (!order) return

    setSubmitting(true)
    try {
      await updateOrder(order.id, { 
        status: "in_progress",
        deliverables: [...deliverables, `Revision requested: ${reviewText}`]
      })
      setReviewText("")
      await loadOrder(order.id)
    } catch (error) {
      console.error("Error requesting revision:", error)
      alert("Failed to request revision. Please try again.")
    } finally {
      setSubmitting(false)
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "submitted": return "bg-purple-100 text-purple-800"
      case "completed": return "bg-green-100 text-green-800"
      case "disputed": return "bg-red-100 text-red-800"
      case "cancelled": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const isBuyer = true // In real app, this would come from auth
  const canSellerAct = order?.status === "pending" || order?.status === "in_progress"
  const canBuyerReview = order?.status === "completed" && isBuyer
  const canBuyerApprove = order?.status === "submitted" && isBuyer

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

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The order you're looking for doesn't exist.
          </p>
          <Link href="/orders">
            <Button>View Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Info */}
          <Card>
            <CardHeader>
              <CardTitle>Gig Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{order.gig?.title}</h3>
                  <p className="text-muted-foreground mb-2">{order.gig?.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary">{order.package?.name}</Badge>
                    <span className="text-muted-foreground">
                      Delivery: {order.package?.deliveryDays} days
                    </span>
                    <span className="text-muted-foreground">
                      Revisions: {order.package?.revisions}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {order.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Project Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{order.requirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {order.deliverables && order.deliverables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm">{deliverable}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                
                {order.deliveryDate && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      order.status === "completed" || order.status === "submitted" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {order.status === "completed" || order.status === "submitted" ? "✓" : "2"}
                    </div>
                    <div>
                      <p className="font-medium">Expected Delivery</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.deliveryDate)}</p>
                    </div>
                  </div>
                )}

                {order.actualDeliveryDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-semibold">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Work Delivered</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.actualDeliveryDate)}</p>
                    </div>
                  </div>
                )}

                {order.buyerApprovedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-semibold">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Order Completed</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.buyerApprovedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {canSellerAct && !isBuyer && (
            <Card>
              <CardHeader>
                <CardTitle>Seller Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Add Deliverables</label>
                    <Textarea
                      placeholder="Describe the work you've completed..."
                      value={deliverables.join("\n")}
                      onChange={(e) => setDeliverables(e.target.value.split("\n").filter(d => d.trim()))}
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={handleMarkAsCompleted}
                    disabled={submitting || deliverables.length === 0}
                    className="w-full"
                  >
                    {submitting ? "Submitting..." : "Submit Work for Review"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {canBuyerApprove && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Approve</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    The seller has submitted their work. Please review and approve or request revisions.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleApproveWork}
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? "Approving..." : "Approve Work"}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {}}
                      className="flex-1"
                    >
                      Request Revision
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {canBuyerReview && (
            <Card>
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= reviewRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Review</label>
                    <Textarea
                      placeholder="Share your experience..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={submitting || !reviewText.trim()}
                    className="w-full"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Package Price</span>
                <span>{formatPrice(order.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service Fee</span>
                <span>{formatPrice(order.amount * 0.05)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Total Paid</span>
                <span>{formatPrice(order.amount * 1.05)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Status */}
          <Card>
            <CardHeader>
              <CardTitle>Escrow Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Protected Payment</p>
                  <p className="text-sm text-muted-foreground">
                    {order.escrow?.status === "held" 
                      ? "Funds held securely in escrow"
                      : order.escrow?.status === "released"
                      ? "Funds released to seller"
                      : "Payment processing"
                    }
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>• Funds released only upon approval</p>
                <p>• Full refund if work not delivered</p>
                <p>• Dispute support available</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Seller
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
