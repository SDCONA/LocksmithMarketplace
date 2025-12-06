import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Star, Check } from "lucide-react";

interface InlineReviewCardProps {
  userName: string;
  userAvatar: string;
  onSubmit: (rating: number, comment: string) => void;
  hasAlreadyReviewed: boolean;
  isSubmitting?: boolean;
}

export function InlineReviewCard({ 
  userName, 
  userAvatar, 
  onSubmit, 
  hasAlreadyReviewed,
  isSubmitting = false 
}: InlineReviewCardProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment);
  };

  if (hasAlreadyReviewed) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 max-w-md w-full shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Review submitted
              </p>
              <p className="text-xs text-green-700">
                Thank you for rating {userName}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 border-2 border-yellow-300 rounded-xl p-4 max-w-md w-full shadow-md">
        <div className="flex items-start space-x-3">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-yellow-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-700 font-semibold text-sm flex-shrink-0 border-2 border-yellow-300">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">
                Rate {userName}
              </p>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setIsExpanded(true);
                    }}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {isExpanded && rating > 0 && (
              <div className="space-y-2 mt-3">
                <Textarea
                  placeholder="Share your experience (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-xs min-h-[60px] bg-white/80 border-yellow-200 focus:border-yellow-400"
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {comment.length}/500
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
