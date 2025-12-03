import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface ParsedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  productUrl: string;
  availability: string;
  sku?: string;
}

export interface SearchProductsResponse {
  success: boolean;
  products: ParsedProduct[];
  cached: boolean;
  retailer: string;
  count: number;
  error?: string;
  message?: string;
}

/**
 * Search for products from retailers
 */
export async function searchProducts(query: string, retailer?: string): Promise<SearchProductsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/search-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ query, retailer }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Get cached search results
 */
export async function getCachedSearches() {
  try {
    const response = await fetch(`${API_BASE_URL}/cached-searches`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cached searches:', error);
    throw error;
  }
}

/**
 * Clear product cache
 */
export async function clearProductCache() {
  try {
    const response = await fetch(`${API_BASE_URL}/clear-cache`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
}