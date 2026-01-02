-- ========================================
-- CHECK IF ADMIN FUNCTIONS ARE CORRECT
-- ========================================

-- Test 1: Do the functions exist and use SECURITY DEFINER?
SELECT 
    p.proname as function_name,
    CASE p.prosecdef 
        WHEN true THEN '✅ SECURITY DEFINER (SECURE)'
        ELSE '❌ SECURITY INVOKER (VULNERABLE)'
    END as security_mode,
    pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'is_current_user_admin')
ORDER BY p.proname;


-- Test 2: Do they check metadata or admins_a7e285ba?
SELECT 
    p.proname as function_name,
    CASE 
        WHEN pg_get_functiondef(p.oid) LIKE '%admins_a7e285ba%' 
             AND pg_get_functiondef(p.oid) NOT LIKE '%raw_app_meta_data%' 
             THEN '✅ SECURE - Uses admins_a7e285ba table'
        WHEN pg_get_functiondef(p.oid) LIKE '%raw_app_meta_data%' 
             THEN '❌ VULNERABLE - Uses metadata'
        WHEN pg_get_functiondef(p.oid) LIKE '%user_profiles%' 
             AND pg_get_functiondef(p.oid) LIKE '%is_admin%' 
             THEN '❌ VULNERABLE - Uses user_profiles.is_admin column'
        ELSE '⚠️ UNKNOWN - Check definition manually'
    END as security_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'is_current_user_admin');


-- Test 3: Check if user_profiles.is_admin column is still being used anywhere
SELECT 
    'user_profiles.is_admin column status' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles' 
            AND column_name = 'is_admin'
        ) THEN '⚠️ WARNING - Column still exists but should be IGNORED'
        ELSE '✅ SAFE - Column does not exist'
    END as status;


-- Test 4: List all functions that might reference user_profiles.is_admin
SELECT 
    p.proname as function_name,
    '❌ VULNERABLE - Still uses user_profiles.is_admin' as issue
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) LIKE '%user_profiles%'
AND pg_get_functiondef(p.oid) LIKE '%is_admin%';
