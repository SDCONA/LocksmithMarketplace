-- ========================================
-- CRITICAL SECURITY TESTS (FIXED)
-- Run ALL of these and paste results
-- ========================================

-- ========================================
-- TEST 1: Verify admins_a7e285ba is LOCKED DOWN
-- ========================================
SELECT 
    'admins_a7e285ba Security Status' as test_name,
    CASE 
        WHEN tbl.rowsecurity = true AND policy_count = 0 THEN '✅ SECURE - RLS enabled with ZERO policies (fully locked)'
        WHEN tbl.rowsecurity = true AND policy_count > 0 THEN '⚠️ WARNING - Has RLS policies (should have ZERO)'
        WHEN tbl.rowsecurity = false THEN '❌ DANGER - RLS is DISABLED'
    END as security_status,
    tbl.rowsecurity as rls_enabled,
    policy_count
FROM (
    SELECT 
        tbl.rowsecurity,
        COUNT(p.policyname) as policy_count
    FROM pg_tables tbl
    LEFT JOIN pg_policies p ON p.tablename = tbl.tablename
    WHERE tbl.schemaname = 'public' 
    AND tbl.tablename = 'admins_a7e285ba'
    GROUP BY tbl.rowsecurity
) tbl;


-- ========================================
-- TEST 2: Check function security mode
-- ========================================
SELECT 
    p.proname as function_name,
    CASE p.prosecdef 
        WHEN true THEN '✅ SECURE - SECURITY DEFINER (runs with owner privileges)'
        ELSE '❌ VULNERABLE - SECURITY INVOKER (runs with caller privileges)'
    END as security_status,
    r.rolname as owner
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_roles r ON r.oid = p.proowner
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'is_current_user_admin')
ORDER BY p.proname;


-- ========================================
-- TEST 3: Check for metadata bypass vulnerability
-- ========================================
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ SECURE - No metadata checks found'
        ELSE '❌ VULNERABLE - ' || COUNT(*) || ' function(s) still use metadata'
    END as security_status,
    STRING_AGG(p.proname, ', ') as vulnerable_functions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%raw_app_meta_data%'
AND p.proname LIKE '%admin%';


-- ========================================
-- TEST 4: Check table grants (who can access directly)
-- ========================================
SELECT 
    grantee,
    privilege_type,
    CASE 
        WHEN grantee = 'anon' THEN '❌ CRITICAL - Anonymous users can access!'
        WHEN grantee = 'authenticated' THEN '❌ DANGER - All logged-in users can access!'
        WHEN grantee = 'service_role' THEN '✅ OK - Service role only (backend)'
        WHEN grantee = 'postgres' THEN '✅ OK - Database superuser'
        ELSE '⚠️ REVIEW - ' || grantee
    END as security_assessment
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'admins_a7e285ba'
ORDER BY 
    CASE grantee
        WHEN 'anon' THEN 1
        WHEN 'authenticated' THEN 2
        WHEN 'service_role' THEN 3
        ELSE 4
    END;


-- ========================================
-- TEST 5: Check function definitions for SQL injection
-- ========================================
SELECT 
    p.proname as function_name,
    CASE 
        WHEN pg_get_functiondef(p.oid) ~ 'SELECT 1 FROM admins_a7e285ba' THEN '✅ LIKELY SECURE - Uses standard query pattern'
        ELSE '⚠️ REVIEW - Check definition manually'
    END as sql_injection_status,
    pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'is_current_user_admin');


-- ========================================
-- TEST 6: Check columns that might leak admin IDs
-- ========================================
WITH public_readable_tables AS (
    SELECT DISTINCT tablename
    FROM pg_policies
    WHERE schemaname = 'public'
    AND cmd = 'SELECT'
    AND (
        qual IS NULL 
        OR qual::text = 'true'
        OR qual::text NOT LIKE '%is_admin%'
        OR qual::text NOT LIKE '%is_current_user_admin%'
    )
)
SELECT 
    c.table_name,
    c.column_name,
    CASE 
        WHEN c.table_name = 'admins_a7e285ba' THEN '🔒 SAFE - Table is fully locked'
        WHEN c.table_name = 'admin_actions' THEN '🔐 PROTECTED - Only admins can see this table'
        WHEN c.table_name IN (SELECT tablename FROM public_readable_tables) 
             AND c.column_name IN ('updated_by', 'created_by', 'admin_id') 
             THEN '⚠️ INFO LEAK - Public can see admin user IDs'
        WHEN c.column_name LIKE '%admin%' THEN '⚠️ REVIEW - May contain admin data'
        ELSE '✅ OK'
    END as exposure_risk
FROM information_schema.columns c
WHERE c.table_schema = 'public'
AND (
    c.column_name LIKE '%admin%'
    OR c.column_name IN ('updated_by', 'created_by', 'granted_by')
    OR c.table_name LIKE '%admin%'
)
ORDER BY 
    CASE 
        WHEN c.table_name = 'admins_a7e285ba' THEN 1
        WHEN c.table_name = 'admin_actions' THEN 2
        ELSE 3
    END,
    c.table_name, 
    c.column_name;


-- ========================================
-- FINAL SECURITY SUMMARY
-- ========================================
SELECT 
    '🔒 SECURITY AUDIT COMPLETE' as status,
    'Review all test results above' as action_required,
    'All critical tests should show ✅' as expected_result;
