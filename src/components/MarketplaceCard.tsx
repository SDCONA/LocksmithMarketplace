import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { StarRating } from "./StarRating";
import { MapPin, MessageCircle, Heart, Clock, ChevronLeft, ChevronRight, TrendingUp, MoreVertical, Edit3, Trash2, Eye, Archive, CheckSquare, Square } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  location: string;
  postedDate: string;
  condition: "new" | "used" | "refurbished";
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    responseTime: string;
  };
  category: string;
  isPromoted?: boolean;
  expires_at?: string;
  views?: number;
}

interface MarketplaceCardProps {
  item: MarketplaceItem;
  onMessage: (sellerId: string) => void;
  onFavorite: (itemId: string) => void;
  onViewListing: (item: MarketplaceItem) => void;
  onViewProfile?: (userId: string) => void;
  isLoggedIn: boolean;
  onAuthRequired: () => void;
  currentUser?: { id: string } | null;
  onPromote?: (listingId: string) => void;
  onEditListing?: (item: MarketplaceItem) => void;
  onDeleteListing?: (listingId: string) => void;
  onArchiveListing?: (listingId: string) => void;
  isSaved?: boolean;
  footerAction?: React.ReactNode;
  onSelectListing?: (listingId: string) => void;
  isSelected?: boolean;
}

export function MarketplaceCard({ 
  item, 
  onMessage, 
  onFavorite,
  onViewListing, 
  onViewProfile,
  isLoggedIn, 
  onAuthRequired,
  currentUser,
  onPromote,
  onEditListing,
  onDeleteListing,
  onArchiveListing,
  isSaved = false,
  footerAction,
  onSelectListing,
  isSelected = false
}: MarketplaceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const handleMessage = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    if (item.seller?.id) {
      onMessage(item.seller.id);
    }
  };

  const handleFavorite = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    onFavorite(item.id);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new": return "bg-green-100 text-green-800";
      case "refurbished": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate days remaining until expiration
  const getDaysRemaining = () => {
    if (!item.expires_at) return null;
    const now = new Date();
    const expiresAt = new Date(item.expires_at);
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Selection Checkbox */}
      {onSelectListing && (
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white h-6 w-6 sm:h-8 sm:w-8"
            onClick={(e) => {
              e.stopPropagation();
              onSelectListing(item.id);
            }}
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4 text-blue-600" />
            ) : (
              <Square className="h-4 w-4 text-gray-600" />
            )}
          </Button>
        </div>
      )}
      
      {/* Image */}
      <div className="relative aspect-square" onClick={() => onViewListing(item)}>
        <img
          src={item.images[currentImageIndex]}
          alt={item.title}
          className="w-full h-full object-cover bg-white"
        />
        
        {/* Image navigation for multiple images */}
        {item.images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 h-6 w-6 sm:h-8 sm:w-8 text-white"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 h-6 w-6 sm:h-8 sm:w-8 text-white"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            {/* Image dots indicator */}
            <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {item.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {item.isPromoted && (
          <Badge className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-orange-500 text-white text-xs">
            Promoted
          </Badge>
        )}
        
        {/* Edit/Delete Menu - Only for own listings */}
        {currentUser && item.seller && currentUser.id === item.seller.id && onEditListing && onDeleteListing && (
          <div className="absolute top-1 sm:top-2 right-8 sm:right-10 z-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white h-6 w-6 sm:h-8 sm:w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewListing(item);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditListing(item);
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {onArchiveListing && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveListing(item.id);
                      }}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-1 sm:top-2 right-1 sm:right-2 bg-white/80 hover:bg-white h-6 w-6 sm:h-8 sm:w-8 ${currentUser?.id === item.seller?.id ? 'hidden' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleFavorite();
          }}
        >
          <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3" onClick={() => onViewListing(item)}>
        {/* Title */}
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 leading-tight text-sm sm:text-base">
          {item.title}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl font-semibold text-green-600">
            ${item.price.toFixed(2)}
          </span>
          <Badge className={`${getConditionColor(item.condition)} text-xs`}>
            {item.condition}
          </Badge>
        </div>

        {/* Expiration countdown - only show for own listings */}
        {currentUser && item.seller && currentUser.id === item.seller.id && daysRemaining !== null && (
          <div className={`text-xs flex items-center ${
            daysRemaining <= 1 ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-gray-600'
          }`}>
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>
              {daysRemaining <= 0 
                ? 'Expires today' 
                : daysRemaining === 1 
                ? '1 day left' 
                : `${daysRemaining} days left`
              }
            </span>
          </div>
        )}


      </div>
      {footerAction && (
        <div className="p-2 sm:p-3 md:p-4">
          {footerAction}
        </div>
      )}
    </div>
  );
}