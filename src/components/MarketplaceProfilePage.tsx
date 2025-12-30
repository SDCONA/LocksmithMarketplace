import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { MarketplaceCard } from "./MarketplaceCard";
import { StarRating } from "./StarRating";
import { EditMarketplaceProfileModal } from "./EditMarketplaceProfileModal";
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  MessageCircle,
  Shield,
  TrendingUp,
  Package,
  Eye,
  Heart,
  User,
  Settings,
  Edit3,
  Archive,
  CheckSquare,
  Square,
  Trash2,
  RefreshCw
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { createClient } from "../utils/supabase/client";
import { toast } from "sonner";

interface MarketplaceProfilePageProps {
  user: any;
  marketplaceProfile: any;
  listings: any[];
  onBack: () => void;
  onMessage: (userId: string) => void;
  onFavorite: (itemId: string) => void;
  onViewListing: (listing: any) => void;
  onAuthRequired: () => void;
  onUpdateMarketplaceProfile: (profileData: any) => void;
  isLoggedIn: boolean;
  onCreateListing?: () => void;
  onEditListing?: (listing: any) => void;
  onDeleteListing?: (listingId: string) => void;
  onPromoteListing?: (listingId: string) => void;
  onNavigateToArchive?: () => void;
}

export function MarketplaceProfilePage({
  user,
  marketplaceProfile,
  listings,
  onBack,
  onMessage,
  onFavorite,
  onViewListing,
  onAuthRequired,
  onUpdateMarketplaceProfile,
  isLoggedIn,
  onCreateListing,
  onEditListing,
  onDeleteListing,
  onPromoteListing,
  onNavigateToArchive
}: MarketplaceProfilePageProps) {
  const [activeTab, setActiveTab] = useState("listings");
  const [showEditModal, setShowEditModal] = useState(false);
  const [archivedListings, setArchivedListings] = useState<any[]>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Bulk selection states
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [processingBulkAction, setProcessingBulkAction] = useState(false);
  
  // Separate selection states for archived tab
  const [selectedArchivedListings, setSelectedArchivedListings] = useState<Set<string>>(new Set());
  const [isArchivedSelectionMode, setIsArchivedSelectionMode] = useState(false);
  const [processingArchivedBulkAction, setProcessingArchivedBulkAction] = useState(false);

  // Filter listings to show only the user's own listings
  const userListings = listings.filter(listing => listing.seller.id === user?.id);
  
  // Filter out archived listings from active listings
  // Only show listings that are NOT in the archivedListings array
  const archivedIds = new Set(archivedListings.map(l => l.id));
  const activeUserListings = userListings.filter(listing => !archivedIds.has(listing.id));
  
  // Combined listings for selection (active + archived)
  const allSelectableListings = [...activeUserListings, ...archivedListings];

  // Function to fetch archived listings
  const fetchArchivedListings = async () => {
    if (!user) return;
    
    try {
      setLoadingArchived(true);
      
      // Get fresh access token from Supabase session
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        console.log('No access token available for fetching archived listings');
        setLoadingArchived(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings/archived`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform archived listings to ensure they have the seller object
        const transformedListings = (data.listings || []).map((listing: any) => ({
          ...listing,
          seller: listing.seller || {
            id: listing.seller_id || user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar,
            rating: user.rating || 0
          }
        }));
        setArchivedListings(transformedListings);
      }
    } catch (error) {
      console.error('Error fetching archived listings:', error);
    } finally {
      setLoadingArchived(false);
    }
  };

  // Fetch archived listings on mount
  useEffect(() => {
    fetchArchivedListings();
  }, [user]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingReviews(true);
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/users/${user.id}/reviews`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Reviews fetched:', data);
          setReviews(data.reviews || []);
        } else {
          console.error('Failed to fetch reviews:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [user?.id]);

  // Calculate user stats
  const totalViews = userListings.reduce((sum, listing) => sum + (listing.views || 0), 0);
  const totalFavorites = userListings.reduce((sum, listing) => sum + (listing.favorites || 0), 0);
  const totalMessages = userListings.reduce((sum, listing) => sum + (listing.messages || 0), 0);

  // Combine user data with marketplace-specific profile data - RESET: No mock stats
  const profileData = {
    ...user,
    ...marketplaceProfile, // This will include marketplaceAvatar and other marketplace-specific fields
    name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown User",
    location: (() => {
      // Format address object into a string
      if (user?.address) {
        if (typeof user.address === 'string') {
          return user.address;
        }
        if (typeof user.address === 'object') {
          const { city, state, zipCode } = user.address;
          const parts = [city, state].filter(Boolean);
          return parts.length > 0 ? parts.join(', ') : "Location not set";
        }
      }
      return marketplaceProfile?.location || "Location not set";
    })(),
    joinedDate: user?.joinedDate || new Date().toISOString(),
    totalSales: 0, // RESET
    responseRate: "0%", // RESET
    averageRating: user?.rating || 0,
    totalReviews: user?.totalReviews || 0,
    isVerified: user?.isVerified || false,
    bio: marketplaceProfile?.bio || user?.bio || "",
    lastActive: "" // RESET
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedListings.size === activeUserListings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(activeUserListings.map(l => l.id)));
    }
  };

  const toggleSelectListing = (listingId: string) => {
    const newSelected = new Set(selectedListings);
    if (newSelected.has(listingId)) {
      newSelected.delete(listingId);
    } else {
      newSelected.add(listingId);
    }
    setSelectedListings(newSelected);
  };

  const handleBulkArchive = async () => {
    if (selectedListings.size === 0) return;
    
    setProcessingBulkAction(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      toast.error('Authentication error. Please log in again.');
      setProcessingBulkAction(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const archivedIds = new Set<string>();

    try {
      for (const listingId of Array.from(selectedListings)) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings/${listingId}/archive`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.ok) {
            successCount++;
            archivedIds.add(listingId);
          } else {
            errorCount++;
            const errorText = await response.text();
            console.error(`Failed to archive listing ${listingId}:`, errorText);
          }
        } catch (err) {
          errorCount++;
          console.error(`Error archiving listing ${listingId}:`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully archived ${successCount} listing${successCount !== 1 ? 's' : ''}`);
        // Refresh archived listings
        await fetchArchivedListings();
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to archive ${errorCount} listing${errorCount !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error archiving listings:', error);
      toast.error('An error occurred while archiving listings');
    } finally {
      setProcessingBulkAction(false);
      setSelectedListings(new Set());
      setIsSelectionMode(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedListings.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedListings.size} listing${selectedListings.size !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setProcessingBulkAction(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const listingId of Array.from(selectedListings)) {
        try {
          if (onDeleteListing) {
            await onDeleteListing(listingId);
            successCount++;
          }
        } catch (err) {
          errorCount++;
          console.error(`Error deleting listing ${listingId}:`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} listing${successCount !== 1 ? 's' : ''}`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} listing${errorCount !== 1 ? 's' : ''}}`);
      }
    } catch (error) {
      console.error('Error deleting listings:', error);
      toast.error('An error occurred while deleting listings');
    } finally {
      setProcessingBulkAction(false);
      setSelectedListings(new Set());
      setIsSelectionMode(false);
    }
  };

  const cancelSelection = () => {
    setSelectedListings(new Set());
    setIsSelectionMode(false);
  };

  // Archived bulk selection handlers
  const toggleSelectAllArchived = () => {
    if (selectedArchivedListings.size === archivedListings.length) {
      setSelectedArchivedListings(new Set());
    } else {
      setSelectedArchivedListings(new Set(archivedListings.map(l => l.id)));
    }
  };

  const toggleSelectArchivedListing = (listingId: string) => {
    const newSelected = new Set(selectedArchivedListings);
    if (newSelected.has(listingId)) {
      newSelected.delete(listingId);
    } else {
      newSelected.add(listingId);
    }
    setSelectedArchivedListings(newSelected);
  };

  const handleBulkRenew = async () => {
    if (selectedArchivedListings.size === 0) return;
    
    setProcessingArchivedBulkAction(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      toast.error('Authentication error. Please log in again.');
      setProcessingArchivedBulkAction(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    try {
      for (const listingId of Array.from(selectedArchivedListings)) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings/${listingId}/unarchive`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            const errorText = await response.text();
            console.error(`Failed to renew listing ${listingId}:`, errorText);
          }
        } catch (err) {
          errorCount++;
          console.error(`Error renewing listing ${listingId}:`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully renewed ${successCount} listing${successCount !== 1 ? 's' : ''}`);
        // Refresh archived listings
        await fetchArchivedListings();
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to renew ${errorCount} listing${errorCount !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error renewing listings:', error);
      toast.error('An error occurred while renewing listings');
    } finally {
      setProcessingArchivedBulkAction(false);
      setSelectedArchivedListings(new Set());
      setIsArchivedSelectionMode(false);
    }
  };

  const handleBulkDeleteArchived = async () => {
    if (selectedArchivedListings.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedArchivedListings.size} archived listing${selectedArchivedListings.size !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setProcessingArchivedBulkAction(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const listingId of Array.from(selectedArchivedListings)) {
        try {
          if (onDeleteListing) {
            await onDeleteListing(listingId);
            successCount++;
          }
        } catch (err) {
          errorCount++;
          console.error(`Error deleting listing ${listingId}:`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} listing${successCount !== 1 ? 's' : ''}`);
        // Refresh archived listings
        await fetchArchivedListings();
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} listing${errorCount !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error deleting listings:', error);
      toast.error('An error occurred while deleting listings');
    } finally {
      setProcessingArchivedBulkAction(false);
      setSelectedArchivedListings(new Set());
      setIsArchivedSelectionMode(false);
    }
  };

  const cancelArchivedSelection = () => {
    setSelectedArchivedListings(new Set());
    setIsArchivedSelectionMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Marketplace Profile</h1>
            <p className="text-gray-600">Manage your public marketplace presence</p>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarImage src={profileData.marketplaceAvatar || profileData.avatar} className="object-cover" />
                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold text-gray-900">{profileData.name}</h2>
                    {profileData.isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profileData.location}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(profileData.joinedDate).getFullYear()}
                  </div>
                </div>
              </div>

              {/* Stats and Rating */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">{activeUserListings.length}</div>
                    <div className="text-sm text-gray-600">Active Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">{profileData.totalReviews}</div>
                    <div className="text-sm text-gray-600">Total Reviews</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <StarRating rating={profileData.averageRating} />
                    <span className="text-sm text-gray-600">
                      {profileData.averageRating} ({profileData.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4">{profileData.bio}</p>

                <Button
                  onClick={() => setShowEditModal(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">My Listings ({activeUserListings.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({archivedListings.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({profileData.totalReviews})</TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            {userListings.length > 0 || archivedListings.length > 0 ? (
              <>
                {/* Bulk Actions Toolbar */}
                {!isSelectionMode ? (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSelectionMode(true)}
                      className="flex items-center gap-2"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Select Listings
                    </Button>
                  </div>
                ) : (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2"
                          >
                            {selectedListings.size === activeUserListings.length && activeUserListings.length > 0 ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                            Select All
                          </Button>
                          <span className="text-sm font-medium text-gray-700">
                            {selectedListings.size} listing{selectedListings.size !== 1 ? 's' : ''} selected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkArchive}
                            disabled={selectedListings.size === 0 || processingBulkAction}
                            className="flex items-center gap-2"
                          >
                            <Archive className="h-4 w-4" />
                            Archive
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            disabled={selectedListings.size === 0 || processingBulkAction}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelSelection}
                            disabled={processingBulkAction}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Active Listings */}
                  {activeUserListings.map((listing) => (
                    <MarketplaceCard
                      key={listing.id}
                      item={listing}
                      onMessage={onMessage}
                      onFavorite={onFavorite}
                      onViewListing={onViewListing}
                      onViewProfile={() => {}} // Not needed for own profile
                      isLoggedIn={isLoggedIn}
                      onAuthRequired={onAuthRequired}
                      currentUser={user}
                      onPromote={onPromoteListing}
                      onEditListing={onEditListing}
                      onDeleteListing={onDeleteListing}
                      onSelectListing={isSelectionMode ? toggleSelectListing : undefined}
                      isSelected={selectedListings.has(listing.id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active listings</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't created any marketplace listings yet.
                  </p>
                  <Button onClick={onCreateListing}>
                    Create Your First Listing
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Archived Tab */}
          <TabsContent value="archived" className="space-y-4">
            {loadingArchived ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-600">Loading archived listings...</p>
                </CardContent>
              </Card>
            ) : archivedListings.length > 0 ? (
              <>
                {/* Bulk Actions Toolbar for Archived */}
                {!isArchivedSelectionMode ? (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsArchivedSelectionMode(true)}
                      className="flex items-center gap-2"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Select Listings
                    </Button>
                  </div>
                ) : (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleSelectAllArchived}
                            className="flex items-center gap-2"
                          >
                            {selectedArchivedListings.size === archivedListings.length ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                            Select All
                          </Button>
                          <span className="text-sm font-medium text-gray-700">
                            {selectedArchivedListings.size} listing{selectedArchivedListings.size !== 1 ? 's' : ''} selected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleBulkRenew}
                            disabled={selectedArchivedListings.size === 0 || processingArchivedBulkAction}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Renew
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDeleteArchived}
                            disabled={selectedArchivedListings.size === 0 || processingArchivedBulkAction}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelArchivedSelection}
                            disabled={processingArchivedBulkAction}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {archivedListings.map((listing) => (
                    <div key={listing.id} className="relative">
                      {!isArchivedSelectionMode && (
                        <Badge 
                          variant="secondary" 
                          className="absolute top-2 left-2 z-10 bg-gray-500 text-white"
                        >
                          <Archive className="h-3 w-3 mr-1" />
                          Archived
                        </Badge>
                      )}
                      <MarketplaceCard
                        item={listing}
                        onMessage={onMessage}
                        onFavorite={onFavorite}
                        onViewListing={onViewListing}
                        onViewProfile={() => {}}
                        isLoggedIn={isLoggedIn}
                        onAuthRequired={onAuthRequired}
                        currentUser={user}
                        onEditListing={onEditListing}
                        onDeleteListing={onDeleteListing}
                        onSelectListing={isArchivedSelectionMode ? toggleSelectArchivedListing : undefined}
                        isSelected={selectedArchivedListings.has(listing.id)}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No archived listings</h3>
                  <p className="text-gray-600">
                    Archived listings will appear here. You can archive listings from the "My Listings" tab.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="space-y-4">
              {/* Overall Rating Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Customer Reviews
                  </CardTitle>
                  <CardDescription>
                    What buyers are saying about your products and service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{profileData.averageRating}</div>
                      <StarRating rating={profileData.averageRating} />
                      <div className="text-sm text-gray-600 mt-1">{profileData.totalReviews} reviews</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-2">{rating}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `0%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-6">0</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews - RESET: No mock reviews */}
              <div className="space-y-4">
                {loadingReviews ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      Loading reviews...
                    </CardContent>
                  </Card>
                ) : reviews.length > 0 ? (
                  reviews.map((review: any) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.reviewer?.avatar_url} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {review.reviewer?.first_name?.[0]}{review.reviewer?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {review.reviewer?.first_name} {review.reviewer?.last_name}
                                  </span>
                                  {review.reviewer?.is_verified && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <StarRating rating={review.overall_rating || review.rating || 5} size="sm" />
                                  <span className="text-xs text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {review.review_text && (
                              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                                {review.review_text}
                              </p>
                            )}
                            
                            {review.listing_title && (
                              <div className="text-xs text-gray-500 mb-3">
                                <span className="font-medium">Purchase:</span> {review.listing_title}
                              </div>
                            )}
                            
                            {/* Category Ratings */}
                            {(review.communication_rating || review.reliability_rating || review.product_quality_rating || review.shipping_rating) && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                                {review.communication_rating > 0 && (
                                  <div className="text-center">
                                    <div className="text-sm font-medium text-gray-900">
                                      {review.communication_rating}★
                                    </div>
                                    <div className="text-xs text-gray-500">Communication</div>
                                  </div>
                                )}
                                {review.reliability_rating > 0 && (
                                  <div className="text-center">
                                    <div className="text-sm font-medium text-gray-900">
                                      {review.reliability_rating}★
                                    </div>
                                    <div className="text-xs text-gray-500">Reliability</div>
                                  </div>
                                )}
                                {review.product_quality_rating > 0 && (
                                  <div className="text-center">
                                    <div className="text-sm font-medium text-gray-900">
                                      {review.product_quality_rating}★
                                    </div>
                                    <div className="text-xs text-gray-500">Quality</div>
                                  </div>
                                )}
                                {review.shipping_rating > 0 && (
                                  <div className="text-center">
                                    <div className="text-sm font-medium text-gray-900">
                                      {review.shipping_rating}★
                                    </div>
                                    <div className="text-xs text-gray-500">Shipping</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      No reviews yet. Complete transactions to receive reviews from buyers.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Marketplace Profile Modal */}
      <EditMarketplaceProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        marketplaceProfile={marketplaceProfile}
        onUpdateMarketplaceProfile={(profileData) => {
          onUpdateMarketplaceProfile(profileData);
          setShowEditModal(false);
        }}
      />
    </div>
  );
}