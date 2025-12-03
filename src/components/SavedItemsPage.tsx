import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { SearchResultCard } from "./SearchResultCard";
import { SavedItemsService } from "../utils/services";
import { AuthService } from "../utils/auth";
import { toast } from "sonner";
import { SkeletonCard } from "./SkeletonCard";
import { 
  ArrowLeft,
  Heart,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Star,
  ShoppingCart
} from "lucide-react";

interface SavedItemsPageProps {
  user: any;
  savedItems: any[];
  onBack: () => void;
  onUnsaveItem: (itemId: string) => void;
  onClearAllSaved: () => void;
}

export function SavedItemsPage({
  user,
  savedItems,
  onBack,
  onUnsaveItem,
  onClearAllSaved
}: SavedItemsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterByRetailer, setFilterByRetailer] = useState("all");

  // Get unique retailers for filter
  const retailers = Array.from(new Set(savedItems.map(item => item.retailer.name)));

  // Filter and sort saved items
  const filteredItems = savedItems.filter(item => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(searchLower) && 
          !item.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Retailer filter
    if (filterByRetailer !== "all" && item.retailer.name !== filterByRetailer) {
      return false;
    }

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "oldest":
        return (a.savedAt || 0) - (b.savedAt || 0);
      default: // newest
        return (b.savedAt || 0) - (a.savedAt || 0);
    }
  });

  const handleUnsaveItem = (itemId: string) => {
    onUnsaveItem(itemId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-500" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Saved Items</h1>
                  <p className="text-sm text-gray-600">{sortedItems.length} saved products from retailers</p>
                </div>
              </div>
            </div>

            {savedItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAllSaved}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {savedItems.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Saved Items Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start browsing our retailer products and save items you're interested in. 
              They'll appear here for easy access later.
            </p>

          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search your saved items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Sort: {sortBy === "newest" ? "Newest" : 
                             sortBy === "oldest" ? "Oldest" :
                             sortBy === "price-asc" ? "Price: Low to High" :
                             sortBy === "price-desc" ? "Price: High to Low" : "Rating"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>
                      Newest Saved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                      Oldest Saved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price-asc")}>
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price-desc")}>
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("rating")}>
                      Highest Rated
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Retailer Filter */}
                {retailers.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Retailer: {filterByRetailer === "all" ? "All" : filterByRetailer}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterByRetailer("all")}>
                        All Retailers
                      </DropdownMenuItem>
                      {retailers.map((retailer) => (
                        <DropdownMenuItem 
                          key={retailer}
                          onClick={() => setFilterByRetailer(retailer)}
                        >
                          {retailer}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Clear Filters */}
                {(searchQuery || filterByRetailer !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterByRetailer("all");
                    }}
                    className="text-gray-600"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {sortedItems.length} of {savedItems.length} saved items
              </p>
            </div>

            {/* Saved Items Grid */}
            {sortedItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {sortedItems.map((item) => (
                  <div key={item.id} className="relative">
                    {/* Unsave Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnsaveItem(item.id)}
                      className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-sm rounded-full h-8 w-8 p-0"
                    >
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                    </Button>
                    
                    {/* Product Card */}
                    <Card className="h-full hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="p-0">
                        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm line-clamp-2 text-gray-900">
                            {item.name}
                          </h3>
                          
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{item.rating}</span>
                            <span className="text-xs text-gray-400">({item.reviewCount})</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-green-600">
                                  ${item.price}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="text-xs text-gray-500 line-through">
                                    ${item.originalPrice}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">{item.retailer.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <Badge 
                              variant={item.inStock ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {item.inStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                            
                            <Button
                              size="sm"
                              onClick={() => window.open(item.productUrl, '_blank')}
                              className="bg-blue-600 hover:bg-blue-700 h-7 px-2"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              <span className="text-xs">View</span>
                            </Button>
                          </div>

                          {item.savedAt && (
                            <p className="text-xs text-gray-400 pt-1">
                              Saved {new Date(item.savedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              // No Results
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterByRetailer("all");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}