import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendEmail, unreadMessagesTemplate, dealExpiringTemplate, dealExpiredTemplate, newDealsDigestTemplate, listingExpiringTemplate, listingExpiredTemplate } from "./resend-mailer.tsx";

const cronApp = new Hono();

// Create Supabase admin client
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// ============================================
// MESSAGE CHECK CRON (runs every 30 minutes)
// ============================================

interface UnreadMessageSummary {
  userId: string;
  userEmail: string;
  userName: string;
  unreadCount: number;
  conversationIds: string[];
}

async function checkUnreadMessages(): Promise<UnreadMessageSummary[]> {
  console.log('[CRON] Starting unread message check...');
  
  const supabaseAdmin = getSupabaseAdmin();
  
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

async function sendUnreadNotifications(summaries: UnreadMessageSummary[]): Promise<void> {
  console.log(`[CRON] Preparing to send notifications to ${summaries.length} users`);

  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://yourdomain.com';
  const messagesUrl = `${baseUrl}/messages`;

  for (const summary of summaries) {
    console.log(`[CRON] User ${summary.userName} (${summary.userEmail}) has ${summary.unreadCount} unread conversation(s)`);
    
    try {
      const emailHtml = unreadMessagesTemplate({
        userName: summary.userName,
        unreadCount: summary.unreadCount,
        conversationIds: summary.conversationIds,
        messagesUrl,
      });

      const result = await sendEmail({
        to: summary.userEmail,
        subject: `You have ${summary.unreadCount} unread message${summary.unreadCount > 1 ? 's' : ''} on Locksmith Marketplace`,
        html: emailHtml,
      });

      if (result.success) {
        console.log(`[CRON] ✅ Email sent to ${summary.userEmail} (Message ID: ${result.messageId})`);
      } else {
        console.error(`[CRON] ❌ Failed to send email to ${summary.userEmail}: ${result.error}`);
      }
      
      // Add delay to respect Resend's rate limit (2 requests/second)
      await new Promise(resolve => setTimeout(resolve, 600));
      
    } catch (error) {
      console.error(`[CRON] Error sending email to ${summary.userEmail}:`, error);
    }
  }

  console.log('[CRON] Notification processing complete');
}

cronApp.post("/message-check-cron", async (c) => {
  const startTime = Date.now();
  console.log(`[CRON] Message check cron started at ${new Date().toISOString()}`);

  try {
    const summaries = await checkUnreadMessages();

    if (summaries.length > 0) {
      await sendUnreadNotifications(summaries);
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON] Message check completed in ${duration}ms`);

    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      usersWithUnread: summaries.length,
      totalUnreadConversations: summaries.reduce((sum, s) => sum + s.unreadCount, 0),
      duration: `${duration}ms`,
    });

  } catch (error) {
    console.error('[CRON] Fatal error in message check cron:', error);
    
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// ============================================
// DEAL EXPIRATION CRON (runs daily at midnight)
// ============================================

interface ExpiringDeal {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  expires_at: string;
  external_url: string;
  retailer_profile_id: string;
  retailerName: string;
  retailerEmail: string;
}

interface ExpiredDeal {
  id: string;
  title: string;
  price: number;
  retailer_profile_id: string;
  retailerName: string;
  retailerEmail: string;
}

async function findExpiringDeals(): Promise<ExpiringDeal[]> {
  console.log('[CRON] Checking for deals expiring in next 24 hours...');

  const supabaseAdmin = getSupabaseAdmin();
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    const { data: deals, error } = await supabaseAdmin
      .from('deals')
      .select(`
        id,
        title,
        price,
        original_price,
        expires_at,
        external_url,
        retailer_profile_id,
        retailer_profiles!inner (
          company_name,
          contact_email
        )
      `)
      .eq('status', 'active')
      .gte('expires_at', now.toISOString())
      .lte('expires_at', in24Hours.toISOString());

    if (error) {
      console.error('[CRON] Error fetching expiring deals:', error);
      return [];
    }

    if (!deals || deals.length === 0) {
      console.log('[CRON] No deals expiring in next 24 hours');
      return [];
    }

    console.log(`[CRON] Found ${deals.length} deals expiring in next 24 hours`);

    return deals.map((deal: any) => ({
      id: deal.id,
      title: deal.title,
      price: deal.price,
      original_price: deal.original_price,
      expires_at: deal.expires_at,
      external_url: deal.external_url,
      retailer_profile_id: deal.retailer_profile_id,
      retailerName: deal.retailer_profiles.company_name || 'Retailer',
      retailerEmail: deal.retailer_profiles.contact_email,
    }));

  } catch (error) {
    console.error('[CRON] Error in findExpiringDeals:', error);
    return [];
  }
}

async function processExpiredDeals(): Promise<ExpiredDeal[]> {
  console.log('[CRON] Checking for expired deals...');

  const supabaseAdmin = getSupabaseAdmin();
  const now = new Date();

  try {
    const { data: expiredDeals, error: fetchError } = await supabaseAdmin
      .from('deals')
      .select(`
        id,
        title,
        price,
        retailer_profile_id,
        retailer_profiles!inner (
          company_name,
          contact_email
        )
      `)
      .eq('status', 'active')
      .lt('expires_at', now.toISOString());

    if (fetchError) {
      console.error('[CRON] Error fetching expired deals:', fetchError);
      return [];
    }

    if (!expiredDeals || expiredDeals.length === 0) {
      console.log('[CRON] No expired deals found');
      return [];
    }

    console.log(`[CRON] Found ${expiredDeals.length} expired deals`);

    const dealIds = expiredDeals.map((d: any) => d.id);
    const { error: updateError } = await supabaseAdmin
      .from('deals')
      .update({ status: 'expired' })
      .in('id', dealIds);

    if (updateError) {
      console.error('[CRON] Error marking deals as expired:', updateError);
      return [];
    }

    console.log(`[CRON] Marked ${dealIds.length} deals as expired`);

    return expiredDeals.map((deal: any) => ({
      id: deal.id,
      title: deal.title,
      price: deal.price,
      retailer_profile_id: deal.retailer_profile_id,
      retailerName: deal.retailer_profiles.company_name || 'Retailer',
      retailerEmail: deal.retailer_profiles.contact_email,
    }));

  } catch (error) {
    console.error('[CRON] Error in processExpiredDeals:', error);
    return [];
  }
}

async function sendExpiringDealNotifications(deals: ExpiringDeal[]): Promise<void> {
  console.log(`[CRON] Sending expiration warnings for ${deals.length} deals...`);

  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://yourdomain.com';

  for (const deal of deals) {
    try {
      const dealUrl = `${baseUrl}/deals/${deal.id}`;
      const dashboardUrl = `${baseUrl}/retailer-dashboard`;

      const emailHtml = dealExpiringTemplate({
        retailerName: deal.retailerName,
        dealTitle: deal.title,
        expiresAt: deal.expires_at,
        dealUrl,
        dashboardUrl,
      });

      const result = await sendEmail({
        to: deal.retailerEmail,
        subject: `⏰ Your deal \"${deal.title}\" expires in 24 hours`,
        html: emailHtml,
      });

      if (result.success) {
        console.log(`[CRON] ✅ Expiration warning sent to ${deal.retailerEmail} for deal: ${deal.title}`);
      } else {
        console.error(`[CRON] ❌ Failed to send warning to ${deal.retailerEmail}: ${result.error}`);
      }
      
      // Add delay to respect Resend's rate limit
      await new Promise(resolve => setTimeout(resolve, 600));
      
    } catch (error) {
      console.error(`[CRON] Error sending expiration warning for deal ${deal.id}:`, error);
    }
  }
}

