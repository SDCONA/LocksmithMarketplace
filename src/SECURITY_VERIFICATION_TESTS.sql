-- ============================================
-- LOCKSMITH MARKETPLACE - SECURITY VERIFICATION TESTS
-- ============================================
-- Run these tests in Supabase SQL Editor to verify security fixes
-- Date: December 16, 2024
-- ============================================

-- PREREQUISITES:
-- 1. You must be logged in as a regular user (not service_role)
-- 2. Note your current user ID by running: SELECT auth.uid();
-- 3. Replace YOUR_USER_ID in tests below with your actual user ID
-- 4. All tests marked "Expected: 0 rows" should return empty results
-- ============================================

\echo '===================='
\echo 'SECURITY TEST SUITE'
\echo '===================='
\echo ''

-- ============================================
-- TEST CATEGORY 1: RLS POLICY VERIFICATION
-- ============================================

\echo '📋 TEST 1: Verify current user can access own profile'
\echo '✅ Expected: Returns YOUR profile data'
\echo ''

SELECT 
  id,
  first_name,
  last_name,
  email,
  phone,
  address,
  'SUCCESS: Can access own profile' as test_result
FROM user_profiles 
WHERE id = auth.uid();

\echo ''
\echo '---'
\echo ''

\echo '📋 TEST 2: Verify CANNOT access other users emails'
\echo '✅ Expected: 0 rows returned'
\echo ''

SELECT 
  id,
  email,
  'SECURITY BREACH: Should not be able to query other users emails!' as test_result
FROM user_profiles 
WHERE id != auth.uid()
LIMIT 10;

\echo ''
\echo '---'
\echo ''

\echo '📋 TEST 3: Verify CANNOT access other users phone numbers'
\echo '✅ Expected: 0 rows returned'
\echo ''

SELECT 
  id,
  phone,
  'SECURITY BREACH: Should not be able to query other users phones!' as test_result
FROM user_profiles 
WHERE id != auth.uid()
LIMIT 10;

\echo ''
\echo '---'
\echo ''

\echo '📋 TEST 4: Verify CANNOT access other users addresses'
\echo '✅ Expected: 0 rows returned'
\echo ''

SELECT 
  id,
  address,
  'SECURITY BREACH: Should not be able to query other users addresses!' as test_result
FROM user_profiles 
WHERE id != auth.uid()
LIMIT 10;

\echo ''
\echo '---'
\echo ''

\echo '📋 TEST 5: Verify CANNOT access privacy settings of other users'
\echo '✅ Expected: 0 rows returned'
\echo ''

SELECT 
  id,
  phone_public,
  email_public,
  auto_reply,
  'SECURITY BREACH: Should not be able to query other users privacy settings!' as test_result
FROM user_profiles 
WHERE id != auth.uid()
LIMIT 10;

\echo ''
\echo '---'
\echo ''

\echo '📋 TEST 6: Verify CANNOT access other users full profiles'
\echo '✅ Expected: 0 rows returned'
\echo ''

SELECT 
  id,
  first_name,
  email,
  phone,
  'SECURITY BREACH: Should not be able to query other users full profiles!' as test_result
FROM user_profiles 
WHERE id != auth.uid()
LIMIT 10;

\echo ''
\echo '---'
\echo ''

-- ============================================
-- TEST CATEGORY 2: RLS POLICY EXISTS CHECK
-- ============================================

\echo '📋 TEST 7: Verify RLS policies are configured correctly'
\echo '✅ Expected: Should see "Users can view own profile" policy'
\echo ''

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
  AND schemaname = 'public'
ORDER BY policyname;

\echo ''
\echo '---'
\echo ''

-- ============================================
-- TEST CATEGORY 3: DATA EXPOSURE CHECKS
-- ============================================

\echo '📋 TEST 8: Check how many user profiles exist (should work)'
\echo '✅ Expected: Returns only count of 1 (your own profile)'
\echo ''

SELECT 
  COUNT(*) as accessible_profiles,
  CASE 
    WHEN COUNT(*) = 1 THEN 'PASS: Can only access own profile'
    WHEN COUNT(*) > 1 THEN 'FAIL: Can access multiple profiles - RLS not working!'
    ELSE 'FAIL: Cannot access any profiles'
  END as test_result
FROM user_profiles;

\echo ''
\echo '---'
\echo ''

\echo '📋 TEST 9: Attempt to join listings with seller sensitive data'
\echo '✅ Expected: 0 rows with email/phone/address'
\echo ''

SELECT 
  ml.id as listing_id,
  ml.title,
  up.email,
  up.phone,
  up.address,
  'SECURITY BREACH: Seller sensitive data exposed!' as test_result
FROM marketplace_listings ml
LEFT JOIN user_profiles up ON ml.seller_id = up.id
WHERE up.id != auth.uid()
  AND (up.email IS NOT NULL OR up.phone IS NOT NULL OR up.address IS NOT NULL)
LIMIT 10;

\echo ''
\echo '---'
\echo ''

-- ============================================
-- TEST CATEGORY 4: BYPASS ATTEMPT TESTS
-- ============================================

\echo '📋 TEST 10: Attempt to bypass RLS with subquery'
\echo '✅ Expected: 0 rows returned'
\echo ''

