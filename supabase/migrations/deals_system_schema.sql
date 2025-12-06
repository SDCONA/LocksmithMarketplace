-- ========================================
-- DEALS SYSTEM - COMPLETE SQL SCHEMA
-- Phase 1: Database Foundation
-- ========================================

-- ========================================
-- 1. RETAILER PROFILES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS retailer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Company Information
    company_name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    
    -- Ownership & Permissions
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    daily_deal_limit INTEGER DEFAULT 10 NOT NULL,
    has_csv_permission BOOLEAN DEFAULT FALSE,
    is_always_on_top BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT valid_daily_limit CHECK (daily_deal_limit >= 0)
);

-- ========================================
-- 2. DEAL TYPES TABLE (Labels)
-- ========================================
CREATE TABLE IF NOT EXISTS deal_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3B82F6', -- Tailwind blue-500
    display_order INTEGER DEFAULT 0
);

-- Insert default deal types
INSERT INTO deal_types (name, color, display_order) VALUES
    ('Flash Sale', '#EF4444', 1),      -- red-500
    ('Daily Deal', '#F59E0B', 2),      -- amber-500
    ('Bundle', '#8B5CF6', 3),          -- violet-500
    ('Clearance', '#10B981', 4),       -- emerald-500
    ('Seasonal', '#EC4899', 5),        -- pink-500
    ('Limited Time', '#F97316', 6),    -- orange-500
    ('Hot Deal', '#DC2626', 7)         -- red-600
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 3. DEALS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relationships
    retailer_profile_id UUID NOT NULL REFERENCES retailer_profiles(id) ON DELETE CASCADE,
    deal_type_id UUID REFERENCES deal_types(id) ON DELETE SET NULL,
    
    -- Product Information
    title TEXT NOT NULL,
    description TEXT CHECK (char_length(description) <= 500),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2), -- For showing discount
    external_url TEXT NOT NULL, -- Link to product on retailer's site
    
    -- Timing
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'paused')),
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    
    CONSTRAINT valid_prices CHECK (price >= 0 AND (original_price IS NULL OR original_price >= price))
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_deals_retailer ON deals(retailer_profile_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_expires_at ON deals(expires_at);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);

-- ========================================
-- 4. DEAL IMAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS deal_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL, -- Path in Supabase Storage
    display_order INTEGER DEFAULT 0,
    
    CONSTRAINT unique_deal_image_order UNIQUE (deal_id, display_order)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_deal_images_deal ON deal_images(deal_id, display_order);

