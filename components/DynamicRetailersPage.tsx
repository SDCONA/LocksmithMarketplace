import { useState, useEffect } from "react";
import { PromotionalBlock } from "./PromotionalBlock";
import { AdminService } from "../utils/services";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";

interface Banner {
  id: string;
  name: string;
  link: string;
  pc_image_url: string;
  mobile_image_url: string;
  order: number;
}

interface RetailerPosition {
  id: string;
  positionNumber: number;
  retailerName: string;
  banners: Banner[];
}

interface DynamicRetailersPageProps {
  user: any;
  savedItemsCount: number;
  onNavigateToSaved: () => void;
}

export function DynamicRetailersPage({ user, savedItemsCount, onNavigateToSaved }: DynamicRetailersPageProps) {
  const [positions, setPositions] = useState<RetailerPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchActivePositions();
  }, []);

  const fetchActivePositions = async () => {
    setIsLoading(true);
    const result = await AdminService.getActiveRetailerBanners();
    
    if (result.success && result.positions) {
      setPositions(result.positions);
    } else {
      console.error('Failed to fetch retailer banners:', result.error);
      setPositions([]);
    }
    
    setIsLoading(false);
  };

  // Transform banner to deal format for PromotionalBlock
  const transformBannerToDeal = (banner: Banner) => {
    // Choose correct image based on device
    const imageUrl = isMobile ? banner.mobile_image_url : banner.pc_image_url;
    
    return {
      id: banner.id,
      title: banner.name,
      description: banner.name,
      image: imageUrl,
      link: banner.link,
      originalPrice: "",
      salePrice: "",
      retailerName: ""
    };
  };

  if (isLoading) {
    return (
      <div className="w-full">
        {user && (
          <div className="container mx-auto px-4 flex justify-end mt-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToSaved}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Heart className="h-4 w-4 mr-1" />
              Saved ({savedItemsCount})
            </Button>
          </div>
        )}
        
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Loading skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-[250px]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no positions, show a message
  if (positions.length === 0) {
    return (
      <div className="w-full">
        {user && (
          <div className="container mx-auto px-4 flex justify-end mt-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToSaved}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Heart className="h-4 w-4 mr-1" />
              Saved ({savedItemsCount})
            </Button>
          </div>
        )}
        
        <div className="container mx-auto px-4 py-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Retailers Available</h3>
          <p className="text-gray-600">Check back soon for promotional offers from our retail partners.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Retailers Header */}
      {user && (
        <div className="container mx-auto px-4 flex justify-end mt-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToSaved}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Heart className="h-4 w-4 mr-1" />
            Saved ({savedItemsCount})
          </Button>
        </div>
      )}
      
      <div className="flex flex-col gap-3 md:gap-4">
        {positions.map((position) => {
          // Transform banners to deals format
          const deals = position.banners.map(transformBannerToDeal);
          
          // Determine colors based on position number
          const colorSchemes = [
            { bg: "bg-gradient-to-br from-blue-50 to-blue-100", accent: "bg-blue-600" },
            { bg: "bg-gradient-to-br from-purple-50 to-purple-100", accent: "bg-purple-600" },
            { bg: "bg-gradient-to-br from-green-50 to-green-100", accent: "bg-green-600" },
            { bg: "bg-gradient-to-br from-orange-50 to-orange-100", accent: "bg-orange-600" },
            { bg: "bg-gradient-to-br from-red-50 to-red-100", accent: "bg-red-600" },
            { bg: "bg-gradient-to-br from-pink-50 to-pink-100", accent: "bg-pink-600" },
            { bg: "bg-gradient-to-br from-indigo-50 to-indigo-100", accent: "bg-indigo-600" },
            { bg: "bg-gradient-to-br from-teal-50 to-teal-100", accent: "bg-teal-600" },
          ];
          
          const colorScheme = colorSchemes[(position.positionNumber - 1) % colorSchemes.length];
          
          // Use first banner's link as retailer website (fallback)
          const retailerWebsite = position.banners[0]?.link || "#";
          
          return (
            <PromotionalBlock
              key={position.id}
              retailerName={position.retailerName}
              retailerWebsite={retailerWebsite}
              deals={deals}
              backgroundColor={colorScheme.bg}
              accentColor={colorScheme.accent}
            />
          );
        })}
      </div>
    </div>
  );
}
