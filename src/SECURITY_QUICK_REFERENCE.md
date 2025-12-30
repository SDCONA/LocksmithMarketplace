# 🔒 SECURITY QUICK REFERENCE
## Locksmith Marketplace - Developer Guide

---

## ⚡ QUICK ACTION ITEMS

### 🚨 CRITICAL - DO THIS NOW
1. **Apply Database Migration**
   ```sql
   -- Run in Supabase SQL Editor:
   -- migrations/006_security_fix_rls_policies.sql
   ```

2. **Deploy Server Changes**
   - Server file `/supabase/functions/server/index.tsx` has been updated
   - Deploy via Supabase Dashboard or CLI

3. **Run Security Tests**
   - Execute queries in `/SECURITY_TEST_QUERIES.sql`
   - All tests marked "Empty" must return 0 rows

---

## 🔴 WHAT WAS VULNERABLE

### Vulnerability #1: Profile Data Leak
```javascript
// ❌ BEFORE (BAD)
GET /users/:userId
Returns: { email, phone, address, ... } // ALL fields exposed!

// ✅ AFTER (GOOD)
GET /users/:userId  
Returns: { firstName, lastName, avatar, ... } // Only safe fields
```

### Vulnerability #2: Database Access Too Open
```javascript
// ❌ BEFORE (BAD)
await supabase.from('user_profiles').select('email, phone')
// Returns ALL users' emails and phones! 🚨

// ✅ AFTER (GOOD)
await supabase.from('user_profiles').select('email, phone')
// Returns EMPTY (only your own via RLS)
```

### Vulnerability #3: Phone Always Shown
```javascript
// ❌ BEFORE (BAD)
GET /listings/:id
Returns seller phone even if phone_public = false

// ✅ AFTER (GOOD)
GET /listings/:id
Returns seller phone ONLY if phone_public = true
```

---

## ✅ WHAT'S NOW SAFE

| Data | Own Profile | Other Users' Profiles |
|------|-------------|----------------------|
| Email | ✅ Visible | ❌ Hidden |
| Phone | ✅ Visible | ❌ Hidden |
| Address | ✅ Visible | ❌ Hidden |
| Name | ✅ Visible | ✅ Visible |
| Avatar | ✅ Visible | ✅ Visible |
| Bio | ✅ Visible | ✅ Visible |
| Rating | ✅ Visible | ✅ Visible |

---

## 🧪 5-MINUTE SECURITY TEST

### Test 1: API Endpoint (30 seconds)
```bash
# Get another user's profile
curl "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-a7e285ba/users/OTHER_USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# ✅ PASS if response has NO email, phone, or address
# ❌ FAIL if you see any sensitive fields
```

### Test 2: Database Query (30 seconds)
```javascript
const { data } = await supabase
  .from('user_profiles')
  .select('email')
  .neq('id', myUserId);

console.log(data.length); // Must be 0
```
**✅ PASS** if `data.length === 0`  
**❌ FAIL** if you get any rows

### Test 3: Phone Privacy (30 seconds)
```bash
# View a listing where seller has phone_public = false
curl "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-a7e285ba/listings/LISTING_ID"

# Check response: user_profiles.phone should be null
```
**✅ PASS** if phone is null  
**❌ FAIL** if phone is exposed

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] Backup database before migration
- [ ] Run migration: `006_security_fix_rls_policies.sql`
- [ ] Deploy server function updates
- [ ] Run Test 1 (API endpoint)
- [ ] Run Test 2 (Database query)
- [ ] Run Test 3 (Phone privacy)
- [ ] Check server logs for errors
- [ ] Verify frontend still works
- [ ] Update team on changes

---

## 🚫 CODING RULES TO PREVENT FUTURE ISSUES

### ❌ NEVER Do This
```typescript
// DON'T spread profile data
return { ...profile }; // Leaks sensitive fields!

// DON'T use SELECT *
.select('*') // Gets all fields including sensitive ones

// DON'T create permissive RLS policies
USING (true) // Allows everyone to see everything!
```

### ✅ ALWAYS Do This
```typescript
// DO explicitly list safe fields
return {
  id: profile.id,
  firstName: profile.first_name,
  // ... only safe fields
};

// DO select specific safe columns
.select('id, first_name, last_name, avatar_url')

// DO create restrictive RLS policies
USING (auth.uid() = id) // Only own data
```

---

## 🔐 SENSITIVE FIELDS LIST

### NEVER Expose to Other Users
- `email`
- `phone`
- `address` (JSONB: city, state, zipCode)
- `phone_public` (privacy setting)
- `email_public` (privacy setting)
- `auto_reply` (boolean flag)
- `auto_reply_message` (private message)

### Safe to Show (Public Profile)
- `id`
- `first_name`, `last_name`
- `avatar_url`
- `bio`
- `website`
- `location` (general, not specific address)
- `is_verified`
- `joined_date`
- `rating`, `total_reviews`
- Stats (listings count, etc.)

---

## 📞 EMERGENCY CONTACTS

If you find a new security issue:

1. **DO NOT** commit it to version control
2. **DO** document it privately
3. **DO** notify the team immediately
4. **DO** follow this checklist again

---

## 📚 FULL DOCUMENTATION

For detailed information, see:
- `/SECURITY_AUDIT_REPORT.md` - Full audit findings
- `/SECURITY_FIXES_APPLIED.md` - Complete fix documentation
- `/SECURITY_TEST_QUERIES.sql` - All test queries

---

**Last Updated:** December 16, 2024  
**Version:** 1.0
