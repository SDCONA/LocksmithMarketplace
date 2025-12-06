-- Reports Table Schema for Locksmith Marketplace
-- This table stores user reports for listings, users, messages, reviews, etc.

CREATE TABLE IF NOT EXISTS reports_a7e285ba (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('listing', 'user', 'message', 'review', 'deal')),
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports_a7e285ba(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_content_type ON reports_a7e285ba(content_type);
CREATE INDEX IF NOT EXISTS idx_reports_content_id ON reports_a7e285ba(content_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports_a7e285ba(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports_a7e285ba(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reports_updated_at
  BEFORE UPDATE ON reports_a7e285ba
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- Row Level Security Policies
ALTER TABLE reports_a7e285ba ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON reports_a7e285ba
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON reports_a7e285ba
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports (using user_metadata)
CREATE POLICY "Admins can view all reports"
  ON reports_a7e285ba
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON reports_a7e285ba
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Admins can delete reports
CREATE POLICY "Admins can delete reports"
  ON reports_a7e285ba
  FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Comments
COMMENT ON TABLE reports_a7e285ba IS 'Stores user reports for content moderation';
COMMENT ON COLUMN reports_a7e285ba.content_type IS 'Type of content being reported (listing, user, message, review, deal)';
COMMENT ON COLUMN reports_a7e285ba.content_id IS 'ID of the content being reported (can be any type, stored as text)';
COMMENT ON COLUMN reports_a7e285ba.reason IS 'Primary reason for the report (spam, inappropriate, fraud, etc.)';
COMMENT ON COLUMN reports_a7e285ba.status IS 'Current status: pending, reviewing, resolved, dismissed';
COMMENT ON COLUMN reports_a7e285ba.reviewed_by IS 'Admin user who reviewed the report';
COMMENT ON COLUMN reports_a7e285ba.resolution_notes IS 'Admin notes about how the report was resolved';
