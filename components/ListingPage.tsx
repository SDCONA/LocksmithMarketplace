import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { MarketplaceCard } from "./MarketplaceCard";
import { StarRating } from "./StarRating";
import { ReportModal } from "./ReportModal";
import { copyToClipboard } from "../utils/clipboard";
import { MessagingService, ReportService } from "../utils/services";
import { AuthService } from "../utils/auth";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  MapPin,
  Calendar,
  Truck,
  Shield,
  Flag,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  CreditCard,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  Printer,
  Facebook,
  Twitter,
  MessageSquare,
  Link2,
  Check,
  AlertTriangle,
  CheckCircle,
  Users,
  CreditCard as CreditCardIcon,
  ShieldCheck,
  Zap,
  Send,
  X
} from "lucide-react";

interface ListingPageProps {
  listing: any;
  currentUser?: any;
  onBack: () => void;
  onMessage: (sellerId: string) => void;
  onFavorite: (listingId: string) => void;
  onViewListing: (item: any) => void;
  onViewSellerListings: (sellerId: string) => void;
  onViewProfile: (userId: string) => void;
  onAuthRequired: () => void;
  onReport: (listing: any) => void;
  isLoggedIn: boolean;
  similarListings?: any[];
  isSaved?: boolean;
}

export function ListingPage({ 
  listing, 
  currentUser,
  onBack, 
  onMessage, 
  onFavorite, 
  onViewListing,
  onViewSellerListings,
  onViewProfile,
  onAuthRequired,
  onReport,
  isLoggedIn,
  similarListings = [],
  isSaved = false
}: ListingPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(isSaved);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [expandedListings, setExpandedListings] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'seller', timestamp: string}>>([]);
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Update favorited state when isSaved prop changes
  useEffect(() => {
    setIsFavorited(isSaved);
  }, [isSaved]);
  
  // Derive seller object from either transformed format or raw backend format
  const seller = listing.seller || {
    id: listing.seller_id || listing.user_profiles?.id || '',
    name: listing.user_profiles 
      ? `${listing.user_profiles.first_name || ''} ${listing.user_profiles.last_name || ''}`.trim() 
      : 'Unknown Seller',
    avatar: listing.user_profiles?.avatar_url || '',
    rating: listing.user_profiles?.rating || 0,
    reviewCount: listing.user_profiles?.total_reviews || 0,
    responseTime: 'Usually responds within an hour',
    joinedDate: listing.user_profiles?.created_at || listing.created_at
  };
  
  // Check if current user is the owner of this listing
  const isOwnListing = currentUser && seller.id === currentUser.id;
  
  // Image Modal State
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [modalOpacity, setModalOpacity] = useState(1);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(1);
  
  // Touch/swipe handling for gallery
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleOpenGallery = (index: number = 0) => {
    setCurrentImageIndex(index);
    setShowImageGallery(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePreviousImage();
    } else if (e.key === 'ArrowRight') {
      handleNextImage();
    } else if (e.key === 'Escape') {
      setShowImageGallery(false);
    }
  };

  // Touch event handlers for swipe detection and drag-to-close
  const getPinchDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getPinchDistance(e.touches);
      setInitialPinchDistance(distance);
      setInitialZoom(imageZoom);
    } else if (e.touches.length === 1) {
      touchEndRef.current = null;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      
      // If zoomed in, prepare for panning
      if (imageZoom > 1) {
        setIsPanning(true);
        setPanStart({ x: imagePan.x, y: imagePan.y });
        setIsDragging(false);
      } else {
        setIsDragging(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      // Handle pinch zoom
      const currentDistance = getPinchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance;
      const newZoom = Math.max(1, Math.min(initialZoom * scale, 4)); // Limit zoom between 1x and 4x
      setImageZoom(newZoom);
      e.preventDefault();
      return;
    }
    
    if (!touchStartRef.current || e.touches.length !== 1) return;
    
    const currentTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    
    touchEndRef.current = currentTouch;
    
    // If zoomed in and panning, update pan position
    if (isPanning && imageZoom > 1) {
      const deltaX = currentTouch.x - touchStartRef.current.x;
      const deltaY = currentTouch.y - touchStartRef.current.y;
      setImagePan({
        x: panStart.x + deltaX,
        y: panStart.y + deltaY
      });
      e.preventDefault();
      return;
    }
    
    // Normal swipe/drag handling when not zoomed
    const deltaY = currentTouch.y - touchStartRef.current.y;
    const deltaX = currentTouch.x - touchStartRef.current.x;
    
    // Only handle vertical drag for closing
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
      // Dragging down
      const progress = Math.min(deltaY / 200, 1); // 200px to fully close
      setDragOffset(deltaY);
      setModalOpacity(1 - progress * 0.7); // Fade out as dragging
    } else {
      // Reset if not dragging down
      setDragOffset(0);
      setModalOpacity(1);
    }
  };

  const handleTouchEnd = () => {
    if (initialPinchDistance) {
      setInitialPinchDistance(null);
      // Reset pan if zoomed back to 1x
      if (imageZoom === 1) {
        setImagePan({ x: 0, y: 0 });
      }
      return;
    }

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!touchStartRef.current || !touchEndRef.current) {
      setIsDragging(false);
      setDragOffset(0);
      setModalOpacity(1);
      return;
    }

    // Only allow swipe navigation when not zoomed in
    if (imageZoom > 1) {
      setIsDragging(false);
      return;
    }

    const distanceX = touchStartRef.current.x - touchEndRef.current.x;
    const distanceY = touchStartRef.current.y - touchEndRef.current.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);
    const isDownSwipe = distanceY < -80; // Swipe down to close

    // Check for close gesture first
    if (isDownSwipe && isVerticalSwipe) {
      setShowImageGallery(false);
      setImageZoom(1);
      setImagePan({ x: 0, y: 0 });
    }
    // Handle horizontal swipes for navigation
    else if (!isVerticalSwipe && listing.images.length > 1) {
      if (isLeftSwipe) {
        handleNextImage();
        setImageZoom(1);
        setImagePan({ x: 0, y: 0 });
      }
      if (isRightSwipe) {
        handlePreviousImage();
        setImageZoom(1);
        setImagePan({ x: 0, y: 0 });
      }
    }

    // Reset drag state
    setIsDragging(false);
    setDragOffset(0);
    setModalOpacity(1);
  };

  // Double tap to zoom
  const [lastTap, setLastTap] = useState(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (imageZoom === 1) {
        setImageZoom(2);
      } else {
        setImageZoom(1);
        setImagePan({ x: 0, y: 0 });
      }
    }
    setLastTap(now);
  };

  const handleFavorite = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    setIsFavorited(!isFavorited);
    onFavorite(listing.id);
  };

  const handleMessage = (messageTemplate?: string) => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    if (messageTemplate) {
      setChatMessage(messageTemplate);
    }
    setShowChatModal(true);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      onAuthRequired();
      return;
    }
    
    try {
      // First, get or create a conversation with the seller
      const conversationResult = await MessagingService.getOrCreateConversation(
        accessToken,
        listing.id,
        seller.id
      );
      
      if (!conversationResult.success || !conversationResult.conversation) {
        toast.error('Failed to start conversation', {
          description: conversationResult.error || 'Please try again'
        });
        return;
      }
      
      // Add message to local state immediately for instant feedback
      const newMessage = {
        id: Date.now().toString(),
        text: chatMessage,
        sender: 'user' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      const messageContent = chatMessage;
      setChatMessage("");
      
      // Send the message to the backend
      const result = await MessagingService.sendMessage(
        accessToken,
        conversationResult.conversation.id,
        messageContent
      );
      
      if (result.success) {
        toast.success('Message sent!', {
          description: 'The seller will be notified.',
          duration: 2000
        });
        // Close modal immediately after successful send
        setShowChatModal(false);
        setChatMessages([]);
      } else {
        toast.error('Failed to send message', {
          description: result.error || 'Please try again'
        });
        // Remove the optimistic message on failure
        setChatMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Check out this ${listing.title}`);
    const body = encodeURIComponent(
      `I found this ${listing.title} for ${listing.price} that might interest you.\n\n` +
      `${listing.description}\n\n` +
      `View it here: ${window.location.href}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareSMS = () => {
    const message = encodeURIComponent(
      `Check out this ${listing.title} for ${listing.price}: ${window.location.href}`
    );
    window.open(`sms:?body=${message}`);
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out this ${listing.title} for ${listing.price}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this ${listing.title} for ${listing.price}`,
        url: window.location.href
      });
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new": return "bg-green-100 text-green-800";
      case "refurbished": return "bg-blue-100 text-blue-800";
      case "used": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionDescription = (condition: string) => {
    switch (condition) {
      case "new": return "Brand new item, never used";
      case "refurbished": return "Professionally restored to working condition";
      case "used": return "Previously owned, shows normal wear";
      default: return "Condition not specified";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Marketplace</span>
          </Button>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleCopyLink}>
                  {copySuccess ? (
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copySuccess ? "Link Copied!" : "Copy Link"}
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShareEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShareSMS}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Share via SMS
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleShareFacebook}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Share on Facebook
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShareTwitter}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Share on Twitter
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {navigator.share && (
                  <DropdownMenuItem onClick={handleNativeShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    More Options...
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Listing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowReportModal(true)}
            >
              <Flag className="h-4 w-4 mr-1" />
              Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-square md:aspect-[4/3] bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-contain bg-white cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => handleOpenGallery(currentImageIndex)}
                    />
                    {listing.images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                          onClick={handlePreviousImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                          onClick={handleNextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  {listing.images.length > 1 && (
                    <div className="flex space-x-2 p-4 overflow-x-auto">
                      {listing.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleOpenGallery(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all hover:opacity-80 ${
                            index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${listing.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Listing Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {listing.postedDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{listing.views || 0} views</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge className={getConditionColor(listing.condition)}>
                        {listing.condition}
                      </Badge>
                      <Badge variant="secondary">{listing.category}</Badge>
                      {listing.isPromoted && (
                        <Badge className="bg-orange-100 text-orange-800">
                          ✨ Promoted
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleFavorite}
                    className={`${isFavorited ? 'text-red-500 border-red-500' : ''} ${currentUser?.id === seller.id ? 'hidden' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Price */}
                  <div>
                    <span className="text-3xl font-bold text-green-600">${listing.price}</span>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{listing.description}</p>
                  </div>

                  {/* Item Details */}
                  <div>
                    <h3 className="font-semibold mb-3">Item Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Condition</span>
                        <p className="font-medium">{listing.condition}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Category</span>
                        <p className="font-medium">{listing.category}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Location</span>
                        <p className="font-medium">{listing.location}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Posted</span>
                        <p className="font-medium">{listing.postedDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping & Returns */}

                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            {!isOwnListing && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button onClick={() => handleMessage()} className="w-full" size="lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Seller
                    </Button>
                    <Button variant="outline" onClick={handleFavorite} className="w-full">
                      <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                      {isFavorited ? 'Saved' : 'Save Item'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seller Information - Only show for other users' listings */}
            {!isOwnListing && (
              <Card>
                <CardHeader>
                  <CardTitle>Seller Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={seller.avatar} />
                      <AvatarFallback>
                        {seller.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{seller.name}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <StarRating rating={seller.rating} size="sm" showValue={true} />
                        <span className="text-gray-500">• {seller.reviewCount || 0} review{seller.reviewCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member since</span>
                      <span>{seller.joinedDate ? new Date(seller.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        if (!isLoggedIn) {
                          onAuthRequired();
                          return;
                        }
                        onViewProfile(seller.id);
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Profile & Reviews
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => onViewSellerListings(seller.id)}
                    >
                      View All Listings
                    </Button>
                    {showContactInfo && (
                      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4" />
                          <span>(555) 123-4567</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4" />
                          <span>seller@email.com</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safety Tips - Only show for other users' listings */}
            {!isOwnListing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Safety Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>• Meet in a public place for transactions</p>
                  <p>• Inspect item before payment</p>
                  <p>• Use secure payment methods</p>
                  <p>• Trust your instincts</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Read full safety guide
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 md:w-96 p-0" align="start">
                      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
                          <div className="flex items-center space-x-2">
                            <ShieldCheck className="h-5 w-5" />
                            <h3 className="font-semibold">Marketplace Safety Guide</h3>
                          </div>
                          <p className="text-blue-100 text-sm mt-1">
                            Stay safe while buying and selling automotive keys
                          </p>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                          {/* Meeting Safety */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-gray-900">Meeting Safely</h4>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>Meet in public places like shopping centers or police stations</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>Bring a friend or family member when possible</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>Meet during daylight hours in well-lit areas</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>Never meet at your home or invite strangers over</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Payment Safety */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <CreditCardIcon className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-gray-900">Payment Protection</h4>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>Use secure payment methods like PayPal or escrow services</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>Cash transactions should be done in person only</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>Never wire money or use gift cards as payment</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>Avoid deals that seem too good to be true</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Product Verification */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Zap className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-gray-900">Key Verification</h4>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>Test the key before completing the purchase</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>Verify compatibility with your specific vehicle</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>Check for authentic OEM markings and part numbers</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>Be wary of keys without proper documentation</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Red Flags */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Flag className="h-4 w-4 text-red-600" />
                              <h4 className="font-medium text-gray-900">Red Flags to Watch</h4>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>Seller refuses to meet in person or provide photos</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>Pressure to buy immediately or make quick decisions</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>Poor grammar, spelling, or communication issues</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>Requesting personal information like SSN or bank details</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Report Issues */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Shield className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-gray-900">Report Suspicious Activity</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              If you encounter suspicious behavior or fraudulent listings, use our report feature to help keep the community safe.
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => onReport(listing)}
                            >
                              <Flag className="h-3 w-3 mr-1" />
                              Report an Issue
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Similar Listings */}
        {similarListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">Similar Listings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarListings.slice(0, 4).map((item) => {
                const isExpanded = expandedListings.includes(item.id);
                
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Regular marketplace card content */}
                    <div className="relative aspect-square cursor-pointer" onClick={() => onViewListing(item)}>
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.isPromoted && (
                        <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                          Promoted
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFavorite(item.id);
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-semibold text-green-600">
                          ${item.price.toFixed(2)}
                        </span>
                        <Badge className={getConditionColor(item.condition)}>
                          {item.condition}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="font-medium text-gray-900 line-clamp-2 leading-tight">
                        {item.title}
                      </h3>

                      {/* Expandable content */}
                      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'} overflow-hidden`}>
                        <div className="space-y-3 pt-3 border-t">
                          {/* Description */}
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {item.description}
                          </p>
                          
                          {/* Seller info */}
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={item.seller.avatar} />
                              <AvatarFallback className="text-xs">
                                {item.seller.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.seller.name}</p>
                              <div className="flex items-center text-xs text-gray-500">
                                <Star className="h-3 w-3 fill-current text-yellow-500 mr-1" />
                                <span>{item.seller.rating}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMessage(item.seller.id);
                              }}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Message
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewListing(item)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Location and Date */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {item.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {item.postedDate}
                        </div>
                      </div>

                      {/* Expand/Collapse button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedListings(prev => prev.filter(id => id !== item.id));
                          } else {
                            setExpandedListings(prev => [...prev, item.id]);
                          }
                        }}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronLeft className="h-4 w-4 mr-1 rotate-90" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-4 w-4 mr-1 rotate-90" />
                            Show More
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-md mx-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={seller.avatar} />
                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{seller.name}</div>
                <div className="text-sm text-gray-500">Message about: {listing.title}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {/* Message Input */}
          <div className="flex space-x-2">
            <Textarea
              placeholder="Type your message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 min-h-[80px] resize-none"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!chatMessage.trim()}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modern Full-Screen Image Gallery Modal */}
      {showImageGallery && (
        <div 
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onClick={() => setShowImageGallery(false)}
          onKeyDown={handleKeyPress}
          tabIndex={-1}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageGallery(false)}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm transition-all duration-200"
          >
            <X className="h-12 w-12" />
          </Button>

          {/* Image Counter */}
          {listing.images.length > 1 && (
            <div className="absolute top-4 left-4 z-50 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {currentImageIndex + 1} of {listing.images.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {listing.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousImage();
                }}
                className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/40 backdrop-blur-sm transition-all duration-200"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/40 backdrop-blur-sm transition-all duration-200"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            </>
          )}

          {/* Main Image Container with Drag Support */}
          <div 
            ref={galleryRef}
            className="relative flex items-center justify-center p-8"
            style={{ 
              transform: isDragging ? `translateY(${dragOffset}px)` : 'translateY(0)',
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              touchAction: imageZoom > 1 ? 'none' : 'auto'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={currentImageIndex}
              src={listing.images[currentImageIndex]}
              alt={`${listing.title} - Image ${currentImageIndex + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl transition-all duration-200"
              style={{
                filter: isDragging ? 'brightness(0.8)' : 'brightness(1)',
                opacity: modalOpacity,
                transform: `scale(${imageZoom}) translate(${imagePan.x / imageZoom}px, ${imagePan.y / imageZoom}px)`,
                cursor: imageZoom > 1 ? 'grab' : 'pointer'
              }}
              onClick={handleDoubleTap}
            />
          </div>

          {/* Bottom Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full text-center">
              <div className="md:hidden">
                {listing.images.length > 1 ? 'Swipe to navigate • Swipe down to close' : 'Swipe down to close'}
              </div>
              <div className="hidden md:block">
                {listing.images.length > 1 ? 'Use arrow keys to navigate • Click outside to close' : 'Click outside to close'}
              </div>
            </div>
            
            {/* Dot Indicators for Desktop */}
            {listing.images.length > 1 && (
              <div className="hidden md:flex items-center justify-center space-x-2 mt-3">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="listing"
        contentId={listing.id}
        contentTitle={listing.title}
        onAuthRequired={onAuthRequired}
      />
    </div>
  );
}