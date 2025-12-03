import { useState } from "react";
import { Star } from "lucide-react";

interface InteractiveStarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InteractiveStarRating({ 
  rating, 
  onRatingChange,
  maxRating = 5, 
  size = "md",
  className = "" 
}: InteractiveStarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const currentRating = hoverRating || rating;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= currentRating;
        
        return (
          <button
            key={i}
            type="button"
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-colors hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            <Star 
              className={`${sizeClasses[size]} transition-colors ${
                isFilled ? "text-yellow-400" : "text-gray-300"
              } hover:text-yellow-400`}
              fill="currentColor"
            />
          </button>
        );
      })}
    </div>
  );
}