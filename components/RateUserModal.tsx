import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { StarRating } from "./StarRating";
import { InteractiveStarRating } from "./InteractiveStarRating";
import { Badge } from "./ui/badge";

interface RateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating: (ratingData: {
    userId: string;
    rating: number;
    review: string;
    categories: {
      communication: number;
      reliability: number;
      productQuality: number;
      shipping: number;
    };
  }) => void;
  user: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalReviews: number;
  };
  listingTitle?: string;
}

export function RateUserModal({ 
  isOpen, 
  onClose, 
  onSubmitRating, 
  user,
  listingTitle 
}: RateUserModalProps) {
  const [overallRating, setOverallRating] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [reliability, setReliability] = useState(5);
  const [productQuality, setProductQuality] = useState(5);
  const [shipping, setShipping] = useState(5);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      alert("Please provide an overall rating");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmitRating({
        userId: user.id,
        rating: overallRating,
        review: review.trim(),
        categories: {
          communication,
          reliability,
          productQuality,
          shipping
        }
      });
      
      // Reset form
      setOverallRating(5);
      setCommunication(5);
      setReliability(5);
      setProductQuality(5);
      setShipping(5);
      setReview("");
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{user.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <StarRating rating={user.rating} size="sm" />
                <span className="text-sm text-gray-500">
                  ({user.totalReviews} reviews)
                </span>
              </div>
              {listingTitle && (
                <p className="text-sm text-gray-600 mt-1">
                  Re: {listingTitle}
                </p>
              )}
            </div>
          </div>

          {/* Overall Rating */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-900">
              Overall Rating *
            </label>
            <div className="flex items-center space-x-3">
              <InteractiveStarRating
                rating={overallRating}
                onRatingChange={setOverallRating}
                size="lg"
              />
              <span className="text-sm text-gray-600">
                {overallRating === 1 && "Poor"}
                {overallRating === 2 && "Fair"}
                {overallRating === 3 && "Good"}
                {overallRating === 4 && "Very Good"}
                {overallRating === 5 && "Excellent"}
              </span>
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Rate by Category</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Communication</span>
                <InteractiveStarRating
                  rating={communication}
                  onRatingChange={setCommunication}
                  size="md"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Reliability</span>
                <InteractiveStarRating
                  rating={reliability}
                  onRatingChange={setReliability}
                  size="md"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Product Quality</span>
                <InteractiveStarRating
                  rating={productQuality}
                  onRatingChange={setProductQuality}
                  size="md"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Shipping Speed</span>
                <InteractiveStarRating
                  rating={shipping}
                  onRatingChange={setShipping}
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Written Review */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-900">
              Written Review (Optional)
            </label>
            <Textarea
              placeholder="Share details about your experience..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Help others by sharing specific details
              </span>
              <span className="text-xs text-gray-400">
                {review.length}/500
              </span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || overallRating === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}