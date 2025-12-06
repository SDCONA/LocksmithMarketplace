import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showValue = false,
  className = "" 
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const stars = [];
  
  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.floor(rating);
    const isPartial = i === Math.ceil(rating) && rating % 1 !== 0;
    
    stars.push(
      <div key={i} className="relative">
        <Star 
          className={`${sizeClasses[size]} text-gray-300`}
          fill="currentColor"
        />
        {(isFilled || isPartial) && (
          <Star 
            className={`${sizeClasses[size]} text-yellow-400 absolute top-0 left-0`}
            fill="currentColor"
            style={{
              clipPath: isPartial 
                ? `inset(0 ${100 - (rating % 1) * 100}% 0 0)`
                : undefined
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {stars}
      </div>
      {showValue && (
        <span className={`font-medium text-gray-900 ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}