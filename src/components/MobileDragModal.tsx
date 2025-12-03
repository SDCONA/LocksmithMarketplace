import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { useMobileDrag } from './hooks/useMobileDrag';

interface MobileDragModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showDragHandle?: boolean;
  title?: string;
  description?: string;
}

export function MobileDragModal({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  showDragHandle = true,
  title = "Modal",
  description
}: MobileDragModalProps) {
  const { modalRef, getModalStyle, getDragHandleStyle } = useMobileDrag({ 
    onClose,
    dismissThreshold: 150,
    velocityThreshold: 0.5
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={modalRef}
        className={`${className} relative`}
        style={getModalStyle()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Accessibility components - hidden from visual users */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {description && <DialogDescription className="sr-only">{description}</DialogDescription>}
        
        {/* Drag Handle - Only visible on mobile when dragging */}
        {showDragHandle && (
          <div 
            className="md:hidden absolute -top-6 left-1/2 transform -translate-x-1/2 pointer-events-none"
            style={getDragHandleStyle()}
          >
            <div className="w-12 h-1 bg-white/80 rounded-full shadow-lg backdrop-blur-sm" />
            <div className="text-white/60 text-xs text-center mt-1 font-medium">
              Drag to close
            </div>
          </div>
        )}
        
        {/* Modal Content */}
        {children}
      </DialogContent>
    </Dialog>
  );
}