-- =============================================
-- DEALS BANNER MIGRATION
-- =============================================
-- This SQL should be run in the Supabase SQL Editor
-- to create the deals_banners_a7e285ba table
-- =============================================

-- Create deals_banners table
CREATE TABLE IF NOT EXISTS deals_banners_a7e285ba (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  link TEXT DEFAULT '',
  pc_image_url TEXT,
  mobile_image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on display_order for faster sorting
CREATE INDEX IF NOT EXISTS deals_banners_display_order_idx 
  ON deals_banners_a7e285ba(display_order);

-- Create index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS deals_banners_is_active_idx 
  ON deals_banners_a7e285ba(is_active);

-- Enable Row Level Security
ALTER TABLE deals_banners_a7e285ba ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active banners
CREATE POLICY "Public can view active deals banners"
  ON deals_banners_a7e285ba
  FOR SELECT
  USING (is_active = true);

-- Create policy to allow service role full access (for admin operations)
CREATE POLICY "Service role has full access to deals banners"
  ON deals_banners_a7e285ba
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deals_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_banners_updated_at_trigger
  BEFORE UPDATE ON deals_banners_a7e285ba
  FOR EACH ROW
  EXECUTE FUNCTION update_deals_banners_updated_at();

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Table: deals_banners_a7e285ba
-- Features:
-- - Separate PC and mobile image URLs
-- - Display order management
-- - Active/inactive status
-- - RLS policies for security
-- - Auto-updating timestamps
-- =============================================
