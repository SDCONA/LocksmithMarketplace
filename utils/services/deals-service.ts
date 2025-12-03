import { AuthService } from "../auth";
import { projectId, publicAnonKey } from "../supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/deals`;

export class DealsService {
  // ========================================
  // RETAILER PROFILES
  // ========================================

  static async getRetailerProfiles() {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/retailer-profiles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch retailer profiles");
    }

    const data = await response.json();
    return data.profiles;
  }

  static async getRetailerProfile(id: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/retailer-profiles/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch retailer profile");
    }

    const data = await response.json();
    return data.profile;
  }

  static async createRetailerProfile(profileData: any) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/retailer-profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create retailer profile");
    }

    const data = await response.json();
    return data.profile;
  }

  static async updateRetailerProfile(id: string, profileData: any) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/retailer-profiles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update retailer profile");
    }

    const data = await response.json();
    return data.profile;
  }

  static async deleteRetailerProfile(id: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/retailer-profiles/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete retailer profile");
    }

    return true;
  }

  static async transferRetailerProfile(id: string, email: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/retailer-profiles/${id}/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to transfer retailer profile");
    }

    const data = await response.json();
    return data.profile;
  }

  static async revokeRetailerProfile(id: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/retailer-profiles/${id}/revoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to revoke retailer profile");
    }

    const data = await response.json();
    return data.profile;
  }

  static async getMyRetailerProfile() {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/my-retailer-profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch my retailer profile");
    }

    const data = await response.json();
    return data.profile; // null if no profile found
  }

  static async uploadRetailerLogo(profileId: string, file: File) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/retailer-profiles/${profileId}/logo/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload logo");
    }

    const data = await response.json();
    return data.profile;
  }

  // ========================================
  // DEAL TYPES
  // ========================================

  static async getDealTypes() {
    const response = await fetch(`${API_URL}/deal-types`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch deal types");
    }

    const data = await response.json();
    return data.dealTypes;
  }

  static async createDealType(typeData: any) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deal-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(typeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create deal type");
    }

    const data = await response.json();
    return data.dealType;
  }

  // ========================================
  // DEALS
  // ========================================

  static async getDeals() {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch deals");
    }

    const data = await response.json();
    return data;
  }

  static async getRetailerDeals(retailerId: string, status: string = "active") {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/retailer-profiles/${retailerId}/deals?status=${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch retailer deals");
    }

    return await response.json();
  }

  static async getDeal(id: string) {
    const token = await AuthService.getFreshToken();
    const response = await fetch(`${API_URL}/deals/${id}`, {
      headers: {
        Authorization: `Bearer ${token || publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch deal");
    }

    const data = await response.json();
    return data.deal;
  }

  static async createDeal(dealData: any) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dealData),
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        // If JSON parsing fails, throw generic error
        throw new Error("Failed to create deal");
      }
      // Attach details if available
      const err: any = new Error(error.error || "Failed to create deal");
      err.details = error.details;
      throw err;
    }

    const data = await response.json();
    return data.deal;
  }

  static async updateDeal(id: string, dealData: any) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dealData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update deal");
    }

    const data = await response.json();
    return data.deal;
  }

  static async deleteDeal(id: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete deal");
    }

    return true;
  }

  static async archiveDeal(id: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals/${id}/archive`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to archive deal");
    }

    const data = await response.json();
    return data.deal;
  }

  static async restoreDeal(id: string, expiresAt: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals/${id}/restore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ expires_at: expiresAt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to restore deal");
    }

    const data = await response.json();
    return data.deal;
  }

  static async pauseDeal(id: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals/${id}/pause`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to pause deal");
    }

    const data = await response.json();
    return data.deal;
  }

  static async activateDeal(id: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals/${id}/activate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to activate deal");
    }

    const data = await response.json();
    return data.deal;
  }

  // ========================================
  // DEAL IMAGES
  // ========================================

  static async uploadDealImage(dealId: string, imageUrl: string, displayOrder: number = 0) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals/${dealId}/images`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image_url: imageUrl, display_order: displayOrder }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload deal image");
    }

    const data = await response.json();
    return data.image;
  }

  // Alias for uploadDealImage
  static async addDealImage(dealId: string, imageUrl: string, displayOrder: number = 0) {
    return this.uploadDealImage(dealId, imageUrl, displayOrder);
  }

  static async uploadDealImageFile(dealId: string, file: File, displayOrder: number = 0) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("display_order", displayOrder.toString());

    const response = await fetch(`${API_URL}/deals/${dealId}/images/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload deal image file");
    }

    const data = await response.json();
    return data.image;
  }

  static async deleteDealImage(imageId: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deal-images/${imageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete deal image");
    }

    return true;
  }

  static async reorderDealImages(dealId: string, imageOrders: Array<{ id: string; display_order: number }>) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals/${dealId}/images/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageOrders }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to reorder deal images");
    }

    return true;
  }

  // ========================================
  // PUBLIC DEALS
  // ========================================

  static async getPublicDeals(excludedRetailers: string[] = []) {
    const excludeParam = excludedRetailers.length > 0 ? `?exclude=${excludedRetailers.join(",")}` : "";
    const response = await fetch(`${API_URL}/public/deals${excludeParam}`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch public deals");
    }

    const data = await response.json();
    return data.deals;
  }

  static async getActiveRetailers() {
    const response = await fetch(`${API_URL}/public/retailers`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch retailers");
    }

    const data = await response.json();
    return data.retailers;
  }

  // ========================================
  // SAVED DEALS
  // ========================================

  static async getSavedDeals(retailerFilter?: string) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const filterParam = retailerFilter ? `?retailer=${retailerFilter}` : "";
    const response = await fetch(`${API_URL}/saved-deals${filterParam}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch saved deals");
    }

    const data = await response.json();
    return data.savedDeals;
  }

  static async saveDeal(dealId: string) {
    const token = await AuthService.getFreshToken();
    const response = await fetch(`${API_URL}/deals/${dealId}/save`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save deal");
    }

    const data = await response.json();
    return data.savedDeal;
  }

  static async unsaveDeal(dealId: string) {
    const token = await AuthService.getFreshToken();
    const response = await fetch(`${API_URL}/deals/${dealId}/save`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to unsave deal");
    }

    return true;
  }

  static async bulkDeleteSavedDeals(savedDealIds: string[]) {
    const token = await AuthService.getFreshToken();
    const response = await fetch(`${API_URL}/saved-deals/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ savedDealIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to bulk delete saved deals");
    }

    return true;
  }

  static async isDealSaved(dealId: string) {
    const token = await AuthService.getFreshToken();
    if (!token) return false;

    const response = await fetch(`${API_URL}/deals/${dealId}/is-saved`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isSaved;
  }

  // ========================================
  // CSV BULK UPLOAD - PHASE 7
  // ========================================

  static async bulkUploadDeals(deals: any[]) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/deals/bulk-upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ deals }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to bulk upload deals");
    }

    return data;
  }

  static async bulkDeleteDeals(dealIds: string[]) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dealIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to bulk delete deals");
    }

    return data;
  }

  static async bulkRenewDeals(dealIds: string[]) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/bulk-renew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dealIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to bulk renew deals");
    }

    return data;
  }

  static async bulkArchiveDeals(dealIds: string[]) {
    const token = await AuthService.getFreshToken();
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_URL}/bulk-archive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dealIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to bulk archive deals");
    }

    return data;
  }
}