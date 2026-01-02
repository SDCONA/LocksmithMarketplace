-- ========================================
-- SECURITY AUDIT: Admin System
-- Check for vulnerabilities and exposure
-- ========================================

-- ========================================
-- TEST 1: Can regular users see admins_a7e285ba?
-- ========================================
-- Expected: NO - RLS should block completely

SELECT 
    tablename,
    rowsecurity as rls_enabled,
    COUNT(*) FILTER (WHERE policyname IS NOT NULL) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename
WHERE t.schemaname = 'public' 
AND t.tablename = 'admins_a7e285ba'
GROUP BY tablename, rowsecurity;

COMMENT ON QUERY IS 'Should show rls_enabled=true and policy_count=0 (zero policies = fully locked)';


-- ========================================
-- TEST 2: Check if admin functions are SECURITY DEFINER
-- ========================================
-- Expected: YES - Functions should run with elevated privileges

SELECT 
    p.proname as function_name,
    CASE p.prosecdef 
        WHEN true THEN 'SECURITY DEFINER (SAFE - runs with function owner privileges)'
        ELSE 'SECURITY INVOKER (UNSAFE - runs with caller privileges)'
    END as security_mode,
    pg_get_function_arguments(p.oid) as arguments,
    r.rolname as owner
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_roles r ON r.oid = p.proowner
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'is_current_user_admin')
ORDER BY p.proname;


-- ========================================
-- TEST 3: Can functions be exploited with SQL injection?
-- ========================================
-- Check if functions use parameterized queries

SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'is_current_user_admin');

COMMENT ON QUERY IS 'Review for SQL injection - should use parameterized WHERE clauses';


-- ========================================
-- TEST 4: Check for metadata-based admin bypass
-- ========================================
-- Search for any remaining metadata checks

SELECT 
    p.proname as function_name,
    'VULNERABLE - Uses metadata' as security_issue
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%raw_app_meta_data%'
AND p.proname LIKE '%admin%';

COMMENT ON QUERY IS 'Should return ZERO rows - no metadata checks allowed';


-- ========================================
-- TEST 5: Check RLS policies for vulnerabilities
-- ========================================
-- Look for policies that might expose admin status

SELECT 
    tablename,
    policyname,
    CASE 
        WHEN qual::text ILIKE '%is_admin%' THEN 'Uses admin check (SECURE)'
        WHEN qual::text ILIKE '%is_current_user_admin%' THEN 'Uses admin check (SECURE)'
        WHEN with_check::text ILIKE '%is_admin%' THEN 'Uses admin check (SECURE)'
        WHEN with_check::text ILIKE '%is_current_user_admin%' THEN 'Uses admin check (SECURE)'
        ELSE 'No admin check'
    END as security_status,
    cmd as command,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
AND (
    qual::text ILIKE '%admin%' 
    OR with_check::text ILIKE '%admin%'
    OR tablename = 'admins_a7e285ba'
)
ORDER BY tablename, policyname;


-- ========================================
-- TEST 6: Check for direct database grants
-- ========================================
-- Look for table-level permissions that might bypass RLS

SELECT 
    grantee,
    table_name,
    privilege_type,
    CASE 
        WHEN grantee = 'anon' THEN '⚠️ DANGER - Anonymous users can access'
        WHEN grantee = 'authenticated' THEN '⚠️ WARNING - All logged in users can access'
        WHEN grantee = 'service_role' THEN '✅ OK - Service role (backend only)'
        ELSE 'REVIEW NEEDED'
    END as security_assessment
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'admins_a7e285ba'
ORDER BY grantee, privilege_type;


-- ========================================
-- TEST 7: Check if user IDs are exposed anywhere
-- ========================================
-- Search for columns that might leak admin user_id

SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN table_name = 'admins_a7e285ba' THEN '🔒 LOCKED (RLS=on, no policies)'
        WHEN table_name = 'admin_actions' THEN '🔐 PROTECTED (admin-only access)'
        ELSE '⚠️ REVIEW - May expose admin IDs'
    END as exposure_risk
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    column_name LIKE '%admin%'
    OR table_name LIKE '%admin%'
)
ORDER BY table_name, column_name;


-- ========================================
-- TEST 8: Verify no public functions expose admin status
-- ========================================
-- Check all public functions that return boolean

SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    CASE p.prosecdef 
        WHEN true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_mode,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_function_result(p.oid) = 'boolean'
AND p.proname LIKE '%admin%'
ORDER BY p.proname;


-- ========================================
-- SECURITY SUMMARY
-- ========================================

/*
🔒 YOUR ADMIN SYSTEM IS SECURE IF:

✅ admins_a7e285ba has:
   - RLS enabled: YES
   - Policy count: 0 (completely locked)
   
✅ is_admin() and is_current_user_admin():
   - Security mode: SECURITY DEFINER
   - No raw_app_meta_data checks
   - Uses parameterized queries (not string concatenation)
   
✅ No table grants to 'anon' or 'authenticated' on admins_a7e285ba

✅ Only service_role can query admins_a7e285ba directly


⚠️ POTENTIAL VULNERABILITIES:

❌ If admins_a7e285ba has any RLS policies → NOT SECURE
❌ If functions use SECURITY INVOKER → EXPLOITABLE
❌ If raw_app_meta_data is checked → BYPASSABLE
❌ If admin_id columns are publicly readable → INFO LEAK
❌ If 'anon' or 'authenticated' has direct grants → FULL COMPROMISE


🛡️ ATTACK SCENARIOS TESTED:

1. Can hacker query admins_a7e285ba? → NO (zero policies block everything)
2. Can hacker see admin user_ids? → NO (table completely locked)
3. Can hacker call is_admin(any_user_id)? → YES, but function runs as SECURITY DEFINER with its own privileges
4. Can hacker modify their own user_id? → NO (auth.uid() is Supabase system function)
5. Can hacker inject SQL into admin functions? → NO (if parameterized)
6. Can hacker set metadata to become admin? → NO (if metadata checks removed)


🔐 FINAL VERDICT:

Your admin system is SECURE if all tests pass above.
The key is: admins_a7e285ba has ZERO RLS policies = no one can read it except service_role.

*/
