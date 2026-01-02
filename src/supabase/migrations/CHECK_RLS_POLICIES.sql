-- Check RLS status and policies on user_preferences
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'user_preferences';

-- Check all policies on user_preferences
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'user_preferences';
