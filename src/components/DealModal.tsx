import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { 
  Heart, ExternalLink, Clock, Store, X, Flag, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import { AuthService } from "../utils/auth";
import { ReportService } from "../utils/services/reports";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

export interface DealModalData {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  external_url: string;
  expires_at: string;
  retailer_profile: {
    id: string;
    company_name: string;
    logo_url: string | null;
    is_always_on_top: boolean;
  };
  deal_type: {
    id: string;
    name: string;
    color: string;
  } | null;
  images: Array<{
    id: string;
    image_url: string;
    display_order: number;
  }>;
  is_saved?: boolean;
  source?: string;
  sourceType?: string;
  currency?: string;
  condition?: string;
  sellerName?: string;
  shippingCost?: number;
}

interface DealModalProps {
  deal: DealModalData;
  isSaved: boolean;
  onSave: (dealId: string) => void;
  onClose: () => void;
  formatTimeRemaining: (expiresAt: string) => string;
  calculateDiscount: (price: number, originalPrice: number) => number;
  isLoggedIn: boolean;
}

export function DealModal({ 
  deal, 
  isSaved, 
  onSave, 
  onClose, 
  formatTimeRemaining, 
  calculateDiscount, 
  isLoggedIn 
}: DealModalProps) {
  const hasImages = deal.images && deal.images.length > 0;
  const hasMultipleImages = deal.images && deal.images.length > 1;
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  // Fullscreen image viewer state
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);

  const openFullscreenImage = (index: number) => {
    setCurrentImageIndex(index);
    setShowFullscreenImage(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeFullscreenImage = () => {
    setShowFullscreenImage(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (deal.images && currentImageIndex < deal.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Calculate distance between two touch points
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
      setInitialScale(scale);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      const newScale = (distance / initialDistance) * initialScale;
      // Limit scale between 1x and 5x
      setScale(Math.min(Math.max(newScale, 1), 5));
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan when zoomed in
      e.preventDefault();
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 100 * (scale - 1);
      const y = ((touch.clientY - rect.top) / rect.height - 0.5) * 100 * (scale - 1);
      setPosition({ x: -x, y: -y });
    }
  };

  const handleTouchEnd = () => {
    setInitialDistance(0);
  };

  // Double tap to zoom
  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleReport = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to report deals");
      return;
    }

    if (!reportReason.trim()) {
      toast.error("Please select a reason");
      return;
    }

    setIsSubmittingReport(true);
    try {
      const token = await AuthService.getFreshToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const result = await ReportService.createReport(token, {
        contentType: 'deal',
        contentId: deal.id,
        reason: reportReason,
        description: reportDescription || undefined,
      });

      if (result.success) {
        toast.success("Report submitted successfully");
        setShowReportDialog(false);
        setReportReason('');
        setReportDescription('');
      } else {
        toast.error(result.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-24 md:pb-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-red-500 rounded-full transition-colors z-10 shadow-lg border border-gray-200 hover:border-red-500 group"
          >
            <X className="h-6 w-6 text-gray-700 group-hover:text-white transition-colors" />
          </button>

          {/* Image Section */}
          {hasImages && (
            <div className="relative mb-6">
              {hasMultipleImages ? (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {deal.images.map((image, index) => (
                    <div key={image.id} className="relative flex-shrink-0 w-full bg-gray-100 rounded-lg aspect-video snap-center">
                      <img
                        src={image.image_url}
                        alt={`${deal.title} - Image ${index + 1}`}
                        className="w-full h-full object-contain rounded-lg cursor-pointer"
                        onClick={() => openFullscreenImage(index)}
                      />
                      {index === 0 && deal.original_price && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
                          <span className="font-bold text-lg">
                            {calculateDiscount(deal.price, deal.original_price)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative bg-gray-100 rounded-lg aspect-video">
                  <img
                    src={deal.images[0].image_url}
                    alt={deal.title}
                    className="w-full h-full object-contain rounded-lg cursor-pointer"
                    onClick={() => openFullscreenImage(0)}
                  />
                  {deal.original_price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full shadow-lg">
                      <span className="font-bold">
                        {calculateDiscount(deal.price, deal.original_price)}% OFF
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Retailer Info */}
          <div className="flex items-center gap-3 mb-4">
            {deal.retailer_profile.logo_url ? (
              <img
                src={deal.retailer_profile.logo_url}
                alt={deal.retailer_profile.company_name}
                className="w-10 h-10 rounded object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{deal.retailer_profile.company_name}</p>
              {deal.retailer_profile.is_always_on_top && (
                <Badge variant="secondary" className="text-xs">
                  Featured Retailer
                </Badge>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold mb-3">{deal.title}</h3>

          {/* Description */}
          {deal.description && (
            <p className="text-gray-700 mb-4 leading-relaxed">
              {deal.description}
            </p>
          )}

          {/* Deal Type */}
          {deal.deal_type && (
            <Badge
              variant="outline"
              className="mb-4"
              style={{
                borderColor: deal.deal_type.color,
                color: deal.deal_type.color,
              }}
            >
              {deal.deal_type.name}
            </Badge>
          )}

          {/* Price Section */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-bold text-green-600">
              ${deal.price.toFixed(2)}
            </span>
            {deal.original_price && (
              <span className="text-2xl text-gray-400 line-through">
                ${deal.original_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-2 text-orange-600 mb-6">
            <Clock className="h-5 w-5" />
            <span className="font-medium text-lg">{formatTimeRemaining(deal.expires_at)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <a
              href={deal.external_url?.startsWith('http') ? deal.external_url : `https://${deal.external_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full" size="lg">
                View Deal
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onSave(deal.id)}
              className={isSaved ? "border-red-500 text-red-500" : ""}
            >
              {isSaved ? (
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              ) : (
                <Heart className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Report Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReportDialog(true)}
            className="w-full text-gray-500 hover:text-red-600"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report this deal
          </Button>

          {/* Report Dialog */}
          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Deal</DialogTitle>
                <DialogDescription>
                  Help us keep the marketplace safe by reporting inappropriate content
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Reason for reporting *</Label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full mt-2 p-2 border rounded-lg"
                  >
                    <option value="">Select a reason</option>
                    <option value="Misleading Information">Misleading Information</option>
                    <option value="Expired Deal">Expired Deal</option>
                    <option value="Incorrect Price">Incorrect Price</option>
                    <option value="Spam">Spam</option>
                    <option value="Inappropriate Content">Inappropriate Content</option>
                    <option value="Scam or Fraud">Scam or Fraud</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <Label>Additional details (optional)</Label>
                  <Textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide more information about why you're reporting this deal..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReportDialog(false);
                    setReportReason('');
                    setReportDescription('');
                  }}
                  disabled={isSubmittingReport}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={isSubmittingReport || !reportReason}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmittingReport ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {showFullscreenImage && (
        <div
          className="fixed inset-0 bg-white z-[100] flex items-center justify-center"
          onClick={closeFullscreenImage}
        >
          {/* Close Button */}
          <button
            onClick={closeFullscreenImage}
            className="absolute top-4 right-4 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* Image Counter */}
          {hasMultipleImages && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-100 text-gray-900 rounded-full">
              <span className="font-medium">
                {currentImageIndex + 1} / {deal.images.length}
              </span>
            </div>
          )}

          {/* Main Image */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
          >
            <img
              src={deal.images[currentImageIndex].image_url}
              alt={`${deal.title} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center center',
              }}
            />
          </div>

          {/* Navigation Buttons */}
          {hasMultipleImages && (
            <>
              {/* Previous Button */}
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previousImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-8 w-8 text-gray-700" />
                </button>
              )}

              {/* Next Button */}
              {currentImageIndex < deal.images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <ChevronRight className="h-8 w-8 text-gray-700" />
                </button>
              )}

              {/* Thumbnail Strip */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 pb-2">
                {deal.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-gray-700 scale-110'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}