import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { 
  ArrowLeft, Heart, ExternalLink, Clock, Tag, Store, 
  RefreshCw, Search, Trash2, Filter, ChevronDown, ChevronUp, X
} from "lucide-react";
import { DealsService } from "../utils/services";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

interface SavedDealsPageProps {
  onBack: () => void;
  onAuthRequired?: () => void;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  external_url: string;
  expires_at: string;
  retailer_profile: {
    id: string;
    company_name: string;
    logo_url: string | null;
  };
  deal_type: {
    id: string;
    name: string;
    color: string;
  } | null;
  images: Array<{
    id: string;
    image_url: string;
    display_order: number;
  }>;
}

interface SavedDeal {
  id: string;
  created_at: string;
  deal: Deal;
}

export function SavedDealsPage({ onBack, onAuthRequired }: SavedDealsPageProps) {
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  useEffect(() => {
    loadSavedDeals();
    loadRetailers();
  }, []);

  const loadSavedDeals = async () => {
    setIsLoading(true);
    try {
      const data = await DealsService.getSavedDeals();
      setSavedDeals(data);
    } catch (error: any) {
      console.error("Error loading saved deals:", error);
      if (error.message.includes("Unauthorized")) {
        toast.error("Please sign in to view saved deals");
        onAuthRequired?.();
      } else {
        toast.error("Failed to load saved deals");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadRetailers = async () => {
    try {
      const data = await DealsService.getActiveRetailers();
      setRetailers(data);
    } catch (error) {
      console.error("Error loading retailers:", error);
    }
  };

  const handleUnsaveDeal = async (dealId: string) => {
    try {
      await DealsService.unsaveDeal(dealId);
      setSavedDeals(prev => prev.filter(sd => sd.deal.id !== dealId));
      toast.success("Deal removed from saved");
    } catch (error: any) {
      console.error("Error unsaving deal:", error);
      toast.error(error.message || "Failed to remove deal");
    }
  };

  const handleToggleSelect = (savedDealId: string) => {
    setSelectedDealIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(savedDealId)) {
        newSet.delete(savedDealId);
      } else {
        newSet.add(savedDealId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedDealIds.size === filteredDeals.length) {
      setSelectedDealIds(new Set());
    } else {
      setSelectedDealIds(new Set(filteredDeals.map(sd => sd.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDealIds.size === 0) return;

    setIsDeletingBulk(true);
    try {
      await DealsService.bulkDeleteSavedDeals(Array.from(selectedDealIds));
      setSavedDeals(prev => prev.filter(sd => !selectedDealIds.has(sd.id)));
      setSelectedDealIds(new Set());
      toast.success(`Removed ${selectedDealIds.size} saved deal${selectedDealIds.size !== 1 ? 's' : ''}`);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error("Error bulk deleting saved deals:", error);
      toast.error(error.message || "Failed to remove deals");
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const toggleRetailerFilter = (retailerId: string) => {
    setSelectedRetailers(prev => {
      if (prev.includes(retailerId)) {
        return prev.filter(id => id !== retailerId);
      } else {
        return [...prev, retailerId];
      }
    });
  };

  const clearFilters = () => {
    setSelectedRetailers([]);
    setSearchQuery("");
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff < 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const calculateDiscount = (price: number, originalPrice: number) => {
    const discount = ((originalPrice - price) / originalPrice) * 100;
    return Math.round(discount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter deals
  const filteredDeals = savedDeals.filter(savedDeal => {
    const deal = savedDeal.deal;
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRetailer = selectedRetailers.length === 0 || 
                           selectedRetailers.includes(deal.retailer_profile.id);
    return matchesSearch && matchesRetailer;
  });

  // Get unique retailers from saved deals
  const savedRetailers = Array.from(new Set(savedDeals.map(sd => sd.deal.retailer_profile.id)))
    .map(id => savedDeals.find(sd => sd.deal.retailer_profile.id === id)!.deal.retailer_profile);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold">Saved Deals</h1>
              <p className="text-sm text-gray-600">
                {filteredDeals.length} saved deal{filteredDeals.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSavedDeals}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search saved deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle */}
          {savedRetailers.length > 0 && (
            <Button
              variant="outline"
              className="w-full mb-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter by Retailer
              {selectedRetailers.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedRetailers.length} selected
                </Badge>
              )}
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-auto" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-auto" />
              )}
            </Button>
          )}

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Select retailers:</p>
                {selectedRetailers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRetailers([])}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {savedRetailers.map((retailer) => {
                  const isSelected = selectedRetailers.includes(retailer.id);
                  return (
                    <button
                      key={retailer.id}
                      onClick={() => toggleRetailerFilter(retailer.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {retailer.logo_url ? (
                        <img
                          src={retailer.logo_url}
                          alt={retailer.company_name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                          <Store className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <span className="text-sm font-medium flex-1 text-left truncate">
                        {retailer.company_name}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {filteredDeals.length > 0 && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedDealIds.size === filteredDeals.length ? "Deselect All" : "Select All"}
              </Button>
              {selectedDealIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove {selectedDealIds.size} Selected
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deals List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                {savedDeals.length === 0
                  ? "You haven't saved any deals yet"
                  : "No deals match your filters"}
              </p>
              {(searchQuery || selectedRetailers.length > 0) && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDeals.map((savedDeal) => {
              const deal = savedDeal.deal;
              const isSelected = selectedDealIds.has(savedDeal.id);
              const primaryImage = deal.images && deal.images.length > 0 
                ? deal.images[0].image_url 
                : null;

              return (
                <Card key={savedDeal.id} className={`overflow-hidden hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      {/* Checkbox */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleToggleSelect(savedDeal.id)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Image */}
                      {primaryImage && (
                        <div className="flex-shrink-0">
                          <img
                            src={primaryImage}
                            alt={deal.title}
                            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Retailer */}
                        <div className="flex items-center gap-2 mb-2">
                          {deal.retailer_profile.logo_url ? (
                            <img
                              src={deal.retailer_profile.logo_url}
                              alt={deal.retailer_profile.company_name}
                              className="w-5 h-5 rounded object-cover"
                            />
                          ) : (
                            <Store className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {deal.retailer_profile.company_name}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {deal.title}
                        </h3>

                        {/* Deal Type */}
                        {deal.deal_type && (
                          <Badge
                            variant="outline"
                            className="mb-2"
                            style={{
                              borderColor: deal.deal_type.color,
                              color: deal.deal_type.color,
                            }}
                          >
                            {deal.deal_type.name}
                          </Badge>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-bold text-green-600">
                            ${deal.price.toFixed(2)}
                          </span>
                          {deal.original_price && (
                            <>
                              <span className="text-lg text-gray-400 line-through">
                                ${deal.original_price.toFixed(2)}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                {calculateDiscount(deal.price, deal.original_price)}% OFF
                              </Badge>
                            </>
                          )}
                        </div>

                        {/* Time & Saved Date */}
                        <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                          <div className="flex items-center gap-1 text-orange-600">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{formatTimeRemaining(deal.expires_at)}</span>
                          </div>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">
                            Saved {formatDate(savedDeal.created_at)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <a
                            href={deal.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button size="sm" className="w-full">
                              View Deal
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnsaveDeal(deal.id)}
                            title="Remove from saved"
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Saved Deals?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedDealIds.size} saved deal{selectedDealIds.size !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingBulk}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingBulk ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}