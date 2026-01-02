-- ================================================
-- DIAGNOSTIC: CHECK ALL TRIGGERS ON auth.users
-- ================================================
-- Run this to see what triggers exist on the auth.users table

-- 1. Check all triggers on auth.users table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- 2. Check all functions that might be related to user creation
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_name LIKE '%user%'
    OR routine_name LIKE '%handle%'
    OR routine_name LIKE '%preference%'
  )
ORDER BY routine_name;

-- 3. Check if user_preferences table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%preference%'
ORDER BY table_name;

-- 4. Check if user_profiles table exists (should exist)
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;
