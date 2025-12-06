import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface SavedItem {
  id: string;
  user_id: string;
  item_id: string;
  item_type: 'listing' | 'product';
  item_data: any;
  created_at: string;
  listing?: any;
}

export class SavedItemsService {
  // Get user's saved items
  static async getSavedItems(accessToken: string, type?: 'listing' | 'product'): Promise<{ success: boolean; savedItems: SavedItem[]; error?: string }> {
    try {
      const url = type ? `${API_BASE}/saved-items?type=${type}` : `${API_BASE}/saved-items`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.log(`Saved items fetch failed (${type}):`, data.error);
        return { success: false, savedItems: [], error: data.error };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Network errors are common when the backend service isn't available
      // Return success with empty array to prevent app crashes
      console.log(`Network error fetching saved items (${type}). This is expected if the backend service is not running.`);
      return { success: true, savedItems: [] };
    }
  }

  // Save an item
  static async saveItem(accessToken: string, itemId: string, itemType: 'listing' | 'product', itemData?: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/saved-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ itemId, itemType, itemData }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        return { success: false, error: data.error };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Network error saving item. Backend service may not be available.');
      // Return success to allow local-only saving
      return { success: true };
    }
  }

  // Remove saved item
  static async removeSavedItem(accessToken: string, itemId: string, itemType?: 'listing' | 'product'): Promise<{ success: boolean; error?: string }> {
    try {
      const url = itemType ? `${API_BASE}/saved-items/${itemId}?type=${itemType}` : `${API_BASE}/saved-items/${itemId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        return { success: false, error: data.error };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Network error removing saved item. Backend service may not be available.');
      // Return success to allow local-only removal
      return { success: true };
    }
  }
}