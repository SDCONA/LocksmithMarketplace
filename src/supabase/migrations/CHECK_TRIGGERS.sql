-- ================================================
-- CHECK ALL TRIGGERS AND FUNCTIONS
-- ================================================

-- 1. Check all triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users';

-- 2. Check function definitions related to user creation
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (p.proname LIKE '%user%' OR p.proname LIKE '%handle%')
ORDER BY p.proname;
