-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS public.create_default_user_preferences() CASCADE;

CREATE OR REPLACE FUNCTION public.create_default_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS policies
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the trigger (since we dropped CASCADE)
DROP TRIGGER IF EXISTS create_user_preferences_on_signup ON auth.users;

CREATE TRIGGER create_user_preferences_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_user_preferences();

-- Verify the fix
SELECT 
    proname as function_name,
    prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'create_default_user_preferences';
