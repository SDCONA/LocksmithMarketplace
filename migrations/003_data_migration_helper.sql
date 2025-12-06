-- ============================================
-- Locksmith Marketplace - Data Migration Helper
-- Migration 003: Helper Functions and Views
-- ============================================

-- This file contains helper functions to migrate data from
-- the KV store to proper SQL tables. Run these after the schema
-- migrations are complete.

-- ============================================
-- MIGRATION TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS migration_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    migration_name TEXT NOT NULL,
    records_migrated INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, running, completed, failed
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================
-- HELPER: Batch Insert Function
-- ============================================

-- This function helps with bulk inserts while handling conflicts
CREATE OR REPLACE FUNCTION batch_upsert_vehicles(vehicle_data JSONB)
RETURNS INTEGER AS $$
DECLARE
    inserted_count INTEGER := 0;
    vehicle_record JSONB;
BEGIN
    FOR vehicle_record IN SELECT * FROM jsonb_array_elements(vehicle_data)
    LOOP
        INSERT INTO vehicles (
            year, make, model, trim, body_type,
            key_type, key_code, transponder_type,
            fob_type, remote_type, notes, metadata
        ) VALUES (
            (vehicle_record->>'year')::INTEGER,
            vehicle_record->>'make',
            vehicle_record->>'model',
            vehicle_record->>'trim',
            vehicle_record->>'body_type',
            vehicle_record->>'key_type',
            vehicle_record->>'key_code',
            vehicle_record->>'transponder_type',
            vehicle_record->>'fob_type',
            vehicle_record->>'remote_type',
            vehicle_record->>'notes',
            vehicle_record->'metadata'
        )
        ON CONFLICT DO NOTHING;
        
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CLEANUP: Remove Old Data
-- ============================================

-- Function to clean up old search history (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_search_history()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM search_history
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old messages (move to archive table)
CREATE OR REPLACE FUNCTION archive_old_messages()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Archive messages older than 1 year from inactive conversations
    -- This is a placeholder - implement based on your archival strategy
    
    -- Example: Delete messages from conversations with no activity in 1 year
    DELETE FROM messages
    WHERE conversation_id IN (
        SELECT id FROM conversations
        WHERE last_message_at < NOW() - INTERVAL '1 year'
    );
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MAINTENANCE: Regular Maintenance Tasks
-- ============================================

-- Function to run regular maintenance
CREATE OR REPLACE FUNCTION run_maintenance()
RETURNS TABLE (task TEXT, result TEXT) AS $$
BEGIN
    -- Update user statistics
    RETURN QUERY SELECT 'refresh_user_statistics'::TEXT, 'Starting'::TEXT;
    PERFORM refresh_user_statistics();
    RETURN QUERY SELECT 'refresh_user_statistics'::TEXT, 'Completed'::TEXT;
    
    -- Vacuum analyze
    RETURN QUERY SELECT 'vacuum_analyze'::TEXT, 'Starting'::TEXT;
    VACUUM ANALYZE;
    RETURN QUERY SELECT 'vacuum_analyze'::TEXT, 'Completed'::TEXT;
    
    -- Cleanup old search history
    RETURN QUERY SELECT 'cleanup_search_history'::TEXT, 
        cleanup_old_search_history()::TEXT || ' records deleted';
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SCHEDULED JOB SUGGESTIONS
-- ============================================

-- These are SQL commands you can run in Supabase to set up scheduled jobs
-- using pg_cron extension (if available)

-- Example 1: Refresh user statistics every hour
-- SELECT cron.schedule('refresh-user-stats', '0 * * * *', 'SELECT refresh_user_statistics()');

-- Example 2: Cleanup old search history daily at 2 AM
-- SELECT cron.schedule('cleanup-search-history', '0 2 * * *', 'SELECT cleanup_old_search_history()');

-- Example 3: Run maintenance weekly on Sundays at 3 AM
-- SELECT cron.schedule('weekly-maintenance', '0 3 * * 0', 'SELECT run_maintenance()');

-- ============================================
-- MONITORING VIEWS
-- ============================================

-- View: Database statistics
CREATE OR REPLACE VIEW database_statistics AS
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count,
    pg_size_pretty(pg_total_relation_size('user_profiles')) as total_size
FROM user_profiles
UNION ALL
SELECT 
    'marketplace_listings',
    COUNT(*),
    pg_size_pretty(pg_total_relation_size('marketplace_listings'))
FROM marketplace_listings
UNION ALL
SELECT 
    'messages',
    COUNT(*),
    pg_size_pretty(pg_total_relation_size('messages'))
FROM messages
UNION ALL
SELECT 
    'conversations',
    COUNT(*),
    pg_size_pretty(pg_total_relation_size('conversations'))
FROM conversations
UNION ALL
SELECT 
    'vehicles',
    COUNT(*),
    pg_size_pretty(pg_total_relation_size('vehicles'))
FROM vehicles
UNION ALL
SELECT 
    'feed_posts',
    COUNT(*),
    pg_size_pretty(pg_total_relation_size('feed_posts'))
FROM feed_posts
UNION ALL
SELECT 
    'saved_items',
    COUNT(*),
    pg_size_pretty(pg_total_relation_size('saved_items'))
FROM saved_items
UNION ALL
SELECT 
    'search_history',
    COUNT(*),
    pg_size_pretty(pg_total_relation_size('search_history'))
FROM search_history;

-- View: Active users statistics
CREATE OR REPLACE VIEW active_users_statistics AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE last_active > NOW() - INTERVAL '24 hours') as active_last_24h,
    COUNT(*) FILTER (WHERE last_active > NOW() - INTERVAL '7 days') as active_last_week,
    COUNT(*) FILTER (WHERE last_active > NOW() - INTERVAL '30 days') as active_last_month,
    COUNT(*) FILTER (WHERE joined_date > NOW() - INTERVAL '30 days') as new_last_month
