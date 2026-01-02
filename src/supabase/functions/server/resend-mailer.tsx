// Resend Email Service Integration
// Handles sending transactional emails via Resend API

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface ResendResponse {
  id?: string;
  error?: {
    message: string;
    name: string;
  };
}

// Using your verified domain for sending emails
const DEFAULT_FROM = 'Locksmith Marketplace <noreply@locksmithmarketplace.com>';

/**
 * Send an email using Resend API
 * @param options - Email options (to, subject, html, from, replyTo)
 * @returns Promise with success status and message ID
 */
export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const apiKey = Deno.env.get('RESEND_API_KEY');

  if (!apiKey) {
    console.error('[Resend] API key not configured');
    return {
      success: false,
      error: 'Email service not configured'
    };
  }

  try {
    console.log(`[Resend] Sending email to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || DEFAULT_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    const data: ResendResponse = await response.json();

    if (!response.ok) {
      console.error('[Resend] API error:', data.error);
      console.error('[Resend] Full response:', data);
      console.error('[Resend] Status code:', response.status);
      return {
        success: false,
        error: data.error?.message || JSON.stringify(data) || `HTTP ${response.status}: Failed to send email`
      };
    }

    console.log(`[Resend] Email sent successfully. Message ID: ${data.id}`);
    return {
      success: true,
      messageId: data.id
    };

  } catch (error) {
    console.error('[Resend] Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send bulk emails (batch send)
 * @param emails - Array of email options
 * @returns Promise with results for each email
 */
export async function sendBulkEmails(emails: EmailOptions[]): Promise<{
  success: boolean;
  results: Array<{ success: boolean; messageId?: string; error?: string }>;
}> {
  const results: Array<{ success: boolean; messageId?: string; error?: string }> = [];
  
  // Resend's rate limit: 2 requests per second
  // Send emails sequentially with 600ms delay (allows ~1.6 emails/sec to be safe)
  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);
    
    // Add delay between sends (except after the last one)
    if (emails.indexOf(email) < emails.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  const allSuccessful = results.every(r => r.success);

  return {
    success: allSuccessful,
    results
  };
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Template: Unread Messages Notification
 */
export function unreadMessagesTemplate(data: {
  userName: string;
  unreadCount: number;
  conversationIds: string[];
  messagesUrl: string;
}): string {
  const { userName, unreadCount, messagesUrl } = data;
  const plural = unreadCount > 1 ? 's' : '';
  const settingsUrl = messagesUrl.replace('/messages', '/account');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You have unread messages</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">💬 New Message${plural}</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>
    
    <p style="font-size: 16px;">You have <strong>${unreadCount} unread conversation${plural}</strong> waiting for you on Locksmith Marketplace.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${messagesUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Messages</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Don't keep your buyers or sellers waiting! Quick responses lead to better deals.</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>You're receiving this email because you have an account on Locksmith Marketplace.</p>
    <p style="margin: 5px 0;">
      <a href="${settingsUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe or manage notification preferences</a>
    </p>
    <p style="margin-top: 15px;">© 2025 Locksmith Marketplace. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Deal Expiration Warning (24 hours before)
 */
export function dealExpiringTemplate(data: {
  retailerName: string;
  dealTitle: string;
  expiresAt: string;
  dealUrl: string;
  dashboardUrl: string;
}): string {
  const { retailerName, dealTitle, expiresAt, dealUrl, dashboardUrl } = data;
  const expiryDate = new Date(expiresAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const settingsUrl = dashboardUrl.replace('/retailer-dashboard', '/account');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deal Expiring Soon</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Deal Expiring Soon</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${retailerName},</p>
    
    <p style="font-size: 16px;">Your deal is expiring soon and will be automatically removed from the marketplace:</p>
    
    <div style="background: white; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${dealTitle}</h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Expires: <strong style="color: #ef4444;">${expiryDate}</strong></p>
    </div>
    
    <p style="font-size: 16px;">Want to keep this deal active? Extend the expiration date or upload a new deal.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">Manage Deals</a>
      <a href="${dealUrl}" style="display: inline-block; background: white; color: #667eea; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #667eea;">View Deal</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">💡 Tip: Upload fresh deals regularly to keep customers engaged!</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">
      <a href="${settingsUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe or manage notification preferences</a>
    </p>
    <p style="margin-top: 15px;">© 2025 Locksmith Marketplace. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Deal Expired (automatic removal notification)
 */
export function dealExpiredTemplate(data: {
  retailerName: string;
  dealTitle: string;
  dealPrice: string;
  dashboardUrl: string;
}): string {
  const { retailerName, dealTitle, dealPrice, dashboardUrl } = data;
  const settingsUrl = dashboardUrl.replace('/retailer-dashboard', '/account');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deal Expired</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #6b7280; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📦 Deal Expired</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${retailerName},</p>
    
    <p style="font-size: 16px;">The following deal has reached its expiration date and has been removed from the marketplace:</p>
    
    <div style="background: white; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${dealTitle}</h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Price: ${dealPrice}</p>
    </div>
    
    <p style="font-size: 16px;">Ready to post a new deal? Upload your latest offers and reach thousands of locksmiths.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Upload New Deal</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">💡 Reminder: Deals expire after 48 hours to keep the marketplace fresh and relevant.</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">
      <a href="${settingsUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe or manage notification preferences</a>
    </p>
    <p style="margin-top: 15px;">© 2025 Locksmith Marketplace. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Admin Warning
 */
export function adminWarningTemplate(data: {
  userName: string;
  warningMessage: string;
  accountUrl: string;
}): string {
  const { userName, warningMessage, accountUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Important Account Notice</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Important Notice</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>
    
    <p style="font-size: 16px;">The Locksmith Marketplace team has sent you an important message regarding your account:</p>
    
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #1f2937; font-size: 15px;">${warningMessage}</p>
    </div>
    
    <p style="font-size: 16px;">If you have questions or concerns, please contact our support team.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${accountUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Account</a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© 2025 Locksmith Marketplace. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Template: New Deals Digest (Every 72 hours)
 */
export function newDealsDigestTemplate(data: {
  userName: string;
  deals: Array<{
    id: string;
    title: string;
    price: string;
    originalPrice?: string;
    retailerName: string;
    imageUrl?: string;
  }>;
  dealsUrl: string;
  unsubscribeUrl: string;
}): string {
  const { userName, deals, dealsUrl, unsubscribeUrl } = data;
  const dealCount = deals.length;

  // Generate deal cards HTML
  const dealCards = deals.slice(0, 6).map(deal => `
    <div style="background: white; border-radius: 8px; overflow: hidden; margin-bottom: 15px; border: 1px solid #e5e7eb;">
      ${deal.imageUrl ? `
      <img src="${deal.imageUrl}" alt="${deal.title}" style="width: 100%; height: 150px; object-fit: cover;">
      ` : ''}
      <div style="padding: 15px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937;">${deal.title}</h3>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">by ${deal.retailerName}</p>
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <span style="font-size: 22px; font-weight: 700; color: #10b981;">${deal.price}</span>
          ${deal.originalPrice ? `
          <span style="font-size: 14px; color: #9ca3af; text-decoration: line-through;">${deal.originalPrice}</span>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Deals This Week</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f3f4f6;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔥 Hot New Deals!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${dealCount} fresh deal${dealCount > 1 ? 's' : ''} just for you</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>
    
    <p style="font-size: 16px;">Great news! We've got <strong>${dealCount} new deal${dealCount > 1 ? 's' : ''}</strong> from trusted retailers in the past few days. Don't miss out on these limited-time offers!</p>
    
    <div style="margin: 25px 0;">
      ${dealCards}
    </div>
    
    ${deals.length > 6 ? `
    <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
      <p style="margin: 0; color: #047857; font-size: 15px;">
        <strong>+ ${deals.length - 6} more deal${deals.length - 6 > 1 ? 's' : ''}</strong> waiting for you!
      </p>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dealsUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Browse All Deals</a>
    </div>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">💡 <strong>Pro Tip:</strong></p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">Deals expire after 48 hours! Act fast to secure the best prices on automotive keys and equipment.</p>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>You're receiving this digest every 3 days because you're a Locksmith Marketplace member.</p>
    <p style="margin: 5px 0;">
      <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">Manage email preferences</a>
    </p>
    <p style="margin-top: 15px;">© 2025 Locksmith Marketplace. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Marketplace Listing Expiring Soon (24 hours before)
 */
export function listingExpiringTemplate(data: {
  userName: string;
  listingTitle: string;
  listingPrice: string;
  expiresAt: string;
  listingUrl: string;
  renewUrl: string;
}): string {
  const { userName, listingTitle, listingPrice, expiresAt, listingUrl, renewUrl } = data;
  const expiryDate = new Date(expiresAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const settingsUrl = renewUrl.split('?')[0].replace(/\/[^\/]*$/, '/account');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Listing Expiring Soon</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Listing Expiring Soon</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>
    
    <p style="font-size: 16px;">Your marketplace listing is expiring in 24 hours and will be automatically archived:</p>
    
    <div style="background: white; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${listingTitle}</h3>
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Price: <strong style="color: #10b981;">${listingPrice}</strong></p>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Expires: <strong style="color: #ef4444;">${expiryDate}</strong></p>
    </div>
    
    <p style="font-size: 16px;">Want to keep this listing active? You can renew it now to extend the expiration date.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${renewUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">Renew Listing</a>
      <a href="${listingUrl}" style="display: inline-block; background: white; color: #667eea; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #667eea;">View Listing</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">💡 Tip: Keep your listings fresh to attract more buyers!</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">
      <a href="${settingsUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe or manage notification preferences</a>
    </p>
    <p style="margin-top: 15px;">© 2025 Locksmith Marketplace. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Marketplace Listing Expired
 */
export function listingExpiredTemplate(data: {
  userName: string;
  listingTitle: string;
  listingPrice: string;
  relistUrl: string;
}): string {
  const { userName, listingTitle, listingPrice, relistUrl } = data;
  const settingsUrl = relistUrl.split('?')[0].replace(/\/[^\/]*$/, '/account');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Listing Expired</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #6b7280; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📦 Listing Expired</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>
    
    <p style="font-size: 16px;">Your marketplace listing has reached its expiration date and has been automatically archived:</p>
    
    <div style="background: white; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${listingTitle}</h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Price: ${listingPrice}</p>
    </div>
    
    <p style="font-size: 16px;">Still have this item? You can relist it with just one click to make it visible to buyers again.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${relistUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Relist Now</a>
    </div>
    
    <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #78350f;">
        <strong>💡 Why do listings expire?</strong><br>
        We automatically archive listings after 30 days to keep our marketplace fresh and ensure buyers see only active items.
      </p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Thanks for being part of Locksmith Marketplace!</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">
      <a href="${settingsUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe or manage notification preferences</a>
    </p>
    <p style="margin-top: 15px;">© 2025 Locksmith Marketplace. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Email Verification
 */
export function emailVerificationTemplate(data: {
  userName: string;
  verificationUrl: string;
}): string {
  const { userName, verificationUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Locksmith Marketplace!</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>
    
    <p style="font-size: 16px;">Thanks for signing up! We're excited to have you join our community of locksmiths and automotive key professionals.</p>
    
    <p style="font-size: 16px;">To complete your registration and start using Locksmith Marketplace, please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Verify Email Address</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">If you didn't create an account with Locksmith Marketplace, you can safely ignore this email.</p>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">This verification link will expire in 24 hours.</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© 2025 Locksmith Marketplace. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Password Reset
 */
export function passwordResetTemplate(data: {
  userName: string;
  resetUrl: string;
  resetCode: string;
}): string {
  const { userName, resetUrl, resetCode } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>
    
    <p style="font-size: 16px;">We received a request to reset your password for your Locksmith Marketplace account.</p>
    
    <p style="font-size: 16px;">Click the button below to choose a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Reset Password</a>
    </div>
    
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Or enter this reset code:</p>
      <p style="margin: 0; font-size: 32px; font-weight: 700; color: #ef4444; letter-spacing: 8px; font-family: 'Courier New', monospace;">${resetCode}</p>
    </div>
    
    <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        <strong>⚠️ Security Notice:</strong><br>
        If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
      </p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">This reset link will expire in 1 hour for security reasons.</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>© 2025 Locksmith Marketplace. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Privacy Policy Update Notification
 */
export function policyUpdateTemplate(data: {
  userName: string;
  policyUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy Updated</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="background-color: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 2V8H20" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 13H8" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 17H8" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 9H9H8" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Privacy Policy Updated</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 20px 0;">
        Hi ${data.userName},
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 20px 0;">
        We wanted to let you know that we've updated our <strong>Privacy Policy</strong>.
      </p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
        <p style="font-size: 14px; line-height: 1.6; color: #555; margin: 0;">
          These updates help us better protect your privacy and explain how we handle your data. 
          We encourage you to review the changes to understand how they may affect you.
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 30px 0;">
        Your continued use of Locksmith Marketplace constitutes acceptance of the updated Privacy Policy.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.policyUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
          Review Privacy Policy
        </a>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0 0; text-align: center;">
        If you have any questions, please don't hesitate to contact our support team.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">
        <strong>Locksmith Marketplace</strong>
      </p>
      <p style="font-size: 12px; color: #999; margin: 0;">
        The trusted platform for automotive key professionals
      </p>
      <p style="font-size: 12px; color: #999; margin: 15px 0 0 0;">
        © 2025 Locksmith Marketplace. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Daily Digest - Consolidated Email
 * Includes: Messages, Deals, Listings - all in one email
 */
export function dailyDigestTemplate(data: {
  userName: string;
  unreadMessages?: {
    count: number;
    conversationIds: string[];
  };
  dealsExpiring?: Array<{
    title: string;
    expiresAt: string;
  }>;
  dealsExpired?: Array<{
    title: string;
    price: string;
  }>;
  newDeals?: Array<{
    id: string;
    title: string;
    price: string;
    originalPrice?: string;
    retailerName: string;
  }>;
  listingsExpiring?: Array<{
    title: string;
    price: string;
    expiresAt: string;
  }>;
  listingsExpired?: Array<{
    title: string;
    price: string;
  }>;
  messagesUrl: string;
  dealsUrl: string;
  dashboardUrl: string;
  accountUrl: string;
}): string {
  const { 
    userName, 
    unreadMessages, 
    dealsExpiring, 
    dealsExpired, 
    newDeals,
    listingsExpiring,
    listingsExpired,
    messagesUrl, 
    dealsUrl, 
    dashboardUrl,
    accountUrl 
  } = data;

  // Calculate total number of updates
  const totalUpdates = 
    (unreadMessages ? 1 : 0) +
    (dealsExpiring && dealsExpiring.length > 0 ? 1 : 0) +
    (dealsExpired && dealsExpired.length > 0 ? 1 : 0) +
    (newDeals && newDeals.length > 0 ? 1 : 0) +
    (listingsExpiring && listingsExpiring.length > 0 ? 1 : 0) +
    (listingsExpired && listingsExpired.length > 0 ? 1 : 0);

  // Generate sections HTML
  let sectionsHtml = '';

  // 1. Unread Messages Section
  if (unreadMessages && unreadMessages.count > 0) {
    sectionsHtml += `
    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #667eea;">
      <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">💬 Unread Messages</h2>
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #4b5563;">
        You have <strong>${unreadMessages.count} unread conversation${unreadMessages.count > 1 ? 's' : ''}</strong> waiting for you.
      </p>
      <a href="${messagesUrl}" style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Messages</a>
    </div>
    `;
  }

  // 2. Deals Expiring Section (for retailers)
  if (dealsExpiring && dealsExpiring.length > 0) {
    const dealsList = dealsExpiring.slice(0, 3).map(deal => {
      const expiryDate = new Date(deal.expiresAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `
      <div style="background: #fef2f2; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #ef4444;">
        <p style="margin: 0; font-size: 15px; color: #1f2937; font-weight: 600;">${deal.title}</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #ef4444;">Expires: ${expiryDate}</p>
      </div>
      `;
    }).join('');

    sectionsHtml += `
    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
      <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">⏰ Deals Expiring Soon</h2>
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #4b5563;">
        ${dealsExpiring.length} of your deal${dealsExpiring.length > 1 ? 's expire' : ' expires'} in the next 24 hours.
      </p>
      ${dealsList}
      ${dealsExpiring.length > 3 ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">+ ${dealsExpiring.length - 3} more</p>` : ''}
      <a href="${dashboardUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 10px;">Manage Deals</a>
    </div>
    `;
  }

  // 3. Deals Expired Section (for retailers)
  if (dealsExpired && dealsExpired.length > 0) {
    const expiredList = dealsExpired.slice(0, 3).map(deal => `
      <div style="background: #f3f4f6; padding: 12px; margin: 8px 0; border-radius: 6px;">
        <p style="margin: 0; font-size: 15px; color: #1f2937; font-weight: 600;">${deal.title}</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7280;">Price: ${deal.price}</p>
      </div>
    `).join('');

    sectionsHtml += `
    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #6b7280;">
      <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">📦 Deals Expired</h2>
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #4b5563;">
        ${dealsExpired.length} of your deal${dealsExpired.length > 1 ? 's have' : ' has'} expired and been removed.
      </p>
      ${expiredList}
      ${dealsExpired.length > 3 ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">+ ${dealsExpired.length - 3} more</p>` : ''}
      <a href="${dashboardUrl}" style="display: inline-block; background: #6b7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 10px;">Upload New Deals</a>
    </div>
    `;
  }

  // 4. New Deals Section (for all users)
  if (newDeals && newDeals.length > 0) {
    const newDealsList = newDeals.slice(0, 4).map(deal => `
      <div style="background: #ecfdf5; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #10b981;">
        <p style="margin: 0; font-size: 15px; color: #1f2937; font-weight: 600;">${deal.title}</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7280;">by ${deal.retailerName}</p>
        <div style="margin-top: 5px;">
          <span style="font-size: 18px; font-weight: 700; color: #10b981;">${deal.price}</span>
          ${deal.originalPrice ? `<span style="font-size: 13px; color: #9ca3af; text-decoration: line-through; margin-left: 8px;">${deal.originalPrice}</span>` : ''}
        </div>
      </div>
    `).join('');

    sectionsHtml += `
    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #10b981;">
      <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">🔥 New Deals</h2>
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #4b5563;">
        ${newDeals.length} fresh deal${newDeals.length > 1 ? 's' : ''} posted in the last 24 hours!
      </p>
      ${newDealsList}
      ${newDeals.length > 4 ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">+ ${newDeals.length - 4} more</p>` : ''}
      <a href="${dealsUrl}" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 10px;">Browse All Deals</a>
    </div>
    `;
  }

  // 5. Listings Expiring Section
  if (listingsExpiring && listingsExpiring.length > 0) {
    const listingsList = listingsExpiring.slice(0, 3).map(listing => {
      const expiryDate = new Date(listing.expiresAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `
      <div style="background: #fef2f2; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #ef4444;">
        <p style="margin: 0; font-size: 15px; color: #1f2937; font-weight: 600;">${listing.title}</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #4b5563;">Price: ${listing.price}</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #ef4444;">Expires: ${expiryDate}</p>
      </div>
      `;
    }).join('');

    sectionsHtml += `
    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">⏰ Listings Expiring Soon</h2>
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #4b5563;">
        ${listingsExpiring.length} of your listing${listingsExpiring.length > 1 ? 's expire' : ' expires'} in the next 24 hours.
      </p>
      ${listingsList}
      ${listingsExpiring.length > 3 ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">+ ${listingsExpiring.length - 3} more</p>` : ''}
      <a href="${accountUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 10px;">Manage Listings</a>
    </div>
    `;
  }

  // 6. Listings Expired Section
  if (listingsExpired && listingsExpired.length > 0) {
    const expiredListingsList = listingsExpired.slice(0, 3).map(listing => `
      <div style="background: #f3f4f6; padding: 12px; margin: 8px 0; border-radius: 6px;">
        <p style="margin: 0; font-size: 15px; color: #1f2937; font-weight: 600;">${listing.title}</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7280;">Price: ${listing.price}</p>
      </div>
    `).join('');

    sectionsHtml += `
    <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #6b7280;">
      <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">📦 Listings Expired</h2>
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #4b5563;">
        ${listingsExpired.length} of your listing${listingsExpired.length > 1 ? 's have' : ' has'} expired and been archived.
      </p>
      ${expiredListingsList}
      ${listingsExpired.length > 3 ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">+ ${listingsExpired.length - 3} more</p>` : ''}
      <a href="${accountUrl}" style="display: inline-block; background: #6b7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 10px;">View My Listings</a>
    </div>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f3f4f6;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📬 Your Daily Update</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${totalUpdates} update${totalUpdates > 1 ? 's' : ''} for you today</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>
    
    <p style="font-size: 16px; margin-bottom: 25px;">Here's what's happening on Locksmith Marketplace:</p>
    
    ${sectionsHtml}
    
    <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 25px 0; text-align: center;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        💡 <strong>Tip:</strong> Quick responses and fresh listings lead to better deals!
      </p>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>You're receiving this daily digest because you have an account on Locksmith Marketplace.</p>
    <p style="margin: 5px 0;">
      <a href="${accountUrl}" style="color: #667eea; text-decoration: none;">Manage email preferences</a>
    </p>
    <p style="margin-top: 15px;">© 2025 Locksmith Marketplace. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}