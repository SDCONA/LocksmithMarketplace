-- ============================================
-- SECURE ADMIN TABLE MIGRATION
-- ============================================
-- This migration creates a completely private admin table
-- that is invisible to all users and only accessible via
-- service role key or SECURITY DEFINER functions.
-- ============================================

-- ============================================
-- 1. CREATE ADMIN TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admins_a7e285ba (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins_a7e285ba(user_id);

-- Enable RLS (with NO policies = completely private)
ALTER TABLE admins_a7e285ba ENABLE ROW LEVEL SECURITY;

-- NO POLICIES CREATED = NO ONE CAN ACCESS
-- Only service role key can access this table

-- ============================================
-- 2. CREATE SECURITY DEFINER FUNCTIONS
-- ============================================

-- Function to check if a specific user is admin
CREATE OR REPLACE FUNCTION is_user_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins_a7e285ba 
    WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current authenticated user is admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins_a7e285ba 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. UPDATE NOTIFICATIONS RLS POLICIES
-- ============================================

-- Drop old admin policy
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

-- Create new admin policy using secure function
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_current_user_admin());

-- ============================================
-- 4. UPDATE REPORTS RLS POLICIES
-- ============================================

-- Drop old admin policies
DROP POLICY IF EXISTS "Admins can view all reports" ON reports_a7e285ba;
DROP POLICY IF EXISTS "Admins can update reports" ON reports_a7e285ba;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports_a7e285ba;

-- Create new admin policies using secure function
CREATE POLICY "Admins can view all reports"
  ON reports_a7e285ba FOR SELECT
  USING (is_current_user_admin());

CREATE POLICY "Admins can update reports"
  ON reports_a7e285ba FOR UPDATE
  USING (is_current_user_admin());

CREATE POLICY "Admins can delete reports"
  ON reports_a7e285ba FOR DELETE
  USING (is_current_user_admin());

-- ============================================
-- 5. UPDATE PLATFORM POLICIES RLS POLICIES
-- ============================================

-- Drop old admin policies
DROP POLICY IF EXISTS "Only admins can insert policies" ON platform_policies;
DROP POLICY IF EXISTS "Only admins can update policies" ON platform_policies;
DROP POLICY IF EXISTS "Only admins can delete policies" ON platform_policies;

-- Create new admin policies using secure function
CREATE POLICY "Only admins can insert policies"
  ON platform_policies FOR INSERT
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can update policies"
  ON platform_policies FOR UPDATE
  USING (is_current_user_admin());

CREATE POLICY "Only admins can delete policies"
  ON platform_policies FOR DELETE
  USING (is_current_user_admin());

-- ============================================
-- 6. UPDATE DEALS SYSTEM RLS POLICIES
-- ============================================

-- Update deal_types policies
DROP POLICY IF EXISTS "Admin can manage deal types" ON deal_types;
CREATE POLICY "Admin can manage deal types"
  ON deal_types FOR ALL
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- Update retailer_profiles admin policy
DROP POLICY IF EXISTS "Admin can do everything with retailer profiles" ON retailer_profiles;
CREATE POLICY "Admin can do everything with retailer profiles"
  ON retailer_profiles FOR ALL
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- Update deals admin policy
DROP POLICY IF EXISTS "Admin can do everything with deals" ON deals;
CREATE POLICY "Admin can do everything with deals"
  ON deals FOR ALL
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- Update deal_images admin policy
DROP POLICY IF EXISTS "Admin can manage all deal images" ON deal_images;
CREATE POLICY "Admin can manage all deal images"
  ON deal_images FOR ALL
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- Update saved_deals admin policy
DROP POLICY IF EXISTS "Admin can view all saved deals" ON saved_deals;
CREATE POLICY "Admin can view all saved deals"
  ON saved_deals FOR SELECT
  USING (is_current_user_admin());

-- ============================================
-- 7. VERIFICATION
-- ============================================

DO $$
DECLARE
  admin_table_exists BOOLEAN;
  function_exists BOOLEAN;
BEGIN
  -- Check if admin table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'admins_a7e285ba'
  ) INTO admin_table_exists;

  -- Check if function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_current_user_admin'
  ) INTO function_exists;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'SECURE ADMIN TABLE MIGRATION COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Admin table exists: %', admin_table_exists;
  RAISE NOTICE 'Admin check function exists: %', function_exists;
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Go to Supabase SQL Editor';
  RAISE NOTICE '2. Run this command to create your first admin:';
  RAISE NOTICE '   INSERT INTO admins_a7e285ba (user_id, notes)';
  RAISE NOTICE '   VALUES (';
  RAISE NOTICE '     (SELECT id FROM auth.users WHERE email = ''your-email@example.com''),';
  RAISE NOTICE '     ''Initial admin - created manually''';
  RAISE NOTICE '   );';
  RAISE NOTICE '3. Log out and log back in to your app';
  RAISE NOTICE '============================================';
END $$;
