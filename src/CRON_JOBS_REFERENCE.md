# ⏰ Cron Jobs Quick Reference

## 📋 All Active Cron Jobs

| Name | File | Schedule | Frequency | Purpose |
|------|------|----------|-----------|---------|
| **Message Check** | `/supabase/functions/message-check-cron/` | `*/30 * * * *` | Every 30 minutes | Send unread message notifications via email |
| **Deal Expiration** | `/supabase/functions/deal-expiration-cron/` | `0 0 * * *` | Daily at midnight UTC | Expire old deals, send expiration warnings |
| **Deal Digest** | `/supabase/functions/deal-digest-cron/` | `0 0 */3 * *` | Every 3 days at midnight UTC | Send new deals digest to active users |

---

## 🚀 Quick Deploy Commands

```bash
# Deploy both cron jobs
supabase functions deploy message-check-cron
supabase functions deploy deal-expiration-cron
supabase functions deploy deal-digest-cron

# Or deploy all functions at once
supabase functions deploy
```

---

## 🧪 Quick Test Commands

```bash
# Test message check locally
curl -X POST http://localhost:54321/functions/v1/message-check-cron

# Test deal expiration locally
curl -X POST http://localhost:54321/functions/v1/deal-expiration-cron

# Test deal digest locally
curl -X POST http://localhost:54321/functions/v1/deal-digest-cron

# Test message check in production
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/message-check-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test deal expiration in production
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/deal-expiration-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test deal digest in production
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/deal-digest-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 📊 What Each Cron Does

### 1. Message Check Cron (`message-check-cron`)

**Runs:** Every 30 minutes

**Process:**
1. ✅ Query database for unread messages
2. ✅ Group messages by recipient user
3. ✅ Get user profile (name, email)
4. ✅ Generate email from template
5. ✅ Send via Resend API
6. ✅ Log success/failure

**Email Sent When:**
- User has unread messages in their conversations
- Email hasn't been sent for that message yet

**Email Contains:**
- Number of unread conversations
- "View Messages" button linking to `/messages`
- Professional gradient design

---

### 2. Deal Expiration Cron (`deal-expiration-cron`)

**Runs:** Daily at midnight UTC

**Process:**
1. ✅ Find deals expiring in next 24 hours
2. ✅ Send 24-hour warning emails to retailers
3. ✅ Find deals that have passed expiration
4. ✅ Mark them as `status: 'expired'` in database
5. ✅ Send "deal expired" notification to retailers

**Emails Sent:**
- **Warning Email:** 24 hours before expiration
- **Expired Email:** When deal is marked expired

**Why daily schedule?**
- Deals expire after 48 hours
- One daily check catches all expiring deals
- Retailers get 24-hour warning
- Not too frequent (won't spam retailers)

---

### 3. Deal Digest Cron (`deal-digest-cron`)

**Runs:** Every 3 days at midnight UTC

**Process:**
1. ✅ Find new deals added in the last 3 days
2. ✅ Send digest email to active users
3. ✅ Log success/failure

**Email Sent When:**
- New deals are added in the last 3 days
- User is marked as active

**Email Contains:**
- List of new deals
- "View Deals" button linking to `/deals`
- Professional gradient design

---

## 🔍 Viewing Logs

### Supabase Dashboard
1. Go to **Edge Functions**
2. Click function name
3. Click **Logs** tab

### Look For These Log Messages

**Message Check Success:**
```
[CRON] Message check cron started at 2025-12-30T10:30:00.000Z
[CRON] Found 5 unread messages
[CRON] Found 2 users with unread messages
[CRON] User John Doe (john@example.com) has 2 unread conversation(s)
[CRON] ✅ Email sent to john@example.com (Message ID: abc123)
[CRON] Message check completed in 245ms
```

**Deal Expiration Success:**
```
[CRON] Deal expiration check started at 2025-12-30T12:00:00.000Z
[CRON] Found 3 deals expiring in next 24 hours
[CRON] ✅ Expiration warning sent to retailer@example.com for deal: Honda Key Fob
[CRON] Found 2 expired deals
[CRON] Marked 2 deals as expired
[CRON] Deal expiration check completed in 312ms
```

**Deal Digest Success:**
```
[CRON] Deal digest cron started at 2025-12-30T12:00:00.000Z
[CRON] Found 5 new deals in the last 3 days
[CRON] Found 3 active users
[CRON] User Jane Smith (jane@example.com) has 5 new deals
[CRON] ✅ Email sent to jane@example.com (Message ID: def456)
[CRON] Deal digest completed in 420ms
```

**Errors to Watch For:**
```
[CRON] ❌ Failed to send email to user@example.com: Domain not verified
[CRON] Error fetching unread messages: [error details]
```

---

## ⚙️ Environment Variables Needed

Both cron jobs require these environment variables:

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `SUPABASE_URL` | Database connection | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin database access | ✅ Yes |
| `RESEND_API_KEY` | Send emails via Resend | ✅ Yes |
| `CRON_SECRET` | Secure cron endpoints | 🟡 Optional |

---

## 🛑 Stopping/Pausing Cron Jobs

### Temporarily Pause
**Option 1:** Comment out the schedule in SQL
```sql
-- View all cron jobs
SELECT * FROM cron.job;

