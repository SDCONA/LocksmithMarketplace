// State Persistence Utility
// Manages localStorage for app state across refreshes

const STATE_KEYS = {
  NAVIGATION: 'app-navigation-state',
  SEARCH: 'app-search-state',
  MARKETPLACE: 'app-marketplace-state',
  FORMS: 'app-forms-state'
};

export interface NavigationState {
  currentSection: string;
  selectedListing: any;
  selectedUserId: string | null;
  selectedSellerId: string | null;
  previousSection: string | null;
  previousConversationId: string | null;
}

export interface SearchState {
  searchQuery: string;
  selectedVehicle: {year: string, make: string, model: string} | null;
  selectedRetailers: string[];
  sortBy: string;
  inStockOnly: boolean;
  showSearchResults: boolean;
}

export interface MarketplaceState {
  marketplaceSearch: string;
  selectedCategory: string;
  selectedCondition: string;
  zipCode: string;
  radius: number;
}

export const StatePersistence = {
  // Navigation State
  saveNavigationState(state: Partial<NavigationState>) {
    try {
      const current = this.getNavigationState();
      const updated = { ...current, ...state };
      localStorage.setItem(STATE_KEYS.NAVIGATION, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving navigation state:', e);
    }
  },

  getNavigationState(): NavigationState {
    try {
      const saved = localStorage.getItem(STATE_KEYS.NAVIGATION);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading navigation state:', e);
    }
    return {
      currentSection: 'marketplace',
      selectedListing: null,
      selectedUserId: null,
      selectedSellerId: null,
      previousSection: null,
      previousConversationId: null
    };
  },

  // Search State
  saveSearchState(state: Partial<SearchState>) {
    try {
      const current = this.getSearchState();
      const updated = { ...current, ...state };
      localStorage.setItem(STATE_KEYS.SEARCH, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving search state:', e);
    }
  },

  getSearchState(): SearchState {
    try {
      const saved = localStorage.getItem(STATE_KEYS.SEARCH);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading search state:', e);
    }
    return {
      searchQuery: '',
      selectedVehicle: null,
      selectedRetailers: [],
      sortBy: 'relevance',
      inStockOnly: false,
      showSearchResults: false
    };
  },

  // Marketplace State
  saveMarketplaceState(state: Partial<MarketplaceState>) {
    try {
      const current = this.getMarketplaceState();
      const updated = { ...current, ...state };
      localStorage.setItem(STATE_KEYS.MARKETPLACE, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving marketplace state:', e);
    }
  },

  getMarketplaceState(): MarketplaceState {
    try {
      const saved = localStorage.getItem(STATE_KEYS.MARKETPLACE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading marketplace state:', e);
    }
    return {
      marketplaceSearch: '',
      selectedCategory: 'all',
      selectedCondition: 'all',
      zipCode: '',
      radius: 25
    };
  },

  // Form State (for Create/Edit Listing modals)
  saveFormState(formName: string, data: any) {
    try {
      const forms = this.getAllForms();
      forms[formName] = data;
      localStorage.setItem(STATE_KEYS.FORMS, JSON.stringify(forms));
    } catch (e) {
      console.error('Error saving form state:', e);
    }
  },

  getFormState(formName: string): any {
    try {
      const forms = this.getAllForms();
      return forms[formName] || null;
    } catch (e) {
      console.error('Error loading form state:', e);
      return null;
    }
  },

  clearFormState(formName: string) {
    try {
      const forms = this.getAllForms();
      delete forms[formName];
      localStorage.setItem(STATE_KEYS.FORMS, JSON.stringify(forms));
    } catch (e) {
      console.error('Error clearing form state:', e);
    }
  },

  getAllForms(): any {
    try {
      const saved = localStorage.getItem(STATE_KEYS.FORMS);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  },

  // Clear all state (useful for logout)
  clearAllState() {
    try {
      localStorage.removeItem(STATE_KEYS.NAVIGATION);
      localStorage.removeItem(STATE_KEYS.SEARCH);
      localStorage.removeItem(STATE_KEYS.MARKETPLACE);
      localStorage.removeItem(STATE_KEYS.FORMS);
    } catch (e) {
      console.error('Error clearing state:', e);
    }
  }
};