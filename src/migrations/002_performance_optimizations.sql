-- ============================================
-- Locksmith Marketplace - Performance Optimizations
-- Migration 002: Additional Indexes and Optimizations
-- ============================================

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

-- Marketplace listings: Search with filters
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status_category_price 
    ON marketplace_listings(status, category, price) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status_created 
    ON marketplace_listings(status, created_at DESC) WHERE status = 'active';

-- Messages: Unread messages per conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_unread 
    ON messages(conversation_id, is_read, created_at DESC) WHERE is_read = FALSE;

-- Conversations: Active conversations with recent messages
CREATE INDEX IF NOT EXISTS idx_conversations_user_last_message 
    ON conversations(buyer_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_seller_last_message 
    ON conversations(seller_id, last_message_at DESC);

-- User reviews: Average rating calculation
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewee_rating 
    ON user_reviews(reviewee_id, rating);

-- Notifications: Unread notifications per user
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_created 
    ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;

-- Search history: Recent searches per user
CREATE INDEX IF NOT EXISTS idx_search_history_user_recent 
    ON search_history(user_id, created_at DESC) 
    WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================
-- PARTIAL INDEXES FOR ACTIVE DATA
-- ============================================

-- Only index active/recent data for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_recent_active 
    ON marketplace_listings(created_at DESC) 
    WHERE status = 'active' AND created_at > NOW() - INTERVAL '90 days';

CREATE INDEX IF NOT EXISTS idx_conversations_recent_active 
    ON conversations(last_message_at DESC) 
    WHERE last_message_at > NOW() - INTERVAL '30 days';

CREATE INDEX IF NOT EXISTS idx_feed_posts_recent 
    ON feed_posts(created_at DESC) 
    WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================
-- COVERING INDEXES FOR COMMON SELECTIONS
-- ============================================

-- Marketplace listings list view (avoid table lookups)
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_list_view 
    ON marketplace_listings(status, created_at DESC) 
    INCLUDE (id, title, price, images, location, seller_id, views) 
    WHERE status = 'active';

-- User profiles basic info (for joins)
CREATE INDEX IF NOT EXISTS idx_user_profiles_basic 
    ON user_profiles(id) 
    INCLUDE (first_name, last_name, avatar_url, rating);

-- ============================================
-- MATERIALIZED VIEW FOR EXPENSIVE QUERIES
-- ============================================

-- User statistics (update periodically, not on every query)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_statistics AS
SELECT 
    up.id,
    up.email,
    up.first_name,
    up.last_name,
    up.avatar_url,
    up.rating,
    up.total_reviews,
    COUNT(DISTINCT ml.id) as total_listings,
    COUNT(DISTINCT CASE WHEN ml.status = 'active' THEN ml.id END) as active_listings,
    COUNT(DISTINCT CASE WHEN ml.status = 'sold' THEN ml.id END) as sold_listings,
    COALESCE(AVG(ml.price), 0) as avg_listing_price,
    COUNT(DISTINCT si.id) as total_saves,
    COUNT(DISTINCT fp.id) as total_posts
FROM user_profiles up
LEFT JOIN marketplace_listings ml ON ml.seller_id = up.id
LEFT JOIN saved_items si ON si.user_id = up.id
LEFT JOIN feed_posts fp ON fp.user_id = up.id
GROUP BY up.id, up.email, up.first_name, up.last_name, up.avatar_url, up.rating, up.total_reviews;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_statistics_id ON user_statistics(id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_listings ON user_statistics(total_listings DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_rating ON user_statistics(rating DESC);

-- Function to refresh user statistics
CREATE OR REPLACE FUNCTION refresh_user_statistics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS TO UPDATE COUNTERS
-- ============================================

-- Update feed post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE feed_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE feed_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update feed post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE feed_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE feed_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Update user review statistics
CREATE OR REPLACE FUNCTION update_user_review_stats()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating NUMERIC;
    review_count INTEGER;
BEGIN
    IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
        -- Calculate new stats
        SELECT 
            COALESCE(AVG(rating), 0),
            COUNT(*)
        INTO avg_rating, review_count
        FROM user_reviews
        WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id);
        
        -- Update user profile
        UPDATE user_profiles
        SET 
            rating = avg_rating,
            total_reviews = review_count
        WHERE id = COALESCE(NEW.reviewee_id, OLD.reviewee_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON user_reviews
    FOR EACH ROW EXECUTE FUNCTION update_user_review_stats();

-- ============================================
-- DATABASE CONFIGURATION FOR PERFORMANCE
-- ============================================

-- Enable parallel query execution for large tables
ALTER TABLE marketplace_listings SET (parallel_workers = 4);
ALTER TABLE messages SET (parallel_workers = 4);
ALTER TABLE vehicles SET (parallel_workers = 4);

-- Set statistics target for better query planning
ALTER TABLE marketplace_listings ALTER COLUMN category SET STATISTICS 1000;
ALTER TABLE marketplace_listings ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE vehicles ALTER COLUMN make SET STATISTICS 1000;
ALTER TABLE vehicles ALTER COLUMN model SET STATISTICS 1000;
ALTER TABLE vehicles ALTER COLUMN year SET STATISTICS 1000;

-- ============================================
-- PARTITIONING FOR LARGE TABLES (Optional)
-- Uncomment if you expect very large data volumes
-- ============================================

-- Example: Partition messages by month for better performance
-- This would require converting the table to a partitioned table
-- Only implement if you expect millions of messages

/*
-- Create partitioned messages table
CREATE TABLE messages_partitioned (
    LIKE messages INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create partitions for each month
CREATE TABLE messages_2025_01 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE messages_2025_02 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- ... create more partitions as needed
*/

-- ============================================
-- FUNCTION: Get unread message count efficiently
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT m.id)
    INTO unread_count
    FROM messages m
    INNER JOIN conversations c ON c.id = m.conversation_id
    WHERE m.is_read = FALSE
      AND m.sender_id != user_uuid
      AND (c.buyer_id = user_uuid OR c.seller_id = user_uuid);
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Index to support the function
CREATE INDEX IF NOT EXISTS idx_messages_unread_count 
    ON messages(sender_id, is_read) 
    WHERE is_read = FALSE;

-- ============================================
-- FUNCTION: Get user conversation list efficiently
-- ============================================

CREATE OR REPLACE FUNCTION get_user_conversations(user_uuid UUID, page_limit INTEGER DEFAULT 20, page_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    other_user_avatar TEXT,
    listing_id UUID,
    listing_title TEXT,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        CASE WHEN c.buyer_id = user_uuid THEN c.seller_id ELSE c.buyer_id END as other_user_id,
        CASE WHEN c.buyer_id = user_uuid THEN up.first_name || ' ' || up.last_name ELSE up2.first_name || ' ' || up2.last_name END as other_user_name,
        CASE WHEN c.buyer_id = user_uuid THEN up.avatar_url ELSE up2.avatar_url END as other_user_avatar,
        c.listing_id,
        ml.title as listing_title,
        m.content as last_message,
        c.last_message_at,
        (SELECT COUNT(*)::INTEGER FROM messages WHERE conversation_id = c.id AND is_read = FALSE AND sender_id != user_uuid) as unread_count
    FROM conversations c
    LEFT JOIN user_profiles up ON up.id = c.seller_id
    LEFT JOIN user_profiles up2 ON up2.id = c.buyer_id
    LEFT JOIN marketplace_listings ml ON ml.id = c.listing_id
    LEFT JOIN LATERAL (
        SELECT content FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) m ON TRUE
    WHERE c.buyer_id = user_uuid OR c.seller_id = user_uuid
    ORDER BY c.last_message_at DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FUNCTION: Search marketplace listings efficiently
-- ============================================

CREATE OR REPLACE FUNCTION search_marketplace_listings(
    search_query TEXT DEFAULT NULL,
    filter_category TEXT DEFAULT NULL,
    filter_min_price NUMERIC DEFAULT NULL,
    filter_max_price NUMERIC DEFAULT NULL,
    filter_condition TEXT DEFAULT NULL,
    sort_by TEXT DEFAULT 'created_at',
    sort_direction TEXT DEFAULT 'DESC',
    page_limit INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    seller_id UUID,
    seller_name TEXT,
    seller_avatar TEXT,
    seller_rating NUMERIC,
    title TEXT,
    description TEXT,
    price NUMERIC,
    category TEXT,
    condition TEXT,
    images TEXT[],
    location TEXT,
    views INTEGER,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ml.id,
        ml.seller_id,
        up.first_name || ' ' || up.last_name as seller_name,
        up.avatar_url as seller_avatar,
        up.rating as seller_rating,
        ml.title,
        ml.description,
        ml.price,
        ml.category,
        ml.condition,
        ml.images,
        ml.location,
        ml.views,
        ml.is_featured,
        ml.created_at
    FROM marketplace_listings ml
    INNER JOIN user_profiles up ON up.id = ml.seller_id
    WHERE ml.status = 'active'
        AND (search_query IS NULL OR to_tsvector('english', ml.title || ' ' || COALESCE(ml.description, '')) @@ plainto_tsquery('english', search_query))
        AND (filter_category IS NULL OR ml.category = filter_category)
        AND (filter_min_price IS NULL OR ml.price >= filter_min_price)
        AND (filter_max_price IS NULL OR ml.price <= filter_max_price)
        AND (filter_condition IS NULL OR ml.condition = filter_condition)
    ORDER BY 
        CASE WHEN sort_by = 'price' AND sort_direction = 'ASC' THEN ml.price END ASC,
        CASE WHEN sort_by = 'price' AND sort_direction = 'DESC' THEN ml.price END DESC,
        CASE WHEN sort_by = 'created_at' AND sort_direction = 'DESC' THEN ml.created_at END DESC,
        CASE WHEN sort_by = 'created_at' AND sort_direction = 'ASC' THEN ml.created_at END ASC,
        CASE WHEN sort_by = 'views' AND sort_direction = 'DESC' THEN ml.views END DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- VACUUM AND ANALYZE
-- ============================================
VACUUM ANALYZE;
