# 📧 Resend Email Integration - Complete Setup Guide

## ✅ What's Implemented

Your Locksmith Marketplace now has complete email notifications via **Resend**, including:

1. **Unread Message Notifications** - Every 30 minutes
2. **Deal Expiration Warnings** - 24 hours before expiration
3. **Deal Expired Notifications** - When deals automatically expire
4. **Admin Warning Emails** - For compliance/moderation notices
5. **New Deals Digest** - Every 3 days to keep users engaged

---

## 🔧 Setup Instructions

### Step 1: Get Your Resend API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `re_`)
4. **You've already provided it** ✅ (stored in `RESEND_API_KEY` environment variable)

---

### Step 2: Verify Your Domain (IMPORTANT!)

**⚠️ Without domain verification, emails will fail!**

#### Option A: Use Resend's Test Domain (Quick Start)
- Resend provides `onboarding@resend.dev` for testing
- **Update line 12 in** `/supabase/functions/server/resend-mailer.tsx`:
  ```typescript
  const DEFAULT_FROM = 'Locksmith Marketplace <onboarding@resend.dev>';
  ```
- ⚠️ Limited to 100 emails per day
- ⚠️ Some email providers may block it

#### Option B: Verify Your Own Domain (Recommended for Production)
1. Go to [Resend Domains](https://resend.com/domains)
2. Click **Add Domain**
3. Enter your domain (e.g., `locksmithmarketplace.com`)
4. Add the DNS records shown (SPF, DKIM, DMARC)
5. Wait for verification (usually 1-24 hours)
6. Update line 12 in `/supabase/functions/server/resend-mailer.tsx`:
   ```typescript
   const DEFAULT_FROM = 'Locksmith Marketplace <noreply@yourdomain.com>';
   ```

---

### Step 3: Deploy Cron Jobs

#### Deploy Message Check Cron
```bash
cd supabase
supabase functions deploy message-check-cron
```

#### Deploy Deal Expiration Cron
```bash
supabase functions deploy deal-expiration-cron
```

#### Deploy New Deals Digest Cron
```bash
supabase functions deploy new-deals-digest-cron
```

---

### Step 4: Schedule the Cron Jobs

#### Option A: Using Supabase Dashboard (Easiest)

**For Message Check Cron:**
1. Go to Supabase Dashboard → **Database** → **Cron Jobs**
2. Click **Create a new cron job**
3. Name: `message-check-every-30-min`
4. Schedule: `*/30 * * * *` (every 30 minutes)
5. Command:
   ```sql
   SELECT
     net.http_post(
       url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/message-check-cron',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     ) AS request_id;
   ```
6. Replace `YOUR_PROJECT_ID` and `YOUR_ANON_KEY`

**For Deal Expiration Cron:**
1. Same steps as above
2. Name: `deal-expiration-every-6-hours`
3. Schedule: `0 0 * * *` (daily at midnight UTC)
4. Command:
   ```sql
   SELECT
     net.http_post(
       url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/deal-expiration-cron',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     ) AS request_id;
   ```

**For New Deals Digest Cron:**
1. Same steps as above
2. Name: `new-deals-digest-every-3-days`
3. Schedule: `0 0 */3 * *` (every 3 days at midnight UTC)
4. Command:
   ```sql
   SELECT
     net.http_post(
       url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/new-deals-digest-cron',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     ) AS request_id;
   ```

#### Option B: Using SQL (Advanced)

Run this in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule message check (every 30 minutes)
SELECT cron.schedule(
  'message-check-every-30-min',
  '*/30 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/message-check-cron',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);

-- Schedule deal expiration check (daily at midnight UTC)
SELECT cron.schedule(
  'deal-expiration-every-6-hours',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/deal-expiration-cron',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);

-- Schedule new deals digest (every 3 days at midnight UTC)
SELECT cron.schedule(
  'new-deals-digest-every-3-days',
  '0 0 */3 * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/new-deals-digest-cron',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

---

## 📋 Cron Schedule Reference

| Cron Job | Schedule | Frequency | Purpose |
|----------|----------|-----------|---------|
| `message-check-cron` | `*/30 * * * *` | Every 30 minutes | Check for unread messages, send email notifications |
| `deal-expiration-cron` | `0 0 * * *` | Daily at midnight UTC | Check for expiring/expired deals, send warnings |
| `new-deals-digest-cron` | `0 0 */3 * *` | Every 3 days at midnight UTC | Send digest of new deals |

---

## 🧪 Testing Your Setup

### Test Message Check Cron
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/message-check-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2025-12-30T...",
  "usersWithUnread": 2,
  "totalUnreadConversations": 3,
  "duration": "245ms"
}
```

### Test Deal Expiration Cron
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/deal-expiration-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2025-12-30T...",
  "expiredDeals": 1,
  "expiringDeals": 2,
  "duration": "312ms"
}
```

### Test New Deals Digest Cron
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/new-deals-digest-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2025-12-30T...",
  "newDealsCount": 5,
  "usersNotified": 3,
  "duration": "450ms"
}
```

---

## 📧 Email Templates Included

### 1. Unread Messages Notification
- **Subject:** "You have X unread message(s) on Locksmith Marketplace"
- **Triggers:** Every 30 minutes if user has unread messages
- **Template:** Professional gradient design with "View Messages" CTA

### 2. Deal Expiring Soon (24-hour warning)
- **Subject:** "⏰ Your deal '[Title]' expires in 24 hours"
- **Triggers:** 24 hours before deal expiration
- **Template:** Orange/red gradient with urgency indicators

### 3. Deal Expired
- **Subject:** "Your deal '[Title]' has expired"
- **Triggers:** When deal passes expiration date
- **Template:** Gray theme with "Upload New Deal" CTA

### 4. Admin Warning
- **Subject:** "Important Account Notice"
- **Triggers:** When admin sends warning message
- **Template:** Red alert design with warning content

### 5. New Deals Digest
- **Subject:** "Discover New Deals on Locksmith Marketplace"
- **Triggers:** Every 3 days
- **Template:** Clean, modern design with a list of new deals

---

## 🎨 Customizing Email Templates

Email templates are in `/supabase/functions/server/resend-mailer.tsx`

To customize:
1. Find the template function (e.g., `unreadMessagesTemplate`)
2. Edit the HTML (inline styles supported)
3. Redeploy: `supabase functions deploy message-check-cron`

**Available Templates:**
- `unreadMessagesTemplate()`
- `dealExpiringTemplate()`
- `dealExpiredTemplate()`
- `adminWarningTemplate()`
- `newDealsDigestTemplate()`

---

## 🔐 Security Features

✅ **CRON_SECRET Support** (Optional)
- Set `CRON_SECRET` environment variable for extra security
- Prevents unauthorized cron triggers

✅ **Service Role Key Protection**
- Cron jobs use `SUPABASE_SERVICE_ROLE_KEY` (never exposed to frontend)

✅ **Rate Limiting**
- Resend has built-in rate limiting
- Test domain: 100 emails/day
- Verified domain: 100,000 emails/month (free tier)

---

## 📊 Monitoring & Logs

### View Logs in Supabase Dashboard
1. Go to **Edge Functions**
2. Click on function name (`message-check-cron` or `deal-expiration-cron`)
3. Click **Logs** tab

**Look for:**
```
[CRON] Message check cron started at 2025-12-30T...
[CRON] Found 5 unread messages
[CRON] Found 2 users with unread messages
[CRON] ✅ Email sent to user@example.com (Message ID: abc123)
[CRON] Message check completed in 245ms
```

### View Sent Emails in Resend Dashboard
1. Go to [Resend Emails](https://resend.com/emails)
2. See delivery status, open rates, click rates
3. View email content and debug issues

---

## 🚨 Troubleshooting

### ❌ "Email service not configured"
- **Solution:** Make sure `RESEND_API_KEY` is set in Supabase secrets

### ❌ "Failed to send email" / "Domain not verified"
- **Solution:** Verify your domain in Resend or use `onboarding@resend.dev`

### ❌ Cron jobs not running
- **Solution:** Check cron schedule is created (see Step 4)
- **Check:** Run `SELECT * FROM cron.job;` in SQL Editor

### ❌ Emails going to spam
- **Solution:** 
  - Verify your domain with SPF/DKIM/DMARC records
  - Use a professional "from" address
  - Avoid spammy words in subject lines

---

## 📈 Resend Pricing

**Free Tier:**
- ✅ 3,000 emails/month
- ✅ Unlimited domains
- ✅ 100 emails/day with test domain
- ✅ Email analytics

**Paid Plans:** Start at $20/month for 50,000 emails

[View Resend Pricing](https://resend.com/pricing)

---

## 🔄 Future Enhancements

Want to add more email notifications? Easy!

**Ideas:**
- Welcome email after signup
- Weekly digest of new marketplace listings
- Price drop alerts for saved searches
- Monthly analytics reports for retailers
- Password reset emails
- Order confirmations

**To add new emails:**
1. Create template function in `resend-mailer.tsx`
2. Call `sendEmail()` from your backend route or cron
3. Done! ✅

---

## ✅ Setup Checklist

- [ ] Resend API key added to `RESEND_API_KEY` environment variable ✅ (Already done)
- [ ] Domain verified in Resend (or using `onboarding@resend.dev`)
- [ ] Updated `DEFAULT_FROM` in `/supabase/functions/server/resend-mailer.tsx`
- [ ] Deployed `message-check-cron` function
- [ ] Deployed `deal-expiration-cron` function
- [ ] Deployed `new-deals-digest-cron` function
- [ ] Created cron schedules in Supabase
- [ ] Tested both cron jobs with curl
- [ ] Checked logs for successful email sends
- [ ] Verified emails in Resend dashboard

---

## 📞 Need Help?

- **Resend Docs:** https://resend.com/docs
- **Resend Support:** https://resend.com/support
- **Supabase Cron Docs:** https://supabase.com/docs/guides/functions/schedule-functions

---

**Last Updated:** December 30, 2025  
**Status:** Ready to deploy! 🚀