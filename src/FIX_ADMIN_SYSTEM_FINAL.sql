-- ========================================
-- LOCKSMITH MARKETPLACE: UNIFIED ADMIN SYSTEM
-- Lock down admin access to ONLY admins_a7e285ba table
-- Remove ALL metadata-based admin checks
-- ========================================

-- ========================================
-- STEP 1: REPLACE is_admin() FUNCTION
-- ========================================
-- BEFORE: Checks auth.users.raw_app_meta_data (insecure metadata)
-- AFTER: ONLY checks admins_a7e285ba table (secure)

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- ONLY check the secure admins_a7e285ba table
    -- NO metadata checks
    RETURN EXISTS (
        SELECT 1 FROM admins_a7e285ba
        WHERE admins_a7e285ba.user_id = user_id
    );
END;
$$;

COMMENT ON FUNCTION is_admin(UUID) IS 'Checks if user is admin by looking up admins_a7e285ba table ONLY. No metadata checks.';


-- ========================================
-- STEP 2: REPLACE is_current_user_admin() FUNCTION
-- ========================================
-- Unify with is_admin() - both check admins_a7e285ba ONLY

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- ONLY check the secure admins_a7e285ba table
    -- NO metadata checks
    RETURN EXISTS (
        SELECT 1 FROM admins_a7e285ba
        WHERE admins_a7e285ba.user_id = auth.uid()
    );
END;
$$;

COMMENT ON FUNCTION is_current_user_admin() IS 'Checks if current user is admin by looking up admins_a7e285ba table ONLY. No metadata checks.';


-- ========================================
-- STEP 3: VERIFY NO OTHER ADMIN MECHANISMS
-- ========================================
-- Check for any other functions that might bypass the admin table

DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname LIKE '%admin%'
    AND p.proname NOT IN ('is_admin', 'is_current_user_admin');
    
    IF func_count > 0 THEN
        RAISE NOTICE 'WARNING: Found % additional admin-related functions. Review them manually.', func_count;
    ELSE
        RAISE NOTICE 'SUCCESS: Only is_admin() and is_current_user_admin() exist.';
    END IF;
END $$;


-- ========================================
-- STEP 4: VERIFICATION QUERIES
-- ========================================

-- Run these to verify the system is working:

-- 1. Check function definitions
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'is_current_user_admin');

-- 2. Check all RLS policies using these functions
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN qual::text LIKE '%is_admin%' OR qual::text LIKE '%is_current_user_admin%' THEN 'USES ADMIN CHECK'
        ELSE 'No admin check'
    END as admin_check_status,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
AND (qual::text LIKE '%is_admin%' OR qual::text LIKE '%is_current_user_admin%')
ORDER BY tablename, policyname;

-- 3. List all users in admins_a7e285ba table
SELECT 
    a.user_id,
    u.email,
    a.granted_at,
    a.notes
FROM admins_a7e285ba a
LEFT JOIN auth.users u ON u.id = a.user_id
ORDER BY a.granted_at DESC;


-- ========================================
-- STEP 5: SECURITY NOTES
-- ========================================

/*
✅ WHAT THIS DOES:
1. Replaces is_admin(user_id) to ONLY check admins_a7e285ba
2. Replaces is_current_user_admin() to ONLY check admins_a7e285ba  
3. Removes all metadata-based admin checks
4. Provides verification queries

🔒 ADMIN ACCESS NOW WORKS LIKE THIS:
- User must be in admins_a7e285ba table
- No other way to become admin
- No metadata checks
- No role checks (except service_role which is Supabase system-level)

⚠️ IMPORTANT:
- admins_a7e285ba has ZERO RLS policies = completely locked down
- Only service_role (backend) can modify admins_a7e285ba
- Frontend cannot add/remove admins directly
- To add admin: INSERT via Supabase SQL Editor or backend server code

📝 TO ADD A NEW ADMIN (via SQL Editor):
INSERT INTO admins_a7e285ba (user_id, granted_by, notes)
VALUES (
    'USER_UUID_HERE',
    auth.uid(),  -- or specific admin UUID
    'Reason for granting admin access'
);

📝 TO REMOVE AN ADMIN (via SQL Editor):
DELETE FROM admins_a7e285ba WHERE user_id = 'USER_UUID_HERE';

*/
