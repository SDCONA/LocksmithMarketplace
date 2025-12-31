import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { 
  Heart, ExternalLink, Clock, Tag, ChevronDown, ChevronUp, 
  Bookmark, Filter, RefreshCw, Store, X, Settings, Upload, Flag, AlertTriangle, Share2
} from "lucide-react";
import { DealsService } from "../utils/services";
import { isAdminUser, AuthService, User } from "../utils/auth";
import { ReportService } from "../utils/services/reports";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { DealModal, DealModalData } from "./DealModal";
import { trackDealView } from "../utils/analytics";

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
    is_always_on_top: boolean;
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
  is_saved?: boolean;
  source?: string; // 'database' or 'ebay', etc.
  sourceType?: string; // 'retailer' or 'external'
  currency?: string;
  condition?: string;
  sellerName?: string;
  shippingCost?: number;
}

interface Retailer {
  id: string;
  company_name: string;
  logo_url: string | null;
}

interface DealsPageProps {
  onNavigateToAdmin?: () => void;
  onNavigateToRetailerDeals?: () => void;
  onNavigateToSavedDeals?: () => void;
  currentUser?: User | null;
}

export function DealsPage({ onNavigateToAdmin, onNavigateToRetailerDeals, onNavigateToSavedDeals, currentUser }: DealsPageProps = {}) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [excludedRetailers, setExcludedRetailers] = useState<string[]>([]);
  const [savedDealIds, setSavedDealIds] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [userRetailerIds, setUserRetailerIds] = useState<Set<string>>(new Set());
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AuthService.getFreshToken();
      setIsLoggedIn(!!token);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    loadDeals();
    loadRetailers();
    if (isLoggedIn) {
      loadSavedDeals();
      loadUserRetailers();
    }
  }, [excludedRetailers, isLoggedIn]);

  // Handle shared deal link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dealId = urlParams.get('dealId');
    
    if (dealId && deals.length > 0) {
      const sharedDeal = deals.find(d => d.id === dealId);
      if (sharedDeal) {
        openDealModal(sharedDeal);
        // Clean up URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [deals]);

  const loadDeals = async () => {
    setIsLoading(true);
    try {
      console.log('📋 Loading all public deals');
      const data = await DealsService.getPublicDeals(excludedRetailers);
      console.log('✅ Public deals loaded:', data.length, 'deals');
      setDeals(data);
    } catch (error) {
      console.error("❌ Error loading deals:", error);
      toast.error("Failed to load deals");
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

  const loadSavedDeals = async () => {
    // Silently skip if not logged in
    if (!isLoggedIn) {
      return;
    }
    
    try {
      // Ensure we have a fresh token before making the request
      const token = await AuthService.getFreshToken();
      if (!token) {
        // User session expired, update login state
        setIsLoggedIn(false);
        setSavedDealIds(new Set());
        return;
      }
      
      const savedDeals = await DealsService.getSavedDeals();
      const savedIds = new Set(savedDeals.map((sd: any) => sd.deal.id));
      setSavedDealIds(savedIds);
    } catch (error: any) {
      // Only log error if it's not an auth issue
      if (error.message !== 'Unauthorized' && error.message !== 'Authentication required') {
        console.error("Error loading saved deals:", error);
      }
      // If unauthorized, user is not logged in
      if (error.message === 'Unauthorized' || error.message === 'Authentication required') {
        setIsLoggedIn(false);
        setSavedDealIds(new Set());
      }
    }
  };

  const loadUserRetailers = async () => {
    // Silently skip if not logged in
    if (!isLoggedIn) {
      return;
    }
    
    try {
      // Ensure we have a fresh token before making the request
      const token = await AuthService.getFreshToken();
      if (!token) {
        // User session expired, update login state
        setIsLoggedIn(false);
        setUserRetailerIds(new Set());
        return;
      }
      
      const profiles = await DealsService.getRetailerProfiles();
      const retailerIds = new Set(profiles.map((p: any) => p.id));
      setUserRetailerIds(retailerIds);
    } catch (error: any) {
      // Only log error if it's not an auth issue
      if (error.message !== 'Unauthorized' && error.message !== 'Authentication required') {
        console.error("Error loading user retailers:", error);
      }
      // If unauthorized, user is not logged in
      if (error.message === 'Unauthorized' || error.message === 'Authentication required') {
        setIsLoggedIn(false);
        setUserRetailerIds(new Set());
      }
    }
  };

  const handleSaveDeal = async (dealId: string) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to save deals");
      return;
    }

    try {
      const isSaved = savedDealIds.has(dealId);
      
      if (isSaved) {
        await DealsService.unsaveDeal(dealId);
        setSavedDealIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(dealId);
          return newSet;
        });
        toast.success("Deal removed from saved");
      } else {
        await DealsService.saveDeal(dealId);
        setSavedDealIds(prev => new Set(prev).add(dealId));
        toast.success("Deal saved!");
      }
    } catch (error: any) {
      console.error("Error saving deal:", error);
      toast.error(error.message || "Failed to save deal");
    }
  };

  const toggleRetailerFilter = (retailerId: string) => {
    setExcludedRetailers(prev => {
      if (prev.includes(retailerId)) {
        return prev.filter(id => id !== retailerId);
      } else {
        return [...prev, retailerId];
      }
    });
  };

  const clearFilters = () => {
    setExcludedRetailers([]);
  };

  const handleRefresh = () => {
    loadDeals();
    if (isLoggedIn) {
      loadSavedDeals();
    }
    toast.success("Deals refreshed");
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

  const openDealModal = (deal: Deal) => {
    setSelectedDeal(deal);
    // Track deal view
    trackDealView(deal.id);
  };

  const closeDealModal = () => {
    setSelectedDeal(null);
  };

  // Separate priority deals from regular deals (backend already randomizes)
  const priorityDeals = deals.filter(deal => deal.retailer_profile.is_always_on_top);
  const regularDeals = deals.filter(deal => !deal.retailer_profile.is_always_on_top);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Deal Modal */}
      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          isSaved={savedDealIds.has(selectedDeal.id)}
          onSave={handleSaveDeal}
          onClose={closeDealModal}
          formatTimeRemaining={formatTimeRemaining}
          calculateDiscount={calculateDiscount}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold">Deals</h1>
              <p className="text-sm text-gray-600">
                {deals.length} active deal{deals.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex gap-2">
              {isAdminUser(currentUser) && onNavigateToAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToAdmin}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              )}
              {isLoggedIn && onNavigateToRetailerDeals && (
                <Button
                  onClick={onNavigateToRetailerDeals}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Store className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              )}
              {isLoggedIn && onNavigateToSavedDeals && (
                <Button
                  onClick={onNavigateToSavedDeals}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 relative"
                >
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  {savedDealIds.size > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-white text-blue-600">
                      {savedDealIds.size}
                    </Badge>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter by Retailer
            {excludedRetailers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {retailers.length - excludedRetailers.length} selected
              </Badge>
            )}
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-auto" />
            )}
          </Button>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Select retailers to show:</p>
                {excludedRetailers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {retailers.map((retailer) => {
                  const isExcluded = excludedRetailers.includes(retailer.id);
                  return (
                    <button
                      key={retailer.id}
                      onClick={() => toggleRetailerFilter(retailer.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                        isExcluded
                          ? 'bg-gray-100 border-gray-300 opacity-50'
                          : 'bg-white border-blue-500 shadow-sm'
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
                      {!isExcluded && (
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
        </div>
      </div>

      {/* Deals Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : deals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">
                {excludedRetailers.length > 0
                  ? "No deals available from selected retailers"
                  : "No active deals at the moment"}
              </p>
              {excludedRetailers.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Priority Deals */}
            {priorityDeals.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {priorityDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isSaved={savedDealIds.has(deal.id)}
                    onSave={handleSaveDeal}
                    formatTimeRemaining={formatTimeRemaining}
                    calculateDiscount={calculateDiscount}
                    isLoggedIn={isLoggedIn}
                    onClick={openDealModal}
                    userRetailerIds={userRetailerIds}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}

            {/* Regular Deals */}
            {regularDeals.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {regularDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isSaved={savedDealIds.has(deal.id)}
                    onSave={handleSaveDeal}
                    formatTimeRemaining={formatTimeRemaining}
                    calculateDiscount={calculateDiscount}
                    isLoggedIn={isLoggedIn}
                    onClick={openDealModal}
                    userRetailerIds={userRetailerIds}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Deal Card Component
interface DealCardProps {
  deal: Deal;
  isSaved: boolean;
  onSave: (dealId: string) => void;
  formatTimeRemaining: (expiresAt: string) => string;
  calculateDiscount: (price: number, originalPrice: number) => number;
  isLoggedIn: boolean;
  onClick: (deal: Deal) => void;
  userRetailerIds: Set<string>;
  currentUser: User | null;
}

function DealCard({ deal, isSaved, onSave, formatTimeRemaining, calculateDiscount, isLoggedIn, onClick, userRetailerIds, currentUser }: DealCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasMultipleImages = deal.images && deal.images.length > 1;
  const primaryImage = deal.images && deal.images.length > 0 
    ? deal.images[currentImageIndex].image_url 
    : null;

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % deal.images.length);
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + deal.images.length) % deal.images.length);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onClick(deal)}>
      <CardContent className="p-0">
        {/* Image Section */}
        {primaryImage && (
          <div className="relative bg-gray-100 aspect-video">
            <img
              src={primaryImage}
              alt={deal.title}
              className="w-full h-full object-contain bg-white"
            />
            
            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                >
                  <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                >
                  <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {deal.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Save Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave(deal.id);
              }}
              className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
              title={isLoggedIn ? (isSaved ? "Remove from saved" : "Save deal") : "Sign in to save"}
            >
              {isSaved ? (
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              ) : (
                <Heart className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Share Button */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const shareUrl = `${window.location.origin}${window.location.pathname}?dealId=${deal.id}`;
                const shareData = {
                  title: deal.title,
                  text: `Check out this deal: ${deal.title} - $${deal.price.toFixed(2)}`,
                  url: shareUrl
                };

                try {
                  if (navigator.share) {
                    await navigator.share(shareData);
                    toast.success("Deal shared successfully!");
                  } else {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Deal link copied to clipboard!");
                  }
                } catch (error: any) {
                  if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                    toast.error("Failed to share deal");
                  }
                }
              }}
              className="absolute top-[4rem] right-3 p-1 rounded-full hover:scale-110 transition-transform"
              title="Share deal"
            >
              <Share2 className="h-4 w-4 text-white drop-shadow-lg" />
            </button>

            {/* Discount Badge */}
            {deal.original_price && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded-full shadow-lg">
                <span className="font-bold text-xs">
                  {calculateDiscount(deal.price, deal.original_price)}% OFF
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="p-4">
          {/* Retailer Info */}
          <div className="flex items-start gap-2 mb-2">
            {deal.retailer_profile.logo_url ? (
              <img
                src={deal.retailer_profile.logo_url}
                alt={deal.retailer_profile.company_name}
                className="w-6 h-6 rounded object-cover"
              />
            ) : (
              <Store className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {deal.retailer_profile.company_name}
            </span>
            {deal.retailer_profile.is_always_on_top && (
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            )}
            {(deal as any).source === 'ebay' && (
              <Badge className="text-xs bg-yellow-400 text-black hover:bg-yellow-500">
                eBay
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {deal.title}
          </h3>



          {/* Deal Type */}
          {deal.deal_type && (
            <Badge
              variant="outline"
              className="mb-3"
              style={{
                borderColor: deal.deal_type.color,
                color: deal.deal_type.color,
              }}
            >
              {deal.deal_type.name}
            </Badge>
          )}

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-green-600">
              ${deal.price.toFixed(2)}
            </span>
            {deal.original_price && (
              <span className="text-sm text-gray-400 line-through">
                ${deal.original_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Time Remaining */}
          {(isAdminUser(currentUser) || userRetailerIds.has(deal.retailer_profile.id)) && (
            <div className="flex items-center gap-1 text-sm text-orange-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{formatTimeRemaining(deal.expires_at)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}