-- ========================================
-- 5. SAVED DEALS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS saved_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    
    CONSTRAINT unique_user_saved_deal UNIQUE (user_id, deal_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_saved_deals_user ON saved_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_deals_deal ON saved_deals(deal_id);

-- ========================================
-- 6. HELPER FUNCTIONS
-- ========================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = user_id AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check daily deal limit
CREATE OR REPLACE FUNCTION check_daily_deal_limit(profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deal_limit INTEGER;
    deals_today INTEGER;
BEGIN
    -- Get the daily limit for this profile
    SELECT daily_deal_limit INTO deal_limit
    FROM retailer_profiles
    WHERE id = profile_id;
    
    -- Count deals created today
    SELECT COUNT(*) INTO deals_today
    FROM deals
    WHERE retailer_profile_id = profile_id
      AND created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day';
    
    -- Return true if under limit (0 = unlimited)
    RETURN deal_limit = 0 OR deals_today < deal_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get deals created today count
CREATE OR REPLACE FUNCTION get_deals_today_count(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    deals_today INTEGER;
BEGIN
    SELECT COUNT(*) INTO deals_today
    FROM deals
    WHERE retailer_profile_id = profile_id
      AND created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day';
    
    RETURN deals_today;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. TRIGGERS
-- ========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_retailer_profiles_updated_at
    BEFORE UPDATE ON retailer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-archive expired deals (runs on SELECT or UPDATE)
CREATE OR REPLACE FUNCTION auto_archive_expired_deals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE deals
    SET status = 'archived',
        archived_at = NOW()
    WHERE status = 'active'
      AND expires_at < NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger will run on any read operation
-- For better performance, you should run this as a scheduled job
-- But for now, we'll update it in the backend when fetching deals

-- Increment save_count when deal is saved
CREATE OR REPLACE FUNCTION increment_deal_save_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE deals
    SET save_count = save_count + 1
    WHERE id = NEW.deal_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_save_count_trigger
    AFTER INSERT ON saved_deals
    FOR EACH ROW
    EXECUTE FUNCTION increment_deal_save_count();

-- Decrement save_count when deal is unsaved
CREATE OR REPLACE FUNCTION decrement_deal_save_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE deals
    SET save_count = save_count - 1
    WHERE id = OLD.deal_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_save_count_trigger
    AFTER DELETE ON saved_deals
    FOR EACH ROW
    EXECUTE FUNCTION decrement_deal_save_count();

-- ========================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE retailer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_deals ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RETAILER PROFILES RLS POLICIES
-- ========================================

-- Admin: Full access
CREATE POLICY "Admin can do everything with retailer profiles"
    ON retailer_profiles
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Retailer User: Can view and update only their profile
CREATE POLICY "Retailer users can view their own profile"
    ON retailer_profiles
    FOR SELECT
    USING (owner_user_id = auth.uid());

CREATE POLICY "Retailer users can update their own profile"
    ON retailer_profiles
    FOR UPDATE
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());

-- Public: Can view active retailer profiles
CREATE POLICY "Public can view active retailer profiles"
    ON retailer_profiles
    FOR SELECT
    USING (is_active = TRUE);

-- ========================================
-- DEAL TYPES RLS POLICIES
-- ========================================

-- Everyone can read deal types
CREATE POLICY "Anyone can view deal types"
    ON deal_types
    FOR SELECT
    USING (TRUE);

-- Only admin can modify deal types
CREATE POLICY "Admin can manage deal types"
    ON deal_types
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ========================================
-- DEALS RLS POLICIES
-- ========================================

-- Admin: Full access to all deals
CREATE POLICY "Admin can do everything with deals"
    ON deals
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Retailer User: Can manage only their deals
CREATE POLICY "Retailer users can view their own deals"
    ON deals
    FOR SELECT
    USING (
        retailer_profile_id IN (
            SELECT id FROM retailer_profiles WHERE owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Retailer users can create their own deals"
    ON deals
    FOR INSERT
    WITH CHECK (
        retailer_profile_id IN (
            SELECT id FROM retailer_profiles WHERE owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Retailer users can update their own deals"
    ON deals
    FOR UPDATE
    USING (
        retailer_profile_id IN (
            SELECT id FROM retailer_profiles WHERE owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        retailer_profile_id IN (
            SELECT id FROM retailer_profiles WHERE owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Retailer users can delete their own deals"
    ON deals
    FOR DELETE
    USING (
        retailer_profile_id IN (
            SELECT id FROM retailer_profiles WHERE owner_user_id = auth.uid()
        )
    );

-- Public: Can view active deals from active retailers
CREATE POLICY "Public can view active deals"
    ON deals
    FOR SELECT
    USING (
        status = 'active'
        AND retailer_profile_id IN (
            SELECT id FROM retailer_profiles WHERE is_active = TRUE
        )
    );

-- ========================================
-- DEAL IMAGES RLS POLICIES
-- ========================================

-- Admin: Full access
CREATE POLICY "Admin can manage all deal images"
    ON deal_images
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Retailer User: Can manage images for their deals
CREATE POLICY "Retailer users can manage their deal images"
    ON deal_images
    FOR ALL
    USING (
        deal_id IN (
            SELECT d.id FROM deals d
            INNER JOIN retailer_profiles rp ON d.retailer_profile_id = rp.id
            WHERE rp.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        deal_id IN (
            SELECT d.id FROM deals d
            INNER JOIN retailer_profiles rp ON d.retailer_profile_id = rp.id
            WHERE rp.owner_user_id = auth.uid()
        )
    );

-- Public: Can view images for active deals
CREATE POLICY "Public can view deal images"
    ON deal_images
    FOR SELECT
    USING (
        deal_id IN (
            SELECT id FROM deals WHERE status = 'active'
        )
    );

-- ========================================
-- SAVED DEALS RLS POLICIES
-- ========================================

-- Users can manage their own saved deals
CREATE POLICY "Users can view their own saved deals"
    ON saved_deals
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can save deals"
    ON saved_deals
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unsave deals"
    ON saved_deals
    FOR DELETE
    USING (user_id = auth.uid());

-- Admin can view all saved deals (for analytics)
CREATE POLICY "Admin can view all saved deals"
    ON saved_deals
    FOR SELECT
    USING (is_admin(auth.uid()));

-- ========================================
-- 9. CREATE STORAGE BUCKET
-- ========================================

-- Note: Run this via Supabase Storage API or Dashboard
-- Bucket name: make-a7e285ba-deals
-- This will be created by the backend on first run

-- ========================================
-- SCHEMA COMPLETE ✓
-- ========================================

-- To verify installation, run:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%deal%' OR table_name LIKE '%retailer%';
