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
  Archive
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { createClient } from "../utils/supabase/client";

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

  // Filter listings to show only the user's own listings
  const userListings = listings.filter(listing => listing.seller.id === user?.id);

  // Fetch archived listings
  useEffect(() => {
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
                    <div className="text-2xl font-semibold text-gray-900">{userListings.length}</div>
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings">My Listings ({userListings.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({profileData.totalReviews})</TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            {userListings.length > 0 || archivedListings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Active Listings */}
                {userListings.map((listing) => (
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
                  />
                ))}
                
                {/* Archived Listings */}
                {archivedListings.map((listing) => (
                  <div key={listing.id} className="relative">
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 left-2 z-10 bg-gray-500 text-white"
                    >
                      <Archive className="h-3 w-3 mr-1" />
                      Archived
                    </Badge>
                    <MarketplaceCard
                      item={listing}
                      onMessage={onMessage}
                      onFavorite={onFavorite}
                      onViewListing={onViewListing}
                      onViewProfile={() => {}} // Not needed for own profile
                      isLoggedIn={isLoggedIn}
                      onAuthRequired={onAuthRequired}
                      currentUser={user}
                      footerAction={
                        onNavigateToArchive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToArchive();
                            }}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <Archive className="h-3 w-3" />
                            Go to Archive
                          </Button>
                        )
                      }
                    />
                  </div>
                ))}
              </div>
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