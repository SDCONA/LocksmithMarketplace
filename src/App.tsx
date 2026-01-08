import { useState, useEffect, useMemo } from "react";
import { VehicleSelector } from "./components/VehicleSelector";
import { SearchResultCard } from "./components/SearchResultCard";
import { SearchFilters } from "./components/SearchFilters";
import { LocksmithMarketplaceLogo } from "./components/KeyFinderLogo";
import { PromotionalBlock } from "./components/PromotionalBlock";
import { AdminPromotionalBanners } from "./components/AdminPromotionalBanners";
import { AuthModal } from "./components/AuthModal";
import { MarketplaceCard } from "./components/MarketplaceCard";
import { CreateListingModal } from "./components/CreateListingModal";
import { SearchResultSkeleton, MarketplaceCardSkeleton } from "./components/SkeletonCard";
import { toast, Toaster } from "sonner";
import { LocalStorage } from "./lib/localStorage";
import { AuthService, isAdminUser } from "./utils/auth";
import { ListingsService, SavedItemsService, MessagingService, NotificationsService, DealsService } from "./utils/services";
import { createClient } from "./utils/supabase/client";
import { projectId, publicAnonKey } from "./utils/supabase/info";
import { debounce } from "./utils/debounce";
import { StatePersistence } from "./utils/statePersistence";
import { DealModal, DealModalData } from "./components/DealModal";
import { loadRecaptchaScript } from "./utils/recaptcha";

import { EditListingModal } from "./components/EditListingModal";
import { ReportModal } from "./components/ReportModal";
import { MessagesPage } from "./components/MessagesPage";
import { AccountPage } from "./components/AccountPage";
import { ListingPage } from "./components/ListingPage";
import { MarketplaceFilters } from "./components/MarketplaceFilters";
import { SettingsPage } from "./components/SettingsPage";
import { UserProfilePage } from "./components/UserProfilePage";
import { HelpSupportPage } from "./components/HelpSupportPage";
import { SellerListingsPage } from "./components/SellerListingsPage";
import { PromotePage } from "./components/PromotePage";
import { Footer } from "./components/Footer";
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";
import { TermsOfServicePage } from "./components/TermsOfServicePage";
import { ContactPage } from "./components/ContactPage";
import { MarketplaceProfilePage } from "./components/MarketplaceProfilePage";
import { EditMarketplaceProfileModal } from "./components/EditMarketplaceProfileModal";
import { SavedItemsPage } from "./components/SavedItemsPage";
import { SavedMarketplaceListingsPage } from "./components/SavedMarketplaceListingsPage";
import { SavedDealsPage } from "./components/SavedDealsPage";
import { ArchivedListingsPage } from "./components/ArchivedListingsPage";
import { AdminPage } from "./components/AdminPage";
import { DynamicRetailersPage } from "./components/DynamicRetailersPage";
import { DealsPage } from "./components/DealsPage";
import { RetailerDashboardPage } from "./components/RetailerDashboardPage";
import { MyRetailerDealsPage } from "./components/MyRetailerDealsPage";
import { HubSection } from "./components/HubSection";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { 
  Search, 
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Globe,
  Clock,
  Store,
  MessageCircle,
  Plus,
  User,
  Users,
  LogOut,
  Settings,
  Heart,
  ShieldCheck,
  Archive,
  Info,
  Moon,
  Sun,
  Tag,
  Compass
} from "lucide-react";

// All major retailers promotional banners - memory optimized (KEY4, UHS Hardware, YCKG, KeyDirect, Transponder Island, Car & Truck Remotes, Best Key Supply, Noble Key Supply, Key Innovations, and Locksmith Keyless)
// Note: For Vercel deployment, replace these with actual image paths in /public/banners/
const xhorseMegaSaleBanner = '/banners/xhorse-mega-sale.png';
const xhorseToolsBanner = '/banners/xhorse-tools.png';
const uhsSmartProBanner = '/banners/uhs-smart-pro.png';
const uhsLocktoberfestBanner = '/banners/uhs-locktoberfest.png';
const yckgSonataBanner = '/banners/yckg-sonata.png';
const yckgHyundaiKiaBanner = '/banners/yckg-hyundai-kia.png';
const keyDirectXT57BBanner = '/banners/keydirect-xt57b.png';
const keyDirectFordMadnessBanner = '/banners/keydirect-ford-madness.png';
const transponderIslandBanner = '/banners/transponder-island.png';
const carTruckRemotesBanner = '/banners/car-truck-remotes.png';
const bestKeySupplyPrimeBanner = '/banners/best-key-supply-prime.png';
const bestKeySupplyMaverickBanner = '/banners/best-key-supply-maverick.png';
const nobleKeySupplyRefurbishingBanner = '/banners/noble-key-supply-refurbishing.png';
const nobleKeySupplyShippingBanner = '/banners/noble-key-supply-shipping.png';
const keyInnovationsHalloweenBanner = '/banners/key-innovations-halloween.png';
const keyInnovationsPrimeDealsBanner = '/banners/key-innovations-prime-deals.png';
const locksmithKeylessNewMonthBanner = '/banners/locksmith-keyless-new-month.png';
const locksmithKeylessNewWeekBanner = '/banners/locksmith-keyless-new-week.png';




// Mock marketplace listings - RESET: Empty array, will use real data from backend
const mockMarketplaceItems = [];

// Sample search results from multiple retailers - RESET: Empty array
const mockSearchResults = [];

