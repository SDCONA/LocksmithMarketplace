import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { MarketplaceCard } from "./MarketplaceCard";
import { StarRating } from "./StarRating";
import { UserReviewsSection } from "./UserReviewsSection";
import { RateUserModal } from "./RateUserModal";
import { PostCard } from "./PostCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { 
  ArrowLeft, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  ShieldCheck,
  Store,
  Clock,
  MessageSquare,
  Settings,
  Save,
  X,
  UserPlus,
  Users,
  Send,
  Paperclip,
  Smile,
  Loader2
} from "lucide-react";

interface UserProfilePageProps {
  userId: string;
  currentUserId?: string;
  onBack: () => void;
  onMessage: (userId: string) => void;
  onViewListing: (listing: any) => void;
  onFavorite: (itemId: string) => void;
  onAuthRequired: () => void;
  isLoggedIn: boolean;
  accessToken?: string;
  onEditListing?: (listing: any) => void;
  onDeleteListing?: (listingId: string) => void;
  onPromoteListing?: (listingId: string) => void;
}

export function UserProfilePage({ 
  userId, 
  currentUserId,
  onBack, 
  onMessage, 
  onViewListing, 
  onFavorite, 
  onAuthRequired,
  isLoggedIn,
  accessToken,
  onEditListing,
  onDeleteListing,
  onPromoteListing
}: UserProfilePageProps) {
  // State for data
  const [profileData, setProfileData] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("listings");
  const [showRateUserModal, setShowRateUserModal] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Check if current user is viewing their own profile
  const isOwnProfile = currentUserId === userId;

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching profile for userId:', userId);

        // Use public anon key for authorization
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          'Content-Type': 'application/json'
        };

        // Fetch user profile
        const profileUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/users/${userId}`;
        console.log('Fetching from:', profileUrl);
        
        const profileRes = await fetch(profileUrl, { headers });
        
        console.log('Profile response status:', profileRes.status);
        
        if (!profileRes.ok) {
          const errorText = await profileRes.text();
          console.error('Profile fetch error:', errorText);
          throw new Error(`Failed to fetch user profile: ${profileRes.status}`);
        }
        
        const profileData = await profileRes.json();
        console.log('Profile data received:', profileData);
        
        if (!profileData.success) {
          throw new Error(profileData.error || 'Failed to fetch profile');
        }
        
        setProfileData(profileData.profile);

        // Fetch user listings
        const listingsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/users/${userId}/listings`;
        const listingsRes = await fetch(listingsUrl, { headers });
        
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          if (listingsData.success) {
            setListings(listingsData.listings || []);
          }
        }

        // Fetch user posts  
        const postsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/users/${userId}/posts`;
        const postsRes = await fetch(postsUrl, { headers });
        
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          if (postsData.success) {
            setPosts(postsData.posts || []);
          }
        }

        // Fetch user reviews
        const reviewsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/users/${userId}/reviews`;
        const reviewsRes = await fetch(reviewsUrl, { headers });
        
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          if (reviewsData.success) {
            setReviews(reviewsData.reviews || []);
          }
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      setError('No user ID provided');
      setLoading(false);
    }
  }, [userId, projectId, publicAnonKey, accessToken]);

  const handleMessage = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !accessToken) return;
    
    setIsSendingMessage(true);
    
    try {
      console.log('Creating conversation with user:', userId);
      
      // Step 1: Create or get conversation
      const conversationRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/conversations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            otherUserId: userId
          })
        }
      );
      
      if (!conversationRes.ok) {
        throw new Error('Failed to create conversation');
      }
      
      const conversationData = await conversationRes.json();
      console.log('Conversation created/retrieved:', conversationData);
      
      if (!conversationData.success || !conversationData.conversation) {
        throw new Error('Failed to get conversation');
      }
      
      const conversationId = conversationData.conversation.id;
      
      // Step 2: Send message
      const messageRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationId,
            content: messageText.trim()
          })
        }
      );
      
      if (!messageRes.ok) {
        throw new Error('Failed to send message');
      }
      
      const messageData = await messageRes.json();
      console.log('Message sent:', messageData);
      
      if (!messageData.success) {
        throw new Error(messageData.error || 'Failed to send message');
      }
      
      // Success! Clear and close modal
      setMessageText("");
      setShowMessageModal(false);
      
      // Show success feedback (you could add a toast here)
      console.log('Message sent successfully!');
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleRateUser = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    setShowRateUserModal(true);
  };

  const handleSubmitRating = async (ratingData: any) => {
    console.log("Rating submitted:", ratingData);
  };

  const handleEditDescription = () => {
    setEditedDescription(profileData?.bio || "");
    setIsEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    // TODO: Save to backend
    console.log("Saving description:", editedDescription);
    setIsEditingDescription(false);
  };

  const handleCancelEdit = () => {
    setEditedDescription("");
    setIsEditingDescription(false);
  };

  const handleFollow = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    
    setIsFollowing(!isFollowing);
    console.log(isFollowing ? "Unfollowed user" : "Followed user", userId);
  };

  const handleLikePost = (postId: string) => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    console.log("Liked post:", postId);
  };

  const handleDeletePost = (postId: string) => {
    console.log("Delete post:", postId);
  };

  const handleTogglePostVisibility = (postId: string) => {
    console.log("Toggle post visibility:", postId);
  };

  const handleViewProfile = (profileUserId: string) => {
    if (profileUserId !== userId) {
      console.log("Navigate to profile:", profileUserId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This user could not be found.'}</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Format user data for display
  const userName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unknown User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  const userLocation = [profileData.city, profileData.state].filter(Boolean).join(', ') || 'Location not set';
  const joinDate = profileData.created_at 
    ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';
  
  const followersCount = profileData.stats?.followers || 0;
  const displayFollowers = followersCount >= 1000 
    ? `${(followersCount / 1000).toFixed(1)}k` 
    : followersCount.toString();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">User Profile</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <Avatar className="h-20 w-20 md:h-24 md:w-24">
                  <AvatarImage src={profileData.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-semibold text-gray-900">{userName}</h2>
                    {profileData.is_verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">

                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {joinDate}</span>
                    </div>
                    {profileData.response_time && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{profileData.response_time}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <StarRating 
                      rating={profileData.rating || 0} 
                      showValue={true}
                      size="md"
                    />
                    <span className="text-sm text-gray-600">({profileData.totalRatings || 0} reviews)</span>
                  </div>

                  {isEditingDescription ? (
                    <div className="mt-2 max-w-2xl space-y-3">
                      <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="Enter your description..."
                        className="min-h-[100px] resize-none"
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {editedDescription.length}/500 characters
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveDescription}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    profileData.bio && (
                      <p className="text-gray-700 mt-2 max-w-2xl">{profileData.bio}</p>
                    )
                  )}
                </div>
              </div>

              {isOwnProfile ? (
                <div className="flex flex-col space-y-3">
                  <Button 
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={handleEditDescription}
                    disabled={isEditingDescription}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Description
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">

                  <Button 
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={handleMessage}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}


        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <MarketplaceCard
                  key={listing.id}
                  item={listing}
                  onMessage={() => handleMessage()}
                  onFavorite={onFavorite}
                  onViewListing={onViewListing}
                  onViewProfile={() => {}}
                  isLoggedIn={isLoggedIn}
                  onAuthRequired={onAuthRequired}
                  currentUser={isOwnProfile && currentUserId ? { id: currentUserId } : null}
                  onPromote={isOwnProfile ? onPromoteListing : undefined}
                  onEditListing={isOwnProfile ? onEditListing : undefined}
                  onDeleteListing={isOwnProfile ? onDeleteListing : undefined}
                />
              ))}
            </div>
            {listings.length === 0 && (
              <div className="text-center py-12">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active listings</h3>
                <p className="text-gray-600">This user doesn't have any active listings at the moment.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <UserReviewsSection
              reviews={reviews}
              averageRating={profileData.rating || 0}
              totalReviews={profileData.totalRatings || 0}
              categoryAverages={{
                communication: 0,
                reliability: 0,
                productQuality: 0,
                shipping: 0
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profileData.avatar_url} />
                <AvatarFallback>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span>Message {userName}</span>
                  {profileData.is_verified && (
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                {profileData.response_time && (
                  <p className="text-sm text-gray-500 font-normal">{profileData.response_time}</p>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              Send a direct message to {userName}. They'll receive a notification and can respond in the Messages section.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-3">
            <div className="space-y-1">
              <label htmlFor="message" className="text-sm font-medium text-gray-700">
                Your message
              </label>
              <Textarea
                id="message"
                placeholder={`Hi ${profileData.first_name || userName.split(' ')[0]}, I'm interested in...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{messageText.length}/500</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 px-2"
                >
                  <Paperclip className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 px-2"
                >
                  <Smile className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSendingMessage}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSendingMessage ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rate User Modal */}
      <RateUserModal
        isOpen={showRateUserModal}
        onClose={() => setShowRateUserModal(false)}
        onSubmitRating={handleSubmitRating}
        user={{
          id: profileData.id,
          name: userName,
          avatar: profileData.avatar_url,
          rating: profileData.rating || 0,
          totalReviews: profileData.totalRatings || 0
        }}
      />
    </div>
  );
}