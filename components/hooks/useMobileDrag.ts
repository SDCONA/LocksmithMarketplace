import { useState, useRef, useEffect, useCallback } from 'react';

interface UseMobileDragOptions {
  isOpen?: boolean;
  onClose?: () => void;
  dismissThreshold?: number;
  velocityThreshold?: number;
  modalRef?: React.RefObject<HTMLDivElement>;
}

export function useMobileDrag({ 
  isOpen,
  onClose, 
  dismissThreshold = 150, 
  velocityThreshold = 0.5,
  modalRef: externalModalRef
}: UseMobileDragOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  
  const lastTouchY = useRef(0);
  const lastTouchTime = useRef(0);
  const internalModalRef = useRef<HTMLDivElement>(null);
  const modalRef = externalModalRef || internalModalRef;
  const canDrag = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if touch started on a scrollable content area
    const scrollableContent = target.closest('[style*="overflow-y: auto"]') || 
                              target.closest('.overflow-y-auto');
    
    // Check if touch started on header or drag handle (these should always trigger drag)
    const isDragArea = target.closest('[style*="touch-action: none"]') ||
                       target.closest('.absolute');
    
    // Check if touch is on interactive elements (buttons, inputs, textarea)
    const isInteractive = target.closest('button') || 
                         target.closest('input') || 
                         target.closest('textarea') ||
                         target.closest('[role="button"]');
    
    // Don't allow drag from interactive elements
    if (isInteractive) {
      canDrag.current = false;
    }
    // Allow dragging from header/drag handle
    else if (isDragArea && !scrollableContent) {
      canDrag.current = true;
    } 
    // For scrollable areas, only allow drag if at the top AND dragging down
    else if (scrollableContent) {
      const scrollable = scrollableContent as HTMLElement;
      canDrag.current = scrollable.scrollTop === 0;
    } 
    // Allow drag from other areas
    else {
      canDrag.current = true;
    }
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
    lastTouchY.current = touch.clientY;
    lastTouchTime.current = Date.now();
    setVelocity(0);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - startY;
    const deltaTime = Date.now() - lastTouchTime.current;
    const deltaPosition = currentY - lastTouchY.current;
    
    // Check if this is a drag gesture (moved more than threshold)
    const dragThreshold = 10;
    
    // If trying to drag down and we can drag
    if (canDrag.current && deltaY > dragThreshold) {
      if (!isDragging) {
        setIsDragging(true);
      }
      
      // Prevent scrolling when dragging
      e.preventDefault();
      e.stopPropagation();
      
      // Only allow dragging down
      if (deltaY >= 0) {
        setDragY(deltaY);
        
        // Calculate velocity
        if (deltaTime > 0) {
          setVelocity(deltaPosition / deltaTime);
        }
        
        lastTouchY.current = currentY;
        lastTouchTime.current = Date.now();
      }
    }
    // If we can't drag or haven't exceeded threshold, allow normal scrolling
    else if (!canDrag.current || Math.abs(deltaY) < dragThreshold) {
      // Don't prevent default - allow scrolling
      return;
    }
  }, [isDragging, startY]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) {
      canDrag.current = false;
      return;
    }
    
    setIsDragging(false);
    canDrag.current = false;
    
    // Check if should dismiss based on distance or velocity
    const shouldDismiss = 
      dragY > dismissThreshold || 
      (dragY > 50 && velocity > velocityThreshold);
    
    if (shouldDismiss && onClose) {
      onClose();
    } else {
      // Spring back to original position
      setDragY(0);
    }
  }, [isDragging, dragY, velocity, dismissThreshold, velocityThreshold, onClose]);

  // Add event listeners
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Use passive: false to allow preventDefault
    const options = { passive: false };
    
    modal.addEventListener('touchstart', handleTouchStart, options);
    modal.addEventListener('touchmove', handleTouchMove, options);
    modal.addEventListener('touchend', handleTouchEnd, options);
    modal.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      modal.removeEventListener('touchstart', handleTouchStart);
      modal.removeEventListener('touchmove', handleTouchMove);
      modal.removeEventListener('touchend', handleTouchEnd);
      modal.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Reset drag state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  const getModalStyle = () => ({
    transform: `translateY(${dragY}px)`,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: Math.max(0.3, 1 - (dragY / (dismissThreshold * 2)))
  });

  const getDragHandleStyle = () => ({
    opacity: dragY > 10 ? Math.min(1, dragY / 50) : 0,
    transition: 'opacity 0.2s ease-out'
  });

  return {
    modalRef,
    isDragging,
    dragY,
    getModalStyle,
    getDragHandleStyle
  };
}