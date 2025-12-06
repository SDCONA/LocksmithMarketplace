import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AuthService } from '../utils/auth';

interface PolicyNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
}

export function PolicyUpdateModal() {
  const [notification, setNotification] = useState<PolicyNotification | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log('[PolicyModal] Component mounted, starting initialization...');
    // Wait a bit for auth to settle, then check
    const timer = setTimeout(() => {
      console.log('[PolicyModal] Timer expired, calling checkForPolicyUpdates...');
      checkForPolicyUpdates();
    }, 1500); // Increased to 1.5 seconds

    return () => {
      console.log('[PolicyModal] Component unmounting, clearing timer');
      clearTimeout(timer);
    };
  }, []);

  // Add test button in development
  useEffect(() => {
    // @ts-ignore - dev only
    window.testPolicyModal = () => {
      console.log('[PolicyModal] Manual test triggered');
      checkForPolicyUpdates();
    };
    // @ts-ignore - dev only
    window.forceShowModal = () => {
      console.log('[PolicyModal] Force showing modal');
      setNotification({
        id: 'test',
        title: 'Test Policy Update',
        message: 'This is a test notification',
        created_at: new Date().toISOString(),
        is_read: false,
        type: 'policy_update'
      });
      setOpen(true);
    };
  }, []);

  const checkForPolicyUpdates = async () => {
    console.log('[PolicyModal] === START checkForPolicyUpdates ===');
    try {
      const token = await AuthService.getFreshToken();
      console.log('[PolicyModal] Checking for updates, token exists:', !!token);
      console.log('[PolicyModal] Token length:', token?.length || 0);
      
      if (!token) {
        console.log('[PolicyModal] No token found, skipping check');
        return;
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/notifications`;
      console.log('[PolicyModal] Fetching from:', url);
      console.log('[PolicyModal] projectId:', projectId);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(err => {
        console.error('[PolicyModal] Fetch error:', err);
        throw err;
      });

      console.log('[PolicyModal] Response received, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[PolicyModal] Response not ok:', response.status, errorText);
        return;
      }

      const data = await response.json();
      console.log('[PolicyModal] Response data:', data);
      console.log('[PolicyModal] Notifications array:', data.notifications);
      console.log('[PolicyModal] Notifications count:', data.notifications?.length || 0);
      
      if (!data.notifications || data.notifications.length === 0) {
        console.log('[PolicyModal] No notifications found');
        return;
      }

      // Find unread policy notifications
      const policyNotifications = data.notifications.filter(
        (n: PolicyNotification) => {
          console.log('[PolicyModal] Checking notification:', n.id, 'type:', n.type, 'is_read:', n.is_read);
          return n.type === 'policy_update' && !n.is_read;
        }
      );

      console.log('[PolicyModal] Unread policy notifications:', policyNotifications.length);

      if (policyNotifications.length > 0) {
        // Show the most recent one
        const latest = policyNotifications[0];
        console.log('[PolicyModal] Showing notification:', latest);
        setNotification(latest);
        setOpen(true);
      } else {
        console.log('[PolicyModal] No unread policy notifications to show');
      }
    } catch (error) {
      console.error('[PolicyModal] Error checking policy updates:', error);
      if (error instanceof Error) {
        console.error('[PolicyModal] Error message:', error.message);
        console.error('[PolicyModal] Error stack:', error.stack);
      }
    }
  };

  const handleOk = async () => {
    if (!notification) return;

    console.log('[PolicyModal] Marking notification as read:', notification.id);

    try {
      const token = await AuthService.getFreshToken();
      if (!token) {
        setOpen(false);
        return;
      }

      // Mark as read
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/notifications/${notification.id}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        console.log('[PolicyModal] Notification marked as read successfully');
      } else {
        const errorText = await response.text();
        console.error('[PolicyModal] Failed to mark as read:', response.status, errorText);
      }

      setOpen(false);
      setNotification(null);
    } catch (error) {
      console.error('[PolicyModal] Error marking notification as read:', error);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Policy Update</DialogTitle>
          <DialogDescription>
            We've updated our policies
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            Our Terms of Service and Privacy Policy have been updated. 
            If you'd like to review the changes, please visit the Policy page.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleOk} className="w-full">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}