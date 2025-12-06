import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server/make-server-a7e285ba`;

export interface SearchHistoryItem {
  query: string;
  filters: any;
  timestamp: number;
}

export class SearchHistoryService {
  // Get user's search history
  static async getSearchHistory(accessToken: string): Promise<{ success: boolean; history: SearchHistoryItem[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/search-history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, history: [], error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error fetching search history:', error);
      return { success: false, history: [], error: 'Network error' };
    }
  }

  // Save search to history
  static async saveSearch(accessToken: string, query: string, filters: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/search-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query, filters }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error saving search:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Clear search history
  static async clearHistory(accessToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/search-history`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error clearing search history:', error);
      return { success: false, error: 'Network error' };
    }
  }
}