SELECT 
  id,
  email,
  'SECURITY BREACH: RLS bypassed with subquery!' as test_result
FROM user_profiles 
WHERE id IN (
  SELECT id FROM user_profiles WHERE id != auth.uid() LIMIT 5
)
AND email IS NOT NULL;

\echo ''
\echo '---'
\echo ''

\echo '📋 TEST 11: Attempt to use EXISTS to check for other users'
\echo '✅ Expected: Should return FALSE (no other profiles accessible)'
\echo ''

SELECT 
  EXISTS(
    SELECT 1 FROM user_profiles WHERE id != auth.uid()
  ) as can_see_other_users,
  CASE 
    WHEN EXISTS(SELECT 1 FROM user_profiles WHERE id != auth.uid()) 
    THEN 'FAIL: Can detect other users exist'
    ELSE 'PASS: Cannot see other users'
  END as test_result;

\echo ''
\echo '---'
\echo ''

-- ============================================
-- TEST CATEGORY 5: BULK SCRAPING PREVENTION
-- ============================================

\echo '📋 TEST 12: Attempt bulk email scraping'
\echo '✅ Expected: 0 rows returned'
\echo ''

SELECT 
  COUNT(*) as scraped_emails,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS: Cannot scrape emails'
    ELSE 'FAIL: Bulk email scraping possible!'
  END as test_result
FROM user_profiles 
WHERE email IS NOT NULL 
  AND id != auth.uid();

\echo ''
\echo '---'
\echo ''

\echo '📋 TEST 13: Attempt bulk phone scraping'
\echo '✅ Expected: 0 rows returned'
\echo ''

SELECT 
  COUNT(*) as scraped_phones,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS: Cannot scrape phone numbers'
    ELSE 'FAIL: Bulk phone scraping possible!'
  END as test_result
FROM user_profiles 
WHERE phone IS NOT NULL 
  AND id != auth.uid();

\echo ''
\echo '---'
\echo ''

-- ============================================
-- TEST CATEGORY 6: SELLER PRIVACY CHECKS
-- ============================================

\echo '📋 TEST 14: Check if seller phone privacy settings are stored'
\echo '✅ Expected: Your own profile with phone_public value'
\echo ''

SELECT 
  id,
  phone,
  phone_public,
  CASE 
    WHEN phone_public IS NOT NULL THEN 'PASS: Privacy setting exists'
    ELSE 'WARNING: Privacy setting not set'
  END as test_result
FROM user_profiles 
WHERE id = auth.uid();

\echo ''
\echo '---'
\echo ''

\echo '📋 TEST 15: Verify CANNOT see other sellers phone_public settings'
\echo '✅ Expected: 0 rows returned'
\echo ''

SELECT 
  id,
  phone_public,
  'SECURITY BREACH: Can see other users privacy settings!' as test_result
FROM user_profiles 
WHERE id != auth.uid()
  AND phone_public IS NOT NULL;

\echo ''
\echo '---'
\echo ''

-- ============================================
-- SUMMARY QUERY - RUN THIS LAST
-- ============================================

\echo '📊 FINAL SUMMARY: Security Status'
\echo ''

WITH security_checks AS (
  SELECT 
    -- Check 1: Can only access own profile
    (SELECT COUNT(*) FROM user_profiles) = 1 as own_profile_only,
    
    -- Check 2: Cannot see other users emails
    (SELECT COUNT(*) FROM user_profiles WHERE id != auth.uid() AND email IS NOT NULL) = 0 as emails_protected,
    
    -- Check 3: Cannot see other users phones
    (SELECT COUNT(*) FROM user_profiles WHERE id != auth.uid() AND phone IS NOT NULL) = 0 as phones_protected,
    
    -- Check 4: Cannot see other users addresses
    (SELECT COUNT(*) FROM user_profiles WHERE id != auth.uid() AND address IS NOT NULL) = 0 as addresses_protected,
    
    -- Check 5: RLS policy exists
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile') as rls_policy_exists
)
SELECT 
  own_profile_only as "✓ Can Access Own Profile Only",
  emails_protected as "✓ Emails Protected",
  phones_protected as "✓ Phones Protected",
  addresses_protected as "✓ Addresses Protected",
  rls_policy_exists as "✓ RLS Policy Exists",
  CASE 
    WHEN own_profile_only AND emails_protected AND phones_protected AND addresses_protected AND rls_policy_exists 
    THEN '✅ ALL SECURITY TESTS PASSED'
    ELSE '❌ SECURITY ISSUES DETECTED - REVIEW FAILED TESTS'
  END as "Overall Status"
FROM security_checks;

\echo ''
\echo '===================='
\echo 'END OF TEST SUITE'
\echo '===================='
\echo ''
\echo 'INTERPRETATION:'
\echo '- TRUE = Security check passed'
\echo '- FALSE = Security issue detected'
\echo '- All checks should be TRUE for production deployment'
\echo ''
\echo 'If any test fails, review the SECURITY_FIXES_APPLIED.md document'
\echo 'and ensure migration 006_security_fix_rls_policies.sql has been applied.'
\echo '===================='
