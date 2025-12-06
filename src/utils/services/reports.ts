import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface Report {
  id: string;
  reporter_id: string;
  content_type: 'listing' | 'post' | 'comment' | 'message' | 'review' | 'user' | 'deal';
  content_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface ReportUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

export interface ReportDetails {
  report: Report;
  reporter: ReportUser | null;
  reportedUser: ReportUser | null;
  reportedContent: any;
}

export class ReportService {
  // Create report
  static async createReport(
    accessToken: string,
    reportData: {
      contentType: string;
      contentId: string;
      reason: string;
      description?: string;
    }
  ): Promise<{ success: boolean; report?: Report; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create report' };
      }

      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get user's reports
  static async getReports(accessToken: string): Promise<{ success: boolean; reports?: Report[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/reports`, {
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

  // Admin: Get all reports
  static async getAllReports(
    accessToken: string,
    filters?: {
      status?: string;
      contentType?: string;
    }
  ): Promise<{ success: boolean; reports?: Report[]; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.contentType) queryParams.append('contentType', filters.contentType);

      const url = `${API_BASE}/reports/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
      console.error('Error fetching all reports:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Admin: Get full report details with user and content data
  static async getReportDetails(
    accessToken: string,
    reportId: string
  ): Promise<{ success: boolean; data?: ReportDetails; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch report details' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching report details:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Admin: Update report status
  static async updateReportStatus(
    accessToken: string,
    reportId: string,
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
    resolutionNotes?: string
  ): Promise<{ success: boolean; report?: Report; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}/status`, {
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

  // Admin: Delete report
  static async deleteReport(
    accessToken: string,
    reportId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete report' };
      }

      return data;
    } catch (error) {
      console.error('Error deleting report:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Admin: Take action on reported content
  static async takeAction(
    accessToken: string,
    reportId: string,
    action: 'delete' | 'warn' | 'dismiss',
    reason: string,
    resolutionNotes?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action, reason, resolutionNotes }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to take action' };
      }

      return data;
    } catch (error) {
      console.error('Error taking action:', error);
      return { success: false, error: 'Network error' };
    }
  }
}