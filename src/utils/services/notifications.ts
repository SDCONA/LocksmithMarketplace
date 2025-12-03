import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
}

export class NotificationService {
  // Get user notifications
  static async getUserNotifications(accessToken: string): Promise<{ success: boolean; notifications?: Notification[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch notifications' };
      }

      // Map 'is_read' from backend to 'read' for frontend interface
      const notifications = (data.notifications || []).map((n: any) => ({
        ...n,
        read: n.is_read ?? n.read
      }));

      return { success: true, notifications };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Mark notification as read
  static async markAsRead(accessToken: string, notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to mark notification as read' };
      }

      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(accessToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to mark all as read' };
      }

      return data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Delete notification
  static async deleteNotification(accessToken: string, notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete notification' };
      }

      return data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get unread count
  static async getUnreadCount(accessToken: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/notifications/unread-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch unread count' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { success: false, error: 'Network error' };
    }
  }
}