import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export class AddressService {
  // Get user addresses
  static async getAddresses(accessToken: string, userId: string): Promise<{ success: boolean; addresses?: UserAddress[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch addresses' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Create address
  static async createAddress(accessToken: string, userId: string, address: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; address?: UserAddress; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(address),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create address' };
      }

      return data;
    } catch (error) {
      console.error('Error creating address:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Update address
  static async updateAddress(accessToken: string, userId: string, addressId: string, updates: Partial<UserAddress>): Promise<{ success: boolean; address?: UserAddress; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update address' };
      }

      return data;
    } catch (error) {
      console.error('Error updating address:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Delete address
  static async deleteAddress(accessToken: string, userId: string, addressId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete address' };
      }

      return data;
    } catch (error) {
      console.error('Error deleting address:', error);
      return { success: false, error: 'Network error' };
    }
  }
}
