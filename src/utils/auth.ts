import { projectId, publicAnonKey } from './supabase/info';
import { createClient as getSupabaseClient } from './supabase/client';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

// Use singleton Supabase client for session management
const supabase = getSupabaseClient();

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  joinedDate?: string;
  isVerified?: boolean;
  isAdmin?: boolean;  // BizDizy admin pattern
  rating?: number;
  totalReviews?: number;
  phonePublic?: boolean;
  emailPublic?: boolean;
  showLastActive?: boolean;
  autoReply?: boolean;
  autoReplyMessage?: string;
  accessToken?: string;
  address?: {
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  access_token?: string;
  session?: any;
  requiresManualSignIn?: boolean;
}

// ============================================
// SECURE AUTH SERVICE (No localStorage tokens)
// ============================================

export const AuthService = {
  // Get fresh token from Supabase session (the ONLY way to get tokens now)
  async getFreshToken(): Promise<string | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return null;
      }
      
      // Check if token is expired or about to expire (within 60 seconds)
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const isExpiringSoon = expiresAt - now < 60000;
      
      if (isExpiringSoon) {
        const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !newSession) {
          await supabase.auth.signOut();
          return null;
        }
        
        return newSession.access_token;
      }
      
      return session.access_token;
    } catch (error) {
      console.error('Error getting fresh token:', error);
      return null;
    }
  },

  // DEPRECATED: Use getFreshToken() instead (backwards compatibility wrapper)
  async getToken(): Promise<string | null> {
    console.warn('AuthService.getToken() is deprecated - use AuthService.getFreshToken() instead');
    return await this.getFreshToken();
  },

  // Sign up
  async signup(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    location?: string;
    city?: string;
    recaptchaToken?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.session) {
        // Set session with Supabase client (session stored securely by Supabase)
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token
        });
      }

      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Failed to connect to server',
      };
    }
  },

  // Sign in
  async signin(email: string, password: string, recaptchaToken?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });

      const result = await response.json();

      if (result.success && result.session) {
        // Set session with Supabase client (session stored securely by Supabase)
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token
        });
      }

      return result;
    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        error: 'Failed to connect to server',
      };
    }
  },

  // Get current user (ALWAYS fetched from server, NEVER from localStorage)
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getFreshToken();
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await supabase.auth.signOut();
        }
        return null;
      }

      const result = await response.json();

      if (result.success && result.user) {
        return {
          ...result.user,
          accessToken: token
        };
      }

      return null;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error - Edge Function may not be deployed or accessible');
      }
      return null;
    }
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<AuthResponse> {
    try {
      const token = await this.getFreshToken();
      if (!token) {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Failed to connect to server',
      };
    }
  },

  // Sign out
  async signout(): Promise<void> {
    try {
      const token = await this.getFreshToken();
      if (token) {
        await fetch(`${API_URL}/auth/signout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      // Sign out from Supabase client (clears session)
      await supabase.auth.signOut();
    }
  },
};

// ============================================
// ADMIN HELPER FUNCTIONS (Secure - no localStorage)
// ============================================

// Get current user from server (secure)
export async function getCurrentUser(): Promise<User | null> {
  return await AuthService.getCurrentUser();
}

// Check if a user object has admin status (synchronous helper)
export function isAdminUser(user: User | null): boolean {
  return user?.isAdmin === true;
}

// Check if current user is admin (async - fetches from server)
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.isAdmin === true;
}

// Check if user has active session
export async function isAuthenticated(): Promise<boolean> {
  const token = await AuthService.getFreshToken();
  return !!token;
}

// Legacy support - these functions are now deprecated but kept for backwards compatibility
export function saveCurrentUser(user: User): void {
  console.warn('saveCurrentUser is deprecated - user data is now fetched from server');
  // No-op - we don't store user data in localStorage anymore
}

export function clearCurrentUser(): void {
  console.warn('clearCurrentUser is deprecated - use AuthService.signout() instead');
  // No-op - session is managed by Supabase
}

// ============================================
// ADMIN API SERVICE
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  location?: string;
  joinedDate?: string;
  lastSignIn?: string;
  isVerified: boolean;
  isBanned: boolean;
  isAdmin: boolean;
  role: string;
  totalSales: number;
  rating: number;
}

export const AdminService = {
  // Get all users (admin only)
  async getAllUsers(): Promise<{ users: AdminUser[], count: number }> {
    const token = await AuthService.getFreshToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }

    const data = await response.json();
    return { users: data.users || [], count: data.count || 0 };
  },

  // Promote user to admin
  async promoteUser(userId: string): Promise<void> {
    const token = await AuthService.getFreshToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/admin/promote/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to promote user');
    }
  },

  // Demote admin to regular user
  async demoteUser(userId: string): Promise<void> {
    const token = await AuthService.getFreshToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/admin/demote/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to demote user');
    }
  },

  // Delete user account
  async deleteUser(userId: string): Promise<void> {
    const token = await AuthService.getFreshToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
  },

  // Check if current user is admin
  async checkAdmin(): Promise<boolean> {
    const token = await AuthService.getFreshToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/admin/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.isAdmin === true;
    } catch {
      return false;
    }
  },
};