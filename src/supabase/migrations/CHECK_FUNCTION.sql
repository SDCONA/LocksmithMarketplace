-- Check the current function definition
SELECT 
    proname as function_name,
    prosecdef as is_security_definer,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'create_default_user_preferences';
