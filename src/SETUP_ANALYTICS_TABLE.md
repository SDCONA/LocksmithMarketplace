# 📊 Deal Analytics Setup Guide

## Step 1: Run SQL Migration

You need to run the SQL script to create the analytics tracking table in your Supabase database.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire content of `/supabase/migrations/deal_analytics_tracking.sql`
5. Click **Run** or press `Ctrl+Enter` / `Cmd+Enter`
6. You should see: "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply the specific migration
psql $DATABASE_URL < supabase/migrations/deal_analytics_tracking.sql
```

---

## Step 2: Verify Installation

Run this query in the SQL Editor to verify the table was created:

```sql
SELECT COUNT(*) FROM deal_analytics_a7e285ba;
```

You should get a result of `0` (zero rows, which is correct for a new installation).

---

## Step 3: Test the Analytics System

### Frontend Tracking
The system automatically tracks when users:
1. **View a deal** - Opens the deal modal (tracked as `'view'`)
2. **Click "View Deal"** - Clicks through to retailer site (tracked as `'redirect'`)

### Backend API
Two new routes are available:
- `POST /deals/track-analytics` - Track a view or redirect event
- `GET /deals/admin/analytics?filter=day` - Get analytics data (admin only)

---

## Step 4: Access Analytics Dashboard

1. Sign in as admin
2. Go to **Admin Panel**
3. Click on the **Analytics** tab
4. You'll see:
   - Total Views
   - Total Redirects
   - Conversion Rate
   - Per-retailer breakdown

### Time Filters Available:
- **Today** - Analytics from today only
- **Week** - Last 7 days
- **Month** - Current month
- **Year** - Current year
- **All Time** - Complete history

---

## Features Implemented ✅

### 1. Automatic Tracking
- ✅ Tracks every time a user views a deal (opens modal)
- ✅ Tracks every time a user clicks "View Deal" button
- ✅ Works for both logged-in and anonymous users
- ✅ Fire-and-forget implementation (doesn't slow down UI)

### 2. Admin Analytics Dashboard
- ✅ Shows total views and redirects
- ✅ Calculates conversion rates
- ✅ Displays data per retailer
- ✅ Time-based filtering (day/week/month/year/all)
- ✅ Real-time refresh capability
- ✅ Performance insights (top performers)

### 3. Future-Proof Design
- ✅ Works automatically for new retailers
- ✅ Scales to handle high traffic
- ✅ Indexed for fast queries
- ✅ Row-level security enabled

---

## Data Structure

### `deal_analytics_a7e285ba` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `created_at` | TIMESTAMP | When the event occurred |
| `deal_id` | UUID | Which deal was viewed/clicked |
| `retailer_profile_id` | UUID | Which retailer owns the deal |
| `event_type` | TEXT | 'view' or 'redirect' |
| `user_id` | UUID | User who performed action (nullable) |

### Indexes (for performance)
- `idx_analytics_deal` - Fast lookup by deal
- `idx_analytics_retailer` - Fast lookup by retailer
- `idx_analytics_event_type` - Fast filtering by event type
- `idx_analytics_created_at` - Fast time-based queries
- `idx_analytics_retailer_created` - Fast retailer + time queries

---

## Security (RLS Policies)

✅ **Admin Access** - Admins can view all analytics
✅ **Retailer Access** - Retailers can see their own analytics only
✅ **Public Insert** - Service role can insert tracking events
✅ **No Public Read** - Regular users cannot query analytics directly

---

## Example Analytics Query

```sql
-- Get analytics for last 7 days by retailer
SELECT 
  rp.company_name,
  COUNT(*) FILTER (WHERE event_type = 'view') as views,
  COUNT(*) FILTER (WHERE event_type = 'redirect') as redirects,
  ROUND(
    (COUNT(*) FILTER (WHERE event_type = 'redirect')::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE event_type = 'view'), 0) * 100), 
    1
  ) as conversion_rate
FROM deal_analytics_a7e285ba da
JOIN retailer_profiles rp ON da.retailer_profile_id = rp.id
WHERE da.created_at >= NOW() - INTERVAL '7 days'
GROUP BY rp.id, rp.company_name
ORDER BY views DESC;
```

---

## Troubleshooting

### "Table doesn't exist" error
**Solution**: Run the SQL migration script in Supabase SQL Editor

### "Permission denied" error
**Solution**: Make sure you're signed in as admin

### No data showing
**Solution**: 
1. Visit the Deals page
2. Click on a few deals to generate test data
3. Click "View Deal" buttons
4. Refresh the Analytics page

### Analytics not tracking
**Solution**:
1. Check browser console for errors
2. Verify the backend routes are working
3. Make sure the table was created successfully

---

## Summary

**You now have a complete analytics system that tracks:**
- ✅ How many times each deal is viewed
- ✅ How many times users click through to retailer sites
- ✅ Conversion rates per retailer
- ✅ Time-filtered analytics (day/week/month/year)
- ✅ Automatic tracking for all future retailers

**Admin can see this data in:** Admin Panel → Analytics tab

🎉 **Done!** Your deal analytics system is ready to use!
