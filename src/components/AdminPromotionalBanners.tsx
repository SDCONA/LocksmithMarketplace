import { useState, useEffect } from 'react';
import { PromotionService } from '../utils/services';

interface AdminPromotionalBannersProps {
  className?: string;
}

export function AdminPromotionalBanners({ className = '' }: AdminPromotionalBannersProps) {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean | null>(null); // Start with null to detect first
  const [isPaused, setIsPaused] = useState(false);

  // Auto-detect mobile vs PC and update on window resize
  useEffect(() => {
    const checkDevice = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
    };

    // Initial check
    checkDevice();

    // Listen for window resize
    window.addEventListener('resize', checkDevice);

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    // Only fetch when we know the device type
    if (isMobile !== null) {
      fetchBanners();
    }
  }, [isMobile]); // Refetch when device type changes

  const fetchBanners = async () => {
    setIsLoading(true);
    const result = await PromotionService.getActivePromotionalBanners();
    
    if (result.success && result.banners) {
      // Sort by display_order and only keep the appropriate image URL
      const sortedBanners = result.banners
        .sort((a, b) => a.display_order - b.display_order)
        .map(banner => ({
          ...banner,
          // Only keep the image URL for current device type
          image_url: isMobile ? banner.mobile_image_url : banner.pc_image_url,
          // Remove the unused URLs to prevent preloading
          mobile_image_url: undefined,
          pc_image_url: undefined
        }))
        .filter(banner => banner.image_url); // Filter out banners without the appropriate image
      setBanners(sortedBanners);
      setCurrentIndex(0); // Reset to first banner when refetching
    } else {
      console.error('Failed to fetch promotional banners:', result.error);
    }
    setIsLoading(false);
  };

  // Auto-rotate banners every 5 seconds (only if not paused)
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  const nextBanner = () => {
    setIsPaused(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setIsPaused(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (isLoading) {
    return (
      <div className={`w-full aspect-[3/2] md:aspect-[970/250] bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500">Loading banners...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Don't render anything if no banners
  }

  const currentBanner = banners[currentIndex];
  const imageUrl = currentBanner.image_url;

  return (
    <div className={`relative w-full aspect-[3/2] md:aspect-[970/250] rounded-lg overflow-hidden bg-gray-100 ${className}`}>
      {/* Banner Image */}
      <a
        href={currentBanner.link || '#'}
        target={currentBanner.link ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className="absolute inset-0 w-full h-full block"
        onClick={(e) => {
          if (!currentBanner.link || currentBanner.link === '#') {
            e.preventDefault();
          }
        }}
      >
        <img
          key={`${imageUrl}-${isMobile}`}
          src={imageUrl}
          alt={currentBanner.name}
          className="w-full h-full object-contain"
          loading="eager"
        />
      </a>

      {/* Navigation arrows - only show if there are multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full transition-colors z-20 shadow-md"
            aria-label="Previous banner"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full transition-colors z-20 shadow-md"
            aria-label="Next banner"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Banner name overlay */}
      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-30">
        <div className="bg-blue-600 text-white text-xs sm:text-sm px-2 py-1 rounded shadow-sm font-medium">
          {currentBanner.name}
        </div>
      </div>

      {/* Slide indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex space-x-1 z-30">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}