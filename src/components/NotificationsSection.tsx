import React, { useState, useEffect } from 'react';
import { Shield, X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Notification {
  id: string;
  title: string;
  message: string;
  metadata: any;
  created_at: string;
  is_read: boolean;
  conversation_id: string;
}

interface NotificationsSectionProps {
  onNotificationsRead?: () => void;
}

export function NotificationsSection({ onNotificationsRead }: NotificationsSectionProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const accessToken = localStorage.getItem('sb-access-token');
      if (!accessToken) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/notifications`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const accessToken = localStorage.getItem('sb-access-token');
      if (!accessToken) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/notifications/mark-read/${notificationId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        
        // Notify parent that notification was read
        if (onNotificationsRead) {
          onNotificationsRead();
        }
        
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Notifications</h2>
          <Badge className="bg-gray-200 text-gray-600">Loading...</Badge>
        </div>
        <p className="text-gray-500 text-center py-8">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Admin Notifications</h2>
        {unreadCount > 0 && (
          <Badge className="bg-red-500 text-white">
            {unreadCount} Unread
          </Badge>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                !notification.is_read
                  ? 'bg-red-50 border-red-500'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0 ${
                  !notification.is_read ? 'ring-2 ring-red-500' : ''
                }`}>
                  <Shield className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <h3 className="text-red-900">
                        {notification.title}
                      </h3>
                    </div>
                    {!notification.is_read && (
                      <Badge className="bg-red-500 text-white text-xs flex-shrink-0">
                        New
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                    {notification.message}
                  </p>

                  {notification.metadata?.listing_url && (
                    <a
                      href={notification.metadata.listing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm inline-block mb-3"
                    >
                      View Related Listing →
                    </a>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    
                    {!notification.is_read && (
                      <Button
                        onClick={() => markAsRead(notification.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
