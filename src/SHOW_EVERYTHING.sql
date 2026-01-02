-- ========================================
-- SHOW EVERYTHING: ALL TABLES, COLUMNS, RLS
-- ========================================

-- Run each query separately and send me ALL results

-- ========================================
-- QUERY 1: ALL TABLES AND ALL COLUMNS
-- ========================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;


-- ========================================
-- QUERY 2: ALL RLS POLICIES FOR ALL TABLES
-- ========================================
SELECT 
  tablename as table_name,
  policyname as policy_name,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- ========================================
-- QUERY 3: WHICH TABLES HAVE RLS ENABLED
-- ========================================
SELECT 
  c.relname as table_name,
  CASE WHEN c.relrowsecurity THEN 'YES' ELSE 'NO' END as rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;
