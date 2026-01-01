import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface UserPreferences {
  id: string;
  user_id: string;
  // Notification Preferences
  email_notifications: boolean;
  push_notifications: boolean;
  message_notifications: boolean;
  listing_notifications: boolean;
  deal_notifications: boolean;
  // Privacy Settings
  profile_visibility: 'public' | 'users' | 'private';
  show_email: boolean;
  show_phone: boolean;
  // Regional Preferences
  language: 'en' | 'es' | 'fr' | 'de';
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  // Appearance
  theme: 'light' | 'dark' | 'system';
  // Timestamps
  created_at: string;
  updated_at: string;
}

export class UserPreferencesService {
  // Get user preferences
  static async getPreferences(accessToken: string): Promise<UserPreferences> {
    try {
      const response = await fetch(`${API_BASE}/user-preferences`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch preferences');
      }

      const data = await response.json();
      return data.preferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  // Update user preferences
  static async updatePreferences(accessToken: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await fetch(`${API_BASE}/user-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update preferences');
      }

      const data = await response.json();
      return data.preferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}

// Legacy settings interface (kept for backward compatibility)
export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  new_message_notifications: boolean;
  listing_updates: boolean;
  price_alerts: boolean;
  two_factor_auth: boolean;
  profile_visibility: 'public' | 'private' | 'contacts';
  created_at: string;
  updated_at: string;
}

export class SettingsService {
  // Get user settings
  static async getSettings(accessToken: string, userId: string): Promise<{ success: boolean; settings?: UserSettings; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch settings' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Update user settings
  static async updateSettings(accessToken: string, userId: string, updates: Partial<UserSettings>): Promise<{ success: boolean; settings?: UserSettings; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update settings' };
      }

      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: 'Network error' };
    }
  }
}