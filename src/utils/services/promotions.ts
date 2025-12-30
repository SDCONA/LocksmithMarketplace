import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface Promotion {
  id: string;
  user_id: string;
  listing_id: string;
  type: 'featured' | 'boost' | 'highlight';
  duration_days: number;
  price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  payment_id?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface PromotionAnalytics {
  id: string;
  promotion_id: string;
  date: string;
  views: number;
  clicks: number;
  messages: number;
  saves: number;
  created_at: string;
}

export class PromotionService {
  // Get active promotional banners (public, no auth required)
  static async getActivePromotionalBanners(): Promise<{ success: boolean; banners?: any[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/promotional-banners`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch promotional banners' };
      }

      return data;
    } catch (error) {
      // Silently fail - promotional banners are optional
      return { success: false, error: 'Network error', banners: [] };
    }
  }

  // Create promotion
  static async createPromotion(
    accessToken: string,
    promotionData: {
      listingId: string;
      type: string;
      durationDays: number;
      price: number;
    }
  ): Promise<{ success: boolean; promotion?: Promotion; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(promotionData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create promotion' };
      }

      return data;
    } catch (error) {
      console.error('Error creating promotion:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get user promotions
  static async getPromotions(accessToken: string): Promise<{ success: boolean; promotions?: Promotion[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/promotions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch promotions' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get promotion analytics
  static async getAnalytics(accessToken: string, promotionId: string): Promise<{ success: boolean; analytics?: PromotionAnalytics[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/promotions/${promotionId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch analytics' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Update promotion
  static async updatePromotion(accessToken: string, promotionId: string, updates: Partial<Promotion>): Promise<{ success: boolean; promotion?: Promotion; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/promotions/${promotionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update promotion' };
      }

      return data;
    } catch (error) {
      console.error('Error updating promotion:', error);
      return { success: false, error: 'Network error' };
    }
  }
}