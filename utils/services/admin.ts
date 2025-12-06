import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export class AdminService {
  // Get all users
  static async getUsers(accessToken: string): Promise<{ success: boolean; users?: any[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch users' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Update user status (ban/unban)
  static async updateUserStatus(accessToken: string, userId: string, isBanned: boolean, banReason?: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isBanned, banReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update user status' };
      }

      return data;
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Toggle admin status
  static async toggleAdminStatus(accessToken: string, userId: string, isAdmin: boolean): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isAdmin }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update admin status' };
      }

      return data;
    } catch (error) {
      console.error('Error updating admin status:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get all reports
  static async getReports(accessToken: string, status?: string): Promise<{ success: boolean; reports?: any[]; error?: string }> {
    try {
      const url = status ? `${API_BASE}/admin/reports?status=${status}` : `${API_BASE}/admin/reports`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch reports' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Update report status
  static async updateReport(accessToken: string, reportId: string, status: string, resolutionNotes?: string): Promise<{ success: boolean; report?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status, resolutionNotes }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update report' };
      }

      return data;
    } catch (error) {
      console.error('Error updating report:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Delete post
  static async deletePost(accessToken: string, postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete post' };
      }

      return data;
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get retailers
  static async getRetailers(accessToken: string): Promise<{ success: boolean; retailers?: any[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/retailers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch retailers' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching retailers:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Create/Update retailer
  static async saveRetailer(accessToken: string, retailer: any): Promise<{ success: boolean; retailer?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/retailers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(retailer),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to save retailer' };
      }

      return data;
    } catch (error) {
      console.error('Error saving retailer:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get banners
  static async getBanners(accessToken: string): Promise<{ success: boolean; banners?: any[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/banners`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch banners' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Create/Update banner
  static async saveBanner(accessToken: string, banner: any): Promise<{ success: boolean; banner?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(banner),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to save banner' };
      }

      return data;
    } catch (error) {
      console.error('Error saving banner:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get all banner positions (admin only)
  static async getBannerPositions(accessToken: string): Promise<{ success: boolean; positions?: any[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/banner-positions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch banner positions' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching banner positions:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get active banner positions (public - for retailers page)
  static async getActiveBannerPositions(): Promise<{ success: boolean; positions?: any[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/banner-positions/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error('Server returned non-JSON response for banner positions');
        return { success: false, error: 'Invalid server response', positions: [] };
      }

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch active banner positions', positions: [] };
      }

      return data;
    } catch (error) {
      console.error('Error fetching active banner positions:', error);
      return { success: false, error: 'Network error', positions: [] };
    }
  }

  // Update banner position (admin only)
  static async updateBannerPosition(accessToken: string, positionId: string, positionData: any): Promise<{ success: boolean; position?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/banner-positions/${positionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(positionData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update banner position' };
      }

      return data;
    } catch (error) {
      console.error('Error updating banner position:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Delete banner position (admin only)
  static async deleteBannerPosition(accessToken: string, positionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/banner-positions/${positionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete banner position' };
      }

      return data;
    } catch (error) {
      console.error('Error deleting banner position:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // ============================================
  // NEW RETAILER BANNER SYSTEM METHODS
  // ============================================

  // Upload banner image
  static async uploadBannerImage(accessToken: string, file: File, imageType: 'pc' | 'mobile'): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('imageType', imageType);

      const response = await fetch(`${API_BASE}/admin/upload-banner-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to upload image' };
      }

      return data;
    } catch (error) {
      console.error('Error uploading banner image:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get all retailer banner positions
  static async getRetailerBanners(accessToken: string): Promise<{ success: boolean; positions?: any[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/retailer-banners`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch retailer banners' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching retailer banners:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Create new retailer position
  static async createRetailerBanner(accessToken: string, positionData: any): Promise<{ success: boolean; position?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/retailer-banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(positionData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create retailer position' };
      }

      return data;
    } catch (error) {
      console.error('Error creating retailer banner:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Update retailer position
  static async updateRetailerBanner(accessToken: string, id: string, updateData: any): Promise<{ success: boolean; position?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/retailer-banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update retailer position' };
      }

      return data;
    } catch (error) {
      console.error('Error updating retailer banner:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Delete retailer position
  static async deleteRetailerBanner(accessToken: string, id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/retailer-banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete retailer position' };
      }

      return data;
    } catch (error) {
      console.error('Error deleting retailer banner:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get active retailer banners (public)
  static async getActiveRetailerBanners(): Promise<{ success: boolean; positions?: any[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/retailer-banners`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch active retailer banners', positions: [] };
      }

      return data;
    } catch (error) {
      console.error('Error fetching active retailer banners:', error);
      return { success: false, error: 'Network error', positions: [] };
    }
  }

  // ============================================
  // PROMOTIONAL BANNERS METHODS
  // ============================================

  // Get all promotional banners (admin only)
  static async getPromotionalBanners(accessToken: string): Promise<{ success: boolean; banners?: any[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/promotional-banners`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch promotional banners' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching promotional banners:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Create promotional banner (admin only)
  static async createPromotionalBanner(accessToken: string, bannerData: any): Promise<{ success: boolean; banner?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/promotional-banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(bannerData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create promotional banner' };
      }

      return data;
    } catch (error) {
      console.error('Error creating promotional banner:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Update promotional banner (admin only)
  static async updatePromotionalBanner(accessToken: string, id: string, updateData: any): Promise<{ success: boolean; banner?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/promotional-banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update promotional banner' };
      }

      return data;
    } catch (error) {
      console.error('Error updating promotional banner:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Delete promotional banner (admin only)
  static async deletePromotionalBanner(accessToken: string, id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/promotional-banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete promotional banner' };
      }

      return data;
    } catch (error) {
      console.error('Error deleting promotional banner:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get active promotional banners (public)
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
        return { success: false, error: data.error || 'Failed to fetch promotional banners', banners: [] };
      }

      return data;
    } catch (error) {
      console.error('Error fetching active promotional banners:', error);
      return { success: false, error: 'Network error', banners: [] };
    }
  }

  // ============================================
  // POLICY MANAGEMENT METHODS
  // ============================================

  // Get platform policies
  static async getPolicies(accessToken: string): Promise<{ success: boolean; policies?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/policies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch policies' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching policies:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Save platform policies
  static async savePolicies(accessToken: string, policyData: { terms: string; privacy: string; notifyUsers: boolean }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/admin/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(policyData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to save policies' };
      }

      return data;
    } catch (error) {
      console.error('Error saving policies:', error);
      return { success: false, error: 'Network error' };
    }
  }
}