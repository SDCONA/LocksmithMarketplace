# 🔒 SECURITY AUDIT REPORT
## Locksmith Marketplace - Supabase Security Audit
**Date:** December 16, 2024  
**Status:** CRITICAL VULNERABILITIES FOUND ⚠️

---

## 🚨 CRITICAL VULNERABILITIES

### 1. **USER PROFILE DATA LEAK** - SEVERITY: CRITICAL 🔴
**Location:** `/supabase/functions/server/index.tsx` - Line 2719  
**Endpoint:** `GET /make-server-a7e285ba/users/:userId`

**Issue:**
```typescript
return c.json({ 
  success: true, 
  profile: {
    ...profile,  // ❌ SPREADS ALL PROFILE DATA INCLUDING SENSITIVE FIELDS
    stats: { ... }
  }
});
```

**Data Leaked:**
- ✅ **Email address** (CRITICAL)
- ✅ **Phone number** (CRITICAL)
- ✅ **Full address** with city, state, zip code (CRITICAL)
- ✅ Auto-reply message (MINOR)
- ✅ Privacy settings (phone_public, email_public) (MINOR)

**Impact:** ANY user can get ANY other user's email, phone, and address by knowing their user ID!

**Attack Vector:**
```javascript
// Attacker can enumerate all users and harvest contact info
for (let userId of userIds) {
  const res = await fetch(`/users/${userId}`);
  const { profile } = await res.json();
  console.log(`Email: ${profile.email}, Phone: ${profile.phone}`);
}
```

---

### 2. **RLS POLICY TOO PERMISSIVE** - SEVERITY: CRITICAL 🔴
**Location:** `/migrations/001_initial_schema.sql` - Line 433

**Issue:**
```sql
CREATE POLICY "Users can view all profiles" ON user_profiles 
  FOR SELECT USING (true);
```

**Impact:** ANY authenticated user can query the `user_profiles` table directly via Supabase client and retrieve ALL fields including:
- email
- phone
- address (JSONB containing city, state, zipCode)
- auto_reply_message

**Attack Vector:**
```javascript
const { data } = await supabase
  .from('user_profiles')
  .select('email, phone, address')
  .limit(1000);
// Returns all emails, phones, and addresses! 🚨
```

---

### 3. **SELLER CONTACT INFO EXPOSURE** - SEVERITY: MEDIUM 🟡
**Location:** `/supabase/functions/server/index.tsx` - Lines 1455-1457  
**Endpoint:** `GET /make-server-a7e285ba/listings/:id`

**Issue:**
The single listing endpoint returns seller's phone and location, but doesn't verify if `phone_public` flag is respected on the backend before returning the data.

```typescript
user_profiles!marketplace_listings_seller_id_fkey (
  id,
  first_name,
  last_name,
  avatar_url,
  rating,
  total_reviews,
  is_verified,
  phone,          // ⚠️ Returned without checking phone_public flag
  phone_public,
  location,
  created_at
)
```

**Impact:** Phone numbers may be exposed even when user sets profile to private.

---

## ✅ SECURITY PASSES

### 1. **Service Role Key Protection** ✓
- Service role key is ONLY used server-side
- Frontend uses anon key only
- No leakage of service key found

### 2. **Authentication on Protected Routes** ✓
- Admin routes properly check `verifyAdmin()`
- User routes properly check `verifyUser()`
- Authorization headers validated

### 3. **Marketplace Listing Endpoints** ✓
- Properly filter user_profiles fields in listing queries
- Only return safe fields (id, first_name, last_name, avatar_url, rating, is_verified)
- No email/phone leaked in listing cards

### 4. **Admin Endpoint Data Sanitization** ✓
- Admin `/admin/users` endpoint properly constructs user objects with explicit fields
- Doesn't use spread operator on sensitive data

### 5. **Message/Conversation Privacy** ✓
- RLS policies properly restrict message access
- Users can only see their own conversations
- Proper filtering in conversation queries

---

## 🔧 REQUIRED FIXES

### Fix #1: Sanitize User Profile Endpoint Response
**File:** `/supabase/functions/server/index.tsx` - Line 2716-2730

**Change from:**
```typescript
return c.json({ 
  success: true, 
  profile: {
    ...profile,  // ❌ DANGEROUS
    stats: { ... }
  }
});
```

**Change to:**
```typescript
return c.json({ 
  success: true, 
  profile: {
    id: profile.id,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    avatar: profile.avatar_url || '',
    bio: profile.bio || '',
    website: profile.website || '',
    location: profile.location || '', // General location only
    isVerified: profile.is_verified || false,
    joinedDate: profile.joined_date,
    lastActive: profile.show_last_active ? profile.last_active : null,
    // ❌ DO NOT include: email, phone, address
    stats: {
      activeListings: listingsData?.filter(l => l.status === 'active').length || 0,
      totalListings: listingsData?.length || 0,
      totalSales: profile.total_sales || 0,
      followers: profile.followers_count || 0,
      following: profile.following_count || 0,
    },
    rating: averageRating,
    totalRatings: reviewsData?.length || 0,
  }
});
```

