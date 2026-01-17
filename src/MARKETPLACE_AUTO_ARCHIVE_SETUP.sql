-- ============================================
-- MARKETPLACE LISTINGS AUTO-ARCHIVE SETUP
-- ============================================
-- Created: January 12, 2026
-- Purpose: Fix auto-archive system for marketplace listings
--
-- WHAT THIS FIXES:
-- 1. Backfills expires_at for existing active listings
-- 2. Sets up PostgreSQL cron job to auto-archive daily
-- 3. Ensures all future listings auto-expire after 7 days
--
-- BEFORE RUNNING:
-- - Verify columns exist: expires_at, archived_at (should already exist)
-- - Backup database if needed
--
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- Step 1: Backfill expires_at for existing active listings without expiry
-- (Sets expiry to 7 days from creation date)
UPDATE marketplace_listings
SET expires_at = created_at + INTERVAL '7 days'
WHERE status = 'active' 
  AND expires_at IS NULL;

-- Verify backfill
SELECT 
  COUNT(*) as total_active,
  COUNT(CASE WHEN expires_at IS NOT NULL THEN 1 END) as has_expiry,
  COUNT(CASE WHEN expires_at IS NULL THEN 1 END) as missing_expiry
FROM marketplace_listings
WHERE status = 'active';

-- Step 2: Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 3: Schedule daily auto-archive job
-- Runs every day at midnight UTC (0:00)
SELECT cron.schedule(
  'archive-expired-marketplace-listings',  -- Job name
  '0 0 * * *',                             -- Cron schedule (daily at midnight)
  $$
  UPDATE marketplace_listings 
  SET status = 'archived', 
      archived_at = NOW() 
  WHERE status = 'active' 
    AND expires_at < NOW();
  $$
);

-- Verify cron job was created
SELECT * FROM cron.job WHERE jobname = 'archive-expired-marketplace-listings';

-- Step 4: Check which listings will be archived next run
SELECT 
  id,
  title,
  created_at,
  expires_at,
  NOW() - expires_at AS overdue_by
FROM marketplace_listings
WHERE status = 'active' 
  AND expires_at < NOW()
ORDER BY expires_at ASC;

-- Step 5 (OPTIONAL): Manually run the archive job now to test
UPDATE marketplace_listings 
SET status = 'archived', 
    archived_at = NOW() 
WHERE status = 'active' 
  AND expires_at < NOW();

-- ============================================
-- ALTERNATIVE: Use Supabase Edge Function Cron
-- ============================================
-- If you prefer Edge Function over pg_cron:
--
-- 1. The file /supabase/functions/cron-archive-listings/index.ts is ready
-- 2. Deploy it: supabase functions deploy cron-archive-listings
-- 3. In Supabase Dashboard → Edge Functions:
--    - Click on "cron-archive-listings"
--    - Add Cron Job
--    - Schedule: "0 0 * * *" (daily at midnight UTC)
--    - Save
--
-- The Edge Function will call your existing archive endpoint automatically.
-- ============================================

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total listings by status
SELECT status, COUNT(*) 
FROM marketplace_listings 
GROUP BY status;

-- Check listings expiring soon (next 7 days)
SELECT 
  id,
  title,
  created_at,
  expires_at,
  expires_at - NOW() AS time_until_expiry
FROM marketplace_listings
WHERE status = 'active' 
  AND expires_at > NOW()
  AND expires_at < NOW() + INTERVAL '7 days'
ORDER BY expires_at ASC;

-- Check archived listings
SELECT 
  id,
  title,
  created_at,
  expires_at,
  archived_at
FROM marketplace_listings
WHERE status = 'archived'
ORDER BY archived_at DESC
LIMIT 10;

-- ============================================
-- CLEANUP (if needed)
-- ============================================

-- Remove cron job (only if you want to delete it)
-- SELECT cron.unschedule('archive-expired-marketplace-listings');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Auto-archive system setup complete! ✅' AS status;
