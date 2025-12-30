# 🔒 Security Testing Guide
## Locksmith Marketplace - Complete Verification Process

**Last Updated:** December 16, 2024  
**Status:** Ready for Testing

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Method 1: Interactive UI Testing (Recommended)](#method-1-interactive-ui-testing-recommended)
4. [Method 2: SQL Testing](#method-2-sql-testing)
5. [Method 3: API Testing with cURL](#method-3-api-testing-with-curl)
6. [Method 4: Frontend Testing with Browser Console](#method-4-frontend-testing-with-browser-console)
7. [Interpreting Results](#interpreting-results)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides **4 different methods** to verify that all security fixes have been successfully applied to your Locksmith Marketplace platform. The fixes address:

- ✅ User profile data sanitization (no email/phone/address leaks)
- ✅ RLS policies restricting direct database queries
- ✅ Seller phone privacy enforcement

---

## Prerequisites

### Before Testing

1. **Apply Database Migration**
   ```sql
   -- In Supabase Dashboard → SQL Editor
   -- Run: /migrations/006_security_fix_rls_policies.sql
   ```

2. **Deploy Server Changes**
   - Ensure `/supabase/functions/server/index.tsx` is deployed
   - Verify Edge Functions are running

3. **Get Test Data**
   - Note your own User ID (for RLS tests)
   - Get another User ID (for API sanitization tests)
   - Get a Listing ID (for seller privacy tests)

---

## Method 1: Interactive UI Testing (Recommended)

### ✨ Best for: Non-technical users, quick verification

### Steps:

1. **Log in as Admin**
   - Navigate to Admin Panel

2. **Open Security Testing Tab**
   - Click on **"Security"** tab in Admin Panel
   - You'll see the Security Testing Dashboard

3. **Configure Test Data**
   - Enter a **Test User ID** (any user that's not you)
   - Enter a **Test Listing ID** (any active listing)
   - Your current user ID is automatically detected

4. **Run Tests**
   - Click **"Run All Tests"** to execute all 12 security tests
   - Or click individual category buttons to run specific test groups:
     - API Data Sanitization (4 tests)
     - Row Level Security Policies (4 tests)
     - Seller Contact Privacy (2 tests)
     - Authentication & Authorization (2 tests)

5. **Review Results**
   - ✅ **Green (Passed)**: Security fix is working correctly
   - ❌ **Red (Failed)**: Security issue detected - needs fixing
   - ⚠️ **Yellow (Warning)**: Test needs configuration or manual verification
   - ⏳ **Blue (Running)**: Test is currently executing
   - ⚪ **Gray (Pending)**: Test hasn't been run yet

6. **View Details**
   - Click on any test to see detailed results
   - Expand "View Details" to see raw response data
   - Check test duration and error messages

### Expected Results:

All tests should **PASS** (green) except:
- Tests may show **WARNING** if test IDs aren't provided
- Phone privacy tests may show **WARNING** if phone is visible but properly authorized

---

## Method 2: SQL Testing

### ✨ Best for: Database administrators, thorough verification

### Steps:

1. **Open Supabase SQL Editor**
   - Go to Supabase Dashboard → SQL Editor
   - Create a new query

2. **Run Verification Script**
   ```sql
   -- Copy contents from /SECURITY_VERIFICATION_TESTS.sql
   -- Paste into SQL Editor
   -- Execute
   ```

3. **Run Individual Tests**
   
   **Test 1: Verify you can access your own profile**
   ```sql
   SELECT id, first_name, email, phone, address
   FROM user_profiles 
   WHERE id = auth.uid();
   ```
   ✅ Expected: Returns YOUR profile data

   **Test 2: Verify you CANNOT access other users' emails**
   ```sql
   SELECT id, email
   FROM user_profiles 
   WHERE id != auth.uid()
   LIMIT 10;
   ```
   ✅ Expected: **0 rows returned**

   **Test 3: Verify you CANNOT access other users' phones**
   ```sql
   SELECT id, phone
   FROM user_profiles 
   WHERE id != auth.uid()
   LIMIT 10;
   ```
   ✅ Expected: **0 rows returned**

   **Test 4: Verify you CANNOT access other users' addresses**
   ```sql
   SELECT id, address
   FROM user_profiles 
   WHERE id != auth.uid()
   LIMIT 10;
   ```
   ✅ Expected: **0 rows returned**

   **Test 5: Summary Check**
   ```sql
   SELECT 
     (SELECT COUNT(*) FROM user_profiles) as accessible_profiles,
     CASE 
       WHEN (SELECT COUNT(*) FROM user_profiles) = 1 
       THEN '✅ PASS: Can only access own profile'
       ELSE '❌ FAIL: Can access multiple profiles'
     END as result;
   ```
   ✅ Expected: **1 accessible profile** (your own)

4. **Check RLS Policy**
   ```sql
   SELECT policyname, cmd, qual
   FROM pg_policies 
   WHERE tablename = 'user_profiles';
   ```
   ✅ Expected: See policy **"Users can view own profile"**

---

## Method 3: API Testing with cURL

### ✨ Best for: Developers, CI/CD pipelines

### Setup:

```bash
# Set your environment variables
export SUPABASE_PROJECT_ID="your-project-id"
export ACCESS_TOKEN="your-access-token"
export TEST_USER_ID="other-user-id"
export TEST_LISTING_ID="listing-id"
```

### Test 1: User Profile API (Should NOT return email/phone/address)

```bash
curl -X GET \
  "https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-a7e285ba/users/${TEST_USER_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '.profile | keys'
```

✅ **Expected Output:** Should NOT include `email`, `phone`, `address`, `phone_public`, `email_public`

```json
[
  "avatar",
  "bio",
  "firstName",
  "id",
  "isVerified",
  "joinedDate",
  "lastActive",
  "lastName",
  "location",
  "rating",
  "stats",
  "totalRatings",
  "website"
]
```

### Test 2: Check for Specific Sensitive Fields

```bash
# This should return null or field should not exist
curl -X GET \
  "https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-a7e285ba/users/${TEST_USER_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '.profile.email // "✅ PASS: Email not exposed"'
```

✅ **Expected:** `"✅ PASS: Email not exposed"`

### Test 3: Listing Seller Phone Privacy

```bash
curl -X GET \
  "https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-a7e285ba/listings/${TEST_LISTING_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '.listing.user_profiles | {phone, phone_public}'
```

✅ **Expected:** Either `phone` is `null` OR `phone_public` field should not be exposed to clients

### Test 4: Protected Route Without Auth

```bash
# Should return 401 Unauthorized
curl -X GET \
  "https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-a7e285ba/profile" \
  -H "Authorization: Bearer invalid-token-12345" \
  -w "\nHTTP Status: %{http_code}\n"
```

✅ **Expected:** HTTP Status: **401**

---

## Method 4: Frontend Testing with Browser Console

### ✨ Best for: Frontend developers, quick checks

### Steps:

1. **Open Browser Console**
   - Press F12 or Right Click → Inspect
   - Go to Console tab

2. **Test Direct Database Query (Should Fail)**

   ```javascript
   // This should return EMPTY array
   const { createClient } = await import('./utils/supabase/client');
   const { projectId, publicAnonKey } = await import('./utils/supabase/info');
   const supabase = createClient(projectId, publicAnonKey);

   const { data, error } = await supabase
     .from('user_profiles')
     .select('email, phone, address')
     .limit(10);

   console.log('Rows returned:', data?.length); // Should be 0 or 1 (own profile)
   console.log('Data:', data);
   ```

   ✅ **Expected:** `Rows returned: 0` or `1` (only your own profile)

3. **Test API Endpoint**

   ```javascript
   // Replace with another user's ID
   const testUserId = 'other-user-id-here';
   
   const response = await fetch(
     `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/users/${testUserId}`,
     {
       headers: {
         'Authorization': `Bearer ${publicAnonKey}`
       }
     }
   );

   const data = await response.json();
   console.log('Profile keys:', Object.keys(data.profile));
   console.log('Has email?', 'email' in data.profile); // Should be false
   console.log('Has phone?', 'phone' in data.profile); // Should be false
   console.log('Has address?', 'address' in data.profile); // Should be false
   ```

   ✅ **Expected:** All checks return `false`

4. **Test Own Profile Access**

   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   const myUserId = session?.user?.id;

   const { data: myProfile } = await supabase
     .from('user_profiles')
     .select('id, email, phone, address')
     .eq('id', myUserId)
     .single();

   console.log('Can access own profile?', !!myProfile);
   console.log('My profile:', myProfile);
   ```

   ✅ **Expected:** `Can access own profile? true` and your profile data is returned

---

## Interpreting Results

### ✅ All Tests Passed

**Meaning:** All security fixes are working correctly
- User data is properly sanitized in API responses
- RLS policies are preventing unauthorized database access
- Seller phone privacy settings are being enforced

**Next Steps:**
1. Mark security audit as complete ✓
2. Update deployment documentation
3. Schedule next security review (quarterly)

---

### ❌ Some Tests Failed

**Meaning:** Security vulnerabilities still exist

**Immediate Actions:**

1. **Check Migration Applied**
   ```sql
   -- Verify RLS policy exists
   SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
   ```

2. **Verify Server Deployed**
   - Check Edge Functions deployment timestamp
   - Ensure latest code is deployed

3. **Review Specific Failures**
   - API tests failing → Check server code at lines 2716-2730, 1468-1472
   - RLS tests failing → Re-run migration 006
   - Auth tests failing → Check authentication middleware

4. **Common Issues:**
   
   | Issue | Cause | Fix |
   |-------|-------|-----|
   | Can see other users' emails | RLS not applied | Run migration 006 |
   | API returns sensitive data | Server not deployed | Deploy Edge Functions |
   | Phone_public exposed | Outdated code | Update server code |
   | Can't access own profile | RLS too restrictive | Check auth.uid() |

---

### ⚠️ Warnings

**Meaning:** Tests need manual verification or configuration

**Common Warnings:**
- "Please enter a test user ID first" → Provide test data in UI
- "User not found" → Use valid user ID for testing
- "Listing not found" → Use valid listing ID for testing
- "Phone is visible" → Verify seller has `phone_public = true` (this is OK)

---

## Troubleshooting

### Problem: "No rows returned when querying own profile"

**Solution:**
```sql
-- Check if you're authenticated
SELECT auth.uid(); -- Should return your user ID

-- Check if your profile exists
SELECT COUNT(*) FROM user_profiles; -- Should be at least 1
```

---

### Problem: "RLS policy not found"

**Solution:**
```sql
-- Re-apply migration
\i /migrations/006_security_fix_rls_policies.sql

-- Or manually create policy
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = id);
```

---

### Problem: "API still returns sensitive data"

**Solution:**
1. Check server deployment status
2. Verify code at `/supabase/functions/server/index.tsx`
3. Look for lines 2716-2730 (user profile endpoint)
4. Ensure it's NOT using spread operator `...profile`
5. Redeploy Edge Functions

---

### Problem: "Tests timeout or hang"

**Solution:**
- Check network connectivity
- Verify Supabase project is online
- Check browser console for errors
- Try running individual tests instead of "Run All"

---

## Quick Checklist

Use this checklist before production deployment:

- [ ] Migration 006 applied successfully
- [ ] Server Edge Functions deployed
- [ ] All 12 UI tests pass (green)
- [ ] SQL verification query returns all TRUE
- [ ] API cURL tests return no sensitive data
- [ ] Browser console tests confirm RLS working
- [ ] Documentation updated
- [ ] Team notified of security fixes
- [ ] Next review scheduled (March 2025)

---

## Support & Resources

- **Security Audit Report:** `/SECURITY_AUDIT_REPORT.md`
- **Fixes Applied:** `/SECURITY_FIXES_APPLIED.md`
- **SQL Tests:** `/SECURITY_VERIFICATION_TESTS.sql`
- **Test Queries:** `/SECURITY_TEST_QUERIES.sql`
- **Quick Reference:** `/SECURITY_QUICK_REFERENCE.md`

---

## Next Steps After Passing

1. ✅ Mark security audit as complete
2. 📝 Update deployment logs
3. 🔔 Notify development team
4. 📅 Schedule quarterly security reviews
5. 🔐 Consider additional security measures:
   - Rate limiting on user profile endpoints
   - Audit logging for profile views
   - CAPTCHA after threshold
   - Automated security monitoring

---

**Last Updated:** December 16, 2024  
**Next Review:** March 2025
