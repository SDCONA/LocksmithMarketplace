-- ============================================
-- TABLE: PROMOTIONAL_BANNERS
-- Stores promotional banners for the marketplace section
-- These banners appear in the PromotionalBlock on the marketplace page
-- ============================================

CREATE TABLE IF NOT EXISTS promotional_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  link TEXT NOT NULL DEFAULT '',
  pc_image_url TEXT NOT NULL,
  mobile_image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_promotional_banners_order ON promotional_banners(display_order);
CREATE INDEX IF NOT EXISTS idx_promotional_banners_active ON promotional_banners(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE promotional_banners ENABLE ROW LEVEL SECURITY;

-- Public read access for active banners
CREATE POLICY "Public can view active promotional banners" ON promotional_banners
  FOR SELECT
  USING (is_active = true);

-- Admin-only write access (will be enforced via backend JWT check)
CREATE POLICY "Admins can manage promotional banners" ON promotional_banners
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_promotional_banners_updated_at
  BEFORE UPDATE ON promotional_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
