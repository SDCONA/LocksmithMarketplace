import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface UserReview {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  listing_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

export class ReviewsService {
  // Get reviews for a user
  static async getUserReviews(userId: string): Promise<{ success: boolean; reviews: UserReview[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/reviews`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, reviews: [], error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { success: false, reviews: [], error: 'Network error' };
    }
  }

  // Check if user can review another user
  static async canReview(
    accessToken: string,
    userId: string
  ): Promise<{ canReview: boolean; reason?: string; messagesSent?: number; messagesRequired?: number }> {
    try {
      const response = await fetch(`${API_BASE}/reviews/can-review/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { canReview: false, reason: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return { canReview: false, reason: 'Network error' };
    }
  }

  // Create review (requires auth)
  static async createReview(
    accessToken: string,
    reviewedUserId: string,
    rating: number,
    comment?: string,
    listingId?: string
  ): Promise<{ success: boolean; review?: UserReview; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reviewedUserId, rating, comment, listingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      return { success: false, error: 'Network error' };
    }
  }
}