async function sendExpiredDealNotifications(deals: ExpiredDeal[]): Promise<void> {
  console.log(`[CRON] Sending expired notifications for ${deals.length} deals...`);

  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://yourdomain.com';
  const dashboardUrl = `${baseUrl}/retailer-dashboard`;

  for (const deal of deals) {
    try {
      const emailHtml = dealExpiredTemplate({
        retailerName: deal.retailerName,
        dealTitle: deal.title,
        dealPrice: `$${deal.price.toFixed(2)}`,
        dashboardUrl,
      });

      const result = await sendEmail({
        to: deal.retailerEmail,
        subject: `Your deal "${deal.title}" has expired`,
        html: emailHtml,
      });

      if (result.success) {
        console.log(`[CRON] ✅ Expiration notice sent to ${deal.retailerEmail} for deal: ${deal.title}`);
      } else {
        console.error(`[CRON] ❌ Failed to send notice to ${deal.retailerEmail}: ${result.error}`);
      }
      
      // Add delay to respect Resend's rate limit
      await new Promise(resolve => setTimeout(resolve, 600));
      
    } catch (error) {
      console.error(`[CRON] Error sending expired notice for deal ${deal.id}:`, error);
    }
  }
}

cronApp.post("/deal-expiration-cron", async (c) => {
  const startTime = Date.now();
  console.log(`[CRON] Deal expiration check started at ${new Date().toISOString()}`);

  try {
    const expiredDeals = await processExpiredDeals();

    if (expiredDeals.length > 0) {
      await sendExpiredDealNotifications(expiredDeals);
    }

    const expiringDeals = await findExpiringDeals();

    if (expiringDeals.length > 0) {
      await sendExpiringDealNotifications(expiringDeals);
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON] Deal expiration check completed in ${duration}ms`);

    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredDeals: expiredDeals.length,
      expiringDeals: expiringDeals.length,
      duration: `${duration}ms`,
    });

  } catch (error) {
    console.error('[CRON] Fatal error in deal expiration cron:', error);
    
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// ============================================
// DEAL DIGEST CRON (runs every 72 hours)
// ============================================

cronApp.post("/deal-digest-cron", async (c) => {
  const startTime = Date.now();
  console.log(`[CRON] ========================================`);
  console.log(`[CRON] Deal digest started at ${new Date().toISOString()}`);
  console.log(`[CRON] ========================================`);

  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Get the last time we sent a digest (global timestamp)
    console.log(`[CRON] 🔍 STEP 1: Fetching last digest timestamp from database...`);
    const { data: lastDigestData, error: fetchError } = await supabaseAdmin
      .from('digest_tracking_a7e285ba')
      .select('last_digest_sent_at')
      .order('last_digest_sent_at', { ascending: false })
      .limit(1)
      .single();
    
    if (fetchError) {
      console.log(`[CRON] ⚠️ No previous digest record found (table empty): ${fetchError.message}`);
    }
    
    const lastDigestSentAt = lastDigestData?.last_digest_sent_at 
      ? new Date(lastDigestData.last_digest_sent_at)
      : new Date(Date.now() - 72 * 60 * 60 * 1000); // Default: 72 hours ago if never sent
    
    console.log(`[CRON] 📅 Last digest was sent at: ${lastDigestSentAt.toISOString()}`);
    console.log(`[CRON] 📅 Current time is: ${new Date().toISOString()}`);
    console.log(`[CRON] 📅 Time difference: ${Math.floor((Date.now() - lastDigestSentAt.getTime()) / (60 * 1000))} minutes`);
    
    // Get all active deals created AFTER last digest
    console.log(`[CRON] 🔍 STEP 2: Querying deals created >= ${lastDigestSentAt.toISOString()}...`);
    const { data: newDeals, error: dealsError } = await supabaseAdmin
      .from('deals')
      .select(`
        id,
        title,
        description,
        price,
        original_price,
        created_at,
        retailer_profiles!inner (
          company_name
        )
      `)
      .eq('status', 'active')
      .gte('created_at', lastDigestSentAt.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (dealsError) {
      console.error('[CRON] ❌ Error fetching new deals:', dealsError);
      throw dealsError;
    }

    console.log(`[CRON] 📊 Query returned ${newDeals?.length || 0} deals`);
    
    if (newDeals && newDeals.length > 0) {
      console.log(`[CRON] 📋 Deal details:`);
      newDeals.forEach((deal: any, index: number) => {
        console.log(`[CRON]   ${index + 1}. "${deal.title}" created at ${deal.created_at}`);
      });
    }

    // If NO new deals, skip sending emails entirely
    if (!newDeals || newDeals.length === 0) {
      console.log('[CRON] ✅ No new deals since last digest. Skipping emails.');
      console.log(`[CRON] ========================================`);
      return c.json({
        success: true,
        timestamp: new Date().toISOString(),
        newDeals: 0,
        emailsSent: 0,
        skipped: true,
        message: 'No new deals to digest',
        duration: `${Date.now() - startTime}ms`,
      });
    }

    console.log(`[CRON] ✅ Found ${newDeals.length} new deals to digest`);

    // Get all users to send digest
    console.log(`[CRON] 🔍 STEP 3: Fetching user profiles to send digest...`);
    const { data: users, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, first_name, last_name')
      .not('email', 'is', null);

    if (usersError) {
      console.error('[CRON] ❌ Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`[CRON] Sending digest to ${users?.length || 0} users`);

    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://yourdomain.com';
    const dealsUrl = `${baseUrl}/deals`;

    let emailsSent = 0;

    for (const user of users || []) {
      try {
        const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
        
        const dealsForEmail = newDeals.map((deal: any) => ({
          id: deal.id,
          title: deal.title,
          description: deal.description || '',
          price: `$${deal.price.toFixed(2)}`,
          originalPrice: deal.original_price ? `$${deal.original_price.toFixed(2)}` : undefined,
          retailerName: deal.retailer_profiles.company_name || 'Retailer',
          dealUrl: `${baseUrl}/deals`,
        }));

        const emailHtml = newDealsDigestTemplate({
          userName,
          deals: dealsForEmail,
          dealsUrl,
          unsubscribeUrl: `${baseUrl}/account`,
        });

        const result = await sendEmail({
          to: user.email,
          subject: `🔑 ${newDeals.length} New Deals on Locksmith Marketplace`,
          html: emailHtml,
        });

        if (result.success) {
          console.log(`[CRON] ✅ Digest sent to ${user.email}`);
          emailsSent++;
        } else {
          console.error(`[CRON] ❌ Failed to send digest to ${user.email}: ${result.error}`);
        }
        
        // Add delay to respect Resend's rate limit (2 requests/second)
        // Wait 600ms between emails to stay under the limit
        await new Promise(resolve => setTimeout(resolve, 600));
        
      } catch (error) {
        console.error(`[CRON] Error sending digest to ${user.email}:`, error);
      }
    }

    // Update last digest timestamp AFTER successful send
    const now = new Date().toISOString();
    
    // Insert or update the timestamp (table should only have 1 row)
    console.log(`[CRON] 🔍 STEP 4: Updating last digest timestamp in database...`);
    console.log(`[CRON] 📝 About to upsert: { id: 1, last_digest_sent_at: "${now}", updated_at: "${now}" }`);
    
    const { data: upsertData, error: upsertError } = await supabaseAdmin
      .from('digest_tracking_a7e285ba')
      .upsert({
        id: 1, // Fixed ID to ensure single row
        last_digest_sent_at: now,
        updated_at: now,
      })
      .select();
    
    if (upsertError) {
      console.error('[CRON] ❌ CRITICAL ERROR updating digest timestamp:', upsertError);
      console.error('[CRON] ❌ Error details:', JSON.stringify(upsertError, null, 2));
    } else {
      console.log(`[CRON] ✅ Updated last_digest_sent_at to: ${now}`);
      console.log(`[CRON] ✅ Upsert result:`, JSON.stringify(upsertData, null, 2));
    }
    
    const duration = Date.now() - startTime;
    console.log(`[CRON] Deal digest completed in ${duration}ms`);
    console.log(`[CRON] ========================================`);

    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      newDeals: newDeals.length,
      emailsSent,
      duration: `${duration}ms`,
    });

  } catch (error) {
    console.error('[CRON] Fatal error in deal digest cron:', error);
    
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// ============================================
// LISTING EXPIRATION CRON (runs daily at midnight)
// ============================================

interface ExpiringListing {
  id: string;
  title: string;
  price: number;
  expires_at: string;
  seller_id: string;
  sellerEmail: string;
  sellerName: string;
}

interface ExpiredListing {
  id: string;
  title: string;
  price: number;
  seller_id: string;
  sellerEmail: string;
  sellerName: string;
}

async function findExpiringListings(): Promise<ExpiringListing[]> {
  console.log('[CRON] Checking for listings expiring in next 24 hours...');

  const supabaseAdmin = getSupabaseAdmin();
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    const { data: listings, error } = await supabaseAdmin
      .from('marketplace_listings')
      .select(`
        id,
        title,
        price,
        expires_at,
        seller_id,
        user_profiles!inner (
          email,
          first_name,
          last_name
        )
      `)
      .eq('status', 'active')
      .gte('expires_at', now.toISOString())
      .lte('expires_at', in24Hours.toISOString());

    if (error) {
      console.error('[CRON] Error fetching expiring listings:', error);
      return [];
    }

    if (!listings || listings.length === 0) {
      console.log('[CRON] No listings expiring in next 24 hours');
      return [];
    }

    console.log(`[CRON] Found ${listings.length} listings expiring in next 24 hours`);

    return listings.map((listing: any) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      expires_at: listing.expires_at,
      seller_id: listing.seller_id,
      sellerEmail: listing.user_profiles.email,
      sellerName: `${listing.user_profiles.first_name || ''} ${listing.user_profiles.last_name || ''}`.trim() || 'User',
    }));

  } catch (error) {
    console.error('[CRON] Error in findExpiringListings:', error);
    return [];
  }
}

async function processExpiredListings(): Promise<ExpiredListing[]> {
  console.log('[CRON] Checking for expired listings...');

  const supabaseAdmin = getSupabaseAdmin();
  const now = new Date();

  try {
    const { data: expiredListings, error: fetchError } = await supabaseAdmin
      .from('marketplace_listings')
      .select(`
        id,
        title,
        price,
        seller_id,
        user_profiles!inner (
          email,
          first_name,
          last_name
        )
      `)
      .eq('status', 'active')
      .lt('expires_at', now.toISOString());

    if (fetchError) {
      console.error('[CRON] Error fetching expired listings:', fetchError);
      return [];
    }

    if (!expiredListings || expiredListings.length === 0) {
      console.log('[CRON] No expired listings found');
      return [];
    }

    console.log(`[CRON] Found ${expiredListings.length} expired listings`);

    const listingIds = expiredListings.map((l: any) => l.id);
    const { error: updateError } = await supabaseAdmin
      .from('marketplace_listings')
      .update({ status: 'expired' })
      .in('id', listingIds);

    if (updateError) {
      console.error('[CRON] Error marking listings as expired:', updateError);
      return [];
    }

    console.log(`[CRON] Marked ${listingIds.length} listings as expired`);

    return expiredListings.map((listing: any) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      seller_id: listing.seller_id,
      sellerEmail: listing.user_profiles.email,
      sellerName: `${listing.user_profiles.first_name || ''} ${listing.user_profiles.last_name || ''}`.trim() || 'User',
    }));

  } catch (error) {
    console.error('[CRON] Error in processExpiredListings:', error);
    return [];
  }
}

async function sendExpiringListingNotifications(listings: ExpiringListing[]): Promise<void> {
  console.log(`[CRON] Sending expiration warnings for ${listings.length} listings...`);

  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://yourdomain.com';

  for (const listing of listings) {
    try {
      const listingUrl = `${baseUrl}/marketplace`;
      const accountUrl = `${baseUrl}/account`;

      const emailHtml = listingExpiringTemplate({
        userName: listing.sellerName,
        listingTitle: listing.title,
        listingPrice: `$${listing.price.toFixed(2)}`,
        expiresAt: listing.expires_at,
        listingUrl,
        renewUrl: accountUrl,
      });

      const result = await sendEmail({
        to: listing.sellerEmail,
        subject: `⏰ Your listing "${listing.title}" expires in 24 hours`,
        html: emailHtml,
      });

      if (result.success) {
        console.log(`[CRON] ✅ Expiration warning sent to ${listing.sellerEmail} for listing: ${listing.title}`);
      } else {
        console.error(`[CRON] ❌ Failed to send warning to ${listing.sellerEmail}: ${result.error}`);
      }
      
      // Add delay to respect Resend's rate limit
      await new Promise(resolve => setTimeout(resolve, 600));
      
    } catch (error) {
      console.error(`[CRON] Error sending expiration warning for listing ${listing.id}:`, error);
    }
  }
}

async function sendExpiredListingNotifications(listings: ExpiredListing[]): Promise<void> {
  console.log(`[CRON] Sending expired notifications for ${listings.length} listings...`);

  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://yourdomain.com';
  const accountUrl = `${baseUrl}/account`;

  for (const listing of listings) {
    try {
      const emailHtml = listingExpiredTemplate({
        userName: listing.sellerName,
        listingTitle: listing.title,
        listingPrice: `$${listing.price.toFixed(2)}`,
        relistUrl: accountUrl,
      });

      const result = await sendEmail({
        to: listing.sellerEmail,
        subject: `Your listing "${listing.title}" has expired`,
        html: emailHtml,
      });

      if (result.success) {
        console.log(`[CRON] ✅ Expiration notice sent to ${listing.sellerEmail} for listing: ${listing.title}`);
      } else {
        console.error(`[CRON] ❌ Failed to send notice to ${listing.sellerEmail}: ${result.error}`);
      }
      
      // Add delay to respect Resend's rate limit
      await new Promise(resolve => setTimeout(resolve, 600));
      
    } catch (error) {
      console.error(`[CRON] Error sending expired notice for listing ${listing.id}:`, error);
    }
  }
}

cronApp.post("/listing-expiration-cron", async (c) => {
  const startTime = Date.now();
  console.log(`[CRON] Listing expiration check started at ${new Date().toISOString()}`);

  try {
    const expiredListings = await processExpiredListings();

    if (expiredListings.length > 0) {
      await sendExpiredListingNotifications(expiredListings);
    }

    const expiringListings = await findExpiringListings();

    if (expiringListings.length > 0) {
      await sendExpiringListingNotifications(expiringListings);
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON] Listing expiration check completed in ${duration}ms`);

    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredListings: expiredListings.length,
      expiringListings: expiringListings.length,
      duration: `${duration}ms`,
    });

  } catch (error) {
    console.error('[CRON] Fatal error in listing expiration cron:', error);
    
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

export default cronApp;