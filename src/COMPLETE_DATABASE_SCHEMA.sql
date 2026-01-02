-- ========================================
-- COMPLETE DATABASE SCHEMA REPORT
-- All Tables, All Columns, All RLS Policies
-- ========================================

-- ========================================
-- PART 1: ALL TABLES AND THEIR COLUMNS
-- ========================================

SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ========================================
-- PART 2: ALL RLS POLICIES
-- ========================================

SELECT 
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
-- PART 3: RLS ENABLED STATUS
-- ========================================

SELECT 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;

-- ========================================
-- PART 4: CURRENT is_admin() FUNCTION
-- ========================================

SELECT pg_get_functiondef('is_admin'::regproc);
