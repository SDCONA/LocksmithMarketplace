-- ========================================
-- LOCKSMITH MARKETPLACE: ADMIN SYSTEM CLEANUP
-- Remove old metadata-based admin system
-- Migrate everything to admins_a7e285ba table
-- ========================================

-- ========================================
-- STEP 1: FIX is_admin() FUNCTION
-- ========================================

-- BEFORE: Function checked auth.users.raw_app_meta_data (metadata-based, insecure)
-- AFTER: Function checks admins_a7e285ba table (secure, isolated)

-- Replace the old metadata-based function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- ONLY check the secure admins_a7e285ba table
    -- NO metadata checks whatsoever
    RETURN EXISTS (
        SELECT 1 FROM admins_a7e285ba
        WHERE admins_a7e285ba.user_id = user_id
    );
END;
$$;

-- ========================================
-- STEP 2: UPDATE NOTIFICATIONS POLICIES
-- ========================================

DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins_a7e285ba WHERE user_id = auth.uid())
  );

-- ========================================
-- STEP 3: UPDATE REPORTS POLICIES
-- ========================================

DROP POLICY IF EXISTS "Admins can view all reports" ON reports_a7e285ba;
DROP POLICY IF EXISTS "Admins can update reports" ON reports_a7e285ba;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports_a7e285ba;

CREATE POLICY "Admins can view all reports"
  ON reports_a7e285ba FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins_a7e285ba WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update reports"
  ON reports_a7e285ba FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admins_a7e285ba WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete reports"
  ON reports_a7e285ba FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM admins_a7e285ba WHERE user_id = auth.uid())
  );

-- ========================================
-- STEP 4: UPDATE PLATFORM POLICIES TABLE
-- ========================================

DROP POLICY IF EXISTS "Only admins can insert policies" ON platform_policies_a7e285ba;
DROP POLICY IF EXISTS "Only admins can update policies" ON platform_policies_a7e285ba;
DROP POLICY IF EXISTS "Only admins can delete policies" ON platform_policies_a7e285ba;

CREATE POLICY "Only admins can insert policies"
  ON platform_policies_a7e285ba FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins_a7e285ba WHERE user_id = auth.uid())
  );

CREATE POLICY "Only admins can update policies"
  ON platform_policies_a7e285ba FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admins_a7e285ba WHERE user_id = auth.uid())
  );

CREATE POLICY "Only admins can delete policies"
  ON platform_policies_a7e285ba FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM admins_a7e285ba WHERE user_id = auth.uid())
  );

-- ========================================
-- STEP 5: UPDATE PLATFORM TERMS TABLE
-- ========================================

DROP POLICY IF EXISTS "Only admins can insert terms" ON platform_terms_a7e285ba;

CREATE POLICY "Only admins can insert terms"
  ON platform_terms_a7e285ba FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins_a7e285ba WHERE user_id = auth.uid())
  );

-- ========================================
-- STEP 6: VERIFICATION
-- ========================================

-- Show current admins in secure table
SELECT '=== ADMINS IN SECURE TABLE (admins_a7e285ba) ===' as info;
SELECT * FROM admins_a7e285ba;

-- Test is_admin() function
SELECT '=== TESTING is_admin() FUNCTION ===' as info;
SELECT 
  user_id,
  is_admin(user_id) as is_admin_result
FROM admins_a7e285ba;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
SELECT '✅ MIGRATION COMPLETE! Only admins_a7e285ba table is now used for admin checks.' as result;
