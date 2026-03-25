"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Star, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { getGigs } from "@/lib/gigs"
import type { Gig, GigCategory, GigFilter } from "@/lib/types/gigs"
import Link from "next/link"

const categories: GigCategory[] = ["Design", "Dev", "Writing", "Marketing", "Video", "Music", "Business"]

export default function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<GigCategory | "">("")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [maxDeliveryDays, setMaxDeliveryDays] = useState(30)
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadGigs()
  }, [searchQuery, selectedCategory, priceRange, maxDeliveryDays, minRating])

  const loadGigs = async () => {
    setLoading(true)
    const filter: GigFilter = {
      searchQuery: searchQuery || undefined,
      category: selectedCategory || undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
      maxDeliveryDays: maxDeliveryDays < 30 ? maxDeliveryDays : undefined,
      minRating: minRating > 0 ? minRating : undefined,
    }

    try {
      const result = await getGigs(filter)
      setGigs(result)
    } catch (error) {
      console.error("Failed to load gigs:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USDC",
    }).format(price)
  }

  const getMinPackagePrice = (gig: Gig) => {
    return Math.min(...gig.packages.map(pkg => pkg.price))
  }

  const getMinDeliveryDays = (gig: Gig) => {
    return Math.min(...gig.packages.map(pkg => pkg.deliveryDays))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Find the Perfect Gig</h1>
        <p className="text-muted-foreground text-lg">
          Discover talented freelancers for your next project
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as GigCategory | "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={10}
                    className="mt-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Max Delivery: {maxDeliveryDays} days
                  </label>
                  <Slider
                    value={[maxDeliveryDays]}
                    onValueChange={(value) => setMaxDeliveryDays(value[0])}
                    max={30}
                    step={1}
                    className="mt-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min Rating: {minRating > 0 ? `${minRating}+ stars` : "Any rating"}
                  </label>
                  <Slider
                    value={[minRating]}
                    onValueChange={(value) => setMinRating(value[0])}
                    max={5}
                    step={0.5}
                    className="mt-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-muted-foreground">
          {loading ? "Loading..." : `Found ${gigs.length} gigs`}
        </p>
      </div>

      {/* Gig Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No gigs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <Link key={gig.id} href={`/gigs/${gig.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {gig.category}
                      </Badge>
                      <CardTitle className="text-lg line-clamp-2">
                        {gig.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {gig.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{gig.rating.toFixed(1)}</span>
                      <span>({gig.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getMinDeliveryDays(gig)}d</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {gig.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {gig.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{gig.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(getMinPackagePrice(gig))}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
