import { createClient } from "npm:@supabase/supabase-js@2";

// This cron function runs every 30 minutes to check for unread messages
// and can be extended to send notifications to users

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

interface UnreadMessageSummary {
  userId: string;
  userEmail: string;
  userName: string;
  unreadCount: number;
  conversationIds: string[];
}

async function checkUnreadMessages(): Promise<UnreadMessageSummary[]> {
  console.log('[CRON] Starting unread message check...');
  
  try {
    // Get all conversations that have unread messages
    const { data: unreadMessages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        is_read,
        conversations!inner (
          id,
          buyer_id,
          seller_id,
          is_admin_warning
        )
      `)
      .eq('is_read', false);

    if (messagesError) {
      console.error('[CRON] Error fetching unread messages:', messagesError);
      throw messagesError;
    }

    if (!unreadMessages || unreadMessages.length === 0) {
      console.log('[CRON] No unread messages found');
      return [];
    }

    console.log(`[CRON] Found ${unreadMessages.length} unread messages`);

    // Group unread messages by recipient
    const userUnreadMap = new Map<string, Set<string>>();

    for (const message of unreadMessages) {
      const conversation = message.conversations;
      if (!conversation) continue;

      // Determine the recipient (not the sender)
      let recipientId: string | null = null;
      
      if (conversation.is_admin_warning) {
        // Admin warnings are sent to the user (both buyer_id and seller_id are the same)
        recipientId = conversation.buyer_id;
      } else {
        // Regular messages: recipient is the other party
        if (message.sender_id === conversation.buyer_id) {
          recipientId = conversation.seller_id;
        } else if (message.sender_id === conversation.seller_id) {
          recipientId = conversation.buyer_id;
        }
      }

      if (recipientId && recipientId !== message.sender_id) {
        if (!userUnreadMap.has(recipientId)) {
          userUnreadMap.set(recipientId, new Set());
        }
        userUnreadMap.get(recipientId)!.add(message.conversation_id);
      }
    }

    // Fetch user details and create summary
    const summaries: UnreadMessageSummary[] = [];

    for (const [userId, conversationSet] of userUnreadMap.entries()) {
      // Get user profile
      const { data: userProfile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('email, first_name, last_name')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error(`[CRON] Error fetching profile for user ${userId}:`, profileError);
        continue;
      }

      summaries.push({
        userId,
        userEmail: userProfile?.email || '',
        userName: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 'User',
        unreadCount: conversationSet.size,
        conversationIds: Array.from(conversationSet),
      });
    }

    console.log(`[CRON] Found ${summaries.length} users with unread messages`);
    return summaries;

  } catch (error) {
    console.error('[CRON] Error in checkUnreadMessages:', error);
    throw error;
  }
}

async function sendNotifications(summaries: UnreadMessageSummary[]): Promise<void> {
  console.log(`[CRON] Preparing to send notifications to ${summaries.length} users`);

  for (const summary of summaries) {
    console.log(`[CRON] User ${summary.userName} (${summary.userEmail}) has ${summary.unreadCount} unread conversation(s)`);
    
    // TODO: Implement notification logic here
    // Options:
    // 1. Send email notifications (requires email service integration)
    // 2. Create in-app notifications in a notifications table
    // 3. Send push notifications (requires push notification service)
    // 4. Log to a notifications queue for processing
    
    // Example: Store notification in database
    try {
      const { error: notifError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: summary.userId,
          type: 'unread_messages',
          title: 'You have unread messages',
          message: `You have ${summary.unreadCount} unread conversation${summary.unreadCount > 1 ? 's' : ''}`,
          metadata: {
            unreadCount: summary.unreadCount,
            conversationIds: summary.conversationIds,
          },
          created_at: new Date().toISOString(),
        });

      if (notifError) {
        // Table might not exist yet - this is optional
        console.log(`[CRON] Note: Could not store notification in database (table may not exist):`, notifError.message);
      }
    } catch (error) {
      console.log('[CRON] Notification storage not available - continuing without it');
    }
  }

  console.log('[CRON] Notification processing complete');
}

// Main handler
Deno.serve(async (req) => {
  const startTime = Date.now();
  console.log(`[CRON] Message check cron started at ${new Date().toISOString()}`);

  try {
    // Verify this is a cron request (optional security check)
    const authHeader = req.headers.get('Authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    // If a cron secret is configured, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('[CRON] Unauthorized cron request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for unread messages
    const summaries = await checkUnreadMessages();

    // Send notifications if there are unread messages
    if (summaries.length > 0) {
      await sendNotifications(summaries);
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON] Message check completed in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        usersWithUnread: summaries.length,
        totalUnreadConversations: summaries.reduce((sum, s) => sum + s.unreadCount, 0),
        duration: `${duration}ms`,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[CRON] Fatal error in message check cron:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
