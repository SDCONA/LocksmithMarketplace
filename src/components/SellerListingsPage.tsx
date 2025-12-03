import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MarketplaceCard } from "./MarketplaceCard";
import { MarketplaceFilters } from "./MarketplaceFilters";
import { 
  ArrowLeft,
  Star,
  MessageCircle,
  MapPin,
  Calendar,
  Shield,
  Store,
  Package,
  Eye,
  Heart,
  Clock
} from "lucide-react";

interface SellerListingsPageProps {
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    responseTime: string;
    location?: string;
    joinedDate?: string;
    totalListings?: number;
    totalSales?: number;
    isVerified?: boolean;
  };
  listings: any[];
  onBack: () => void;
  onMessage: (sellerId: string) => void;
  onFavorite: (itemId: string) => void;
  onViewListing: (listing: any) => void;
  onAuthRequired: () => void;
  isLoggedIn: boolean;
}

export function SellerListingsPage({
  seller,
  listings,
  onBack,
  onMessage,
  onFavorite,
  onViewListing,
  onAuthRequired,
  isLoggedIn
}: SellerListingsPageProps) {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState(25);

  // Filter and sort listings
  const filteredListings = listings.filter(item => {
    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      if (item.category !== selectedCategory) return false;
    }

    // Condition filter
    if (selectedCondition && selectedCondition !== "all") {
      if (item.condition !== selectedCondition) return false;
    }

    // Location filter (radius filter only works with zip code)
    if (zipCode && zipCode.length === 5 && radius < 500) {
      // In a real application, this would use a geocoding service 
      // to calculate actual distances based on zip codes
      // For now, we'll use a simple mock distance calculation
      
      // Mock distance calculation - in reality this would involve:
      // 1. Convert user's zip code to lat/lng
      // 2. Convert item location to lat/lng  
      // 3. Calculate actual distance using haversine formula
      // 4. Compare with selected radius
      
      // For demo purposes, we'll assume all items are within range
      // when a zip code is entered, unless radius is very small
      if (radius < 10) {
        // For very small radius, only show items from same city
        const itemCity = item.location.split(',')[0].trim().toLowerCase();
        const mockCities = ['los angeles', 'san diego', 'phoenix']; // Mock nearby cities for small radius
        if (!mockCities.includes(itemCity)) return false;
      }
    }

    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "distance":
        return a.location.localeCompare(b.location);
      case "popular":
        return (b.seller?.rating || 0) - (a.seller?.rating || 0);
      default: // newest
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }
  });

  const handleMessage = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    onMessage(seller.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Listing</span>
            </Button>
          </div>

          {/* Seller Profile Section */}
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarImage src={seller.avatar} />
                <AvatarFallback className="text-xl">
                  {seller.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-semibold text-gray-900">{seller.name}</h1>
                  {seller.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{seller.rating}</span>
                  </div>
                  
                  {seller.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{seller.location}</span>
                    </div>
                  )}
                  
                  {seller.joinedDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {seller.joinedDate}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{seller.responseTime}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Store className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{listings.length}</span>
                    <span className="text-gray-600">listings</span>
                  </div>
                  
                  {seller.totalSales && (
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{seller.totalSales}</span>
                      <span className="text-gray-600">sales</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 md:w-48">
              <Button onClick={handleMessage} className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Seller
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  All listings are authentic and verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                All Listings by {seller.name}
              </h2>
              <p className="text-gray-600 mt-1">
                {sortedListings.length} items available
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <MarketplaceFilters
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedCondition={selectedCondition}
                setSelectedCondition={setSelectedCondition}
                sortBy={sortBy}
                setSortBy={setSortBy}
                zipCode={zipCode}
                setZipCode={setZipCode}
                radius={radius}
                setRadius={setRadius}
              />
            </div>

            {/* Listings Grid */}
            <div className="lg:col-span-3">
              {sortedListings.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {sortedListings.map((item) => (
                    <MarketplaceCard
                      key={item.id}
                      item={item}
                      onMessage={onMessage}
                      onFavorite={onFavorite}
                      onViewListing={onViewListing}
                      isLoggedIn={isLoggedIn}
                      onAuthRequired={onAuthRequired}
                      currentUser={null}
                      onPromote={undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                  <p className="text-gray-600 mb-4">
                    This seller doesn't have any listings that match your current filters
                  </p>
                  <Button 
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedConditions([]);
                    }}
                    variant="outline"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}