import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star, ExternalLink, MapPin, Heart, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { StarRating } from "./StarRating";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "./ui/dialog";
import { useState } from "react";

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
  dealData?: any; // Full deal data if this is from database
}

interface SearchResultCardProps {
  result: SearchResult;
  onSaveItem?: (item: SearchResult) => void;
  isSaved?: boolean;
  isLoggedIn?: boolean;
  onAuthRequired?: () => void;
  onViewProduct?: (result: SearchResult) => void;
}

export function SearchResultCard({ 
  result, 
  onSaveItem, 
  isSaved = false, 
  isLoggedIn = false, 
  onAuthRequired,
  onViewProduct
}: SearchResultCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
    lastUpdated,
    dealData
  } = result;


  const handleViewProduct = () => {
    if (onViewProduct) {
      onViewProduct(result);
    } else {
      window.open(productUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveItem = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent modal from opening when clicking save
    if (!isLoggedIn && onAuthRequired) {
      onAuthRequired();
      return;
    }
    if (onSaveItem) {
      onSaveItem(result);
    }
  };

  const handleCardClick = () => {
    // If this is a database deal, use the onViewProduct handler to open DealModal
    if (dealData && onViewProduct) {
      onViewProduct(result);
    } else {
      // Otherwise, open the generic product modal
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Card 
        className="w-full hover:shadow-lg transition-shadow duration-200 relative cursor-pointer"
        onClick={handleCardClick}
      >
        {/* eBay Badge */}
        {retailer.name === 'eBay' && (
          <Badge className="absolute top-2 left-2 z-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs">
            eBay
          </Badge>
        )}
        
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl pr-8">{name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback 
                src={image} 
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-bold ${inStock ? 'text-green-600' : 'text-gray-500'}`}>
                    ${price.toFixed(2)}
                  </span>
                  {originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {!inStock && (
                  <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
                )}
                {inStock && (
                  <Badge variant="default" className="bg-green-600 text-sm">In Stock</Badge>
                )}
              </div>

              {/* Rating */}
              {rating && reviewCount && (
                <div className="flex items-center space-x-2">
                  <StarRating rating={rating} size="md" />
                  <span className="text-base text-muted-foreground">({reviewCount} reviews)</span>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{description}</p>
              </div>

              {/* Shipping */}
              {shipping && (
                <div>
                  <h4 className="font-semibold mb-1">Shipping</h4>
                  <p className="text-blue-600">{shipping}</p>
                </div>
              )}

              {/* Retailer */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Retailer</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-medium text-blue-600">{retailer.name}</span>
                  </div>
                  {retailer.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{retailer.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button 
                  onClick={handleViewProduct}
                  disabled={!inStock}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  {inStock ? 'View Product' : 'Out of Stock'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSaveItem}
                  className="w-full"
                  size="lg"
                >
                  <Heart className={`h-5 w-5 mr-2 ${isSaved ? 'text-red-500 fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Item'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}