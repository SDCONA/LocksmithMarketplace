import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface KeyProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  inStock: boolean;
  isPopular?: boolean;
  onAddToCart?: (productId: string) => void;
}

export function KeyProductCard({ 
  id,
  name, 
  description, 
  price, 
  originalPrice,
  rating,
  reviewCount,
  image,
  inStock,
  isPopular,
  onAddToCart 
}: KeyProductCardProps) {


  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 relative">
      {isPopular && (
        <Badge className="absolute top-2 left-2 z-10 bg-red-600 text-white">
          Popular
        </Badge>
      )}

      
      <CardContent className="p-4">
        <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
          <ImageWithFallback 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-sm">{name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg text-red-600">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <Button 
            onClick={() => onAddToCart?.(id)}
            disabled={!inStock}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}