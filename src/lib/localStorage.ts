// Utility functions for managing localStorage with type safety

export const LocalStorage = {
  // Search History
  getSearchHistory: (): string[] => {
    try {
      const history = localStorage.getItem('searchHistory');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  },

  addSearchHistory: (query: string) => {
    try {
      const history = LocalStorage.getSearchHistory();
      // Remove duplicates and add to front
      const updated = [query, ...history.filter(h => h !== query)].slice(0, 10); // Keep last 10
      localStorage.setItem('searchHistory', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save search history:', err);
    }
  },

  clearSearchHistory: () => {
    try {
      localStorage.removeItem('searchHistory');
    } catch (err) {
      console.error('Failed to clear search history:', err);
    }
  },

  // Filter Preferences
  getFilterPreferences: () => {
    try {
      const prefs = localStorage.getItem('filterPreferences');
      return prefs ? JSON.parse(prefs) : null;
    } catch {
      return null;
    }
  },

  saveFilterPreferences: (filters: any) => {
    try {
      localStorage.setItem('filterPreferences', JSON.stringify(filters));
    } catch (err) {
      console.error('Failed to save filter preferences:', err);
    }
  },

  // Marketplace Filter Preferences
  getMarketplaceFilterPreferences: () => {
    try {
      const prefs = localStorage.getItem('marketplaceFilterPreferences');
      return prefs ? JSON.parse(prefs) : null;
    } catch {
      return null;
    }
  },

  saveMarketplaceFilterPreferences: (filters: any) => {
    try {
      localStorage.setItem('marketplaceFilterPreferences', JSON.stringify(filters));
    } catch (err) {
      console.error('Failed to save marketplace filter preferences:', err);
    }
  },

  // Recently Viewed Items
  getRecentlyViewed: () => {
    try {
      const items = localStorage.getItem('recentlyViewed');
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  },

  addRecentlyViewed: (item: any) => {
    try {
      const items = LocalStorage.getRecentlyViewed();
      // Remove duplicates and add to front
      const updated = [item, ...items.filter((i: any) => i.id !== item.id)].slice(0, 20); // Keep last 20
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save recently viewed:', err);
    }
  },
};
