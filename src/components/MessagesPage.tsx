import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { Checkbox } from "./ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  Search, 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Image as ImageIcon,
  X,
  Trash2,
  Archive,
  Flag,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  User,
  Store,
  BellOff,
  Shield,
  Smile
} from "lucide-react";
import { toast } from "sonner";
import { MessagingService } from "../utils/services";
import { AuthService } from "../utils/auth";
import { getCurrentUser } from "../utils/auth";
import { InlineReviewCard } from "./InlineReviewCard";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "image";
  image_urls?: string[];
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  listingItem?: {
    title: string;
    price: number;
    image: string;
  };
}

// RESET: No mock conversations
const mockConversations: Conversation[] = [];

interface MessagesPageProps {
  onBack: () => void;
  onViewProfile?: (userId: string, sourceContext?: { section: string; conversationId?: string }) => void;
  onViewListings?: (userId: string) => void;
  onViewListing?: (listing: any) => void;
  initialConversationId?: string | null;
}

export function MessagesPage({ onBack, onViewProfile, onViewListings, onViewListing, initialConversationId }: MessagesPageProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversationId || null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Array<{ file: File; preview: string }>>([]);
  
  // Image viewer state
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  
  // Touch handling for swipe gestures
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Pinch zoom state
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(1);
  
  // Selection state for bulk actions (both mobile and desktop)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Review state
  const [messagesSentCount, setMessagesSentCount] = useState(0);
  const [hasReviewedUser, setHasReviewedUser] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // PERFORMANCE: Track which conversation we're loading to prevent duplicates
  const loadingConversationRef = useRef<string | null>(null);
  
  // Ref for auto-scrolling to bottom of messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user ID on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      if (user?.id) {
        setCurrentUserId(user.id);
        console.log('✅ Current user ID set:', user.id);
      } else {
        console.log('❌ No current user found');
      }
    };
    fetchCurrentUser();
  }, []);

  // Function to reload conversations (for updating unread counts)
  const reloadConversations = useCallback(async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;

    try {
      const result = await MessagingService.getConversations(accessToken);
      if (result.success && result.conversations) {
        const transformedConversations = result.conversations.map((conv: any) => {
          const otherUser = conv.buyer || conv.seller;
          return {
            id: conv.id,
            buyer: conv.buyer,
            seller: conv.seller,
            participant: {
              id: otherUser.id,
              name: `${otherUser.first_name} ${otherUser.last_name}`,
              avatar: otherUser.avatar_url,
              isOnline: false
            },
            lastMessage: conv.last_message_content || 'No messages yet',
            lastMessageTime: new Date(conv.last_message_at || conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: conv.unread_count > 0,
            unreadCount: conv.unread_count || 0,
            messages: [],
            listingItem: conv.listing ? {
              title: conv.listing.title,
              price: conv.listing.price,
              image: conv.listing.images?.[0] || ''
            } : undefined
          };
        });
        setConversations(transformedConversations);
      }
    } catch (error) {
      console.log('Error reloading conversations:', error);
    }
  }, []);
  
  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      const accessToken = await AuthService.getFreshToken();
      if (!accessToken) {
        console.log('No access token found, skipping conversation load');
        setIsLoadingConversations(false);
        return;
      }

      // OPTIMIZATION: Skip if we already have conversations (returning from a chat)
      if (conversations.length > 0) {
        console.log('Conversations already loaded, skipping fetch');
        setIsLoadingConversations(false);
        return;
      }

      try {
        const result = await MessagingService.getConversations(accessToken);
        if (result.success && result.conversations) {
          // Transform backend conversations to match UI format
          const transformedConversations = result.conversations.map((conv: any) => {
            const otherUser = conv.buyer || conv.seller;
            return {
              id: conv.id,
              buyer: conv.buyer,
              seller: conv.seller,
              participant: {
                id: otherUser.id,
                name: `${otherUser.first_name} ${otherUser.last_name}`,
                avatar: otherUser.avatar_url,
                isOnline: false
              },
              lastMessage: conv.last_message_content || 'No messages yet',
              lastMessageTime: new Date(conv.last_message_at || conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unread: conv.unread_count > 0,
              unreadCount: conv.unread_count || 0,
              messages: [],
              listingItem: conv.listing ? {
                title: conv.listing.title,
                price: conv.listing.price,
                image: conv.listing.images?.[0] || ''
              } : undefined
            };
          });
          setConversations(transformedConversations);
        } else if (result.error) {
          console.error('Failed to load conversations:', result.error);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        // Don't show toast for auth errors on page load
        if (error instanceof Error && !error.message.includes('401')) {
          toast.error('Failed to load conversations');
        }
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      loadingConversationRef.current = null;
      return;
    }

    // PERFORMANCE: Prevent duplicate API calls for the same conversation
    if (loadingConversationRef.current === selectedConversation) {
      console.log(`⚠️ Already loading conversation ${selectedConversation}, skipping duplicate call`);
      return;
    }

    loadingConversationRef.current = selectedConversation;
    let cancelled = false;

    const loadMessages = async () => {
      const accessToken = await AuthService.getFreshToken();
      if (!accessToken) {
        console.log('❌ No access token, cannot load messages');
        setIsLoadingMessages(false);
        loadingConversationRef.current = null;
        return;
      }

      setIsLoadingMessages(true);
      setHasReviewedUser(false); // Reset review state when switching conversations
      console.log(`📨 Loading messages for conversation: ${selectedConversation}`);
      
      try {
        const result = await MessagingService.getMessages(accessToken, selectedConversation);
        if (!cancelled && result.success && result.messages) {
          setMessages(result.messages);
          console.log(`✅ Loaded ${result.messages.length} messages`);
          
          // Reload conversations to update unread counts (messages were just marked as read)
          reloadConversations();
          
          // Count messages sent by current user
          if (currentUserId) {
            const userMessages = result.messages.filter((msg: any) => msg.sender_id === currentUserId);
            setMessagesSentCount(userMessages.length);
            
            // Check if user has already reviewed the other person
            const conversation = conversations.find(c => c.id === selectedConversation);
            if (conversation && userMessages.length >= 10) {
              const otherParticipant = conversation.buyer?.id === currentUserId ? conversation.seller : conversation.buyer;
              if (otherParticipant) {
                checkIfAlreadyReviewed(otherParticipant.id);
              }
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading messages:', error);
          toast.error('Failed to load messages');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMessages(false);
          // Clear the loading ref only after the request completes
          if (loadingConversationRef.current === selectedConversation) {
            loadingConversationRef.current = null;
          }
        }
      }
    };

    loadMessages();

    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [selectedConversation, reloadConversations]);

  // Auto-scroll to bottom when messages load or change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && selectedImages.length === 0) return;
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please sign in to send messages');
      return;
    }
    
    console.log('📤 Sending message with:', {
      text: newMessage,
      imageCount: selectedImages.length,
      conversationId: selectedConversation
    });
    
    try {
      setIsUploading(true); // Show uploading state
      const result = await MessagingService.sendMessage(accessToken, selectedConversation, newMessage, selectedImages.map(img => img.file));
      
      console.log('📨 Send result:', result);
      
      if (result.success) {
        setNewMessage("");
        setSelectedImages([]);
        // Refresh messages to show the new one
        const messagesResult = await MessagingService.getMessages(accessToken, selectedConversation);
        console.log('📬 Refreshed messages:', messagesResult);
        if (messagesResult.success) {
          setMessages(messagesResult.messages);
          
          // Count messages sent by current user
          const userMessages = messagesResult.messages.filter((msg: any) => msg.sender_id === currentUserId);
          const newMessageCount = userMessages.length;
          setMessagesSentCount(newMessageCount);
          
          // Check if user has already reviewed after reaching 10 messages
          if (newMessageCount >= 10 && selectedConversation) {
            const conversation = conversations.find(c => c.id === selectedConversation);
            if (conversation) {
              const otherParticipant = conversation.buyer?.id === currentUserId ? conversation.seller : conversation.buyer;
              if (otherParticipant) {
                checkIfAlreadyReviewed(otherParticipant.id);
              }
            }
          }
        }
        toast.success('Message sent!');
      } else {
        console.error('❌ Send message error:', result.error);
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsUploading(false); // Clear uploading state
    }
  };

  const checkIfAlreadyReviewed = async (userId: string) => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/reviews/can-review/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // If canReview is false and reason includes "already reviewed", set state
        if (!data.canReview && data.reason && data.reason.includes('already reviewed')) {
          setHasReviewedUser(true);
        } else {
          setHasReviewedUser(false);
        }
      }
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const otherParticipant = conversation.buyer?.id === currentUserId ? conversation.seller : conversation.buyer;
    if (!otherParticipant) return;

    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please sign in to submit a review');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/reviews`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reviewedUserId: otherParticipant.id,
            rating,
            comment,
          }),
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Thank you for your review!');
        setHasReviewedUser(true);
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (selectedImages.length + files.length > 5) {
      toast.error(`You can only upload a maximum of 5 images. Currently selected: ${selectedImages.length}`);
      // Reset the input
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    const newImages: Array<{ file: File; preview: string }> = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        processedCount++;
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        processedCount++;
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        newImages.push({ file, preview: dataUrl });
        processedCount++;

        // When all files are processed
        if (processedCount === files.length) {
          setSelectedImages(prev => [...prev, ...newImages]);
          setIsUploading(false);
          if (newImages.length > 0) {
            toast.success(`${newImages.length} image(s) added`);
          }
          // Reset the input value
          e.target.value = '';
          // Ensure input field is focused
          setTimeout(() => {
            const messageInput = document.querySelector('input[placeholder="Type a message..."]') as HTMLInputElement;
            messageInput?.focus();
          }, 100);
        }
      };
      reader.onerror = () => {
        toast.error(`Failed to read ${file.name}`);
        processedCount++;
        if (processedCount === files.length) {
          setIsUploading(false);
          // Reset the input value
          e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  // PERFORMANCE: Memoize filtered and sorted conversations
  const filteredConversations = useMemo(() => {
    return conversations
      .filter(conversation =>
        conversation.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by unread count first (conversations with unread messages go to top)
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
        
        // If both have unread or both have no unread, maintain original order
        return 0;
      });
  }, [conversations, searchQuery]);

  // PERFORMANCE: Calculate total unread conversations count
  const unreadConversationsCount = useMemo(() => {
    return conversations.filter(c => c.unreadCount > 0).length;
  }, [conversations]);

  // PERFORMANCE: Memoize current conversation data
  const currentConversationData = useMemo(() => 
    selectedConversation ? conversations.find(c => c.id === selectedConversation) : null,
    [selectedConversation, conversations]
  );

  // Selection handlers - Optimized with useCallback
  const handleSelectAll = useCallback(() => {
    if (selectedConversations.size === filteredConversations.length) {
      setSelectedConversations(new Set());
    } else {
      setSelectedConversations(new Set(filteredConversations.map(c => c.id)));
    }
  }, [selectedConversations.size, filteredConversations]);

  const handleSelectConversation = useCallback((id: string) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedConversations(newSelected);
  }, [selectedConversations]);

  const handleDeleteSelected = useCallback(async () => {
    const user = getCurrentUser();
    if (!user?.accessToken) {
      toast.error('Please sign in to delete conversations');
      return;
    }

    try {
      const idsToDelete = Array.from(selectedConversations);
      const result = await MessagingService.deleteConversations(user.accessToken, idsToDelete);
      
      if (result.success) {
        setConversations(prev => prev.filter(c => !selectedConversations.has(c.id)));
        setSelectedConversations(new Set());
        setIsSelectionMode(false);
        if (selectedConversation && selectedConversations.has(selectedConversation)) {
          setSelectedConversation(null);
        }
        setShowDeleteDialog(false);
        toast.success(`Successfully deleted ${result.deletedCount} conversation(s)`);
      } else {
        toast.error(result.error || 'Failed to delete conversations');
      }
    } catch (error) {
      console.error('Error deleting conversations:', error);
      toast.error('Failed to delete conversations');
    }
  }, [selectedConversations, selectedConversation]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    const user = getCurrentUser();
    if (!user?.accessToken) {
      toast.error('Please sign in to delete conversation');
      return;
    }

    try {
      const result = await MessagingService.deleteConversations(user.accessToken, [id]);
      
      if (result.success) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (selectedConversation === id) {
          setSelectedConversation(null);
        }
        setConversationToDelete(null);
        setShowDeleteDialog(false);
        toast.success('Conversation deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  }, [selectedConversation]);

  // Swipe gesture handlers
  const minSwipeDistance = 50;

  const getPinchDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getPinchDistance(e.touches);
      setInitialPinchDistance(distance);
      setInitialZoom(imageZoom);
    } else if (e.touches.length === 1) {
      setTouchEnd(null);
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      
      // If zoomed in, prepare for panning
      if (imageZoom > 1) {
        setIsPanning(true);
        setPanStart({ x: imagePan.x, y: imagePan.y });
      }
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      // Handle pinch zoom
      const currentDistance = getPinchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance;
      const newZoom = Math.max(1, Math.min(initialZoom * scale, 4)); // Limit zoom between 1x and 4x
      setImageZoom(newZoom);
      e.preventDefault();
    } else if (e.touches.length === 1) {
      setTouchEnd({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      
      // If zoomed in and panning, update pan position
      if (isPanning && imageZoom > 1 && touchStart) {
        const deltaX = e.touches[0].clientX - touchStart.x;
        const deltaY = e.touches[0].clientY - touchStart.y;
        setImagePan({
          x: panStart.x + deltaX,
          y: panStart.y + deltaY
        });
        e.preventDefault();
      }
    }
  };

  const onTouchEnd = () => {
    if (initialPinchDistance) {
      setInitialPinchDistance(null);
      // Reset pan if zoomed back to 1x
      if (imageZoom === 1) {
        setImagePan({ x: 0, y: 0 });
      }
      return;
    }

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!touchStart || !touchEnd) return;
    
    // Only allow swipe navigation when not zoomed in
    if (imageZoom > 1) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;
    
    // Swipe down to close
    if (Math.abs(distanceY) > Math.abs(distanceX) && isDownSwipe) {
      setViewerImage(null);
      setImageZoom(1);
      setImagePan({ x: 0, y: 0 });
      return;
    }
    
    // Swipe left to next image
    if (Math.abs(distanceX) > Math.abs(distanceY) && isLeftSwipe && viewerIndex < viewerImages.length - 1) {
      const newIndex = viewerIndex + 1;
      setViewerIndex(newIndex);
      setViewerImage(viewerImages[newIndex]);
      setImageZoom(1);
      setImagePan({ x: 0, y: 0 });
    }
    
    // Swipe right to previous image
    if (Math.abs(distanceX) > Math.abs(distanceY) && isRightSwipe && viewerIndex > 0) {
      const newIndex = viewerIndex - 1;
      setViewerIndex(newIndex);
      setViewerImage(viewerImages[newIndex]);
      setImageZoom(1);
      setImagePan({ x: 0, y: 0 });
    }
  };

  // Double tap to zoom
  const [lastTap, setLastTap] = useState(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (imageZoom === 1) {
        setImageZoom(2);
      } else {
        setImageZoom(1);
        setImagePan({ x: 0, y: 0 });
      }
    }
    setLastTap(now);
  };

  return (
    <div className="h-[calc(100vh-16rem)] md:h-[calc(100vh-8rem)] flex bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Sidebar - Conversations List */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col bg-white shadow-lg ${selectedConversation ? 'hidden md:flex' : ''}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4 relative">
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden hover:bg-blue-100 rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Messages</h1>
            </div>
            

            
            {/* Selection Controls (Mobile & Desktop) */}
            <div className="flex items-center space-x-2 relative">
              {!isSelectionMode ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsSelectionMode(true)}
                  className="hover:bg-blue-100 rounded-xl"
                >
                  Select
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsSelectionMode(false);
                      setSelectedConversations(new Set());
                    }}
                    className="hover:bg-red-100 rounded-xl"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  {selectedConversations.size > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="bg-red-600 hover:bg-red-700 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete ({selectedConversations.size})
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Select All Checkbox (Mobile & Desktop) */}
          {isSelectionMode && (
            <div className="flex items-center space-x-2 mb-4 bg-white rounded-xl p-2 border border-gray-200">
              <Checkbox 
                checked={selectedConversations.size === filteredConversations.length && filteredConversations.length > 0}
                onCheckedChange={handleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All ({filteredConversations.length})
              </label>
            </div>
          )}
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 bg-white border-gray-300 focus:border-blue-500 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingConversations ? (
            // Skeleton Loading State
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 mb-2 rounded-xl border-2 border-gray-200 bg-white">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500 text-sm">
                Start a conversation by messaging a seller on a listing
              </p>
            </div>
          ) : (
            // Conversation List
            filteredConversations.map((conversation) => {
              const isUnread = conversation.unreadCount > 0;
              const isSelected = selectedConversation === conversation.id;
              const isChecked = selectedConversations.has(conversation.id);
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    if (isSelectionMode) {
                      handleSelectConversation(conversation.id);
                    } else {
                      setSelectedConversation(conversation.id);
                    }
                  }}
                  className={`p-4 mb-2 rounded-xl border-2 cursor-pointer transition-all relative ${
                    isUnread
                      ? 'bg-blue-50 border-blue-400'
                      : isSelected
                      ? 'bg-blue-100 border-blue-300'
                      : isChecked
                      ? 'bg-blue-50 border-blue-300'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  {/* UNREAD COUNT BADGE - Top Right Corner of Card */}
                  {conversation.unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white shadow-lg ring-2 ring-white/30 flex items-center justify-center font-semibold">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </Badge>
                  )}
                  
                  <div className="flex items-start space-x-3 relative">
                    {/* Green dot indicator for unread messages - REMOVED to avoid duplicate */}
                    
                    {/* Selection Checkbox (Mobile & Desktop) */}
                    {isSelectionMode && (
                      <div className="flex items-center justify-center pt-1">
                        <Checkbox 
                          checked={isChecked}
                          onCheckedChange={() => handleSelectConversation(conversation.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                    
                    {/* Unread indicator dot */}
                    {isUnread && !isSelectionMode && (
                      <div className="flex items-center justify-center pt-1">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                    
                    <div className="relative">
                      <Avatar className={`h-12 w-12 ${isUnread ? 'ring-2 ring-blue-500' : ''}`}>
                        <AvatarImage src={conversation.participant.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.participant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`truncate ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}`}>
                          {conversation.participant.name}
                        </h3>
                        <span className={`text-xs ${isUnread ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                          {conversation.lastMessageTime}
                        </span>
                      </div>
                      
                      {conversation.lastMessage && conversation.lastMessage !== "no messages yet" && (
                        <p className={`text-sm truncate mb-2 ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {conversation.lastMessage}
                        </p>
                      )}
                      
                      {conversation.listingItem && (
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-2 border border-gray-200">
                          <img
                            src={conversation.listingItem.image}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 truncate">
                              {conversation.listingItem.title}
                            </p>
                            <p className="text-xs font-medium text-green-600">
                              ${conversation.listingItem.price}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedConversation ? '' : 'hidden md:flex'}`}>
        {currentConversationData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/30 bg-gradient-to-r from-white/95 via-blue-50/90 to-white/95 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden hover:bg-blue-500/20 rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-500/40 shadow-xl">
                      <AvatarImage src={currentConversationData.participant.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {currentConversationData.participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {currentConversationData.participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {currentConversationData.participant.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {currentConversationData.participant.isOnline ? 'Active now' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-10 w-10 hover:bg-blue-500/20 hover:shadow-md rounded-xl transition-all duration-300"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 bg-gradient-to-br from-white/95 via-blue-50/90 to-white/95 backdrop-blur-xl border-white/40"
                      sideOffset={5}
                    >
                      <DropdownMenuItem 
                        className="cursor-pointer hover:bg-blue-500/10 rounded-lg"
                        onClick={() => onViewProfile?.(currentConversationData.participant.id, {
                          section: 'messages',
                          conversationId: currentConversationData.id
                        })}
                      >
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer hover:bg-blue-500/10 rounded-lg"
                        onClick={() => onViewListings?.(currentConversationData.participant.id)}
                      >
                        <Store className="h-4 w-4 mr-2" />
                        View Listings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/30" />
                      <DropdownMenuItem className="cursor-pointer hover:bg-blue-500/10 rounded-lg">
                        <BellOff className="h-4 w-4 mr-2" />
                        Mute Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-blue-500/10 rounded-lg">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-blue-500/10 rounded-lg">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Chat History
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/30" />
                      <DropdownMenuItem className="text-orange-600 cursor-pointer hover:bg-orange-500/10 rounded-lg">
                        <Flag className="h-4 w-4 mr-2" />
                        Report User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-red-500/10 rounded-lg">
                        <Shield className="h-4 w-4 mr-2" />
                        Block User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Listing Item Reference */}
            {currentConversationData.listingItem && (
              <div 
                className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-blue-100/50 cursor-pointer hover:from-blue-100/80 hover:to-indigo-100/80 backdrop-blur-md transition-all duration-300 shadow-sm"
                onClick={() => {
                  // Create a mock listing object from the conversation data
                  const mockListing = {
                    id: `listing-${currentConversationData.id}`,
                    title: currentConversationData.listingItem!.title,
                    price: currentConversationData.listingItem!.price,
                    images: [currentConversationData.listingItem!.image],
                    description: "View full listing details in the marketplace.",
                    location: "Location from seller",
                    postedDate: "Recently",
                    condition: "used" as const,
                    seller: {
                      id: currentConversationData.participant.id,
                      name: currentConversationData.participant.name,
                      avatar: currentConversationData.participant.avatar,
                      rating: 4.5,
                      responseTime: "Usually responds quickly"
                    },
                    category: "Car Keys & Remotes"
                  };
                  onViewListing?.(mockListing);
                }}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={currentConversationData.listingItem.image}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover shadow-md ring-2 ring-white/40"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {currentConversationData.listingItem.title}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      ${currentConversationData.listingItem.price}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50/80 via-blue-50/30 to-gray-50/80">
              {isLoadingMessages ? (
                // Skeleton Loading State for Messages
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`flex ${i % 3 === 0 ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                        {i % 3 !== 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-20 w-full rounded-2xl" />
                          <Skeleton className="h-3 w-16 ml-2" />
                        </div>
                        {i % 3 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full"></div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = currentUserId && message.sender_id === currentUserId;
                  
                  // DEBUG: Log to check if comparison is working
                  if (index === 0) {
                    console.log('🔍 Message sender comparison:', {
                      currentUserId,
                      currentUserIdType: typeof currentUserId,
                      messageSenderId: message.sender_id,
                      messageSenderIdType: typeof message.sender_id,
                      isCurrentUser,
                      areEqual: message.sender_id === currentUserId,
                    });
                  }
                  
                  const conversation = conversations.find(c => c.id === selectedConversation);
                  const otherParticipant = conversation && currentUserId ? 
                    (conversation.buyer?.id === currentUserId ? conversation.seller : conversation.buyer) : null;
                  
                  // Show review card after the 10th message (index 9)
                  const showReviewCard = index === 10 && messagesSentCount >= 10 && otherParticipant;
                  
                  return (
                    <React.Fragment key={message.id}>
                      {showReviewCard && otherParticipant && (
                        <InlineReviewCard
                          userName={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
                          userAvatar={otherParticipant.avatar_url || ''}
                          onSubmit={handleSubmitReview}
                          hasAlreadyReviewed={hasReviewedUser}
                          isSubmitting={isSubmittingReview}
                        />
                      )}
                      <div
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] ${
                          isCurrentUser
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                            : 'bg-gradient-to-br from-white/95 to-gray-50/90 text-gray-900 backdrop-blur-md border border-white/40'
                        }`}
                      >
                        {/* Display images if any */}
                        {message.image_urls && message.image_urls.length > 0 && (
                          <div className="mb-2">
                            <div className="grid grid-cols-2 gap-1 max-w-[200px]">
                              {message.image_urls.slice(0, 4).map((imageUrl: string, index: number) => (
                                <div 
                                  key={index}
                                  className="relative aspect-square cursor-pointer"
                                  onClick={() => {
                                    setViewerImage(imageUrl);
                                    setViewerImages(message.image_urls);
                                    setViewerIndex(index);
                                  }}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-full object-cover rounded-md hover:opacity-90 transition-opacity"
                                  />
                                  {/* Show +N overlay on 4th image if there are more */}
                                  {index === 3 && message.image_urls.length > 4 && (
                                    <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center">
                                      <span className="text-white font-semibold text-lg">
                                        +{message.image_urls.length - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Display text content if any */}
                        {message.content && (
                          <p className="text-sm">{message.content}</p>
                        )}
                        
                        <p className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    </React.Fragment>
                  );
                })
              )}
              
              {/* Show review card at the end if user has sent 10+ messages but there are 10 or fewer total messages */}
              {messages.length > 0 && messages.length <= 10 && messagesSentCount >= 10 && (() => {
                const conversation = conversations.find(c => c.id === selectedConversation);
                const otherParticipant = conversation && currentUserId ? 
                  (conversation.buyer?.id === currentUserId ? conversation.seller : conversation.buyer) : null;
                
                return otherParticipant ? (
                  <InlineReviewCard
                    userName={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
                    userAvatar={otherParticipant.avatar_url || ''}
                    onSubmit={handleSubmitReview}
                    hasAlreadyReviewed={hasReviewedUser}
                    isSubmitting={isSubmittingReview}
                  />
                ) : null;
              })()}
              
              {/* Scroll anchor for auto-scroll to bottom */}
              <div ref={messagesEndRef} />
            </div>



            {/* Message Input */}
            <div className="p-4 border-t border-white/30 bg-gradient-to-r from-white/95 via-blue-50/90 to-white/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent pointer-events-none"></div>
              
              {/* Image Previews */}
              {selectedImages.length > 0 && (
                <div className="mb-3 relative z-10">
                  <div className="flex items-center gap-2 flex-wrap bg-white/60 backdrop-blur-md rounded-xl p-2 border border-white/40">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-blue-200 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <div className="text-xs text-gray-600 ml-2">
                      {selectedImages.length} / 5 images
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 relative z-10">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading || selectedImages.length >= 5}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    disabled={isUploading || selectedImages.length >= 5}
                    onClick={() => {
                      const fileInput = document.getElementById('file-upload');
                      if (selectedImages.length === 0) {
                        toast.info('You can select multiple images at once!', { duration: 2000 });
                      }
                      fileInput?.click();
                    }}
                    className="hover:bg-blue-500/20 hover:shadow-md rounded-xl transition-all duration-300 disabled:opacity-50"
                    title={selectedImages.length >= 5 ? "Maximum 5 images reached" : "Add images (you can select multiple)"}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </div>
                
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={false}
                  className="flex-1 bg-white/80 backdrop-blur-md border-white/40 focus:border-blue-500/60 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] focus:shadow-[0_6px_20px_rgba(59,130,246,0.3)] transition-all duration-300"
                />
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-blue-500/20 hover:shadow-md rounded-xl transition-all duration-300"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={(!newMessage.trim() && selectedImages.length === 0) || isUploading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_4px_16px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)] rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/80 via-blue-50/30 to-gray-50/80">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_8px_24px_rgba(59,130,246,0.2)]">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No conversation selected
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-white/95 via-blue-50/90 to-white/95 backdrop-blur-xl border-white/40">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {conversationToDelete ? 'Delete Conversation' : `Delete ${selectedConversations.size} Conversations`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {conversationToDelete 
                ? 'Are you sure you want to delete this conversation? It will be removed from your inbox, but the other person will still have access to it.'
                : `Are you sure you want to delete ${selectedConversations.size} conversations? They will be removed from your inbox, but the other participants will still have access to them.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowDeleteDialog(false);
                setConversationToDelete(null);
              }}
              className="bg-white/90 backdrop-blur-md hover:bg-white border-white/60 rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (conversationToDelete) {
                  handleDeleteConversation(conversationToDelete);
                } else {
                  handleDeleteSelected();
                  setShowDeleteDialog(false);
                }
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-[0_4px_16px_rgba(220,38,38,0.4)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.5)] rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewerImage} onOpenChange={() => { setViewerImage(null); setImageZoom(1); }}>
        <DialogContent className="max-w-7xl w-full h-[90vh] bg-black/95 border-0 p-0 overflow-hidden">
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          <DialogDescription className="sr-only">
            Full size image viewer
          </DialogDescription>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Simple Close Button - Top Right */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => { setViewerImage(null); setImageZoom(1); }}
              className="absolute top-4 right-4 z-20 text-white hover:bg-white/20 rounded-full w-10 h-10 bg-black/40 backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image - Simple and Clean */}
            {viewerImage && (
              <div 
                className="relative w-full h-full overflow-hidden flex items-center justify-center"
                style={{ touchAction: imageZoom > 1 ? 'none' : 'auto' }}
              >
                <img 
                  src={viewerImage} 
                  alt="Full size" 
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${imageZoom}) translate(${imagePan.x / imageZoom}px, ${imagePan.y / imageZoom}px)`,
                    cursor: imageZoom > 1 ? 'grab' : 'pointer'
                  }}
                  onClick={handleDoubleTap}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                />
              </div>
            )}
            
            {/* Hint text for mobile */}
            <div className="absolute bottom-6 left-0 right-0 text-center z-10 md:hidden">
              <p className="text-white/60 text-sm">Swipe down to close • Swipe left/right to navigate</p>
              {viewerImages.length > 1 && (
                <p className="text-white/40 text-xs mt-1">{viewerIndex + 1} / {viewerImages.length}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}