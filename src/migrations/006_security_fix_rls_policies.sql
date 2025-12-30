-- ============================================
-- Locksmith Marketplace - Security Fix Migration
-- Migration 006: Fix RLS Policies for user_profiles
-- ============================================
-- 
-- SECURITY ISSUE: The original RLS policy allowed ANY authenticated user
-- to query all fields from user_profiles table, including sensitive data
-- like email, phone, and address.
--
-- SOLUTION: Remove the overly permissive policy and restrict direct
-- database access. Force all profile views through API endpoints which
-- properly sanitize data.
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;

-- Create restrictive policy: users can only view their own full profile via direct query
CREATE POLICY "Users can view own profile" ON user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- NOTE: Other users' profiles should be accessed ONLY through server API endpoints
-- The server endpoints at /users/:userId properly filter sensitive fields
-- This prevents direct database queries from leaking email, phone, address, etc.

-- For reference, the server endpoint returns only these safe fields:
--   - id, firstName, lastName, avatar, bio, website, location (general)
--   - isVerified, joinedDate, lastActive, stats, rating, totalRatings
--
-- These fields are NEVER exposed to other users:
--   - email, phone, address, phone_public, email_public
--   - auto_reply, auto_reply_message

-- ============================================
-- Add comment for documentation
-- ============================================
COMMENT ON TABLE user_profiles IS 
  'User profile data with RLS enabled. Users can only directly query their own profile. 
   Public profile views must go through API endpoints which filter sensitive fields.';

-- ============================================
-- VERIFICATION QUERIES (Run these to test)
-- ============================================
-- 
-- As a logged-in user, test that you CANNOT access other users' sensitive data:
-- 
-- SELECT email FROM user_profiles WHERE id != auth.uid(); 
-- Expected: Empty result set
-- 
-- SELECT phone FROM user_profiles WHERE id != auth.uid();
-- Expected: Empty result set
-- 
-- SELECT address FROM user_profiles WHERE id != auth.uid();
-- Expected: Empty result set
--
-- SELECT * FROM user_profiles WHERE id = auth.uid();
-- Expected: Returns your own profile with all fields
-- ============================================
