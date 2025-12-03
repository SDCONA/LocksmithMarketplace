import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star, ExternalLink, MapPin, Heart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { StarRating } from "./StarRating";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  image: string;
  retailer: {
    name: string;
    website: string;
    logo?: string;
    location?: string;
  };
  inStock: boolean;
  shipping?: string;
  productUrl: string;
  lastUpdated?: string;
}

interface SearchResultCardProps {
  result: SearchResult;
  onSaveItem?: (item: SearchResult) => void;
  isSaved?: boolean;
  isLoggedIn?: boolean;
  onAuthRequired?: () => void;
}

export function SearchResultCard({ 
  result, 
  onSaveItem, 
  isSaved = false, 
  isLoggedIn = false, 
  onAuthRequired 
}: SearchResultCardProps) {
  const {
    id,
    name,
    description,
    price,
    originalPrice,
    rating,
    reviewCount,
    image,
    retailer,
    inStock,
    shipping,
    productUrl,
    lastUpdated
  } = result;


  const handleViewProduct = () => {
    window.open(productUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveItem = () => {
    if (!isLoggedIn && onAuthRequired) {
      onAuthRequired();
      return;
    }
    if (onSaveItem) {
      onSaveItem(result);
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 relative">
      {/* Save Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSaveItem}
        className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-sm rounded-full h-8 w-8 p-0"
      >
        <Heart className={`h-4 w-4 ${isSaved ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
      </Button>
      <CardContent className="p-2 sm:p-3 md:p-4">
        <div className="aspect-square mb-2 sm:mb-3 md:mb-4 bg-gray-100 rounded-lg overflow-hidden">
          <ImageWithFallback 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <h3 className="line-clamp-2 text-sm sm:text-base font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">{description}</p>
          
          {rating && reviewCount && (
            <div className="flex items-center space-x-1">
              <StarRating rating={rating} size="sm" />
              <span className="text-sm text-muted-foreground">({reviewCount})</span>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className={`${inStock ? 'text-lg sm:text-xl text-green-600' : 'text-lg sm:text-xl text-gray-500'} font-semibold`}>
              ${price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm sm:text-base text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {shipping && (
            <p className="text-sm text-blue-600">{shipping}</p>
          )}
          
          {/* Retailer Info */}
          <div className="border-t pt-2 mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">from</span>
                <span className="text-sm sm:text-base font-medium text-blue-600 truncate">{retailer.name}</span>
              </div>
              {retailer.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">{retailer.location}</span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleViewProduct}
              disabled={!inStock}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
              size="sm"
            >
              <ExternalLink className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{inStock ? `View on ${retailer.name}` : "Out of Stock"}</span>
              <span className="sm:hidden">{inStock ? "View" : "Out of Stock"}</span>
            </Button>
          </div>

          {lastUpdated && (
            <p className="text-sm text-muted-foreground text-center mt-1 sm:mt-2">
              Updated {lastUpdated}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}