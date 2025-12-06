import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { StarRating } from "./StarRating";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ChevronDown, ChevronUp, MoreVertical, Flag, AlertTriangle, UserX, Shield, Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  id: string;
  reviewerId: string;
  reviewer: {
    first_name: string;
    last_name: string;
  };
  reviewerAvatar: string;
  rating: number;
  review: string;
  categories: {
    communication: number;
    reliability: number;
    productQuality: number;
    shipping: number;
  };
  listingTitle?: string;
  date: string;
  isVerifiedPurchase: boolean;
}

interface UserReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  categoryAverages: {
    communication: number;
    reliability: number;
    productQuality: number;
    shipping: number;
  };
  currentUserId?: string;
  onEditReview?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
}

export function UserReviewsSection({ 
  reviews, 
  averageRating, 
  totalReviews, 
  categoryAverages,
  currentUserId,
  onEditReview,
  onDeleteReview
}: UserReviewsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const reviewsPerPage = 5;

  const handleDropdownToggle = (reviewId: string, isOpen: boolean) => {
    // Force close any other dropdowns first
    if (isOpen) {
      setOpenDropdownId(reviewId);
    } else {
      setOpenDropdownId(null);
    }
  };

  const handleMenuItemClick = (reviewId: string, reportType: string, reviewerName: string) => {
    // Close dropdown first
    setOpenDropdownId(null);
    // Small delay to ensure dropdown closes before showing alert
    setTimeout(() => {
      handleReportReview(reviewId, reportType, reviewerName);
    }, 100);
  };

  const handleReportReview = (reviewId: string, reportType: string, reviewerName: string) => {
    // In real app, submit report to backend
    console.log("Review reported:", { reviewId, reportType, reviewerName });
    
    // Show confirmation message based on report type
    const reportTypeNames = {
      "inappropriate-content": "Inappropriate Content",
      "spam-fake": "Spam or Fake Review",
      "harassment": "Harassment or Abusive Language",
      "false-information": "False Information",
      "other": "Other Violation"
    };
    
    const reportTypeName = reportTypeNames[reportType as keyof typeof reportTypeNames] || "Unknown";
    alert(`Thank you for reporting this review by ${reviewerName} for: ${reportTypeName}. We'll review your report and take appropriate action if necessary.`);
  };

  // Check if review is within 15-day edit window
  const isReviewEditable = (reviewDate: string): boolean => {
    const reviewTime = new Date(reviewDate).getTime();
    const currentTime = new Date().getTime();
    const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
    return (currentTime - reviewTime) <= fifteenDaysInMs;
  };

  // Sort all reviews first, then paginate
  const sortedAllReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const displayedReviews = sortedAllReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => Math.floor(r.rating) === rating).length,
    percentage: (reviews.filter(r => Math.floor(r.rating) === rating).length / totalReviews) * 100
  }));

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Customer Reviews</h3>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={averageRating} size="md" />
                <div className="text-sm text-gray-500 mt-1">
                  Based on {totalReviews} reviews
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 w-6">
                  {rating}★
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Reviews</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewerAvatar} />
                    <AvatarFallback>
                      {review.reviewer.first_name && review.reviewer.last_name ? `${review.reviewer.first_name[0]}${review.reviewer.last_name[0]}` : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{review.reviewer.first_name && review.reviewer.last_name ? `${review.reviewer.first_name} ${review.reviewer.last_name}` : 'Unknown User'}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm text-gray-500">{review.date}</span>
                          {review.isVerifiedPurchase && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu 
                        open={openDropdownId === review.id} 
                        onOpenChange={(open) => handleDropdownToggle(review.id, open)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 text-gray-400 hover:text-gray-600 active:bg-gray-100 touch-manipulation select-none"
                            onTouchStart={(e) => {
                              // Prevent default touch behavior that might interfere
                              e.preventDefault();
                            }}
                            onTouchEnd={(e) => {
                              // Prevent default and handle touch properly
                              e.preventDefault();
                              e.stopPropagation();
                              // Toggle dropdown state manually for mobile
                              const isCurrentlyOpen = openDropdownId === review.id;
                              handleDropdownToggle(review.id, !isCurrentlyOpen);
                            }}
                            onClick={(e) => {
                              // Prevent click if this was a touch event
                              if (e.detail === 0) {
                                // This is a programmatic click, likely from touch
                                return;
                              }
                              // Handle normal mouse clicks
                              const isCurrentlyOpen = openDropdownId === review.id;
                              handleDropdownToggle(review.id, !isCurrentlyOpen);
                            }}
                          >
                            <MoreVertical className="h-4 w-4 pointer-events-none" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 touch-manipulation">
                          <DropdownMenuItem 
                            onClick={() => handleMenuItemClick(review.id, "inappropriate-content", review.reviewer.first_name && review.reviewer.last_name ? `${review.reviewer.first_name} ${review.reviewer.last_name}` : 'Unknown User')}
                            className="touch-manipulation cursor-pointer"
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Inappropriate Content
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMenuItemClick(review.id, "spam-fake", review.reviewer.first_name && review.reviewer.last_name ? `${review.reviewer.first_name} ${review.reviewer.last_name}` : 'Unknown User')}
                            className="touch-manipulation cursor-pointer"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Spam or Fake Review
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMenuItemClick(review.id, "harassment", review.reviewer.first_name && review.reviewer.last_name ? `${review.reviewer.first_name} ${review.reviewer.last_name}` : 'Unknown User')}
                            className="touch-manipulation cursor-pointer"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Harassment
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMenuItemClick(review.id, "false-information", review.reviewer.first_name && review.reviewer.last_name ? `${review.reviewer.first_name} ${review.reviewer.last_name}` : 'Unknown User')}
                            className="touch-manipulation cursor-pointer"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            False Information
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleMenuItemClick(review.id, "other", review.reviewer.first_name && review.reviewer.last_name ? `${review.reviewer.first_name} ${review.reviewer.last_name}` : 'Unknown User')}
                            className="touch-manipulation cursor-pointer"
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Other Violation
                          </DropdownMenuItem>
                          {currentUserId === review.reviewerId && isReviewEditable(review.date) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onEditReview?.(review.id)}
                                className="touch-manipulation cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Review
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDeleteReview?.(review.id)}
                                className="touch-manipulation cursor-pointer"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Review
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {review.listingTitle && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Purchase: </span>
                        {review.listingTitle}
                      </div>
                    )}

                    {review.review && (
                      <p className="text-gray-700 leading-relaxed">
                        {review.review}
                      </p>
                    )}

                    {/* Category Ratings */}
                    {review.categories && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {review.categories.communication}★
                          </div>
                          <div className="text-xs text-gray-500">Communication</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {review.categories.reliability}★
                          </div>
                          <div className="text-xs text-gray-500">Reliability</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {review.categories.productQuality}★
                          </div>
                          <div className="text-xs text-gray-500">Quality</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {review.categories.shipping}★
                          </div>
                          <div className="text-xs text-gray-500">Shipping</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Show first page, last page, current page, and pages around current
                  const showPage = page === 1 || 
                                   page === totalPages || 
                                   Math.abs(page - currentPage) <= 1;
                  
                  // Show ellipsis
                  const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                  const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }

                  if (!showPage) return null;

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to leave a review!
        </div>
      )}
    </div>
  );
}