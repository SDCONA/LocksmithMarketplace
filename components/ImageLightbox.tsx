import { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, isOpen, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(1);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-[95vh] flex items-center justify-center">
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 z-50 flex gap-2">
            <Button
              onClick={handleZoomOut}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              disabled={zoom <= 1}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleZoomIn}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <span className="text-white text-sm bg-black/50 px-3 py-2 rounded-full">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                onClick={goToPrevious}
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                onClick={goToNext}
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image */}
          <div className="overflow-auto max-w-full max-h-full p-8">
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="transition-transform duration-200 object-contain"
              style={{
                transform: `scale(${zoom})`,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
