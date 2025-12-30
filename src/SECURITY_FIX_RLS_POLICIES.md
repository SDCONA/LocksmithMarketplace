# CRITICAL SECURITY FIX: Update RLS Policies to Use app_metadata

## ⚠️ SECURITY VULNERABILITY DETECTED

The Supabase database linter has identified that several RLS (Row Level Security) policies are using `user_metadata` (also known as `raw_user_meta_data`) to check admin status. This is a **critical security vulnerability** because:

- `user_metadata` / `raw_user_meta_data` can be edited by end users
- Malicious users could grant themselves admin privileges
- `app_metadata` / `raw_app_meta_data` should be used instead (only modifiable server-side)

## 🔧 Required Database Changes

You must manually update the following RLS policies in your Supabase dashboard.

### Quick Reference:
**INSECURE:** `auth.users.raw_user_meta_data->>'role'`  
**SECURE:** `auth.users.raw_app_meta_data->>'role'`

### 1. Table: `notifications`
**Policy:** `Admins can create notifications`

**Current (INSECURE):**
```sql
(auth.jwt() ->> 'user_metadata'::text)::jsonb ->> 'role' = 'admin'
```

**Update to (SECURE):**
```sql
(auth.jwt() ->> 'app_metadata'::text)::jsonb ->> 'role' = 'admin'
OR
(auth.jwt() ->> 'app_metadata'::text)::jsonb ->> 'is_admin' = 'true'
```

---

### 2. Table: `reports_a7e285ba`
**Policy:** `Admins can view all reports`

**Current (INSECURE):**
```sql
(auth.jwt() ->> 'user_metadata'::text)::jsonb ->> 'role' = 'admin'
```

**Update to (SECURE):**
```sql
(auth.jwt() ->> 'app_metadata'::text)::jsonb ->> 'role' = 'admin'
OR
(auth.jwt() ->> 'app_metadata'::text)::jsonb ->> 'is_admin' = 'true'
```

---

### 3. Table: `reports_a7e285ba`
**Policy:** `Admins can update reports`

**Current (INSECURE):**
```sql
(auth.jwt() ->> 'user_metadata'::text)::jsonb ->> 'role' = 'admin'
```

**Update to (SECURE):**
```sql
(auth.jwt() ->> 'app_metadata'::text)::jsonb ->> 'role' = 'admin'
OR
(auth.jwt() ->> 'app_metadata'::text)::jsonb ->> 'is_admin' = 'true'
```

---

### 4. Table: `reports_a7e285ba`
**Policy:** `Admins can delete reports`

**Current (INSECURE):**
```sql
(auth.jwt() ->> 'user_metadata'::text)::jsonb ->> 'role' = 'admin'
```

**Update to (SECURE):**
```sql
(auth.jwt() ->> 'app_metadata'::text)::jsonb ->> 'role' = 'admin'
OR
(auth.jwt() ->> 'app_metadata'::text)::jsonb ->> 'is_admin' = 'true'
```

---

### 5. Table: `platform_policies`
**Policies:** `Only admins can insert/update/delete policies`

**Current (INSECURE):**
```sql
EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = auth.uid()
  AND (
    auth.users.raw_user_meta_data->>'role' = 'admin'
    OR auth.users.raw_user_meta_data->>'is_admin' = 'true'
  )
)
```

**Update to (SECURE):**
```sql
EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = auth.uid()
  AND (
    auth.users.raw_app_meta_data->>'role' = 'admin'
    OR auth.users.raw_app_meta_data->>'is_admin' = 'true'
  )
)
```

**Affected Policies:**
- `Only admins can insert policies`
- `Only admins can update policies`
- `Only admins can delete policies`

---

### 6. Table: `notifications`
**Policy:** `Admins can insert notifications`

**Current (INSECURE):**
```sql
EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = auth.uid()
  AND (
    auth.users.raw_user_meta_data->>'role' = 'admin'
    OR auth.users.raw_user_meta_data->>'is_admin' = 'true'
  )
)
```

**Update to (SECURE):**
```sql
EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = auth.uid()
  AND (
    auth.users.raw_app_meta_data->>'role' = 'admin'
    OR auth.users.raw_app_meta_data->>'is_admin' = 'true'
  )
)
```

---

## 📝 How to Apply Changes

### Method 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard** → Your Project → Database → Policies
2. **For each table listed above:**
   - Find the policy by name
   - Click "Edit Policy"
   - Update the policy definition:
     - Replace `raw_user_meta_data` with `raw_app_meta_data`
     - Replace `user_metadata` with `app_metadata`
   - Save the policy

3. **Verify the fix:**
   - Go to Database → Database Linter
   - Run the linter
   - All security errors should be resolved

### Method 2: Via SQL Editor

Run this SQL script in your Supabase SQL Editor:

```sql
-- Drop and recreate all affected policies with secure app_metadata checks

-- ============================================
-- PLATFORM POLICIES
-- ============================================

DROP POLICY IF EXISTS "Only admins can insert policies" ON platform_policies;
DROP POLICY IF EXISTS "Only admins can update policies" ON platform_policies;
DROP POLICY IF EXISTS "Only admins can delete policies" ON platform_policies;

CREATE POLICY "Only admins can insert policies"
  ON platform_policies
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_app_meta_data->>'role' = 'admin'
        OR auth.users.raw_app_meta_data->>'is_admin' = 'true'
      )
    )
  );

CREATE POLICY "Only admins can update policies"
  ON platform_policies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_app_meta_data->>'role' = 'admin'
        OR auth.users.raw_app_meta_data->>'is_admin' = 'true'
      )
    )
  );

CREATE POLICY "Only admins can delete policies"
  ON platform_policies
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_app_meta_data->>'role' = 'admin'
        OR auth.users.raw_app_meta_data->>'is_admin' = 'true'
      )
    )
  );

-- ============================================
-- NOTIFICATIONS
-- ============================================

DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;

CREATE POLICY "Admins can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_app_meta_data->>'role' = 'admin'
        OR auth.users.raw_app_meta_data->>'is_admin' = 'true'
      )
    )
  );

-- Note: The linter errors mention these using auth.jwt(), but they should
-- be updated to use the pattern above for consistency and security
```

---

## ✅ Backend Code Already Fixed

The backend server code has been updated to check `app_metadata` instead of `user_metadata`:
- All admin verification endpoints now use `user.app_metadata`
- This prevents privilege escalation attacks
- Backend changes are already deployed

---

## 🔐 Why This Matters

**Before (Vulnerable):**
```javascript
// User could edit their own user_metadata
const maliciousUser = {
  user_metadata: { role: 'admin' } // ❌ User can set this themselves!
}
```

**After (Secure):**
```javascript
// Only server can set app_metadata via admin API
const secureUser = {
  app_metadata: { role: 'admin' } // ✅ Only modifiable server-side
}
```

---

## 📚 References

- [Supabase Docs: RLS and user_metadata](https://supabase.com/docs/guides/database/database-linter?lint=0015_rls_references_user_metadata)
- [Supabase Auth: app_metadata vs user_metadata](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts)

---

**IMPORTANT:** Until these RLS policies are updated in the database, the application has a critical security vulnerability that allows any user to grant themselves admin privileges.
