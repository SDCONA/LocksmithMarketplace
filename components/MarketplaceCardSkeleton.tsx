export function MarketplaceCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-3 space-y-2">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        
        {/* Price skeleton */}
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        
        {/* Location skeleton */}
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        
        {/* Date skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}
