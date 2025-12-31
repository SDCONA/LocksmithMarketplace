-- ========================================
-- DEAL ANALYTICS TRACKING SYSTEM
-- Track views and redirect clicks per deal
-- ========================================

-- ========================================
-- 1. ANALYTICS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS deal_analytics_a7e285ba (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relationships
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    retailer_profile_id UUID NOT NULL REFERENCES retailer_profiles(id) ON DELETE CASCADE,
    
    -- Event type: 'view' or 'redirect'
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'redirect')),
    
    -- Optional: user tracking (null for anonymous)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_deal ON deal_analytics_a7e285ba(deal_id);
CREATE INDEX IF NOT EXISTS idx_analytics_retailer ON deal_analytics_a7e285ba(retailer_profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON deal_analytics_a7e285ba(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON deal_analytics_a7e285ba(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_retailer_created ON deal_analytics_a7e285ba(retailer_profile_id, created_at DESC);

-- ========================================
-- 2. RLS POLICIES
-- ========================================
ALTER TABLE deal_analytics_a7e285ba ENABLE ROW LEVEL SECURITY;

-- Admin can view all analytics
CREATE POLICY "Admin can view all analytics"
    ON deal_analytics_a7e285ba
    FOR SELECT
    USING (is_admin(auth.uid()));

-- Service role can insert analytics (from backend)
CREATE POLICY "Service role can insert analytics"
    ON deal_analytics_a7e285ba
    FOR INSERT
    WITH CHECK (true);

-- Retailer users can view their own analytics
CREATE POLICY "Retailer users can view their own analytics"
    ON deal_analytics_a7e285ba
    FOR SELECT
    USING (
        retailer_profile_id IN (
            SELECT id FROM retailer_profiles WHERE owner_user_id = auth.uid()
        )
    );

-- ========================================
-- INSTALLATION COMPLETE ✓
-- ========================================

-- To verify installation:
-- SELECT COUNT(*) FROM deal_analytics_a7e285ba;
