// Deal Analytics Tracking Utility
import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

/**
 * Track a deal view or redirect click
 * @param dealId - The deal ID
 * @param eventType - 'view' or 'redirect'
 */
export async function trackDealEvent(dealId: string, eventType: 'view' | 'redirect'): Promise<void> {
  try {
    // Fire and forget - don't block the UI
    fetch(`${API_URL}/deals/track-analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        dealId,
        eventType
      }),
    }).catch(error => {
      // Silent failure - analytics should never break the app
      console.warn('Failed to track analytics:', error);
    });
  } catch (error) {
    // Silent failure
    console.warn('Failed to track analytics:', error);
  }
}

/**
 * Track deal view (when modal opens)
 */
export function trackDealView(dealId: string): void {
  trackDealEvent(dealId, 'view');
}

/**
 * Track deal redirect (when user clicks "View Deal")
 */
export function trackDealRedirect(dealId: string): void {
  trackDealEvent(dealId, 'redirect');
}
