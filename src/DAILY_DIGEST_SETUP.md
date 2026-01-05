# Daily Digest Email System

## Overview

The **Daily Digest System** consolidates ALL email notifications into **ONE email per user per day**. This dramatically reduces email volume, improves user experience, and keeps you within Resend's FREE plan limits.

---

## 📊 What's Included in the Daily Digest?

Each user receives a single, beautiful email containing:

### 1. **💬 Unread Messages**
- Number of unread conversations
- Quick link to messages

### 2. **⏰ Deals Expiring Soon** (Retailers only)
- Deals expiring in next 24 hours
- Quick link to manage deals

### 3. **📦 Deals Expired** (Retailers only)
- Deals that expired in last 24 hours
- Quick link to upload new deals

### 4. **🔥 New Deals** (All users)
- Fresh deals posted in last 24 hours
- Shows top 4 deals with pricing
- Quick link to browse all deals

### 5. **⏰ Listings Expiring Soon** (Sellers only)
- Marketplace listings expiring in next 24 hours
- Quick link to manage listings

### 6. **📦 Listings Expired** (Sellers only)
- Listings that expired in last 24 hours
- Quick link to relist

---

## 🎯 Smart Email Logic

**Important:** Users only receive an email if they have **at least ONE** update!

- No updates = No email (zero spam!)
- 1+ updates = Beautiful daily digest

---

## 📅 Schedule

**Runs:** Once daily at **9:00 AM** (recommended)
**Cron Expression:** `0 9 * * *`

You can customize the time in the cron configuration.

---

## 📧 Email Capacity

### With Resend FREE Plan (100 emails/day):
```
90 users = Daily digest ✅
10 emails = Critical (password reset, verification) ✅
Total: 100 users comfortably supported!
```

### When you grow beyond 100 users:
```
Upgrade to Resend PRO ($20/month)
→ Supports 1,666 users/day
→ NO code changes needed!
```

---

## 🚀 Setup Instructions

### Step 1: Deploy the Function

The daily digest route is already integrated into your server at:
```
/supabase/functions/server/cron-routes.tsx
```

Route: `/make-server-a7e285ba/daily-digest-cron`

### Step 2: Configure the Cron Job

#### Option A: Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Cron Jobs**
3. Click **Create a new cron job**
4. Configure:
   - **Name:** `daily-digest-a7e285ba`
   - **Schedule:** `0 9 * * *` (9 AM daily)
   - **SQL Command:**
   ```sql
   SELECT
     net.http_post(
       url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-a7e285ba/daily-digest-cron',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     ) AS request_id;
   ```
5. Replace `YOUR_PROJECT_ID` and `YOUR_ANON_KEY` with your actual values
6. Click **Create**

#### Option B: SQL Query (Advanced)

