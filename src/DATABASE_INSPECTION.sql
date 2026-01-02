-- ========================================
-- COMPLETE DATABASE INSPECTION
-- Shows all tables, columns, RLS policies
-- ========================================

-- ========================================
-- 1. ALL TABLES WITH COLUMN DETAILS
-- ========================================
SELECT 
  '=== TABLE: ' || table_name || ' ===' as info,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'kv_%'
ORDER BY table_name, ordinal_position;

-- ========================================
-- 2. ALL TABLES LIST (Summary)
-- ========================================
SELECT 
  '=== ALL TABLES (Summary) ===' as info,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'kv_%'
ORDER BY table_name;

-- ========================================
-- 3. ALL RLS POLICIES
-- ========================================
SELECT 
  '=== RLS POLICIES ===' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- 4. RLS STATUS FOR EACH TABLE
-- ========================================
SELECT 
  '=== RLS STATUS ===' as info,
  relname as table_name,
  CASE 
    WHEN relrowsecurity THEN 'ENABLED ✅'
    ELSE 'DISABLED ❌'
  END as rls_status,
  CASE 
    WHEN relforcerowsecurity THEN 'FORCED'
    ELSE 'NOT FORCED'
  END as rls_forced
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relname NOT LIKE 'kv_%'
ORDER BY relname;

-- ========================================
-- 5. ALL CUSTOM FUNCTIONS
-- ========================================
SELECT 
  '=== CUSTOM FUNCTIONS ===' as info,
  routine_name,
  routine_type,
  data_type as return_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_admin', 'check_daily_deal_limit', 'get_deals_today_count', 'update_updated_at_column')
ORDER BY routine_name;

-- ========================================
-- 6. ALL INDEXES
-- ========================================
SELECT 
  '=== INDEXES ===' as info,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'kv_%'
ORDER BY tablename, indexname;

-- ========================================
-- 7. FOREIGN KEY RELATIONSHIPS
-- ========================================
SELECT 
  '=== FOREIGN KEYS ===' as info,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ========================================
-- 8. ADMIN TABLE CHECK
-- ========================================
SELECT 
  '=== ADMIN TABLE (admins_a7e285ba) ===' as info,
  *
FROM admins_a7e285ba;

-- ========================================
-- 9. CHECK is_admin() FUNCTION
-- ========================================
SELECT 
  '=== is_admin() FUNCTION SOURCE ===' as info,
  pg_get_functiondef('is_admin(uuid)'::regprocedure) as function_definition;

-- ========================================
-- 10. TABLE ROW COUNTS
-- ========================================
SELECT 
  '=== TABLE ROW COUNTS ===' as info,
  schemaname,
  relname as table_name,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND relname NOT LIKE 'kv_%'
ORDER BY n_live_tup DESC;

-- ========================================
-- COMPLETE
-- ========================================
SELECT '✅ DATABASE INSPECTION COMPLETE' as result;
