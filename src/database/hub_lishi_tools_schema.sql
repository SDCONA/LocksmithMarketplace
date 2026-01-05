-- ============================================
-- HUB LISHI TOOLS DATABASE SCHEMA
-- ============================================
-- This schema stores Lishi tool information for the Hub section
-- Table: hub_lishi_tools
-- Purpose: Store Lishi tool compatibility data for all car brands
-- ============================================

-- Create the hub_lishi_tools table
CREATE TABLE IF NOT EXISTS hub_lishi_tools (
  id BIGSERIAL PRIMARY KEY,
  tool_name TEXT NOT NULL,
  tool_code TEXT,
  brand TEXT NOT NULL,
  compatibility JSONB DEFAULT '[]'::jsonb,
  years TEXT,
  notes TEXT,
  profile TEXT,
  image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hub_lishi_tools_brand ON hub_lishi_tools(brand);
CREATE INDEX IF NOT EXISTS idx_hub_lishi_tools_tool_code ON hub_lishi_tools(tool_code);
CREATE INDEX IF NOT EXISTS idx_hub_lishi_tools_created_at ON hub_lishi_tools(created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_hub_lishi_tools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_hub_lishi_tools_updated_at ON hub_lishi_tools;
CREATE TRIGGER trigger_update_hub_lishi_tools_updated_at
  BEFORE UPDATE ON hub_lishi_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_hub_lishi_tools_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE hub_lishi_tools ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access (anyone can view Lishi tools)
DROP POLICY IF EXISTS "Public read access for hub_lishi_tools" ON hub_lishi_tools;
CREATE POLICY "Public read access for hub_lishi_tools"
  ON hub_lishi_tools
  FOR SELECT
  USING (true);

-- Policy 2: Only admins can insert new tools
DROP POLICY IF EXISTS "Admins can insert hub_lishi_tools" ON hub_lishi_tools;
CREATE POLICY "Admins can insert hub_lishi_tools"
  ON hub_lishi_tools
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins_a7e285ba
      WHERE user_id = auth.uid()
    )
  );

-- Policy 3: Only admins can update tools
DROP POLICY IF EXISTS "Admins can update hub_lishi_tools" ON hub_lishi_tools;
CREATE POLICY "Admins can update hub_lishi_tools"
  ON hub_lishi_tools
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins_a7e285ba
      WHERE user_id = auth.uid()
    )
  );

-- Policy 4: Only admins can delete tools
DROP POLICY IF EXISTS "Admins can delete hub_lishi_tools" ON hub_lishi_tools;
CREATE POLICY "Admins can delete hub_lishi_tools"
  ON hub_lishi_tools
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admins_a7e285ba
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================
-- Uncomment to insert sample data for testing

-- INSERT INTO hub_lishi_tools (tool_name, tool_code, brand, compatibility, years, notes, profile) VALUES
-- ('HU66 Lishi 2-in-1 Pick & Decoder', 'HU66', 'Acura', '["MDX", "RDX", "TLX"]'::jsonb, '2007-2020', '6 cuts', 'HU66'),
-- ('HON66 Lishi 2-in-1 Pick & Decoder', 'HON66', 'Acura', '["ILX", "NSX"]'::jsonb, '2013-2020', '6 cuts', 'HON66');

-- ============================================
-- NOTES FOR DEVELOPERS
-- ============================================
-- 
-- Column Descriptions:
-- - id: Auto-incrementing primary key
-- - tool_name: Full name of the Lishi tool (e.g., "HU66 Lishi 2-in-1 Pick & Decoder")
-- - tool_code: Short code for the tool (e.g., "HU66", "HON66")
-- - brand: Car brand name (e.g., "Acura", "BMW", "Ford")
-- - compatibility: JSON array of compatible vehicle models (e.g., ["MDX", "RDX", "TLX"])
-- - years: Year range as text (e.g., "2007-2020", "2015-Present")
-- - notes: Additional notes (e.g., "6 cuts", "Works with ignition only")
-- - profile: Key profile type (e.g., "HU66", "HON66")
-- - image_path: Path to image in Hub storage bucket (e.g., "lishi/acura/hu66.jpg")
-- - created_at: Timestamp when record was created
-- - updated_at: Timestamp when record was last updated
--
-- Usage:
-- 1. Run this SQL in Supabase SQL Editor to create the table
-- 2. Use the server API routes to insert/update/delete data
-- 3. Frontend components will fetch data from the API
-- 
-- ============================================
