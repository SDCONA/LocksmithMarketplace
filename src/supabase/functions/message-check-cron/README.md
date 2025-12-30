# Message Check Cron Job

This Supabase Edge Function runs every 30 minutes to check for unread messages and notify users.

## Schedule

- **Frequency**: Every 30 minutes
- **Cron Expression**: `*/30 * * * *`

## Functionality

1. **Check Unread Messages**: Queries the database for all unread messages
2. **Group by User**: Groups unread messages by recipient user
3. **Send Notifications**: Processes notifications for users with unread messages

## Setup Instructions

### 1. Deploy the Function

```bash
supabase functions deploy message-check-cron
```

### 2. Set Up Cron Trigger

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Functions**
3. Find the `message-check-cron` function
4. Click **Add Trigger** → **Cron Trigger**
5. Set schedule: `*/30 * * * *` (every 30 minutes)
6. Save the trigger

#### Option B: Using pg_cron (SQL)

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cron job to run every 30 minutes
SELECT cron.schedule(
  'message-check-every-30-min',
  '*/30 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/message-check-cron',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
    ) AS request_id;
  $$
);
```

Replace:
- `YOUR_PROJECT_ID` with your actual Supabase project ID
- `YOUR_CRON_SECRET` with a secure secret (optional, for added security)

### 3. Configure Environment Variables (Optional)

For added security, set a cron secret:

```bash
supabase secrets set CRON_SECRET=your-secure-random-string
```

Then include this in the Authorization header when calling the function.

## Testing the Function

You can manually trigger the cron job to test it:

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/message-check-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Or test locally:

```bash
supabase functions serve message-check-cron
```

Then in another terminal:

```bash
curl -X POST http://localhost:54321/functions/v1/message-check-cron
```

## Notification Options

The cron job currently logs users with unread messages. You can extend it to:

### 1. Email Notifications

Integrate with an email service (SendGrid, Resend, AWS SES):

```typescript
// In the sendNotifications function
const { error } = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: summary.userEmail }],
      subject: 'You have unread messages on Locksmith Marketplace'
    }],
    from: { email: 'notifications@locksmithmarketplace.com' },
    content: [{
      type: 'text/html',
      value: `<p>Hi ${summary.userName},</p><p>You have ${summary.unreadCount} unread conversation(s).</p>`
    }]
  })
});
```

### 2. Push Notifications

Integrate with a push notification service (Firebase, OneSignal):

```typescript
// Store push tokens in user_profiles table
// Then send push notifications via the service API
```

### 3. In-App Notifications

Store notifications in a database table:

```sql
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

The cron job already attempts to insert into this table if it exists.

## Monitoring

Check the function logs in the Supabase Dashboard:

1. Go to **Edge Functions**
2. Click on `message-check-cron`
3. View the **Logs** tab

You'll see output like:
```
[CRON] Message check cron started at 2025-12-14T10:30:00.000Z
[CRON] Found 5 unread messages
[CRON] Found 2 users with unread messages
[CRON] User John Doe (john@example.com) has 2 unread conversation(s)
[CRON] User Jane Smith (jane@example.com) has 1 unread conversation(s)
[CRON] Message check completed in 245ms
```

## Customization

### Change Frequency

To run at a different interval, update the cron schedule:

- Every 15 minutes: `*/15 * * * *`
- Every hour: `0 * * * *`
- Every 2 hours: `0 */2 * * *`
- Once daily at 9 AM: `0 9 * * *`

### Add Notification Threshold

Only notify if unread count exceeds a threshold:

```typescript
if (summary.unreadCount >= 3) {
  // Send notification
}
```

### Add Time-Based Logic

Only send notifications during certain hours:

```typescript
const hour = new Date().getHours();
if (hour >= 8 && hour <= 20) {
  // Send notifications only between 8 AM and 8 PM
}
```

## Troubleshooting

### Cron Not Running

1. Verify the function is deployed: `supabase functions list`
2. Check if cron job is scheduled: `SELECT * FROM cron.job;`
3. Check function logs for errors

### No Notifications Being Sent

1. Verify unread messages exist in the database
2. Check that user emails are properly stored in `user_profiles`
3. Review function logs for errors

### Performance Issues

If you have many users, consider:
- Batching notifications
- Adding rate limiting
- Using a queue system for notification processing
