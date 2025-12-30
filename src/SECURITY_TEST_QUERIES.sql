-- ============================================
-- SECURITY TEST QUERIES
-- Locksmith Marketplace - Supabase Security Audit
-- ============================================
-- 
-- Run these queries to verify that security vulnerabilities are fixed.
-- These should be run AFTER applying migration 006_security_fix_rls_policies.sql
--
-- HOW TO TEST:
-- 1. Run these queries as an AUTHENTICATED user (not admin)
-- 2. All queries marked "Should be EMPTY" should return 0 rows
-- 3. If any return data, the security vulnerability still exists
-- ============================================

-- ============================================
-- TEST 1: Email Access Control
-- ============================================
-- Try to access emails of other users
-- EXPECTED RESULT: Empty (0 rows)
SELECT email, id, first_name 
FROM user_profiles 
WHERE id != auth.uid() 
LIMIT 10;

-- ============================================
-- TEST 2: Phone Number Access Control  
-- ============================================
-- Try to access phone numbers of other users
-- EXPECTED RESULT: Empty (0 rows)
SELECT phone, id, first_name 
FROM user_profiles 
WHERE id != auth.uid() 
LIMIT 10;

-- ============================================
-- TEST 3: Address Access Control
-- ============================================
-- Try to access addresses of other users
-- EXPECTED RESULT: Empty (0 rows)
SELECT address, id, first_name 
FROM user_profiles 
WHERE id != auth.uid() 
LIMIT 10;

-- ============================================
-- TEST 4: Full Profile Access Control
-- ============================================
-- Try to access all fields of other users
-- EXPECTED RESULT: Empty (0 rows)
SELECT * 
FROM user_profiles 
WHERE id != auth.uid() 
LIMIT 10;

-- ============================================
-- TEST 5: Own Profile Access (Should Work)
-- ============================================
-- Try to access your own profile
-- EXPECTED RESULT: Returns 1 row with all your fields
SELECT * 
FROM user_profiles 
WHERE id = auth.uid();

-- ============================================
-- TEST 6: Privacy Settings Access Control
-- ============================================
-- Try to access privacy settings of other users
-- EXPECTED RESULT: Empty (0 rows)
SELECT phone_public, email_public, auto_reply, auto_reply_message, id 
FROM user_profiles 
WHERE id != auth.uid() 
LIMIT 10;

-- ============================================
-- TEST 7: Message Privacy
-- ============================================
-- Try to access messages from conversations you're not part of
-- EXPECTED RESULT: Empty (0 rows)
SELECT * 
FROM messages m
WHERE NOT EXISTS (
  SELECT 1 FROM conversations c
  WHERE c.id = m.conversation_id
  AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
)
LIMIT 10;

-- ============================================
-- TEST 8: Notifications Privacy
-- ============================================
-- Try to access notifications of other users
-- EXPECTED RESULT: Empty (0 rows)
SELECT * 
FROM notifications 
WHERE user_id != auth.uid() 
LIMIT 10;

-- ============================================
-- TEST 9: Search History Privacy
-- ============================================
-- Try to access search history of other users
-- EXPECTED RESULT: Empty (0 rows)
SELECT * 
FROM search_history 
WHERE user_id != auth.uid() 
LIMIT 10;

-- ============================================
-- TEST 10: Saved Items Privacy
-- ============================================
-- Try to access saved items of other users
-- EXPECTED RESULT: Empty (0 rows)
SELECT * 
FROM saved_items 
WHERE user_id != auth.uid() 
LIMIT 10;

-- ============================================
-- TEST 11: Reports Privacy
-- ============================================
-- Try to access reports filed by other users
-- EXPECTED RESULT: Empty (0 rows) unless you're admin
SELECT * 
FROM reports 
WHERE reporter_id != auth.uid() 
LIMIT 10;

-- ============================================
-- TEST 12: Conversations Privacy
-- ============================================
-- Try to access conversations you're not part of
-- EXPECTED RESULT: Empty (0 rows)
SELECT * 
FROM conversations 
WHERE buyer_id != auth.uid() 
AND seller_id != auth.uid() 
LIMIT 10;

-- ============================================
-- BULK DATA SCRAPING TEST
-- ============================================
-- Simulate a scraper trying to get all emails
-- EXPECTED RESULT: Empty (0 rows) or only your own email
SELECT 
  id,
  email,
  phone,
  address,
  first_name,
  last_name
FROM user_profiles
ORDER BY created_at DESC
LIMIT 1000;

-- This should return ONLY your own profile, not 1000 profiles

-- ============================================
-- TEST SUMMARY
-- ============================================
-- If ANY of the queries marked "EXPECTED: Empty" return data,
-- the security vulnerability has NOT been fixed.
--
-- ALL queries should return empty except:
-- - TEST 5 (Own Profile Access) - should return 1 row
-- - BULK TEST - should return only 1 row (your profile)
-- ============================================