-- Disable a job
SELECT cron.unschedule('message-check-every-30-min');

-- Re-enable later
SELECT cron.schedule(
  'message-check-every-30-min',
  '*/30 * * * *',
  $$ ... $$
);
```

**Option 2:** Return early from cron function
Add this at the top of the function:
```typescript
// Temporarily disabled
return new Response(
  JSON.stringify({ success: true, message: 'Cron disabled' }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
);
```

### Permanently Remove
```sql
SELECT cron.unschedule('message-check-every-30-min');
SELECT cron.unschedule('deal-expiration-every-6-hours');
SELECT cron.unschedule('deal-digest-every-3-days');
```

---

## 🔄 Modifying Schedules

Want to change how often cron jobs run?

### Cron Schedule Format
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 and 7 = Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Common Schedules

| Schedule | Frequency | Example Use |
|----------|-----------|-------------|
| `*/5 * * * *` | Every 5 minutes | Real-time notifications |
| `*/30 * * * *` | Every 30 minutes | ✅ Message check (current) |
| `0 * * * *` | Every hour | Moderate traffic apps |
| `0 */6 * * *` | Every 6 hours | ✅ Deal expiration (current) |
| `0 0 * * *` | Daily at midnight | Daily digests, cleanup |
| `0 9 * * 1` | Monday at 9am | Weekly reports |

### Change Schedule Example
```sql
-- Unschedule old
SELECT cron.unschedule('message-check-every-30-min');

-- Schedule new (every 15 minutes instead)
SELECT cron.schedule(
  'message-check-every-15-min',
  '*/15 * * * *',
  $$ ... same command ... $$
);
```

---

## 💰 Cost Considerations

### Resend Email Costs
- **Free tier:** 3,000 emails/month
- **Message check:** 48 runs/day × 30 days = 1,440 checks/month
  - If 10% have unread messages = ~144 emails/month ✅
- **Deal expiration:** 1 run/day × 30 days = 30 checks/month
  - If 5 warnings + 5 expired = ~10 emails/day = ~300 emails/month ✅
- **Deal digest:** 1 run every 3 days × 30 days = 10 checks/month
  - If 5 new deals per digest = ~50 emails/month ✅

**Total estimated:** ~494 emails/month (well within free tier)

### Supabase Edge Function Costs
- **Free tier:** 500,000 invocations/month
- **Your usage:** ~1,500 cron runs/month ✅

**Both well within free tier!** 🎉

---

## 🐛 Debugging Tips

### Email Not Sending?
1. ✅ Check `RESEND_API_KEY` is set
2. ✅ Verify domain in Resend dashboard
3. ✅ Check cron logs for errors
4. ✅ Test manually with curl
5. ✅ Check spam folder

### Cron Not Running?
1. ✅ Verify schedule exists: `SELECT * FROM cron.job;`
2. ✅ Check function is deployed: `supabase functions list`
3. ✅ Check logs for errors
4. ✅ Test function manually with curl

### Wrong Schedule?
1. ✅ Use [Crontab Guru](https://crontab.guru/) to verify cron expression
2. ✅ Check timezone (Supabase cron uses UTC)
3. ✅ Unschedule and reschedule if needed

---

## 📈 Monitoring Checklist

Weekly monitoring tasks:

- [ ] Check cron logs for errors
- [ ] Verify emails are being delivered (Resend dashboard)
- [ ] Check email open rates (Resend analytics)
- [ ] Review expired deals count
- [ ] Monitor Resend usage (stay within free tier)

---

## 🎯 Next Steps

After setup:
1. ✅ Deploy both cron functions
2. ✅ Create cron schedules in database
3. ✅ Verify domain in Resend (or use test domain)
4. ✅ Test with curl commands
5. ✅ Check logs for successful runs
6. ✅ Verify emails in Resend dashboard
7. ✅ Set up monitoring alerts (optional)

**Full setup instructions:** See `/RESEND_EMAIL_SETUP.md`

---

**Last Updated:** December 30, 2025