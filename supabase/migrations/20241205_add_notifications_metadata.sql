-- ============================================
-- ADD METADATA COLUMN TO NOTIFICATIONS TABLE
-- ============================================
-- This allows admin action notifications to store detailed information
-- about reports, reasons, and actions taken

DO $$ 
BEGIN
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB;
        CREATE INDEX IF NOT EXISTS idx_notifications_metadata ON notifications USING GIN(metadata);
        RAISE NOTICE 'Added metadata column to notifications table';
    ELSE
        RAISE NOTICE 'metadata column already exists in notifications table';
    END IF;

    -- Add is_read column if it doesn't exist (for compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'is_read'
    ) THEN
        ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        -- Copy data from 'read' column if it exists
        UPDATE notifications SET is_read = read WHERE read IS NOT NULL;
        RAISE NOTICE 'Added is_read column to notifications table';
    ELSE
        RAISE NOTICE 'is_read column already exists in notifications table';
    END IF;

    -- Add resolution_notes column to reports table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports_a7e285ba' AND column_name = 'resolution_notes'
    ) THEN
        ALTER TABLE reports_a7e285ba ADD COLUMN resolution_notes TEXT;
        RAISE NOTICE 'Added resolution_notes column to reports_a7e285ba table';
    ELSE
        RAISE NOTICE 'resolution_notes column already exists in reports_a7e285ba table';
    END IF;
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

RAISE NOTICE '✅ Notifications metadata migration complete!';
