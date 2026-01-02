-- Show triggers on auth.users table
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS is_enabled,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users'
  AND NOT t.tgisinternal;
