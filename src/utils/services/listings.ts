import { projectId, publicAnonKey } from '../supabase/info';
import { requestDeduplicator } from '../requestDeduplication';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  images: string[];
  vehicle_year?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  key_type?: string;
  transponder_type?: string;
  status: string;
  views: number;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    rating: number;
    total_reviews: number;
    is_verified: boolean;
  };
}

export interface ListingFilters {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
  random?: boolean;
}

export class ListingsService {
  // Archive expired listings (call periodically)
  static async archiveExpiredListings(): Promise<{ success: boolean; archived?: number; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/listings/archive-expired`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Failed to archive expired listings: ${data.error || 'Unknown error'}`);
        return { success: false, error: data.error || 'Failed to archive expired listings' };
      }

      return { success: true, archived: data.archived };
    } catch (error) {
      console.error('Error archiving expired listings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Get all listings with optional filters
  static async getListings(filters?: ListingFilters): Promise<{ success: boolean; listings: Listing[]; pagination?: any; error?: string }> {
    try {
      // Archive expired listings before fetching (only on first page load)
      if (!filters?.page || filters.page === 1) {
        this.archiveExpiredListings().catch(err => console.error('Background archive failed:', err));
      }

      const serviceStart = performance.now();
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.condition) params.append('condition', filters.condition);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.random) params.append('random', filters.random.toString());
      if ((filters as any)?.zipCode) params.append('zipCode', (filters as any).zipCode);
      if ((filters as any)?.radius) params.append('radius', (filters as any).radius.toString());

      const url = `${API_BASE}/listings${params.toString() ? `?${params.toString()}` : ''}`;
      
      // Create cache key
      const cacheKey = `listings:${params.toString()}`;
      
      // OPTIMIZED: Cache paginated requests too, but with shorter duration
      const isFirstPage = !filters?.page || filters.page === 1;
      const cacheDuration = isFirstPage ? 60 : 30; // 60s for first page, 30s for others
      
      // Check cache first
      const cached = requestDeduplicator.get(cacheKey);
      if (cached) {
        console.log(`💾 Cache hit! Returned in ${(performance.now() - serviceStart).toFixed(0)}ms`);
        return cached;
      }
      console.log(`⏱️ Cache miss, making fresh request...`);

      // Make request directly (removed deduplication overhead for speed)
      const executeRequest = async () => {
        const fetchStart = performance.now();
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        console.log(`🌐 Network fetch took: ${(performance.now() - fetchStart).toFixed(0)}ms`);

        const parseStart = performance.now();
        const data = await response.json();
        console.log(`📦 JSON parse took: ${(performance.now() - parseStart).toFixed(0)}ms`);

        if (!response.ok) {
          console.error(`Failed to fetch listings: ${data.error || 'Unknown error'} (Status: ${response.status})`);
          return { success: false, listings: [], error: data.error || 'Failed to fetch listings' };
        }

        // OPTIMIZED: Cache successful responses - 60s for first page, 30s for others
        requestDeduplicator.set(cacheKey, data, cacheDuration);
        console.log(`✅ Response cached for ${cacheDuration}s`);

        return data;
      };
      
      return await executeRequest();
    } catch (error) {
      console.error('Error fetching listings:', error);
      return { success: false, listings: [], error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Get single listing by ID
  static async getListing(id: string): Promise<{ success: boolean; listing?: Listing; error?: string }> {
    try {
      const cacheKey = `listing:${id}`;
      
      // Check cache first
      const cached = requestDeduplicator.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Use deduplication
      return await requestDeduplicator.deduplicate(cacheKey, async () => {
        const response = await fetch(`${API_BASE}/listings/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.error || 'Failed to fetch listing' };
        }

        // Cache for 60 seconds
        requestDeduplicator.set(cacheKey, data, 60);

        return data;
      });
    } catch (error) {
      console.error('Error fetching listing:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Create new listing (requires auth)
  static async createListing(accessToken: string, listingData: Partial<Listing>): Promise<{ success: boolean; listing?: Listing; error?: string }> {
    try {
      console.log('ListingsService.createListing called with:', listingData);
      const response = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(listingData),
      });

      const data = await response.json();
      console.log('Server response:', { status: response.status, data });

      if (!response.ok) {
        const errorMsg = data.error || `Server error: ${response.status}`;
        console.error('Failed to create listing:', errorMsg);
        return { success: false, error: errorMsg };
      }

      // Clear listings cache when new listing is created
      requestDeduplicator.clear('listings:');

      return data;
    } catch (error) {
      console.error('Error creating listing (network or parsing):', error);
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Update listing (requires auth and ownership)
  static async updateListing(accessToken: string, id: string, updates: Partial<Listing>): Promise<{ success: boolean; listing?: Listing; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update listing' };
      }

      // Clear cache for this listing and listings list
      requestDeduplicator.clear(`listing:${id}`);
      requestDeduplicator.clear('listings:');

      return data;
    } catch (error) {
      console.error('Error updating listing:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Delete listing (requires auth and ownership)
  static async deleteListing(accessToken: string, id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/listings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete listing' };
      }

      // Clear cache for this listing and listings list
      requestDeduplicator.clear(`listing:${id}`);
      requestDeduplicator.clear('listings:');

      return data;
    } catch (error) {
      console.error('Error deleting listing:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Archive listing manually (requires auth and ownership)
  static async archiveListing(accessToken: string, id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/listings/${id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to archive listing' };
      }

      // Clear cache for this listing and listings list
      requestDeduplicator.clear(`listing:${id}`);
      requestDeduplicator.clear('listings:');

      return data;
    } catch (error) {
      console.error('Error archiving listing:', error);
      return { success: false, error: 'Network error' };
    }
  }
}