SELECT 
    'TEST 1: Admin Table Lock Status' as test_name,
    CASE 
        WHEN tbl.rowsecurity = true AND policy_count = 0 THEN '✅ SECURE - RLS enabled with ZERO policies'
        WHEN tbl.rowsecurity = true AND policy_count > 0 THEN '❌ INSECURE - Has RLS policies'
        WHEN tbl.rowsecurity = false THEN '❌ CRITICAL - RLS DISABLED'
    END as result,
    tbl.rowsecurity::text as detail1,
    policy_count::text as detail2
FROM (
    SELECT tbl.rowsecurity, COUNT(p.policyname) as policy_count
    FROM pg_tables tbl
    LEFT JOIN pg_policies p ON p.tablename = tbl.tablename
    WHERE tbl.schemaname = 'public' AND tbl.tablename = 'admins_a7e285ba'
    GROUP BY tbl.rowsecurity
) tbl

UNION ALL

SELECT 
    'TEST 2: Function Security Mode - ' || p.proname,
    CASE p.prosecdef 
        WHEN true THEN '✅ SECURE - SECURITY DEFINER'
        ELSE '❌ VULNERABLE - SECURITY INVOKER'
    END,
    r.rolname::text,
    NULL
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_roles r ON r.oid = p.proowner
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'is_current_user_admin')

UNION ALL

SELECT 
    'TEST 3: Metadata Bypass Check',
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ SECURE - No metadata checks'
        ELSE '❌ VULNERABLE - ' || COUNT(*) || ' functions use metadata'
    END,
    COALESCE(STRING_AGG(p.proname, ', '), 'None'),
    NULL
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%raw_app_meta_data%'
AND p.proname LIKE '%admin%'

UNION ALL

SELECT 
    'TEST 4: Table Grants - ' || grantee,
    CASE 
        WHEN grantee = 'anon' THEN '❌ CRITICAL - Anonymous access'
        WHEN grantee = 'authenticated' THEN '❌ DANGER - All users can access'
        WHEN grantee = 'service_role' THEN '✅ OK - Backend only'
        WHEN grantee = 'postgres' THEN '✅ OK - Superuser'
        ELSE '⚠️ REVIEW'
    END,
    privilege_type,
    NULL
FROM information_schema.table_privileges
WHERE table_schema = 'public' AND table_name = 'admins_a7e285ba'

UNION ALL

SELECT 
    'TEST 5: Function Uses Secure Table - ' || p.proname,
    CASE 
        WHEN pg_get_functiondef(p.oid) LIKE '%admins_a7e285ba%' 
             AND pg_get_functiondef(p.oid) NOT LIKE '%raw_app_meta_data%' 
             THEN '✅ SECURE - Uses admins_a7e285ba'
        WHEN pg_get_functiondef(p.oid) LIKE '%raw_app_meta_data%' 
             THEN '❌ VULNERABLE - Uses metadata'
        WHEN pg_get_functiondef(p.oid) LIKE '%user_profiles%is_admin%' 
             THEN '❌ VULNERABLE - Uses user_profiles.is_admin'
        ELSE '⚠️ UNKNOWN'
    END,
    NULL,
    NULL
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'is_current_user_admin')

UNION ALL

SELECT 
    'TEST 6: user_profiles.is_admin Column Check',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles' 
            AND column_name = 'is_admin'
        ) THEN '⚠️ WARNING - Old column exists (should be ignored)'
        ELSE '✅ SAFE - Column removed'
    END,
    NULL,
    NULL

ORDER BY test_name;

SELECT 
    'INFO LEAK CHECK' as category,
    c.table_name,
    c.column_name,
    CASE 
        WHEN c.table_name = 'admins_a7e285ba' THEN '🔒 SAFE - Fully locked'
        WHEN c.table_name = 'admin_actions' THEN '🔐 PROTECTED - Admin only'
        WHEN c.column_name IN ('updated_by', 'created_by') THEN '⚠️ INFO LEAK - Shows admin UUIDs'
        WHEN c.column_name LIKE '%admin%' THEN '⚠️ REVIEW'
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

SELECT 
    'FUNCTION DEFINITION' as category,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as full_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'is_current_user_admin')
ORDER BY p.proname;
