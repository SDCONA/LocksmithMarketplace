-- Check if kv_store_a7e285ba table exists
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'kv_store_a7e285ba';

-- If table exists, check its structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'kv_store_a7e285ba'
ORDER BY ordinal_position;
