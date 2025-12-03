-- ============================================
-- TABLE: BANNER_POSITIONS
-- Stores banner position configurations for the retailers page
-- Each position (1-20) can contain up to 5 banners
-- ============================================

CREATE TABLE IF NOT EXISTS banner_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_number INTEGER NOT NULL UNIQUE CHECK (position_number >= 1 AND position_number <= 20),
  position_name TEXT NOT NULL DEFAULT '',
  banners JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_banner_positions_number ON banner_positions(position_number);
CREATE INDEX IF NOT EXISTS idx_banner_positions_active ON banner_positions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banner_positions_banners ON banner_positions USING gin(banners);

-- RLS Policies
ALTER TABLE banner_positions ENABLE ROW LEVEL SECURITY;

-- Public read access for active positions with banners
CREATE POLICY "Public can view active banner positions" ON banner_positions
  FOR SELECT
  USING (is_active = true AND jsonb_array_length(banners) > 0);

-- Admin-only write access (will be enforced via backend JWT check)
CREATE POLICY "Admins can manage banner positions" ON banner_positions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_banner_positions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_banner_positions_timestamp
  BEFORE UPDATE ON banner_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_banner_positions_updated_at();

-- Insert default 20 positions
INSERT INTO banner_positions (position_number, position_name, banners)
SELECT 
  n, 
  'Position ' || n,
  '[]'::jsonb
FROM generate_series(1, 20) AS n
ON CONFLICT (position_number) DO NOTHING;
