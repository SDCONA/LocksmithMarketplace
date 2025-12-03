import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink, Pause } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { PromotionService } from '../utils/services';

// Random Banner Slideshow Component for empty promotional blocks
function RandomBannerSlideshow({ retailerName }: { retailerName: string }) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  
  // Array of all available promotional banners using imported variables
  const allPromotionalBanners = [
    xhorseMegaSaleBanner,
    xhorseToolsBanner,
    uhsSmartProBanner,
    uhsLocktoberfestBanner,
    yckgSonataBanner,
    yckgHyundaiKiaBanner,
    keyDirectXT57BBanner,
    keyDirectFordMadnessBanner,
    transponderIslandBanner,
    carTruckRemotesBanner,
    bestKeySupplyPrimeBanner,
    bestKeySupplyMaverickBanner,
    nobleKeySupplyRefurbishingBanner,
    nobleKeySupplyShippingBanner,
    keyInnovationsHalloweenBanner,
    keyInnovationsPrimeDealsBanner,
    locksmithKeylessNewMonthBanner,
    locksmithKeylessNewWeekBanner
  ];
  
  // Auto-rotate banners every 2 seconds (only if not paused)
  useEffect(() => {
    if (autoScrollPaused) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % allPromotionalBanners.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [allPromotionalBanners.length, autoScrollPaused]);
  
  // Manual navigation functions
  const nextBanner = () => {
    setAutoScrollPaused(true);
    setCurrentBannerIndex((prev) => (prev + 1) % allPromotionalBanners.length);
  };

  const prevBanner = () => {
    setAutoScrollPaused(true);
    setCurrentBannerIndex((prev) => (prev - 1 + allPromotionalBanners.length) % allPromotionalBanners.length);
  };
  
  const currentBanner = allPromotionalBanners[currentBannerIndex];
  
  return (
    <div className="relative w-full aspect-[3/2] md:aspect-[970/250] mb-2 md:rounded-lg overflow-hidden bg-gray-100">
      <LazyImage
        key={currentBannerIndex}
        src={currentBanner}
        alt={`${retailerName} promotional banner ${currentBannerIndex + 1}`}
        className="w-full h-full object-contain"
      />
      
      {/* Navigation arrows */}
      <button
        onClick={prevBanner}
        className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full transition-colors z-20 shadow-md"
      >
        <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full transition-colors z-20 shadow-md"
      >
        <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>
      
      {/* Overlay with retailer info */}
      <div className="absolute bottom-2 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
        Featured Retailer Promotions ({currentBannerIndex + 1}/{allPromotionalBanners.length})
      </div>
      
      {/* Navigation dots */}
      <div className="absolute bottom-2 right-3 flex space-x-1">
        {allPromotionalBanners.slice(0, 5).map((_, index) => ( // Show only first 5 dots for space
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              index === (currentBannerIndex % 5) ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

interface DealSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string; // Add link field for redirect
  originalPrice: string;
  salePrice: string;
  retailerName?: string;
}

interface PromotionalBlockProps {
  retailerName: string;
  retailerWebsite: string;
  deals: DealSlide[];
  backgroundColor?: string;
  accentColor?: string;
}

export function PromotionalBlock({ 
  retailerName, 
  retailerWebsite, 
  deals, 
  backgroundColor = "bg-gradient-to-br from-blue-50 to-blue-100",
  accentColor = "bg-blue-600"
}: PromotionalBlockProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Don't render anything if no deals
  if (!deals || deals.length === 0) {
    return (
      <div className={`md:${backgroundColor} md:rounded-xl md:p-4 lg:p-6 w-full bg-transparent p-0 relative overflow-hidden`}>
        {/* Empty state - just show retailer name */}
        <RandomBannerSlideshow retailerName={retailerName} />
      </div>
    );
  }

  // Auto-slide functionality (only if not paused)
  useEffect(() => {
    if (deals.length <= 1 || autoScrollPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % deals.length);
    }, 4000);

    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [deals.length, autoScrollPaused]);

  const nextSlide = () => {
    setAutoScrollPaused(true);
    setCurrentSlide((prev) => (prev + 1) % deals.length);
  };

  const prevSlide = () => {
    setAutoScrollPaused(true);
    setCurrentSlide((prev) => (prev - 1 + deals.length) % deals.length);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]));
    console.error(`❌ Banner failed to load: ${deals[index]?.title}`);
  };

  const handleImageLoad = (index: number) => {
    console.log(`✅ Banner loaded: ${deals[index]?.title}`);
  };

  const currentDeal = deals[currentSlide];

  return (
    <div className={`md:${backgroundColor} md:rounded-xl md:p-4 lg:p-6 w-full bg-transparent p-0 relative overflow-hidden`}>
      {/* Sliding Content */}
      <div 
        className="relative w-full aspect-[3/2] md:aspect-[970/250] mb-2 md:rounded-lg overflow-hidden"
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {deals.map((deal, index) => (
            <div key={deal.id} className="min-w-full h-full relative flex-shrink-0">
              {imageErrors.has(index) ? (
                // Error state
                <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-4">
                    <h3 className="font-semibold text-gray-700 mb-1">{deal.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">Image failed to load</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setImageErrors(prev => {
                          const newErrors = new Set(prev);
                          newErrors.delete(index);
                          return newErrors;
                        });
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                // Clickable banner with link
                <a
                  href={deal.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 w-full h-full block cursor-pointer"
                  onClick={(e) => {
                    if (!deal.link || deal.link === '#') {
                      e.preventDefault();
                    }
                  }}
                >
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-contain"
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    loading="lazy"
                  />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Navigation arrows - only show if there are multiple deals */}
        {deals.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full transition-colors z-20 shadow-md"
            >
              <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full transition-colors z-20 shadow-md"
            >
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </>
        )}

        {/* Retailer name - positioned in left bottom corner with blue background */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-30">
          <div className="bg-blue-600 text-white text-xs sm:text-sm px-2 py-1 rounded shadow-sm font-medium">
            {currentDeal.retailerName || retailerName}
          </div>
        </div>





        {/* Slide indicators - positioned inside the banner, only show if there are multiple deals */}
        {deals.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 z-30">
            {deals.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-200 border border-white/40 ${
                  index === currentSlide ? 'bg-white scale-110 shadow-sm' : 'bg-white/70 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}