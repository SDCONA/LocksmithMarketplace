import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { MarketplaceCard } from "./MarketplaceCard";
import { SavedItemsService } from "../utils/services";
import { AuthService } from "../utils/auth";
import { toast } from 'sonner';
import { SkeletonCard } from "./SkeletonCard";
import { 
  ArrowLeft,
  Heart,
  Search,
  Filter,
  Trash2,
  Store,
  SortAsc
} from "lucide-react";

interface SavedMarketplaceListingsPageProps {
  user: any;
  savedListings: any[];
  onBack: () => void;
  onUnsaveListing: (listingId: string) => void;
  onClearAllSaved: () => void;
  onMessage: (sellerId: string) => void;
  onFavorite: (itemId: string) => void;
  onViewListing: (listing: any) => void;
  onViewProfile: (userId: string) => void;
  onAuthRequired: () => void;
  onEditListing?: (listing: any) => void;
  onDeleteListing?: (listingId: string) => void;
  onPromoteListing?: (listingId: string) => void;
}

export function SavedMarketplaceListingsPage({
  user,
  savedListings,
  onBack,
  onUnsaveListing,
  onClearAllSaved,
  onMessage,
  onFavorite,
  onViewListing,
  onViewProfile,
  onAuthRequired,
  onEditListing,
  onDeleteListing,
  onPromoteListing
}: SavedMarketplaceListingsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterByCategory, setFilterByCategory] = useState("all");

  // Get unique categories for filter
  const categories = Array.from(new Set(savedListings.map(item => item.category)));

  // Filter and sort saved listings
  const filteredListings = savedListings.filter(listing => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!listing.title.toLowerCase().includes(searchLower) && 
          !listing.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Category filter
    if (filterByCategory !== "all") {
      if (listing.category !== filterByCategory) return false;
    }

    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "title":
        return a.title.localeCompare(b.title);
      case "oldest":
        return (a.savedAt || 0) - (b.savedAt || 0);
      default: // newest
        return (b.savedAt || 0) - (a.savedAt || 0);
    }
  });

  const handleUnsave = (listingId: string) => {
    onUnsaveListing(listingId);
  };

  return (
    <div className="container mx-auto px-4 pt-6 pb-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
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
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Heart className="h-6 w-6 mr-2 text-red-500" />
              Saved Marketplace Listings
            </h1>
            <p className="text-gray-600 mt-1">
              {savedListings.length} saved listing{savedListings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {savedListings.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No saved listings yet</h2>
          <p className="text-gray-600 mb-6">
            Start exploring the marketplace and save listings you're interested in
          </p>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search saved listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort By */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Sort: {sortBy === "newest" ? "Newest" : 
                           sortBy === "oldest" ? "Oldest" :
                           sortBy === "price-asc" ? "Price Low-High" :
                           sortBy === "price-desc" ? "Price High-Low" : "Title"}
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
                  <DropdownMenuItem onClick={() => setSortBy("title")}>
                    Title A-Z
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Filter */}
              {categories.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      {filterByCategory === "all" ? "All Categories" : filterByCategory}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterByCategory("all")}>
                      All Categories
                    </DropdownMenuItem>
                    {categories.map(category => (
                      <DropdownMenuItem 
                        key={category} 
                        onClick={() => setFilterByCategory(category)}
                      >
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Clear All */}
              {savedListings.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to remove all saved listings?")) {
                      onClearAllSaved();
                    }
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">
              {sortedListings.length} of {savedListings.length} listing{sortedListings.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Listings Grid */}
          {sortedListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {sortedListings.map((listing) => (
                <div key={listing.id} className="relative">
                  <MarketplaceCard
                    item={listing}
                    onMessage={onMessage}
                    onFavorite={(itemId) => {
                      // For saved listings, we want to unsave them
                      handleUnsave(itemId);
                    }}
                    onViewListing={onViewListing}
                    onViewProfile={onViewProfile}
                    isLoggedIn={!!user}
                    onAuthRequired={onAuthRequired}
                    currentUser={user}
                    onPromote={onPromoteListing}
                    onEditListing={onEditListing}
                    onDeleteListing={onDeleteListing}
                    // Show as favorited since it's in saved list
                    isSaved={true}
                  />
                  {/* Saved badge removed */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings match your search</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setFilterByCategory("all");
                  setSortBy("newest");
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}