-- ============================================
-- GET TEST DATA FOR SECURITY TESTING
-- ============================================
-- Run this script to get User IDs and Listing IDs
-- for testing the security fixes
-- ============================================

\echo '🔍 Getting Test Data for Security Testing'
\echo '=========================================='
\echo ''

-- Get your own user ID
\echo '1️⃣ YOUR USER ID (for RLS testing):'
SELECT auth.uid() as your_user_id;

\echo ''
\echo '---'
\echo ''

-- Get other user IDs (you'll use these to test that you CANNOT see their data)
\echo '2️⃣ OTHER USER IDs (for API sanitization testing):'
\echo '   Use these to verify their email/phone/address is NOT exposed'
\echo ''

-- This query will only work with service_role key
-- If you get an error, use the Supabase dashboard to view users table
SELECT 
  id as user_id,
  first_name || ' ' || last_name as name,
  created_at
FROM user_profiles
WHERE id != auth.uid()
ORDER BY created_at DESC
LIMIT 5;

\echo ''
\echo '   ⚠️  If you see "no rows returned", you need to run this as service_role'
\echo '   ⚠️  Or use Supabase Dashboard → Authentication → Users to find user IDs'
\echo ''
\echo '---'
\echo ''

-- Get listing IDs for testing seller phone privacy
\echo '3️⃣ LISTING IDs (for seller privacy testing):'
\echo '   Use these to verify seller phone privacy is enforced'
\echo ''

SELECT 
  ml.id as listing_id,
  ml.title,
  ml.seller_id,
  up.phone_public,
  CASE 
    WHEN up.phone_public = true THEN 'Phone should be visible'
    WHEN up.phone_public = false THEN 'Phone should be HIDDEN'
    ELSE 'Phone privacy not set'
  END as expected_result
FROM marketplace_listings ml
LEFT JOIN user_profiles up ON ml.seller_id = up.id
WHERE ml.status = 'active'
  AND ml.seller_id != auth.uid()
ORDER BY ml.created_at DESC
LIMIT 5;

\echo ''
\echo '   ⚠️  If you see "no rows returned", there are no active listings from other users'
\echo ''
\echo '---'
\echo ''

\echo '📋 COPY THESE VALUES TO:'
\echo ''
\echo '   Method 1 (UI Testing):'
\echo '   - Admin Panel → Security Tab'
\echo '   - Paste User ID and Listing ID into form'
\echo ''
\echo '   Method 2 (SQL Testing):'
\echo '   - Already have your user ID from auth.uid()'
\echo '   - Use other user IDs from list above'
\echo ''
\echo '   Method 3 (cURL Testing):'
\echo '   - export TEST_USER_ID="paste-user-id-here"'
\echo '   - export TEST_LISTING_ID="paste-listing-id-here"'
\echo ''
\echo '=========================================='
\echo '✅ Test data collection complete!'
\echo '=========================================='
