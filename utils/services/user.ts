import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  phone: string;
  location: string;
  bio: string;
  website: string;
  joinedDate: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  phonePublic: boolean;
  emailPublic: boolean;
  showLastActive: boolean;
  autoReply: boolean;
  autoReplyMessage: string;
  address?: {
    street: string;
    apartment: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  avatar?: string;
  phonePublic?: boolean;
  emailPublic?: boolean;
  showLastActive?: boolean;
  autoReply?: boolean;
  autoReplyMessage?: string;
  address?: {
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

export class UserService {
  // Update user profile
  static async updateProfile(accessToken: string, updates: ProfileUpdateData): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Profile update failed:', data.error);
        return { success: false, error: data.error || 'Failed to update profile' };
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch user profile' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Upload avatar image
  static async uploadAvatar(accessToken: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Avatar upload failed:', data.error);
        return { success: false, error: data.error || 'Failed to upload avatar' };
      }

      return data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Change password
  static async changePassword(accessToken: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Password change failed:', data.error);
        return { success: false, error: data.error || 'Failed to change password' };
      }

      return data;
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Delete account
  static async deleteAccount(accessToken: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Account deletion failed:', data.error);
        return { success: false, error: data.error || 'Failed to delete account' };
      }

      return data;
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, error: 'Network error' };
    }
  }
}