export default function App() {
  // Dark Mode State - Initialize from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode class to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Auth & User State
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Load reCAPTCHA script on mount
  useEffect(() => {
    // Attempt to load reCAPTCHA, but don't crash the app if it fails
    // Actual enforcement happens during login/signup
    loadRecaptchaScript().catch((error) => {
      // reCAPTCHA load error - silent
    });
  }, []);

  // Check for email verification token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verify_token');
    
    if (verifyToken) {
      // Auto-verify email
      const verifyEmail = async () => {
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/auth/verify-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({ token: verifyToken })
          });

          const data = await response.json();

          if (data.success && data.user) {
            // Set session with Supabase client if session data is returned
            if (data.session) {
              const supabase = createClient(projectId, publicAnonKey);
              await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
              });
            }
            
            toast.success("Email verified!", {
              description: "Your account is now active. Welcome to Locksmith Marketplace!",
              duration: 5000
            });
            
            // Auto-login the user
            setUser(data.user);
            
            // Clean URL by removing the token
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            toast.error("Verification failed", {
              description: data.error || "The verification link may have expired. Please try signing up again."
            });
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          toast.error("Verification failed", {
            description: "An unexpected error occurred. Please try again."
          });
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      
      verifyEmail();
    }
  }, []);

  // Edge function warm-up removed due to 401 errors
  // Natural traffic will warm up the function instead

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoadingAuth(true);
      
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          // Load saved items using fresh token
          const accessToken = await AuthService.getFreshToken();
          if (accessToken) {
            // Load saved marketplace listings
            try {
              const savedListingsResult = await SavedItemsService.getSavedItems(accessToken, 'listing');
              if (savedListingsResult.success) {
                const listingsData = savedListingsResult.savedItems.map((item: any) => ({
                  ...item.item_data,
                  savedAt: new Date(item.created_at).getTime()
                }));
              }
            } catch (error) {
              // Error loading saved listings
            }
            
            // Load saved retailer products
            try {
              const savedProductsResult = await SavedItemsService.getSavedItems(accessToken, 'product');
              if (savedProductsResult.success) {
                const productsData = savedProductsResult.savedItems.map((item: any) => ({
                  ...item.item_data,
                  savedAt: new Date(item.created_at).getTime()
                }));
                setSavedItems(productsData);
              } else {
                // No saved products
              }
            } catch (error) {
              // Error loading saved products
            }
          }
        } else {
          // No active session
        }
      } catch (error) {
        setUser(null);
      }
      
      setIsLoadingAuth(false);
    };
    
    checkAuth();
  }, []);
  
  // Navigation State - Initialize from localStorage
  const savedNavState = StatePersistence.getNavigationState();
  
  // One-time migration: If saved state has 'retailers', change it to 'marketplace'
  if (savedNavState.currentSection === 'retailers') {
    savedNavState.currentSection = 'marketplace';
    StatePersistence.saveNavigationState(savedNavState);
  }
  
  const [currentSection, setCurrentSection] = useState<'retailers' | 'search' | 'marketplace' | 'messages' | 'account' | 'listing' | 'settings' | 'profile' | 'help' | 'seller-listings' | 'promote' | 'contact' | 'privacy' | 'terms' | 'deals' | 'marketplace-profile' | 'saved-items' | 'saved-marketplace-listings' | 'saved-deals' | 'archived-listings' | 'admin' | 'retailer-dashboard' | 'my-retailer-deals' | 'hub'>(savedNavState.currentSection as any);
  const [selectedListing, setSelectedListing] = useState<any>(savedNavState.selectedListing);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(savedNavState.selectedUserId);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(savedNavState.selectedSellerId);
  const [previousSection, setPreviousSection] = useState<string | null>(savedNavState.previousSection);
  const [previousConversationId, setPreviousConversationId] = useState<string | null>(savedNavState.previousConversationId);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  
  // Search States - Initialize from localStorage
  const savedSearchState = StatePersistence.getSearchState();
  
  const [searchQuery, setSearchQuery] = useState(savedSearchState.searchQuery);
  const [selectedVehicle, setSelectedVehicle] = useState<{year: string, make: string, model: string} | null>(savedSearchState.selectedVehicle);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(mockSearchResults);
  const [showSearchResults, setShowSearchResults] = useState(savedSearchState.showSearchResults);
  const [selectedDealForModal, setSelectedDealForModal] = useState<DealModalData | null>(null);
  
  // Search Filter states
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>(savedSearchState.selectedRetailers);
  const [sortBy, setSortBy] = useState(savedSearchState.sortBy);
  const [inStockOnly, setInStockOnly] = useState(savedSearchState.inStockOnly);
  
  // Marketplace States
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showEditListing, setShowEditListing] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingListing, setReportingListing] = useState<any>(null);
  
  // Marketplace Search - Initialize from localStorage
  const savedMarketplaceState = StatePersistence.getMarketplaceState();
  const [marketplaceSearch, setMarketplaceSearch] = useState(savedMarketplaceState.marketplaceSearch);
  
  // Infinite scroll pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreListings, setHasMoreListings] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Marketplace Filter states with persistence
  const [selectedCategory, setSelectedCategory] = useState<string>(savedMarketplaceState.selectedCategory);
  const [selectedCondition, setSelectedCondition] = useState<string>(savedMarketplaceState.selectedCondition);
  const [marketplaceSortBy, setMarketplaceSortBy] = useState(() => {
    // Always default to "random" on page load/refresh
    return "random";
  });
  const [zipCode, setZipCode] = useState(savedMarketplaceState.zipCode);
  const [radius, setRadius] = useState(savedMarketplaceState.radius);

  // Marketplace Profile States
  const [marketplaceProfile, setMarketplaceProfile] = useState<any>(null);
  
  // Search History
  const [searchHistory, setSearchHistory] = useState<string[]>(() => LocalStorage.getSearchHistory());

  // Saved Items State (for retailer products)
  const [savedItems, setSavedItems] = useState<any[]>([]);
  
  // Saved Marketplace Listings State  
  const [savedMarketplaceListings, setSavedMarketplaceListings] = useState<any[]>([]);
  
  // Check for unread notifications
  useEffect(() => {
    const checkUnreadNotifications = async () => {
      if (!user) {
        setUnreadNotificationsCount(0);
        return;
      }

      try {
        const accessToken = localStorage.getItem('sb-access-token');
        if (!accessToken) return;

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/notifications/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();
        if (data.success) {
          setUnreadNotificationsCount(data.count || 0);
        }
      } catch (error) {
        // Error checking unread notifications
      }
    };

    checkUnreadNotifications();
    
    // Check every 60 seconds
    const interval = setInterval(checkUnreadNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Clear notification count when user opens account page
  useEffect(() => {
    if (currentSection === 'account' && unreadNotificationsCount > 0) {
      // Small delay to allow notifications page to load
      setTimeout(() => {
        setUnreadNotificationsCount(0);
      }, 1000);
    }
  }, [currentSection]);

  // Persist navigation state on changes
  useEffect(() => {
    StatePersistence.saveNavigationState({
      currentSection,
      selectedListing,
      selectedUserId,
      selectedSellerId,
      previousSection,
      previousConversationId
    });
  }, [currentSection, selectedListing, selectedUserId, selectedSellerId, previousSection, previousConversationId]);

  // Persist search state on changes
  useEffect(() => {
    StatePersistence.saveSearchState({
      searchQuery,
      selectedVehicle,
      selectedRetailers,
      sortBy,
      inStockOnly,
      showSearchResults
    });
  }, [searchQuery, selectedVehicle, selectedRetailers, sortBy, inStockOnly, showSearchResults]);

  // Persist marketplace state on changes
  useEffect(() => {
    StatePersistence.saveMarketplaceState({
      marketplaceSearch,
      selectedCategory,
      selectedCondition,
      zipCode,
      radius
    });
  }, [marketplaceSearch, selectedCategory, selectedCondition, zipCode, radius]);
  
  // Fix saved items with incorrect URLs (Figma links)
  useEffect(() => {
    const fixSavedItemUrls = async () => {
      if (savedItems.length === 0) return;
      
      const itemsToFix = savedItems.filter(item => 
        item.productUrl && item.productUrl.includes('figma.site')
      );
      
      if (itemsToFix.length === 0) {
        return;
      }
      
      // Fix saved item URLs
      
      const accessToken = await AuthService.getFreshToken();
      if (!accessToken) return;
      
      try {
        // Fetch fresh data for each item with wrong URL
        const fixedItems = await Promise.all(
          itemsToFix.map(async (item) => {
            try {
              const dealData = await DealsService.getDeal(item.id);
              if (dealData && dealData.external_url) {
                // Update the saved item in the database
                await SavedItemsService.saveItem(accessToken, item.id, 'product', {
                  ...item,
                  productUrl: dealData.external_url,
                  retailer: {
                    ...item.retailer,
                    website: dealData.external_url
                  }
                });
                
                return {
                  ...item,
                  productUrl: dealData.external_url,
                  retailer: {
                    ...item.retailer,
                    website: dealData.external_url
                  }
                };
              }
              return item;
            } catch (error) {
              // Silently skip items that can't be fetched (likely deleted deals)
              return item;
            }
          })
        );
        
        // Update state with fixed items
        setSavedItems(prevItems => 
          prevItems.map(item => {
            const fixed = fixedItems.find(f => f.id === item.id);
            return fixed || item;
          })
        );
        
        const successfullyFixed = fixedItems.filter((item, index) => 
          item.productUrl !== itemsToFix[index].productUrl
        ).length;
        
        if (successfullyFixed > 0) {
          toast.success(`Fixed ${successfullyFixed} product links`);
        }
      } catch (error) {
        // Some URLs could not be fixed
      }
    };
    
    fixSavedItemUrls();
  }, [savedItems.length]); // Only run when items are first loaded

  // Unread Messages State
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  // Sync URL with current section
  useEffect(() => {
    const path = `/${currentSection}`;
    const currentHash = window.location.hash; // Preserve hash fragment for Hub sub-pages
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path + currentHash); // Add hash back to URL
    }
  }, [currentSection]);
  
  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1);
      const validSections = ['retailers', 'search', 'marketplace', 'messages', 'account', 'listing', 'settings', 'profile', 'help', 'seller-listings', 'promote', 'contact', 'privacy', 'terms', 'deals', 'marketplace-profile', 'saved-items', 'saved-marketplace-listings', 'saved-deals', 'archived-listings', 'admin', 'retailer-dashboard', 'my-retailer-deals', 'hub'];
      if (validSections.includes(path)) {
        setCurrentSection(path as any);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Handle initial page load from URL (e.g., email links to /messages)
  useEffect(() => {
    // Check for query parameter (e.g., ?section=messages)
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    
    // Check for path-based routing (e.g., /messages)
    const path = window.location.pathname.slice(1);
    
    const validSections = ['retailers', 'search', 'marketplace', 'messages', 'account', 'listing', 'settings', 'profile', 'help', 'seller-listings', 'promote', 'contact', 'privacy', 'terms', 'deals', 'marketplace-profile', 'saved-items', 'saved-marketplace-listings', 'saved-deals', 'archived-listings', 'admin', 'retailer-dashboard', 'my-retailer-deals', 'hub'];
    
    // Prioritize query parameter over path
    if (sectionParam && validSections.includes(sectionParam)) {
      setCurrentSection(sectionParam as any);
      // Clean URL (preserve hash for Hub sub-pages)
      window.history.replaceState({}, '', `/${sectionParam}${window.location.hash}`);
    } else if (path && validSections.includes(path)) {
      setCurrentSection(path as any);
    }
  }, []); // Only run on mount
  
  // Handle email verification and password reset tokens from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verify_token');
    const resetToken = urlParams.get('reset_token');
    
    const handleTokenVerification = async () => {
      if (verifyToken) {
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/verify-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({ token: verifyToken })
          });

          const data = await response.json();

          if (data.success && data.user) {
            toast.success("Email verified successfully!", {
              description: "Welcome to Locksmith Marketplace!"
            });
            setUser(data.user);
            // Clear token from URL
            window.history.replaceState({}, '', '/');
          } else {
            toast.error("Verification failed", {
              description: data.error || "Invalid or expired token. Please request a new verification email."
            });
          }
        } catch (error) {
          toast.error("Verification failed", {
            description: "An error occurred. Please try again."
          });
        }
      } else if (resetToken) {
        // For reset token, we'll show the reset form in AuthModal
        // Store token temporarily and show auth modal
        sessionStorage.setItem('resetToken', resetToken);
        setShowAuthModal(true);
        // Clear token from URL
        window.history.replaceState({}, '', '/');
      }
    };
    
    handleTokenVerification();
  }, []);
  
  // Check admin access when navigating to admin section
  useEffect(() => {
    if (currentSection === 'admin' && !isAdminUser(user)) {
      toast.error('You do not have permission to access the admin panel');
      setCurrentSection('marketplace');
    }
  }, [currentSection]);

  // Scroll to top when navigating between sections with smooth transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Refresh unread count when leaving messages section (messages may have been read)
    // OPTIMIZATION: Debounce to avoid calling on every navigation
    if (currentSection !== 'messages' && user?.accessToken) {
      const timer = setTimeout(() => {
        fetchUnreadMessagesCount();
      }, 500); // Wait 500ms to avoid redundant calls
      return () => clearTimeout(timer);
    }
  }, [currentSection]);
  
  // Persist marketplace filters
  useEffect(() => {
    LocalStorage.saveMarketplaceFilterPreferences({
      selectedCategory,
      selectedCondition,
      marketplaceSortBy,
      zipCode,
      radius
    });
  }, [selectedCategory, selectedCondition, marketplaceSortBy, zipCode, radius]);
  
  // Persist retailer search filters
  useEffect(() => {
    LocalStorage.saveFilterPreferences({
      selectedRetailers,
      sortBy,
      inStockOnly
    });
  }, [selectedRetailers, sortBy, inStockOnly]);
  
  // Subscribe to real-time messages updates (replaces polling)
  useEffect(() => {
    if (user?.id) {
      // Initial fetch
      fetchUnreadMessagesCount();
      
      // Set up real-time subscription
      const supabase = createClient();
      
      // Subscribe to messages table changes
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            // Refetch count when messages are inserted or updated
            fetchUnreadMessagesCount();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setUnreadMessagesCount(0);
    }
  }, [user?.id]);

  // Fetch unread messages count from backend
  const fetchUnreadMessagesCount = async () => {
    if (!user?.accessToken) return;
    
    try {
      const result = await MessagingService.getUnreadCount(user.accessToken);
      if (result.success) {
        setUnreadMessagesCount(result.count);
      }
    } catch (error) {
      // Error fetching unread messages count
    }
  };
  
  // Debounced version of fetchMarketplaceListings (only for search)
  const debouncedFetchListings = useMemo(
    () => debounce(() => fetchMarketplaceListings(1, false), 300), // Reduced from 500ms to 300ms
    []
  );

  // Fetch marketplace listings when marketplace section is active or filters change
  useEffect(() => {
    if (currentSection === 'marketplace') {
      // Reset to page 1 when filters change
      setCurrentPage(1);
      setHasMoreListings(true);
      
      // Use debounced version for search, immediate for other filters
      if (marketplaceSearch) {
        debouncedFetchListings();
      } else {
        fetchMarketplaceListings(1, false);
      }
    }
  }, [currentSection, selectedCategory, selectedCondition, marketplaceSearch, zipCode, radius]);

  // Fetch marketplace listings from backend with pagination
  const fetchMarketplaceListings = async (page = 1, append = false) => {
    if (page === 1) {
      setIsLoadingListings(true);
    } else {
      setIsLoadingMore(true);
    }
    setListingsError(null);
    
    try {
      const filters: any = { page, limit: 20, random: true }; // Always randomize listings
      if (selectedCategory && selectedCategory !== 'all') filters.category = selectedCategory;
      if (selectedCondition && selectedCondition !== 'all') filters.condition = selectedCondition;
      if (marketplaceSearch) filters.search = marketplaceSearch;
      if (zipCode && zipCode.length === 5) filters.zipCode = zipCode;
      if (radius) filters.radius = radius;
      
      const result = await ListingsService.getListings(filters);
      
      if (result.success && result.listings) {
        // Transform backend listings to match frontend format
        const transformedListings = result.listings.map((listing: any) => ({
          id: listing.id,
          title: listing.title,
          price: listing.price,
          description: listing.description,
          images: listing.images || [],
          location: listing.location || 'Not specified',
          postedDate: new Date(listing.created_at).toLocaleDateString(),
          condition: listing.condition,
          seller: {
            id: listing.user_profiles?.id || listing.seller_id,
            name: listing.user_profiles ? `${listing.user_profiles.first_name} ${listing.user_profiles.last_name}` : 'Unknown',
            avatar: listing.user_profiles?.avatar_url || '',
            rating: listing.user_profiles?.rating || 0,
            reviewCount: listing.user_profiles?.total_reviews || 0,
            responseTime: 'Usually responds within an hour',
            joinedDate: listing.user_profiles?.created_at
          },
          seller_id: listing.seller_id, // Keep original seller_id for backend operations
          category: listing.category,
          isPromoted: false,
          views: listing.views || 0,
          favorites: 0,
          messages: 0,
          createdAt: new Date(listing.created_at).getTime(),
          created_at: listing.created_at, // Keep original timestamp
          vehicleYear: listing.vehicle_year,
          vehicleMake: listing.vehicle_make,
          vehicleModel: listing.vehicle_model,
          keyType: listing.key_type,
          transponderType: listing.transponder_type,
        }));
        
        // Append or replace items based on pagination
        if (append) {
          setMarketplaceItems(prev => [...prev, ...transformedListings]);
        } else {
          setMarketplaceItems(transformedListings);
        }
        
        // Update pagination state
        setCurrentPage(page);
        setHasMoreListings(result.pagination?.hasMore || false);
      } else {
        setListingsError(result.error || 'Failed to load listings');
        if (page === 1) {
          toast.error('Failed to load listings');
        }
      }
    } catch (error) {
      setListingsError('Network error');
      if (page === 1) {
        toast.error('Failed to connect to server');
      }
    } finally {
      setIsLoadingListings(false);
      setIsLoadingMore(false);
    }
  };

  // Infinite scroll - load more when user scrolls near bottom
  useEffect(() => {
    if (currentSection !== 'marketplace') return;
    
    const handleScroll = () => {
      // Check if user has scrolled near bottom (80% of page height)
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      const scrolledPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      // Load more when scrolled 80% down and not already loading
      if (scrolledPercentage > 0.8 && hasMoreListings && !isLoadingMore && !isLoadingListings) {
        fetchMarketplaceListings(currentPage + 1, true);
      }
    };
    
    // Add scroll listener with throttling
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  }, [currentSection, currentPage, hasMoreListings, isLoadingMore, isLoadingListings]);

  const handleVehicleSelect = (year: string, make: string, model: string) => {
    setSelectedVehicle({ year, make, model });
    setShowSearchResults(true);
    performSearch(year, make, model);
  };

  const performSearch = async (year?: string, make?: string, model?: string) => {
    setIsSearching(true);
    
    // Save search to history
    if (searchQuery.trim()) {
      LocalStorage.addSearchHistory(searchQuery.trim());
      setSearchHistory(LocalStorage.getSearchHistory());
    }
    
    try {
      // Construct search query
      let query = searchQuery.trim();
      if (!query && year && make && model) {
        query = `${year} ${make} ${model} key`;
      } else if (year && make && model) {
        query = `${year} ${make} ${model} ${query}`;
      }

      // If there's a query, use multi-source search (database + eBay + future sources)
      if (query) {
        // Use the new DealsService search that combines database + eBay
        const result = await DealsService.searchDeals(query, [], true);
        
        if (result.deals && result.deals.length > 0) {
          // Transform deals to SearchResult format
          const transformedResults = result.deals.map((deal: any) => ({
            id: deal.id,
            name: deal.title,
            description: deal.description || '',
            price: typeof deal.price === 'number' ? deal.price : parseFloat(deal.salePrice || deal.price || '0'),
            originalPrice: deal.originalPrice ? (typeof deal.originalPrice === 'number' ? deal.originalPrice : parseFloat(deal.originalPrice)) : undefined,
            image: deal.images?.[0]?.image_url || deal.image || '',
            retailer: {
              name: deal.sourceType === 'ebay' ? 'eBay' : (deal.retailer_profile?.company_name || 'Retailer'),
              website: deal.external_url || '#',
              location: deal.location || 'USA',
            },
            inStock: true,
            productUrl: deal.external_url || '#',
            lastUpdated: 'Just now',
            shipping: deal.shippingCost ? `+$${deal.shippingCost.toFixed(2)} shipping` : (deal.shippingCost === 0 ? 'Free shipping' : undefined),
            dealData: deal.sourceType === 'retailer' ? deal : null, // Include full deal data for database products
          }));

          setSearchResults(transformedResults);
          
          const dbCount = result.deals.filter((d: any) => d.sourceType === 'retailer').length;
          const ebayCount = result.deals.filter((d: any) => d.sourceType === 'ebay').length;
          
          // Show appropriate message based on results
          if (transformedResults.length > 0) {
            if (ebayCount > 0 && dbCount > 0) {
              toast.success(`Found ${transformedResults.length} products`, {
                description: `${dbCount} from retailers, ${ebayCount} from eBay`,
                duration: 3000,
              });
            } else if (ebayCount > 0) {
              toast.success(`Found ${ebayCount} products from eBay`, {
                duration: 3000,
              });
            } else if (dbCount > 0) {
              toast.success(`Found ${dbCount} products from retailers`, {
                description: 'eBay results temporarily unavailable (cached or rate limited)',
                duration: 4000,
              });
            }
          } else {
            toast.info('No products found', {
              description: 'Try a different search term or vehicle',
              duration: 3000,
            });
          }
          
          setIsSearching(false);
          return;
        } else {
          // No products found
        }
      }
      
      // Fallback to mock results if no query or no results
      let filteredResults = mockSearchResults;
      
      if (year && make && model) {
        filteredResults = mockSearchResults.filter(result => 
          result.name.toLowerCase().includes(make.toLowerCase()) ||
          result.name.toLowerCase().includes(year)
        );
      }
      
      if (searchQuery) {
        filteredResults = filteredResults.filter(result =>
          result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setSearchResults(filteredResults);
      
      toast.info(`Showing ${filteredResults.length} sample results`, {
        description: searchQuery || `${year} ${make} ${model}`,
        duration: 2000,
      });
      
    } catch (error) {
      
      // Fallback to mock results on error
      setSearchResults(mockSearchResults);
      
      toast.error('Could not fetch products from Key4.com', {
        description: 'Showing sample results instead',
        duration: 3000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    setShowSearchResults(true);
    if (selectedVehicle) {
      performSearch(selectedVehicle.year, selectedVehicle.make, selectedVehicle.model);
    } else {
      performSearch();
    }
  };

  const clearFilters = () => {
    setSelectedRetailers([]);
    setSortBy("relevance");
    setInStockOnly(false);
  };

  const handleGoHome = () => {
    setSelectedVehicle(null);
    setSearchQuery("");
    setSearchResults(mockSearchResults);
    setShowSearchResults(false);
    setCurrentSection('marketplace');
    clearFilters();
    setPreviousConversationId(null);
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await AuthService.signout();
    setUser(null);
    setCurrentSection('marketplace'); // Redirect to marketplace after logout
    setPreviousConversationId(null);
    
    // Clear all persisted state on logout
    StatePersistence.clearAllState();
  };

  const handleUpdateUser = (userData: any) => {
    setUser(userData);
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleCreateListing = async (listing: any) => {
    if (!user) {
      toast.error('Please sign in to create a listing');
      return;
    }
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      handleAuthRequired();
      return;
    }
    
    try {
      const listingData = {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
        location: listing.location,
        images: listing.images || [],
        vehicleYear: listing.vehicleYear || null,
        vehicleMake: listing.vehicleMake || null,
        vehicleModel: listing.vehicleModel || null,
        keyType: listing.keyType || null,
        transponderType: listing.transponderType || null,
      };
      
      const result = await ListingsService.createListing(accessToken, listingData);
      
      if (result.success && result.listing) {
        toast.success('Listing created successfully!', {
          description: 'Your item is now live on the marketplace',
          duration: 2000,
        });
        // Refresh listings
        fetchMarketplaceListings();
      } else {
        toast.error(result.error || 'Failed to create listing', {
          description: 'Please check all required fields and try again',
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error('Failed to create listing', {
        description: 'An unexpected error occurred',
        duration: 2000,
      });
    }
  };

  const handleEditListing = (listing: any) => {
    if (!user) {
      handleAuthRequired();
      return;
    }
    setEditingListing(listing);
    setShowEditListing(true);
  };

  const handleUpdateListing = async (updatedListing: any) => {
    if (!user) {
      toast.error('Authentication required');
      return;
    }
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }
    
    try {
      const result = await ListingsService.updateListing(accessToken, updatedListing.id, updatedListing);
      
      if (result.success) {
        toast.success('Listing updated successfully!');
        fetchMarketplaceListings(); // Refresh listings
      } else {
        toast.error(result.error || 'Failed to update listing');
      }
    } catch (error) {
      toast.error('Failed to update listing');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!user) {
      toast.error('Authentication required');
      return;
    }
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }
    
    try {
      const result = await ListingsService.deleteListing(accessToken, listingId);
      
      if (result.success) {
        toast.success('Listing deleted');
        fetchMarketplaceListings(); // Refresh listings
      } else {
        toast.error(result.error || 'Failed to delete listing');
      }
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const handleArchiveListing = async (listingId: string) => {
    if (!user) {
      toast.error('Authentication required');
      return;
    }
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }
    
    try {
      const result = await ListingsService.archiveListing(accessToken, listingId);
      
      if (result.success) {
        toast.success('Listing archived successfully');
        fetchMarketplaceListings(); // Refresh listings
      } else {
        toast.error(result.error || 'Failed to archive listing');
      }
    } catch (error) {
      toast.error('Failed to archive listing');
    }
  };

  const handlePromoteListing = (listingId: string) => {
    // Navigate to promote page with the specific listing
    setCurrentSection('promote');
  };

  const handleReport = (listing: any) => {
    if (!user) {
      handleAuthRequired();
      return;
    }
    setReportingListing(listing);
    setShowReportModal(true);
  };

  const handleSubmitReport = (reportData: any) => {
    // In a real app, this would send the report to the backend
    
    // Show success toast
    toast.success("Report submitted", {
      description: "We'll review it and take appropriate action if necessary.",
      duration: 4000,
    });
  };

  const handleUpdateMarketplaceProfile = (profileData: any) => {
    // Update the marketplace profile data (this maintains its own avatar separate from user account)
    setMarketplaceProfile(profileData);
    
    // Update only the relevant fields in the main user data (NOT avatar - marketplace has its own)
    const updatedUser = {
      ...user,
      bio: profileData.bio,
      location: profileData.location,
      website: profileData.website,
      phonePublic: profileData.phonePublic,
      emailPublic: profileData.emailPublic,
      showLastActive: profileData.showLastActive,
      autoReply: profileData.autoReply,
      autoReplyMessage: profileData.autoReplyMessage,
      allowOffers: profileData.allowOffers,
      showcaseVerification: profileData.showcaseVerification
      // Note: avatar is NOT copied - marketplace profile has its own separate avatar
    };
    
    setUser(updatedUser);
  };

  const handleMessage = async (sellerId: string) => {
    if (!user) {
      handleAuthRequired();
      return;
    }
    
    // If we have a selected listing, create/get conversation for it
    if (selectedListing) {
      const accessToken = await AuthService.getFreshToken();
      if (!accessToken) {
        handleAuthRequired();
        return;
      }
      
      try {
        // Get or create conversation with the seller about this listing
        const result = await MessagingService.getOrCreateConversation(
          accessToken,
          selectedListing.id,
          sellerId
        );
        
        if (result.success && result.conversation) {
          // Store the conversation ID so MessagesPage can open it
          setPreviousConversationId(result.conversation.id);
          setPreviousSection('listing');
          setCurrentSection('messages');
        } else {
          toast.error('Failed to start conversation', {
            description: result.error || 'Please try again'
          });
        }
      } catch (error) {
        toast.error('Failed to start conversation');
      }
    } else {
      // Just navigate to messages page
      setCurrentSection('messages');
    }
  };

  const handleFavorite = (itemId: string) => {
    if (!user) {
      handleAuthRequired();
      return;
    }
    
    // Find the listing in marketplace items
    const listing = marketplaceItems.find(item => item.id === itemId);
    if (listing) {
      // Check if already saved
      const isAlreadySaved = savedMarketplaceListings.some(savedListing => savedListing.id === itemId);
      if (isAlreadySaved) {
        // Unsave if already saved
        handleUnsaveMarketplaceListing(itemId);
      } else {
        // Save if not already saved
        handleSaveMarketplaceListing(listing);
      }
    } else {
      // Listing not found
    }
  };

  const handleViewListing = async (listing: any) => {
    // First set the listing to show the page immediately
    setSelectedListing(listing);
    setCurrentSection('listing');
    
    // Then fetch fresh data from backend to increment view count
    try {
      const headers: any = {};
      // Only include Authorization header if user is logged in
      if (user?.accessToken) {
        headers['Authorization'] = `Bearer ${user.accessToken}`;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/listings/${listing.id}`,
        { headers }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.listing) {
          // Transform backend listing to match frontend format
          const transformedListing = {
            ...listing, // Keep all existing frontend fields
            ...data.listing, // Override with backend data
            seller: {
              id: data.listing.user_profiles?.id || data.listing.seller_id,
              name: data.listing.user_profiles ? 
                `${data.listing.user_profiles.first_name} ${data.listing.user_profiles.last_name}` : 
                listing.seller?.name || 'Unknown',
              avatar: data.listing.user_profiles?.avatar_url || listing.seller?.avatar || '',
              rating: data.listing.user_profiles?.rating || listing.seller?.rating || 0,
              reviewCount: data.listing.user_profiles?.total_reviews || listing.seller?.reviewCount || 0,
              responseTime: listing.seller?.responseTime || 'Usually responds within an hour',
              joinedDate: data.listing.user_profiles?.created_at || listing.seller?.joinedDate
            },
            // Update view count
            views: data.listing.views
          };
          
          // Update the listing with fresh data including incremented view count
          setSelectedListing(transformedListing);
          
          // Also update the listing in the marketplace items array
          setMarketplaceItems(prevItems => 
            prevItems.map(item => 
              item.id === data.listing.id ? { ...item, views: data.listing.views } : item
            )
          );
        }
      } else {
        // Failed to fetch listing details
      }
    } catch (error) {
      // Error fetching listing details
      // Keep showing the original listing data if fetch fails
    }
  };

  const handleViewProfile = (userId: string, sourceContext?: { section: string; conversationId?: string }) => {
    setSelectedUserId(userId);
    
    // Track where the user came from
    if (sourceContext) {
      setPreviousSection(sourceContext.section);
      setPreviousConversationId(sourceContext.conversationId || null);
    } else {
      setPreviousSection(currentSection);
      setPreviousConversationId(null);
    }
    
    setCurrentSection('profile');
  };

  const handleViewUserListings = (userId: string) => {
    // In a real app, this would filter listings by user
    setCurrentSection('marketplace');
  };

  const handleViewSellerListings = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setCurrentSection('seller-listings');
  };

  // Saved Items Handlers
  const handleSaveItem = async (item: any) => {
    if (!user) {
      handleAuthRequired();
      return;
    }
    
    // Check if item is already saved
    const isAlreadySaved = savedItems.some(savedItem => savedItem.id === item.id);
    if (isAlreadySaved) {
      toast.info('Item already in your saved items');
      return;
    }
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      handleAuthRequired();
      return;
    }
    
    try {
      const result = await SavedItemsService.saveItem(accessToken, item.id, 'product', item);
      
      if (result.success) {
        // Add timestamp when saved
        const itemWithSaveData = {
          ...item,
          savedAt: Date.now()
        };
        
        setSavedItems(prev => [itemWithSaveData, ...prev]);
        toast.success('Item saved!', {
          description: 'Added to your saved items',
          duration: 2000,
        });
      } else {
        toast.error(result.error || 'Failed to save item');
      }
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleUnsaveItem = async (itemId: string) => {
    if (!user) {
      return;
    }
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      return;
    }
    
    try {
      const result = await SavedItemsService.removeSavedItem(accessToken, itemId, 'product');
      
      if (result.success) {
        setSavedItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Item removed from saved');
      } else {
        toast.error(result.error || 'Failed to remove saved item');
      }
    } catch (error) {
      toast.error('Failed to remove saved item');
    }
  };

  const handleClearAllSaved = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please sign in to clear saved items');
      return;
    }

    try {
      // Delete all saved items (products) from database
      const deletePromises = savedItems.map(item => 
        SavedItemsService.removeSavedItem(accessToken, item.id, 'product')
      );
      
      await Promise.all(deletePromises);
      
      // Clear local state
      setSavedItems([]);
      toast.success('All saved items cleared');
    } catch (error) {
      toast.error('Failed to clear some saved items');
    }
  };

  // Deal Modal Handlers
  const handleViewDealProduct = (result: any) => {
    // Only open modal for database deals, not external API results
    if (result.dealData) {
      setSelectedDealForModal(result.dealData);
    }
  };

  const handleCloseDealModal = () => {
    setSelectedDealForModal(null);
  };

  const handleSaveDealFromModal = async (dealId: string) => {
    if (!user) {
      handleAuthRequired();
      return;
    }
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      handleAuthRequired();
      return;
    }
    
    try {
      const isAlreadySaved = savedItems.some(item => item.id === dealId);
      
      if (isAlreadySaved) {
        // Unsave
        const result = await SavedItemsService.removeSavedItem(accessToken, dealId, 'product');
        if (result.success) {
          setSavedItems(prev => prev.filter(item => item.id !== dealId));
          toast.success('Deal removed from saved');
        }
      } else {
        // Save - find the deal in search results to get full data
        const dealInResults = searchResults.find((r: any) => r.id === dealId);
        if (dealInResults && dealInResults.dealData) {
          const result = await SavedItemsService.saveItem(accessToken, dealId, 'product', dealInResults);
          if (result.success) {
            setSavedItems(prev => [{...dealInResults, savedAt: Date.now()}, ...prev]);
            toast.success('Deal saved!');
          }
        }
      }
    } catch (error) {
      toast.error('Failed to update saved status');
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff < 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const calculateDiscount = (price: number, originalPrice: number) => {
    const discount = ((originalPrice - price) / originalPrice) * 100;
    return Math.round(discount);
  };

  // Marketplace Listing Save/Unsave Handlers
  const handleSaveMarketplaceListing = async (listing: any) => {
    if (!user) {
      handleAuthRequired();
      return;
    }
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      handleAuthRequired();
      return;
    }
    
    try {
      const result = await SavedItemsService.saveItem(accessToken, listing.id, 'listing', listing);
      
      if (result.success) {
        // Add to local state
        const listingWithSaveData = {
          ...listing,
          savedAt: Date.now()
        };
        setSavedMarketplaceListings(prev => [listingWithSaveData, ...prev]);
        
        toast.success('Listing saved!', {
          description: 'Added to your saved marketplace listings',
          duration: 2000,
        });
      } else if (result.alreadySaved) {
        toast.info('Listing already in your saved items');
      } else {
        toast.error(result.error || 'Failed to save listing');
      }
    } catch (error) {
      toast.error('Failed to save listing');
    }
  };

  const handleUnsaveMarketplaceListing = async (listingId: string) => {
    if (!user) {
      handleAuthRequired();
      return;
    }
    
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      handleAuthRequired();
      return;
    }
    
    try {
      const result = await SavedItemsService.removeSavedItem(accessToken, listingId, 'listing');
      
      if (result.success) {
        setSavedMarketplaceListings(prev => prev.filter(listing => listing.id !== listingId));
        toast.success('Listing removed from saved');
      } else {
        toast.error(result.error || 'Failed to remove saved listing');
      }
    } catch (error) {
      toast.error('Failed to remove saved listing');
    }
  };

  const handleClearAllSavedMarketplaceListings = async () => {
    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      toast.error('Please sign in to clear saved listings');
      return;
    }

    try {
      // Delete all saved marketplace listings from database
      const deletePromises = savedMarketplaceListings.map(listing => 
        SavedItemsService.removeSavedItem(accessToken, listing.id, 'listing')
      );
      
      await Promise.all(deletePromises);
      
      // Clear local state
      setSavedMarketplaceListings([]);
      toast.success('All saved marketplace listings cleared');
    } catch (error) {
      toast.error('Failed to clear some saved listings');
    }
  };

  // Apply filters to search results
  const filteredResults = searchResults.filter(result => {
    // Retailer filter
    if (selectedRetailers.length > 0) {
      if (!selectedRetailers.includes(result.retailer.name)) return false;
    }
    
    // Stock filter
    if (inStockOnly && !result.inStock) return false;
    
    return true;
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "updated":
        return a.lastUpdated === "30 minutes ago" ? -1 : 1;
      default:
        return 0;
    }
  });

  // Filter and sort marketplace items
  const filteredMarketplaceItems = marketplaceItems.filter(item => {
    // Search filter
    if (marketplaceSearch) {
      const searchLower = marketplaceSearch.toLowerCase();
      if (!item.title.toLowerCase().includes(searchLower) && 
          !item.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      if (item.category !== selectedCategory) return false;
    }

    // Condition filter
    if (selectedCondition && selectedCondition !== "all") {
      if (item.condition !== selectedCondition) return false;
    }

    // Note: Location/radius filtering is now handled by the backend with proper geocoding
    // No need to filter again on the frontend

    return true;
  });

  const sortedMarketplaceItems = [...filteredMarketplaceItems].sort((a, b) => {
    switch (marketplaceSortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "distance":
        // Mock distance sorting
        return a.location.localeCompare(b.location);
      case "popular":
        return (b.seller.rating || 0) - (a.seller.rating || 0);
      case "random":
        // Keep backend random order, no need to re-sort
        return 0;
      case "newest":
        // Use timestamps for proper chronological ordering, with fallback to item ID for older items
        const aTime = a.createdAt || parseInt(a.id) || 0;
        const bTime = b.createdAt || parseInt(b.id) || 0;
        return bTime - aTime; // Most recent first
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pb-16">
      {/* Deal Modal for database products */}
      {selectedDealForModal && (
        <DealModal
          deal={selectedDealForModal}
          isSaved={savedItems.some(item => item.id === selectedDealForModal.id)}
          onSave={handleSaveDealFromModal}
          onClose={handleCloseDealModal}
          formatTimeRemaining={formatTimeRemaining}
          calculateDiscount={calculateDiscount}
          isLoggedIn={!!user}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600/90 via-blue-500/85 to-indigo-600/90 dark:from-gray-800 dark:via-gray-900 dark:to-black backdrop-blur-xl text-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-b border-white/20 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5 pointer-events-none"></div>
        <div className="container mx-auto px-4 py-4 relative">
          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="flex items-center justify-between gap-3">
              {/* Logo */}
              <div 
                className="text-blue-400 font-bold text-2xl leading-tight flex-shrink-0"
              >
                LM
              </div>
              
              {/* Mobile Navigation Buttons */}
              <div className="flex items-center gap-1.5 justify-center">
                {/* Marketplace */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentSection('marketplace');
                  }}
                  className={`flex flex-col items-center justify-center h-12 w-16 rounded-lg transition-all duration-300 ${
                    currentSection === 'marketplace' ? 'text-white bg-white/25 shadow-md border border-white/40' : 'text-white/90 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Store className="h-5 w-5 mb-1" />
                  <span className="text-xs font-bold leading-tight">Market</span>
                </Button>

                {/* Messages */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!user) {
                      handleAuthRequired();
                      return;
                    }
                    setCurrentSection('messages');
                  }}
                  className={`flex flex-col items-center justify-center h-12 w-16 rounded-lg relative transition-all duration-300 ${
                    currentSection === 'messages' ? 'text-white bg-white/25 shadow-md border border-white/40' : 'text-white/90 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <MessageCircle className="h-5 w-5 mb-1" />
                  <span className="text-xs font-bold leading-tight">Messages</span>
                  {unreadMessagesCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] bg-red-500 text-white shadow-lg ring-2 ring-white/30 flex items-center justify-center">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </Badge>
                  )}
                </Button>

                {/* Deals */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentSection('deals');
                  }}
                  className={`flex flex-col items-center justify-center h-12 w-16 rounded-lg transition-all duration-300 ${
                    currentSection === 'deals' ? 'text-white bg-white/25 shadow-md border border-white/40' : 'text-white/90 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Tag className="h-5 w-5 mb-1" />
                  <span className="text-xs font-bold leading-tight">Deals</span>
                </Button>

                {/* Hub */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentSection('hub');
                  }}
                  className={`flex flex-col items-center justify-center h-12 w-16 rounded-lg transition-all duration-300 ${
                    currentSection === 'hub' ? 'text-white bg-white/25 shadow-md border border-white/40' : 'text-white/90 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Compass className="h-5 w-5 mb-1" />
                  <span className="text-xs font-bold leading-tight">Hub</span>
                </Button>
              </div>

              {/* Mobile User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={`text-white hover:bg-white/20 hover:shadow-lg p-3 rounded-xl flex-shrink-0 backdrop-blur-sm border transition-all duration-300 ${
                        unreadNotificationsCount > 0 
                          ? 'border-red-500 ring-2 ring-red-500/50 hover:border-red-400' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-white/40 shadow-md">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium text-xs">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
                    <DropdownMenuItem onClick={() => {
                      setCurrentSection('account');
                    }}>
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setCurrentSection('account');
                    }}>
                      <Heart className="h-4 w-4 mr-2" />
                      Saved Items
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setCurrentSection('messages');
                    }}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setCurrentSection('settings');
                    }}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    {isAdminUser(user) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setCurrentSection('admin');
                        }}>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      handleLogout();
                    }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="bg-white/95 text-gray-700 border-white/40 hover:bg-white hover:shadow-lg text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-300 flex flex-col leading-none h-auto"
                >
                  <span>Sign</span>
                  <span>In</span>
                </Button>
              )}
            </div>
          </div>

          {/* Desktop/Tablet Header */}
          <div className="hidden md:block">
            {/* First Row - Always visible on desktop/tablet */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <button 
                  onClick={() => {
                    handleGoHome();
                  }}
                  className="hover:opacity-95 transition-all duration-300 hover:scale-105 text-white font-semibold text-lg leading-tight hover:bg-white/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] rounded-2xl px-4 py-2.5 flex-shrink-0 backdrop-blur-sm border border-white/10 hover:border-white/30 shadow-md"
                >
                  <div>Locksmith</div>
                  <div>Marketplace</div>
                </button>
                
                {/* Desktop Navigation Buttons */}
                <div className="flex items-center justify-center space-x-8 flex-1">
                  {/* HIDDEN: Retailers button temporarily hidden */}
                  {false && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleGoHome();
                    }}
                    className={`text-white hover:bg-white/20 hover:shadow-lg rounded-xl px-4 py-2 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 ${
                      currentSection === 'retailers' ? 'bg-white/25 shadow-md border-white/30' : ''
                    }`}
                  >
                    <span className="hidden lg:inline">Retailers</span>
                    <span className="lg:hidden">Retail</span>
                  </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCurrentSection('deals');
                      setPreviousConversationId(null);
                    }}
                    className={`text-white hover:bg-white/20 hover:shadow-lg rounded-xl px-4 py-2 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 ${
                      currentSection === 'deals' ? 'bg-white/25 shadow-md border-white/30' : ''
                    }`}
                  >
                    <span className="hidden lg:inline">Deals</span>
                    <span className="lg:hidden">Deals</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCurrentSection('marketplace');
                      setPreviousConversationId(null);
                    }}
                    className={`text-white hover:bg-white/20 hover:shadow-lg rounded-xl px-4 py-2 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 ${
                      currentSection === 'marketplace' ? 'bg-white/25 shadow-md border-white/30' : ''
                    }`}
                  >
                    <span className="hidden lg:inline">Marketplace</span>
                    <span className="lg:hidden">Market</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCurrentSection('hub');
                      setPreviousConversationId(null);
                    }}
                    className={`text-white hover:bg-white/20 hover:shadow-lg rounded-xl px-4 py-2 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 ${
                      currentSection === 'hub' ? 'bg-white/25 shadow-md border-white/30' : ''
                    }`}
                  >
                    <span className="hidden lg:inline">Hub</span>
                    <span className="lg:hidden">Hub</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (!user) {
                        handleAuthRequired();
                        return;
                      }
                      setCurrentSection('messages');
                      setPreviousConversationId(null);
                    }}
                    className={`text-white hover:bg-white/20 hover:shadow-lg rounded-xl px-4 py-2 transition-all duration-300 relative backdrop-blur-sm border border-transparent hover:border-white/20 ${
                      currentSection === 'messages' ? 'bg-white/25 shadow-md border-white/30' : ''
                    }`}
                  >
                    <span className="hidden lg:inline">Messages</span>
                    <span className="lg:hidden">Msgs</span>
                    {user && unreadMessagesCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-md">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* User Menu - positioned at the end */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={`flex items-center space-x-2 text-white hover:bg-white/20 hover:shadow-lg backdrop-blur-sm rounded-2xl px-4 py-2.5 transition-all duration-300 ml-4 flex-shrink-0 border shadow-md ${
                        unreadNotificationsCount > 0 
                          ? 'border-red-500 ring-2 ring-red-500/50 hover:border-red-400' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-white/40 shadow-md">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left lg:block md:hidden">
                        <div className="text-sm font-medium">Hi, {user.firstName}</div>
                        <div className="text-xs text-white/80">View Account</div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
                    <DropdownMenuItem onClick={() => {
                      setCurrentSection('account');
                      setPreviousConversationId(null);
                    }}>
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setCurrentSection('account');
                      setPreviousConversationId(null);
                    }}>
                      <Heart className="h-4 w-4 mr-2" />
                      Saved Items
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setCurrentSection('messages');
                      setPreviousConversationId(null);
                    }}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setCurrentSection('settings');
                      setPreviousConversationId(null);
                    }}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    {isAdminUser(user) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setCurrentSection('admin');
                          setPreviousConversationId(null);
                        }}>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      handleLogout();
                    }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAuthModal(true);
                    }}
                    className="bg-white/95 backdrop-blur-md text-blue-700 hover:bg-white border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] rounded-2xl px-5 py-2.5 font-medium transition-all duration-300 hover:scale-105"
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Vehicle Selector - HIDDEN: Not currently in use */}
        {/* <div className="md:hidden">
          {(currentSection === 'retailers' || currentSection === 'search' || showSearchResults) && !['messages', 'account', 'listing', 'settings', 'profile', 'help', 'seller-listings', 'promote', 'contact', 'privacy', 'terms', 'saved-items', 'saved-marketplace-listings', 'saved-deals', 'archived-listings', 'admin', 'retailer-dashboard', 'my-retailer-deals'].includes(currentSection) && (
            <VehicleSelector onVehicleSelect={handleVehicleSelect} />
          )}
        </div> */}

        {/* Messages Page */}
        {currentSection === 'messages' && (
          <MessagesPage 
            onBack={() => setCurrentSection('marketplace')}
            onViewProfile={handleViewProfile}
            onViewListings={handleViewUserListings}
            onViewListing={handleViewListing}
            initialConversationId={previousConversationId}
          />
        )}

        {/* Account Page */}
        {currentSection === 'account' && (
          <AccountPage 
            user={user}
            onBack={() => setCurrentSection('marketplace')}
            onUpdateUser={handleUpdateUser}
            onViewProfile={handleViewProfile}
            onNavigateToRetailer={() => setCurrentSection('retailer-dashboard')}
            onLogout={handleLogout}
            onNotificationRead={async () => {
              // Reload notification count after marking as read
              try {
                const accessToken = localStorage.getItem('sb-access-token');
                if (!accessToken) return;

                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/notifications/unread-count`,
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                );

                const data = await response.json();
                if (data.success) {
                  setUnreadNotificationsCount(data.count || 0);
                }
              } catch (error) {
                // Error refreshing notification count
              }
            }}
          />
        )}

        {/* Deals Page */}
        {currentSection === 'deals' && (
          <DealsPage 
            onNavigateToAdmin={() => setCurrentSection('admin')}
            onNavigateToRetailerDeals={() => setCurrentSection('my-retailer-deals')}
            onNavigateToSavedDeals={() => setCurrentSection('saved-deals')}
            currentUser={user}
          />
        )}

        {/* Hub Section */}
        {currentSection === 'hub' && (
          <HubSection
            onBack={() => setCurrentSection('marketplace')}
            user={user}
            onAuthRequired={handleAuthRequired}
          />
        )}

        {/* My Retailer Deals (Dashboard) */}
        {currentSection === 'my-retailer-deals' && (
          <MyRetailerDealsPage
            user={user}
            onBack={() => setCurrentSection('deals')}
            onNavigateToProfile={() => setCurrentSection('retailer-dashboard')}
          />
        )}

        {/* Retailer Dashboard (Profile) */}
        {currentSection === 'retailer-dashboard' && (
          <RetailerDashboardPage
            user={user}
            onBack={() => setCurrentSection('my-retailer-deals')}
            onManageDeals={() => setCurrentSection('my-retailer-deals')}
          />
        )}

        {/* Listing Page */}
        {currentSection === 'listing' && selectedListing && (
          <ListingPage
            listing={selectedListing}
            currentUser={user}
            onBack={() => setCurrentSection('marketplace')}
            onMessage={handleMessage}
            onFavorite={handleFavorite}
            onViewListing={handleViewListing}
            onViewSellerListings={handleViewSellerListings}
            onViewProfile={handleViewProfile}
            onAuthRequired={handleAuthRequired}
            onReport={handleReport}
            isLoggedIn={!!user}
            similarListings={marketplaceItems.filter(item => 
              item.id !== selectedListing.id && 
              item.category === selectedListing.category
            )}
            isSaved={savedMarketplaceListings.some(savedListing => savedListing.id === selectedListing.id)}
          />
        )}

        {/* Settings Page */}
        {currentSection === 'settings' && (
          <SettingsPage
            user={user}
            onBack={() => setCurrentSection('marketplace')}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {/* Admin Page */}
        {currentSection === 'admin' && isAdminUser(user) && (
          <AdminPage
            onBack={() => setCurrentSection('marketplace')}
          />
        )}

        {/* User Profile Page */}
        {currentSection === 'profile' && selectedUserId && (
          <UserProfilePage
            userId={selectedUserId}
            currentUserId={user?.id}
            onBack={() => {
              if (previousSection === 'messages') {
                // Return to the specific conversation in messages
                setCurrentSection('messages');
                // The conversation will be restored via initialConversationId prop
              } else if (previousSection) {
                setCurrentSection(previousSection as any);
                // Clear conversation context since we're not going back to messages
                setPreviousConversationId(null);
              } else {
                setCurrentSection('marketplace');
                setPreviousConversationId(null);
              }
              // Clear the previous section tracking
              setPreviousSection(null);
            }}
            onMessage={handleMessage}
            onViewListing={handleViewListing}
            onFavorite={handleFavorite}
            onAuthRequired={handleAuthRequired}
            isLoggedIn={!!user}
            accessToken={user?.accessToken}
            onEditListing={handleEditListing}
            onDeleteListing={handleDeleteListing}
            onArchiveListing={handleArchiveListing}
            onPromoteListing={handlePromoteListing}
          />
        )}

        {/* Help & Support Page */}
        {currentSection === 'help' && (
          <HelpSupportPage
            onBack={() => setCurrentSection('marketplace')}
          />
        )}

        {/* Seller Listings Page */}
        {currentSection === 'seller-listings' && selectedSellerId && (
          <SellerListingsPage
            seller={(() => {
              // Find the seller from marketplace items
              const sellerItem = marketplaceItems.find(item => item.seller.id === selectedSellerId);
              if (sellerItem) {
                return {
                  ...sellerItem.seller,
                  location: sellerItem.location,
                  joinedDate: "March 2023",
                  totalSales: 0, // RESET: No mock data
                  isVerified: true
                };
              }
              // Fallback seller data if not found
              return {
                id: selectedSellerId,
                name: "Unknown Seller",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                rating: 0,
                responseTime: "Unknown",
                location: "Unknown",
                joinedDate: "Unknown",
                totalSales: 0,
                isVerified: false
              };
            })()}
            listings={marketplaceItems.filter(item => item.seller.id === selectedSellerId)}
            onBack={() => setCurrentSection('listing')}
            onMessage={handleMessage}
            onFavorite={handleFavorite}
            onViewListing={handleViewListing}
            onAuthRequired={handleAuthRequired}
            isLoggedIn={!!user}
          />
        )}

        {/* Promote Page */}
        {currentSection === 'promote' && (
          <PromotePage
            user={user}
            onBack={() => setCurrentSection('account')}
            userListings={marketplaceItems.filter(item => user && item.seller.id === user.id)}
            onViewListing={handleViewListing}
            onEditListing={handleEditListing}
          />
        )}

        {/* Saved Items Page */}
        {currentSection === 'saved-items' && user && (
          <SavedItemsPage
            user={user}
            savedItems={savedItems}
            onBack={() => setCurrentSection('marketplace')}
            onUnsaveItem={handleUnsaveItem}
            onClearAllSaved={handleClearAllSaved}
          />
        )}

        {/* Saved Marketplace Listings Page */}
        {currentSection === 'saved-marketplace-listings' && user && (
          <SavedMarketplaceListingsPage
            user={user}
            savedListings={savedMarketplaceListings}
            onBack={() => setCurrentSection('marketplace')}
            onUnsaveListing={handleUnsaveMarketplaceListing}
            onClearAllSaved={handleClearAllSavedMarketplaceListings}
            onMessage={handleMessage}
            onFavorite={handleFavorite}
            onViewListing={handleViewListing}
            onViewProfile={handleViewProfile}
            onAuthRequired={handleAuthRequired}
            onEditListing={handleEditListing}
            onDeleteListing={handleDeleteListing}
            onArchiveListing={handleArchiveListing}
            onPromoteListing={handlePromoteListing}
          />
        )}

        {/* Saved Deals Page */}
        {currentSection === 'saved-deals' && (
          <SavedDealsPage
            onBack={() => setCurrentSection('deals')}
            onAuthRequired={handleAuthRequired}
          />
        )}

        {/* Archived Listings Page */}
        {currentSection === 'archived-listings' && user && (
          <ArchivedListingsPage
            user={user}
            onBack={() => setCurrentSection('marketplace')}
            onViewListing={handleViewListing}
          />
        )}

        {/* Contact Page */}
        {currentSection === 'contact' && (
          <ContactPage
            onBack={() => setCurrentSection('marketplace')}
          />
        )}

        {/* Privacy Policy Page */}
        {currentSection === 'privacy' && (
          <PrivacyPolicyPage
            onBack={() => setCurrentSection('marketplace')}
          />
        )}

        {/* Terms of Service Page */}
        {currentSection === 'terms' && (
          <TermsOfServicePage
            onBack={() => setCurrentSection('marketplace')}
          />
        )}

        {/* Marketplace Profile Page */}
        {currentSection === 'marketplace-profile' && user && (
          <MarketplaceProfilePage
            user={user}
            marketplaceProfile={marketplaceProfile}
            listings={marketplaceItems}
            onBack={() => setCurrentSection('marketplace')}
            onMessage={handleMessage}
            onFavorite={handleFavorite}
            onViewListing={handleViewListing}
            onAuthRequired={handleAuthRequired}
            onUpdateMarketplaceProfile={handleUpdateMarketplaceProfile}
            isLoggedIn={!!user}
            onCreateListing={() => {
              if (!user) {
                handleAuthRequired();
                return;
              }
              setShowCreateListing(true);
            }}
            onEditListing={handleEditListing}
            onDeleteListing={handleDeleteListing}
            onArchiveListing={handleArchiveListing}
            onPromoteListing={handlePromoteListing}
            onNavigateToArchive={() => setCurrentSection('archived-listings')}
          />
        )}

        {/* Main Content */}
        {!['messages', 'account', 'listing', 'settings', 'profile', 'help', 'seller-listings', 'promote', 'contact', 'privacy', 'terms', 'marketplace-profile', 'saved-items', 'saved-marketplace-listings', 'saved-deals', 'archived-listings', 'admin', 'retailer-dashboard', 'my-retailer-deals', 'hub', 'deals'].includes(currentSection) && (
          <div className="w-full pt-0 pb-8 flex-1">
            {/* Marketplace Section */}
            {currentSection === 'marketplace' && (
              <div className="w-full">
                {/* Promotional Banner - From Admin Panel */}
                <div className="w-full">
                  <AdminPromotionalBanners />
                </div>

                {/* Marketplace Header */}
                <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
                  <div className="flex items-center space-x-3">
                    <h1 className="hidden md:block text-2xl font-semibold text-gray-900 dark:text-white">Marketplace</h1>
                  </div>
                </div>

                {/* Marketplace Filters */}
                <div className="container mx-auto px-4 mb-6">
                  <MarketplaceFilters
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedCondition={selectedCondition}
                    setSelectedCondition={setSelectedCondition}
                    sortBy={marketplaceSortBy}
                    setSortBy={setMarketplaceSortBy}
                    zipCode={zipCode}
                    setZipCode={setZipCode}
                    radius={radius}
                    setRadius={setRadius}
                    searchQuery={marketplaceSearch}
                    setSearchQuery={setMarketplaceSearch}
                    handleSearch={handleSearch}
                    isSearching={isSearching}
                    currentSection={currentSection}
                    onAddListing={() => {
                      if (!user) {
                        handleAuthRequired();
                        return;
                      }
                      setShowCreateListing(true);
                    }}
                  />
                </div>

                {/* Marketplace Grid */}
                <div className="container mx-auto px-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {sortedMarketplaceItems.length} items
                    </span>
                    {user && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentSection('saved-marketplace-listings');
                          }}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Saved ({savedMarketplaceListings.length})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentSection('marketplace-profile');
                          }}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          My profile
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 -mx-4 md:mx-0 md:grid-cols-5 md:gap-4">
                    {isLoadingListings ? (
                      // Show skeleton loaders while loading
                      Array.from({ length: 10 }).map((_, index) => (
                        <MarketplaceCardSkeleton key={index} />
                      ))
                    ) : (
                      sortedMarketplaceItems.map((item) => (
                        <MarketplaceCard
                          key={item.id}
                          item={item}
                          onMessage={handleMessage}
                          onFavorite={handleFavorite}
                          onViewListing={handleViewListing}
                          onViewProfile={handleViewProfile}
                          isLoggedIn={!!user}
                          onAuthRequired={handleAuthRequired}
                          currentUser={user}
                          onPromote={handlePromoteListing}
                          onEditListing={handleEditListing}
                          onDeleteListing={handleDeleteListing}
                          onArchiveListing={handleArchiveListing}
                          isSaved={savedMarketplaceListings.some(savedListing => savedListing.id === item.id)}
                        />
                      ))
                    )}
                  </div>

                  {/* Loading more indicator */}
                  {isLoadingMore && (
                    <div className="flex justify-center items-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-gray-600">Loading more listings...</p>
                      </div>
                    </div>
                  )}

                  {/* End of listings indicator */}
                  {!isLoadingListings && !isLoadingMore && !hasMoreListings && sortedMarketplaceItems.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">You've reached the end of the listings</p>
                    </div>
                  )}

                  {!isLoadingListings && sortedMarketplaceItems.length === 0 && (
                    <div className="text-center py-12">
                      <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No items found</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Try adjusting your search criteria or filters
                      </p>
                      <Button 
                        onClick={() => {
                          setSelectedCategory("all");
                          setSelectedCondition("all");
                          setZipCode("");
                          setRadius(25);
                          setMarketplaceSearch("");
                        }}
                        variant="outline"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Search Results Section */}
            {showSearchResults && currentSection !== 'marketplace' && (
              <div className="container mx-auto px-4 space-y-6">
                {/* Search Info */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedVehicle 
                        ? `Keys for ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
                        : searchQuery 
                          ? `Search results for: ${searchQuery}`
                          : "All automotive keys"
                      }
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {(() => {
                        const ebayCount = sortedResults.filter(r => r.retailer.name === 'eBay').length;
                        const retailerCount = sortedResults.length - ebayCount;
                        if (ebayCount > 0 && retailerCount > 0) {
                          return `${sortedResults.length} results found (${retailerCount} from retailers, ${ebayCount} from eBay)`;
                        } else if (ebayCount > 0) {
                          return `${sortedResults.length} results found from eBay`;
                        } else {
                          return `${sortedResults.length} results found from retailers`;
                        }
                      })()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentSection('saved-items');
                        }}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Saved
                      </Button>
                    )}
                    <Button onClick={() => {
                      handleGoHome();
                    }} variant="outline">
                      ← Back to Marketplace
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <SearchFilters
                  selectedRetailers={selectedRetailers}
                  setSelectedRetailers={setSelectedRetailers}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                />

                {/* Search Results */}
                {isSearching ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SearchResultSkeleton key={i} />
                    ))}
                  </div>
                ) : sortedResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {sortedResults.map((result) => (
                      <SearchResultCard 
                        key={result.id} 
                        result={result}
                        onSaveItem={handleSaveItem}
                        isSaved={savedItems.some(item => item.id === result.id)}
                        isLoggedIn={!!user}
                        onAuthRequired={handleAuthRequired}
                        onViewProduct={handleViewDealProduct}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button onClick={() => {
                      clearFilters();
                    }} variant="outline">
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Promotional Retailers Section */}
            {/* HIDDEN: Retailers page temporarily hidden */}
            {false && !showSearchResults && currentSection === 'retailers' && (
              <DynamicRetailersPage
                user={user}
                savedItemsCount={savedItems.length}
                onNavigateToSaved={() => setCurrentSection('saved-items')}
              />
            )}

            {/* OLD HARDCODED RETAILERS SECTION - REPLACED WITH DYNAMIC COMPONENT ABOVE */}
            {false && !showSearchResults && currentSection === 'retailers' && (
              <div className="w-full">
                {/* Retailers Header */}
                <div className="container mx-auto px-4 flex justify-end mt-6 mb-8">
                  {user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentSection('saved-items');
                      }}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      Saved ({savedItems.length})
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-col gap-6 md:gap-6">
                  {/* 1. KEY4 Deals - With banners */}
                  <PromotionalBlock
                    retailerName="KEY4"
                    retailerWebsite="key4.com"
                    backgroundColor="bg-gradient-to-br from-blue-50 to-blue-100"
                    accentColor="bg-blue-600"
                    deals={[
                      {
                        id: "1",
                        title: "Xhorse Mega Sale",
                        description: "Universal Key Blades, Wire Remotes, Wireless Remotes, Smart Prox Remotes, XM38 Remotes, Super Chip XT27A01, Adapters, Tools & Devices - UP TO 40% OFF",
                        image: xhorseMegaSaleBanner,
                        originalPrice: "$29.99",
                        salePrice: "$0.39"
                      },
                      {
                        id: "2",
                        title: "Xhorse Professional Tools",
                        description: "Xhorse XP-005L Dolphin II Key Cutting Machine $1699 & Xhorse VVDI Key Tool Plus Full Version $1799 - Limited Quantity Available",
                        image: xhorseToolsBanner,
                        originalPrice: "$1799.00",
                        salePrice: "$1699.00"
                      }
                    ]}
                  />

                  {/* 2. UHS Hardware Deals - Fall Smart Pro Promotions & Locktoberfest */}
                  <PromotionalBlock
                    retailerName="UHS Hardware"
                    retailerWebsite="uhs-hardware.com"
                    backgroundColor="bg-gradient-to-br from-blue-50 to-blue-100"
                    accentColor="bg-blue-600"
                    deals={[
                      {
                        id: "uhs1",
                        title: "Fall Smart Pro Promotions",
                        description: "Smart Pro Ford Bundle with 6 Months UTP - Buy Outright $2,950 or Trade Up with 1 Year UTP & Autel Programmer Exchange",
                        image: uhsSmartProBanner,
                        originalPrice: "$3,500.00",
                        salePrice: "$2,950.00"
                      },
                      {
                        id: "uhs2",
                        title: "Locktoberfest 2025",
                        description: "Celebrate Locktoberfest and raise a stein to big savings all week long! Up to 25% off Keyless Factory Smart Keys, 20% off Combo Locksets & Access Control, 15% off Key Blanks",
                        image: uhsLocktoberfestBanner,
                        originalPrice: "25% OFF",
                        salePrice: "KEYLESS FACTORY"
                      }
                    ]}
                  />

                  {/* 3. YCKG Deals - Hyundai/KIA/Genesis Smart Keys */}
                  <PromotionalBlock
                    retailerName="YCKG"
                    retailerWebsite="yckg.com"
                    backgroundColor="bg-gradient-to-br from-blue-50 to-blue-100"
                    accentColor="bg-blue-600"
                    deals={[
                      {
                        id: "yckg1",
                        title: "YCKG#3035 24-25 Sonata",
                        description: "2024-2025 Hyundai Sonata OEM Unlocked Smart Key - Stop paying MSRP! Get genuine OEM quality at unbeatable prices",
                        image: yckgSonataBanner,
                        originalPrice: "$400.00+",
                        salePrice: "$50.00"
                      },
                      {
                        id: "yckg2",
                        title: "Hyundai/KIA/Genesis Smart Keys",
                        description: "STOP PAYING MSRP for OEM Hyundai, KIA, and Genesis Smart Keys - Huge stock on desirable part numbers at the best prices. Multiple models available with massive savings",
                        image: yckgHyundaiKiaBanner,
                        originalPrice: "UP TO $400+",
                        salePrice: "FROM $49"
                      }
                    ]}
                  />

                  {/* 4. Transponder Island Deals - NEW OEM Refurbished Keys */}
                  <PromotionalBlock
                    retailerName="Transponder Island"
                    retailerWebsite="transponderisland.com"
                    backgroundColor="bg-gradient-to-br from-orange-50 to-orange-100"
                    accentColor="bg-orange-600"
                    deals={[
                      {
                        id: "transponder1",
                        title: "NEW OEM Refurbished Keys Available",
                        description: "Professional refurbished OEM keys with quality guarantee. Multiple key types and vehicle compatibility available. Click here to see full list of available inventory.",
                        image: transponderIslandBanner,
                        originalPrice: "SEE FULL",
                        salePrice: "LIST"
                      }
                    ]}
                  />

                  {/* 5. Car & Truck Remotes Deals - Fall Time Special */}
                  <PromotionalBlock
                    retailerName="Car & Truck Remotes"
                    retailerWebsite="cartruckremotes.com"
                    backgroundColor="bg-gradient-to-br from-orange-50 to-red-50"
                    accentColor="bg-orange-600"
                    deals={[
                      {
                        id: "cartruckremotes1",
                        title: "Fall Time Special - BUY 1, GET 1",
                        description: "25% OFF ON ALL AFTERMARKET REMOTES AND KEYS - Limited time fall promotion with Buy 1, Get 1 deals on aftermarket remotes and automotive keys. Shop now for best selection!",
                        image: carTruckRemotesBanner,
                        originalPrice: "BUY 1",
                        salePrice: "GET 1"
                      }
                    ]}
                  />

                  {/* 6. Best Key Supply Deals - Prime Big Deal Days & Maverick Key Cutting Machine */}
                  <PromotionalBlock
                    retailerName="Best Key Supply"
                    retailerWebsite="bestkeysupply.com"
                    backgroundColor="bg-gradient-to-br from-blue-50 to-blue-100"
                    accentColor="bg-blue-600"
                    deals={[
                      {
                        id: "bestkey1",
                        title: "Prime Big Deal Days",
                        description: "Oct. 7 Shop Now! Special pricing on automotive key fobs, remotes, and replacement keys. Limited time Prime member exclusive deals on top automotive key products.",
                        image: bestKeySupplyPrimeBanner,
                        originalPrice: "PRIME",
                        salePrice: "DEALS"
                      },
                      {
                        id: "bestkey2",
                        title: "Maverick Key Cutting Machine",
                        description: "Pre-Orders Now Available! Professional Commercial Grade Key Cutting Machine with advanced capabilities. Secure your order for the next generation of key cutting technology.",
                        image: bestKeySupplyMaverickBanner,
                        originalPrice: "PRE-ORDER",
                        salePrice: "AVAILABLE"
                      }
                    ]}
                  />

                  {/* 7. Key Direct Deals - XT57B VVDI Super Chip & All-Ford Madness Event */}
                  <PromotionalBlock
                    retailerName="Key Direct"
                    retailerWebsite="keydirect.com"
                    backgroundColor="bg-gradient-to-br from-orange-50 to-orange-100"
                    accentColor="bg-orange-600"
                    deals={[
                      {
                        id: "keydirect1",
                        title: "NEW XT57B VVDI Super Chip",
                        description: "In Stock & Ready to Ship! The new-generation super chip with stronger capabilities and enhanced features. Order today for immediate delivery!",
                        image: keyDirectXT57BBanner,
                        originalPrice: "ORDER",
                        salePrice: "TODAY!"
                      },
                      {
                        id: "keydirect2",
                        title: "All-Ford Madness Event",
                        description: "Sep 23 - Oct 6: Every Ford deal you've been waiting for - now in one sale! Massive savings on Ford keys, remotes, and programming tools.",
                        image: keyDirectFordMadnessBanner,
                        originalPrice: "LIMITED TIME",
                        salePrice: "SHOP NOW"
                      }
                    ]}
                  />

                  {/* 8. Noble Key Supply Deals - OEM Refurbishing & Free Shipping */}
                  <PromotionalBlock
                    retailerName="Noble Key Supply"
                    retailerWebsite="noblekeysupply.com"
                    backgroundColor="bg-gradient-to-br from-purple-50 to-purple-100"
                    accentColor="bg-purple-600"
                    deals={[
                      {
                        id: "noble1",
                        title: "ANNOUNCING! OEM Refurbishing & Unlocking Services",
                        description: "Professional OEM refurbishing and unlocking services now available! High-quality restoration of automotive keys and fobs with expert unlocking capabilities.",
                        image: nobleKeySupplyRefurbishingBanner,
                        originalPrice: "OEM",
                        salePrice: "SERVICES"
                      },
                      {
                        id: "noble2",
                        title: "Free Priority Shipping or $20 Next Day Air",
                        description: "When you spend $200 or more - Choose free priority shipping or upgrade to next day air for only $20. Fast, reliable delivery on all automotive key orders.",
                        image: nobleKeySupplyShippingBanner,
                        originalPrice: "FREE",
                        salePrice: "SHIPPING"
                      }
                    ]}
                  />

                  {/* 9. Key Innovations Deals - Halloween Special & Prime Deals */}
                  <PromotionalBlock
                    retailerName="Key Innovations"
                    retailerWebsite="keyinnovations.com"
                    backgroundColor="bg-gradient-to-br from-orange-50 to-orange-100"
                    accentColor="bg-orange-600"
                    deals={[
                      {
                        id: "keyinnov1",
                        title: "NO TRICKS, ALL TREATS! UP TO 20% OFF SELECT OEM",
                        description: "Neil's Deals Halloween Special - Get up to 20% off select OEM keys and remotes! Spooky savings on automotive key fobs with professional quality and compatibility.",
                        image: keyInnovationsHalloweenBanner,
                        originalPrice: "UP TO 20%",
                        salePrice: "OFF OEM"
                      },
                      {
                        id: "keyinnov2",
                        title: "PRIME DEALS! BUY 3, GET 1 FREE",
                        description: "On select KEYLESS2GO keys and remotes! Hurry, sale ends Wednesday, October 8th. Stock up on quality keyless entry solutions with this limited-time promotion.",
                        image: keyInnovationsPrimeDealsBanner,
                        originalPrice: "BUY 3",
                        salePrice: "GET 1 FREE"
                      }
                    ]}
                  />

                  {/* 10. Locksmith Keyless Deals - New Month Arrivals & Volume Discounts */}
                  <PromotionalBlock
                    retailerName="Locksmith Keyless"
                    retailerWebsite="locksmithkeyless.com"
                    backgroundColor="bg-gradient-to-br from-teal-50 to-teal-100"
                    accentColor="bg-teal-600"
                    deals={[
                      {
                        id: "locksmithkeyless1",
                        title: "New Month New Locksmith Arrivals!",
                        description: "Start October with Locksmith Gear Designed for Pros Like You! Professional automotive diagnostic tools, key programming devices, and locksmith equipment for expert professionals.",
                        image: locksmithKeylessNewMonthBanner,
                        originalPrice: "NEW MONTH",
                        salePrice: "NEW GEAR"
                      },
                      {
                        id: "locksmithkeyless2",
                        title: "New Week New Exciting Deals!",
                        description: "Unlock Savings with Every Purchase! This Week: Big Volume Discounts – Save Up to 65%! Professional locksmith tools and automotive key equipment at unbeatable prices.",
                        image: locksmithKeylessNewWeekBanner,
                        originalPrice: "SAVE UP TO",
                        salePrice: "65% OFF"
                      }
                    ]}
                  />


                </div>

                {/* Info Section */}
                <div className="container mx-auto px-4 mt-8">

                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer onNavigate={setCurrentSection} />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      <CreateListingModal
        isOpen={showCreateListing}
        onClose={() => setShowCreateListing(false)}
        onCreateListing={handleCreateListing}
      />

      <EditListingModal
        isOpen={showEditListing}
        onClose={() => {
          setShowEditListing(false);
          setEditingListing(null);
        }}
        onUpdateListing={handleUpdateListing}
        onDeleteListing={handleDeleteListing}
        listing={editingListing}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportingListing(null);
        }}
        onSubmitReport={handleSubmitReport}
        listingId={reportingListing?.id || ""}
        listingTitle={reportingListing?.title || ""}
      />
      
      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}