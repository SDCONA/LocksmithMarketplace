-- ============================================
-- Locksmith Marketplace - Complete Database Schema
-- Migration 001: Initial Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TABLE: user_profiles
-- Stores extended user profile information
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    website TEXT,
    avatar_url TEXT,
    address JSONB, -- {city, state, zipCode}
    phone_public BOOLEAN DEFAULT FALSE,
    email_public BOOLEAN DEFAULT FALSE,
    show_last_active BOOLEAN DEFAULT TRUE,
    auto_reply BOOLEAN DEFAULT FALSE,
    auto_reply_message TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    joined_date TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rating ON user_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_joined_date ON user_profiles(joined_date DESC);

-- Trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: marketplace_listings
-- Stores marketplace product listings
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL,
    condition TEXT NOT NULL,
    images TEXT[], -- Array of image URLs
    location TEXT,
    status TEXT DEFAULT 'active', -- active, sold, archived
    views INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    vehicle_compatibility JSONB, -- {year, make, model, key_type}
    shipping_available BOOLEAN DEFAULT FALSE,
    shipping_cost NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for marketplace_listings
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON marketplace_listings(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON marketplace_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured ON marketplace_listings(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_vehicle ON marketplace_listings USING GIN (vehicle_compatibility);

-- Full-text search index for listings
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_search ON marketplace_listings 
    USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Trigger for marketplace_listings updated_at
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: saved_items
-- Stores users' saved/favorited listings
-- ============================================
CREATE TABLE IF NOT EXISTS saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Indexes for saved_items
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_listing ON saved_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_created_at ON saved_items(created_at DESC);

-- ============================================
-- TABLE: conversations
-- Stores messaging conversations between users
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_id, seller_id, listing_id)
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Trigger for conversations updated_at
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: messages
-- Stores individual messages in conversations
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read) WHERE is_read = FALSE;

-- ============================================
-- TABLE: feed_posts
-- Stores community feed posts
-- ============================================
CREATE TABLE IF NOT EXISTS feed_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    images TEXT[], -- Array of image URLs
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for feed_posts
CREATE INDEX IF NOT EXISTS idx_feed_posts_user ON feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON feed_posts(created_at DESC);

-- Trigger for feed_posts updated_at
CREATE TRIGGER update_feed_posts_updated_at BEFORE UPDATE ON feed_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: post_likes
-- Stores likes on feed posts
-- ============================================
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Indexes for post_likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

-- ============================================
-- TABLE: post_comments
-- Stores comments on feed posts
-- ============================================
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for post_comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

-- Trigger for post_comments updated_at
CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: user_reviews
-- Stores reviews between users
-- ============================================
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, reviewee_id, listing_id)
);

-- Indexes for user_reviews
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer ON user_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewee ON user_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_listing ON user_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON user_reviews(created_at DESC);

-- Trigger for user_reviews updated_at
CREATE TRIGGER update_user_reviews_updated_at BEFORE UPDATE ON user_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: notifications
-- Stores user notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- message, like, comment, review, listing
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- TABLE: retailers
-- Stores retailer information (admin managed)
-- ============================================
CREATE TABLE IF NOT EXISTS retailers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for retailers
CREATE INDEX IF NOT EXISTS idx_retailers_active ON retailers(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_retailers_display_order ON retailers(display_order);

-- Trigger for retailers updated_at
CREATE TRIGGER update_retailers_updated_at BEFORE UPDATE ON retailers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: banners
-- Stores promotional banners (admin managed)
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for banners
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON banners(display_order);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date);

-- Trigger for banners updated_at
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: vehicles
-- Stores vehicle database (JobDataPro structure)
-- Years: 1950-2026 (77 years)
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER NOT NULL CHECK (year >= 1950 AND year <= 2026),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    trim TEXT,
    body_type TEXT,
    key_type TEXT,
    key_code TEXT,
    transponder_type TEXT,
    fob_type TEXT,
    remote_type TEXT,
    notes TEXT,
    metadata JSONB, -- Additional flexible data storage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_make ON vehicles(make);
CREATE INDEX IF NOT EXISTS idx_vehicles_model ON vehicles(model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year_make_model ON vehicles(year, make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_key_type ON vehicles(key_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_metadata ON vehicles USING GIN (metadata);

-- Full-text search index for vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_search ON vehicles 
    USING GIN (to_tsvector('english', 
        make || ' ' || model || ' ' || COALESCE(trim, '') || ' ' || 
        COALESCE(key_type, '') || ' ' || COALESCE(notes, '')
    ));

-- Trigger for vehicles updated_at
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: search_history
-- Stores user search history
-- ============================================
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB, -- {year, make, model, category, etc.}
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search_history
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_user_created ON search_history(user_id, created_at DESC);

-- ============================================
-- TABLE: reports
-- Stores user reports for listings/users/posts
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    reviewed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_listing ON reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_post ON reports(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Trigger for reports updated_at
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Marketplace Listings Policies
CREATE POLICY "Anyone can view active listings" ON marketplace_listings FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Users can create listings" ON marketplace_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON marketplace_listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own listings" ON marketplace_listings FOR DELETE USING (auth.uid() = seller_id);

-- Saved Items Policies
CREATE POLICY "Users can view own saved items" ON saved_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own saved items" ON saved_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved items" ON saved_items FOR DELETE USING (auth.uid() = user_id);

-- Conversations Policies
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT 
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT 
    WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages Policies
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = messages.conversation_id 
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    ));
CREATE POLICY "Users can create messages in own conversations" ON messages FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update messages they received" ON messages FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = messages.conversation_id 
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    ));

-- Feed Posts Policies
CREATE POLICY "Anyone can view feed posts" ON feed_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON feed_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON feed_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON feed_posts FOR DELETE USING (auth.uid() = user_id);

-- Post Likes Policies
CREATE POLICY "Anyone can view post likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post Comments Policies
CREATE POLICY "Anyone can view comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

-- User Reviews Policies
CREATE POLICY "Anyone can view reviews" ON user_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON user_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON user_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Retailers Policies (public read, admin write)
CREATE POLICY "Anyone can view active retailers" ON retailers FOR SELECT USING (is_active = true);

-- Banners Policies (public read, admin write)
CREATE POLICY "Anyone can view active banners" ON banners FOR SELECT USING (is_active = true);

-- Vehicles Policies (public read, admin write)
CREATE POLICY "Anyone can view vehicles" ON vehicles FOR SELECT USING (true);

-- Search History Policies
CREATE POLICY "Users can view own search history" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own search history" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own search history" ON search_history FOR DELETE USING (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ============================================
-- INITIAL DATA (if needed)
-- ============================================

-- You can add initial retailers, banners, or vehicle data here
-- Example:
-- INSERT INTO retailers (name, url, logo_url, display_order) VALUES
--   ('Key4.com', 'https://key4.com', 'https://key4.com/logo.png', 1);

-- ============================================
-- VACUUM AND ANALYZE
-- ============================================
VACUUM ANALYZE;
