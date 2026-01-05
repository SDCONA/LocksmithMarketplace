-- =====================================================
-- CREATE email_verification_tokens TABLE
-- =====================================================
-- This table was documented in DATABASE_MASTER_REFERENCE.md
-- but was never actually created in the database.
-- Run this SQL in your Supabase SQL Editor to fix the
-- "Token/code not found or already used" error.
-- =====================================================

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  token text NOT NULL,
  verification_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone,
  type text NOT NULL DEFAULT 'email_verification'
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token 
  ON email_verification_tokens(token);
  
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_code 
  ON email_verification_tokens(verification_code);
  
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id 
  ON email_verification_tokens(user_id);

-- Enable RLS
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role has full access
CREATE POLICY "email_verification_tokens_service_all"
  ON email_verification_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Users can view their own tokens
CREATE POLICY "email_verification_tokens_select_own"
  ON email_verification_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION INSTRUCTIONS:
-- =====================================================
-- After running this SQL, verify the table was created by running:
--
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'email_verification_tokens'
-- ORDER BY ordinal_position;
--
-- =====================================================
