-- ============================================
-- PLATFORM POLICIES TABLE ONLY
-- ============================================
-- Simplified migration that only creates platform_policies
-- Use this if notifications table already exists

-- Create the platform_policies table
CREATE TABLE IF NOT EXISTS platform_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terms_content TEXT,
  privacy_content TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE platform_policies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read policies" ON platform_policies;
DROP POLICY IF EXISTS "Only admins can insert policies" ON platform_policies;
DROP POLICY IF EXISTS "Only admins can update policies" ON platform_policies;
DROP POLICY IF EXISTS "Only admins can delete policies" ON platform_policies;

-- Policy: Anyone can read policies (public access)
CREATE POLICY "Anyone can read policies"
  ON platform_policies
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert policies
CREATE POLICY "Only admins can insert policies"
  ON platform_policies
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR auth.users.raw_user_meta_data->>'is_admin' = 'true'
      )
    )
  );

-- Policy: Only admins can update policies
CREATE POLICY "Only admins can update policies"
  ON platform_policies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR auth.users.raw_user_meta_data->>'is_admin' = 'true'
      )
    )
  );

-- Policy: Only admins can delete policies
CREATE POLICY "Only admins can delete policies"
  ON platform_policies
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR auth.users.raw_user_meta_data->>'is_admin' = 'true'
      )
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_platform_policies_updated_at 
  ON platform_policies(updated_at DESC);

-- ============================================
-- INITIAL DATA
-- ============================================
-- Insert default policy content (only if table is empty)

INSERT INTO platform_policies (terms_content, privacy_content)
SELECT 
  E'# Terms & Conditions\n\nWelcome to Locksmith Marketplace!\n\n## 1. Acceptance of Terms\nBy accessing and using the Locksmith Marketplace platform, you accept and agree to be bound by the terms and provision of this agreement.\n\n## 2. User Accounts\n- You must register for an account to use certain features\n- You are responsible for maintaining the confidentiality of your account\n- You must provide accurate and complete information\n\n## 3. Marketplace Rules\n- All listings must be accurate and honest\n- No fraudulent or misleading content\n- Respect other users and retailers\n\n## 4. Retailer Guidelines\n- Retailers must provide valid business information\n- All deals must be legitimate offers\n- Retailers are responsible for honoring posted deals\n\n## 5. Prohibited Activities\n- Posting false or misleading information\n- Attempting to circumvent security measures\n- Harassment or abuse of other users\n\n## 6. Limitation of Liability\nLocksmith Marketplace is provided "as is" without warranties of any kind.\n\n## 7. Changes to Terms\nWe reserve the right to modify these terms at any time. Users will be notified of significant changes.\n\nLast updated: ' || NOW()::DATE,
  
  E'# Privacy Policy\n\nYour privacy is important to us.\n\n## Information We Collect\n\n### Account Information\n- Name and email address\n- Profile information\n- Authentication data\n\n### Usage Information\n- Search queries\n- Browsing history on our platform\n- Deal interactions\n\n### Location Information\n- General location for finding nearby deals\n- Not precise GPS coordinates\n\n## How We Use Your Information\n\n- To provide and improve our services\n- To communicate with you about deals and updates\n- To personalize your experience\n- To ensure platform security\n\n## Information Sharing\n\nWe do not sell your personal information. We may share data with:\n- Retailers (only when you interact with their deals)\n- Service providers who assist our operations\n- Law enforcement when required by law\n\n## Your Rights\n\n- Access your personal data\n- Request data deletion\n- Opt out of marketing communications\n- Update your information at any time\n\n## Data Security\n\nWe implement appropriate security measures to protect your information.\n\n## Cookie Policy\n\nWe use cookies to improve your experience and analyze usage.\n\n## Contact Us\n\nFor privacy concerns, contact our support team.\n\nLast updated: ' || NOW()::DATE
WHERE NOT EXISTS (SELECT 1 FROM platform_policies LIMIT 1);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Platform policies table created successfully!';
  RAISE NOTICE 'You can now manage Terms & Conditions and Privacy Policy from the Admin Panel → Policy tab';
END $$;