FROM user_profiles;

-- View: Marketplace statistics
CREATE OR REPLACE VIEW marketplace_statistics AS
SELECT 
    COUNT(*) as total_listings,
    COUNT(*) FILTER (WHERE status = 'active') as active_listings,
    COUNT(*) FILTER (WHERE status = 'sold') as sold_listings,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_listings,
    AVG(price) as average_price,
    AVG(views) as average_views,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as new_last_24h,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_last_week
FROM marketplace_listings;

-- View: Messaging statistics
CREATE OR REPLACE VIEW messaging_statistics AS
SELECT 
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(DISTINCT CASE WHEN c.last_message_at > NOW() - INTERVAL '24 hours' THEN c.id END) as active_last_24h,
    COUNT(DISTINCT m.id) as total_messages,
    COUNT(DISTINCT CASE WHEN m.created_at > NOW() - INTERVAL '24 hours' THEN m.id END) as messages_last_24h,
    COUNT(DISTINCT CASE WHEN m.is_read = false THEN m.id END) as unread_messages
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id;

-- ============================================
-- PERFORMANCE MONITORING
-- ============================================

-- View: Slow queries (if pg_stat_statements extension is enabled)
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- queries taking more than 100ms on average
ORDER BY mean_exec_time DESC
LIMIT 20;

-- View: Table bloat estimation
CREATE OR REPLACE VIEW table_bloat_check AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_live_tup,
    n_dead_tup,
    CASE 
        WHEN n_live_tup > 0 
        THEN round(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
        ELSE 0 
    END AS dead_tuple_percent
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- View: Index usage statistics
CREATE OR REPLACE VIEW index_usage_statistics AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================
-- GRANTS (adjust based on your needs)
-- ============================================

-- Grant usage on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_message_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION search_marketplace_listings TO authenticated;

-- Grant select on monitoring views to authenticated users (optional)
-- GRANT SELECT ON database_statistics TO authenticated;
-- GRANT SELECT ON active_users_statistics TO authenticated;
-- GRANT SELECT ON marketplace_statistics TO authenticated;
-- GRANT SELECT ON messaging_statistics TO authenticated;