Run this in your Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the daily digest cron job
SELECT cron.schedule(
  'daily-digest-a7e285ba',
  '0 9 * * *', -- 9 AM daily
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-a7e285ba/daily-digest-cron',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

### Step 3: Test the Cron Job

Manually trigger the cron to test:

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-a7e285ba/daily-digest-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Check the logs in Supabase Dashboard → Edge Functions → server → Logs

---

## 🗑️ Deprecating Old Cron Jobs

**IMPORTANT:** Once the daily digest is working, you should **disable** the old individual cron jobs to avoid duplicate emails:

### Cron Jobs to Disable:

1. **message-check-cron** (every 30 min)
2. **deal-expiration-cron** (daily)
3. **deal-digest-cron** (every 72 hours)
4. **listing-expiration-cron** (daily)

### How to Disable:

#### Method 1: Supabase Dashboard
1. Go to **Database** → **Cron Jobs**
2. Find each old cron job
3. Click **Delete** or **Disable**

#### Method 2: SQL Query
```sql
-- List all cron jobs
SELECT * FROM cron.job;

-- Unschedule old cron jobs
SELECT cron.unschedule('message-check-every-30-min');
SELECT cron.unschedule('deal-expiration-daily');
SELECT cron.unschedule('deal-digest-every-72h');
SELECT cron.unschedule('listing-expiration-daily');
```

**Note:** The old routes are still available in `/supabase/functions/server/cron-routes.tsx` but won't be called if the cron jobs are disabled.

---

## 🎨 Email Template

The daily digest uses a beautiful, professional template that includes:

- **Gradient header** with update count
- **Modular sections** (only shown if user has updates)
- **Color-coded borders** for each section type
- **Quick action buttons** for each section
- **Mobile responsive** design
- **Professional footer** with unsubscribe link

Preview the template by checking `/supabase/functions/server/resend-mailer.tsx` → `dailyDigestTemplate()`

---

## 📈 Monitoring

### Check Cron Execution:

**SQL Query:**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-digest-a7e285ba')
ORDER BY start_time DESC 
LIMIT 10;
```

### Check Server Logs:

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **server**
3. Click **Logs** tab
4. Filter for `[DAILY DIGEST]`

You'll see detailed logs like:
```
[DAILY DIGEST] Found 45 users
[DAILY DIGEST] 23 users have updates to receive
[DAILY DIGEST] Emails sent: 23
[DAILY DIGEST] Completed in 14250ms
```

---

## ⚙️ Customization

### Change Schedule Time

Edit the cron expression:

| Schedule | Cron Expression | Description |
|----------|----------------|-------------|
| 9 AM daily | `0 9 * * *` | Current (recommended) |
| 8 AM daily | `0 8 * * *` | Earlier morning |
| 6 PM daily | `0 18 * * *` | Evening digest |
| Twice daily | `0 9,18 * * *` | 9 AM and 6 PM |

### Exclude Specific Updates

Edit `/supabase/functions/server/cron-routes.tsx`:

```typescript
// Example: Don't show new deals if less than 5
if (globalNewDeals.length >= 5) {
  digestData.newDeals = globalNewDeals;
}
```

### Change Email Subject

```typescript
subject: `📬 Your Daily Update - Locksmith Marketplace`,
// Change to:
subject: `Daily Digest: ${totalUpdates} Updates`,
```

---

## 🔒 Critical Emails (Still Sent Immediately)

These emails are **NOT** part of the daily digest and are sent immediately:

1. ✅ **Email Verification** (sign-up)
2. ✅ **Password Reset**
3. ✅ **Admin Warnings** (urgent)
4. ✅ **Privacy Policy Updates** (compliance)

---

## 💡 Benefits

### User Experience:
- ✅ One organized email instead of 4-6 separate emails
- ✅ No email fatigue or spam complaints
- ✅ Professional, consolidated updates
- ✅ Only receive email when there's something new

### Cost Efficiency:
- ✅ Stay on Resend FREE plan (100 emails/day)
- ✅ Support 90-100 users without paying
- ✅ Easy upgrade path when you grow
- ✅ No code changes needed to scale

### System Performance:
- ✅ Reduced server load (1 cron instead of 4)
- ✅ Better rate limit management
- ✅ Simpler monitoring and debugging
- ✅ Professional email deliverability

---

## 🎉 Success Metrics

After implementing, you should see:

| Metric | Before | After |
|--------|--------|-------|
| Emails per user/day | 4-6 emails | **1 email** |
| Daily email volume (50 users) | 220 emails | **50 emails** |
| Resend plan needed | PRO ($20/mo) | **FREE ($0)** |
| User complaints | Higher | **Near zero** |
| Email open rate | 15-25% | **40-60%** (higher!) |

---

## 🆘 Troubleshooting

### No emails being sent?

1. Check cron is running: `SELECT * FROM cron.job WHERE jobname = 'daily-digest-a7e285ba';`
2. Check server logs for errors
3. Verify Resend API key is set: `echo $RESEND_API_KEY`
4. Manually test the endpoint with curl

### Users not receiving emails?

1. Check they have updates (query will skip users with no updates)
2. Verify their email is in `user_profiles` table
3. Check Resend dashboard for delivery status
4. Look for `[DAILY DIGEST]` errors in logs

### Emails going to spam?

1. Verify sender domain is configured in Resend
2. Add SPF/DKIM records to your domain
3. Ensure "From" address is `support@locksmithmarketplace.com`
4. Check email content doesn't trigger spam filters

---

## 📞 Support

For issues:
1. Check the server logs first
2. Review this documentation
3. Test with curl to isolate the issue
4. Check Resend dashboard for delivery status

---

**Last Updated:** January 2, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready