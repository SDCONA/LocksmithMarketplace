-- ============================================
-- FIX: Notifications Table Structure & Reports Table
-- ============================================
-- This migration:
-- 1. Ensures notifications table has correct structure
-- 2. Creates reports_a7e285ba table
-- 3. Sets up proper RLS policies
-- ============================================

-- ============================================
-- 1. FIX NOTIFICATIONS TABLE
-- ============================================

-- Check if notifications table exists and add missing columns if needed
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    END IF;

    -- Add read column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'read'
    ) THEN
        ALTER TABLE notifications ADD COLUMN read BOOLEAN DEFAULT FALSE;
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
    END IF;

    -- Add read_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'read_at'
    ) THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;
    END IF;

    -- Add type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'type'
    ) THEN
        ALTER TABLE notifications ADD COLUMN type TEXT DEFAULT 'system';
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'title'
    ) THEN
        ALTER TABLE notifications ADD COLUMN title TEXT;
    END IF;

    -- Add message column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'message'
    ) THEN
        ALTER TABLE notifications ADD COLUMN message TEXT;
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE notifications ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    END IF;
END $$;

-- Enable RLS on notifications if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 2. CREATE REPORTS TABLE
-- ============================================

-- Create reports_a7e285ba table if it doesn't exist
CREATE TABLE IF NOT EXISTS reports_a7e285ba (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('listing', 'user', 'deal', 'message')),
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for reports table
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports_a7e285ba(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_content_type ON reports_a7e285ba(content_type);
CREATE INDEX IF NOT EXISTS idx_reports_content_id ON reports_a7e285ba(content_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports_a7e285ba(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports_a7e285ba(created_at DESC);

-- Enable RLS on reports table
ALTER TABLE reports_a7e285ba ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own reports" ON reports_a7e285ba;
DROP POLICY IF EXISTS "Users can create reports" ON reports_a7e285ba;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports_a7e285ba;
DROP POLICY IF EXISTS "Admins can update reports" ON reports_a7e285ba;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports_a7e285ba;

-- Create RLS policies for reports
CREATE POLICY "Users can view their own reports"
  ON reports_a7e285ba FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON reports_a7e285ba FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON reports_a7e285ba FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Admins can update reports"
  ON reports_a7e285ba FOR UPDATE
  USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Admins can delete reports"
  ON reports_a7e285ba FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reports_updated_at_trigger ON reports_a7e285ba;
CREATE TRIGGER update_reports_updated_at_trigger
  BEFORE UPDATE ON reports_a7e285ba
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables exist
DO $$
DECLARE
  notification_count INTEGER;
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO notification_count FROM information_schema.tables WHERE table_name = 'notifications';
  SELECT COUNT(*) INTO report_count FROM information_schema.tables WHERE table_name = 'reports_a7e285ba';
  
  RAISE NOTICE 'Migration Complete:';
  RAISE NOTICE '- notifications table: % (1 = exists)', notification_count;
  RAISE NOTICE '- reports_a7e285ba table: % (1 = exists)', report_count;
END $$;