---

### Fix #2: Update RLS Policy for user_profiles
**File:** Create new migration file

**Remove:**
```sql
CREATE POLICY "Users can view all profiles" ON user_profiles 
  FOR SELECT USING (true);
```

**Replace with:**
```sql
-- Users can only view their own full profile
CREATE POLICY "Users can view own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = id);

-- Users can view limited public fields of other profiles
-- This policy is intentionally restrictive - the API layer handles public profile views
CREATE POLICY "Users can view public profile fields" ON user_profiles 
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND id != auth.uid()
  );
```

**Note:** Since we can't create column-level security in Postgres/Supabase RLS, we need to rely on the API layer to filter fields. The RLS policy above still allows SELECT but the application layer (server routes) MUST filter the returned fields.

**BETTER APPROACH:** Remove the permissive RLS policy entirely and force all profile access through server endpoints:

```sql
-- Remove public read policy
DROP POLICY "Users can view all profiles" ON user_profiles;

-- Only allow users to view their own profile via direct query
CREATE POLICY "Users can view own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = id);

-- All other profile views MUST go through server API endpoints
```

---

### Fix #3: Respect phone_public Flag in Listing Endpoint
**File:** `/supabase/functions/server/index.tsx` - After line 1462

**Add sanitization logic:**
```typescript
if (error) {
  return c.json({ error: "Listing not found" }, 404);
}

// Sanitize seller contact info based on privacy settings
if (listing.user_profiles && !listing.user_profiles.phone_public) {
  listing.user_profiles.phone = null; // Hide phone if not public
}
```

---

## 📋 RECOMMENDED ADDITIONAL SECURITY MEASURES

### 1. **Add Rate Limiting**
- Implement rate limiting on user profile endpoints to prevent scraping
- Suggestion: Max 100 profile requests per hour per user

### 2. **Add Audit Logging**
- Log all access to user profiles
- Track who is viewing whose profiles
- Alert on suspicious patterns (e.g., one user viewing 100+ profiles)

### 3. **Implement Data Access Monitoring**
- Monitor for bulk SELECT queries on user_profiles table
- Alert admins if suspicious queries detected

### 4. **Add CAPTCHA to Registration**
- Prevent automated account creation for scraping purposes

### 5. **Consider Honeypot Fields**
- Add fake fields to user_profiles to detect scrapers
- If a query selects these fields, flag the user

---

## 🧪 RECOMMENDED SECURITY TESTS

Run these queries as an anonymous user (or regular user) to verify fixes:

```sql
-- Test 1: Should return EMPTY (anonymous can't access profiles)
SELECT email FROM user_profiles LIMIT 10;

-- Test 2: Should return EMPTY (anonymous can't access phone)
SELECT phone FROM user_profiles LIMIT 10;

-- Test 3: Should return EMPTY (anonymous can't access addresses)
SELECT address FROM user_profiles LIMIT 10;

-- Test 4: Should return EMPTY (anonymous can't access messages)
SELECT * FROM messages LIMIT 10;

-- Test 5: As authenticated user, try to access another user's private data
SELECT email, phone FROM user_profiles WHERE id != auth.uid() LIMIT 1;
-- Should return EMPTY or ERROR
```

---

## 📊 AUDIT SUMMARY

| Category | Status | Severity | Fixed |
|----------|--------|----------|-------|
| User Profile API Data Leak | ⚠️ VULNERABLE | CRITICAL | ⏳ PENDING |
| RLS Policy Too Permissive | ⚠️ VULNERABLE | CRITICAL | ⏳ PENDING |
| Seller Contact Privacy | ⚠️ VULNERABLE | MEDIUM | ⏳ PENDING |
| Service Role Key Security | ✅ SECURE | N/A | N/A |
| Auth on Protected Routes | ✅ SECURE | N/A | N/A |
| Message Privacy | ✅ SECURE | N/A | N/A |

**OVERALL RISK LEVEL: HIGH 🔴**

---

## 🚀 IMMEDIATE ACTION REQUIRED

1. **IMMEDIATELY** deploy Fix #1 (User Profile Endpoint)
2. **IMMEDIATELY** deploy Fix #2 (RLS Policy)
3. Deploy Fix #3 (Phone Privacy) within 24 hours
4. Run security tests after each fix
5. Consider a security announcement to users

---

## 📞 NEXT STEPS

1. Apply all fixes in this report
2. Run the recommended security tests
3. Consider a security audit of the frontend to ensure it doesn't cache/expose sensitive data
4. Review all other API endpoints for similar vulnerabilities
5. Implement additional security measures

---

**Report Generated By:** Figma Make Security Audit System  
**Reviewed By:** [PENDING]  
**Approval Status:** [PENDING]
