# 🔒 LOCKSMITH MARKETPLACE - COMPLETE DATABASE SCHEMA
## ⚠️ READ THIS BEFORE ANY DATABASE CHANGES ⚠️

---

# 🚨 MANDATORY READING PROTOCOL 🚨

## ⚠️ READ THIS FILE BEFORE:
1. ✅ **GIVING ANY ANSWER TO THE USER**
2. ✅ **MAKING ANY CODE CHANGES**
3. ✅ **SUGGESTING ANY SOLUTIONS**
4. ✅ **WRITING ANY DATABASE QUERIES**
5. ✅ **PROPOSING ANY FEATURES**

**EVERY SINGLE INTERACTION MUST START BY READING THIS FILE.**

---

# ⚠️ CRITICAL DEVELOPMENT NOTES ⚠️

## ABSOLUTELY DO NOT USE KV STORE

**DO NOT USE KV STORE.**

**Use existing database tables or create new tables if needed.**

**If you need to store data:**
1. Check existing tables first
2. Create new tables if necessary
3. Ask user to run SQL queries to verify table structure
4. Provide SQL for user to execute and return results

**NEVER assume KV store exists or works.**
**NEVER use `kv.set()`, `kv.get()`, or any KV store operations.**

---

## Database Architecture

- This project uses **PostgreSQL via Supabase**
- There are **38 tables** in the schema (see complete list below)
- Always use proper tables with RLS policies
- Always verify table existence before using it

---

**READ THIS FILE EVERY TIME BEFORE MAKING CHANGES**

---

## 📊 TOTAL TABLES: 38
## 🔐 ALL TABLES HAVE RLS ENABLED: YES

---

## 📋 COMPLETE TABLE LIST WITH ALL COLUMNS

### 1. admin_actions
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `admin_id` (uuid, NOT NULL)
- `action_type` (text, NOT NULL)
- `target_type` (text, NOT NULL)
- `target_id` (uuid, NOT NULL)
- `description` (text, NOT NULL)
- `metadata` (jsonb, nullable)
- `created_at` (timestamp with time zone, default: now())

**RLS Policies:**
- INSERT: Admins can insert admin actions → `is_current_user_admin()`
- SELECT: Admins can view all admin actions → `is_current_user_admin()`

---

### 2. admins_a7e285ba ⭐ SECURE ADMIN TABLE
- `user_id` (uuid, NOT NULL, PRIMARY KEY)
- `granted_by` (uuid, nullable)
- `granted_at` (timestamp with time zone, default: now())
- `notes` (text, nullable)

**RLS Policies:**
- ❌ ZERO POLICIES - Completely locked down by default

---

### 3. banner_positions
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `position_number` (integer, NOT NULL)
- `retailer_name` (text, NOT NULL)
- `is_active` (boolean, default: true)
- `retailer_data` (jsonb, default: '{"banners": []}')
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())
- `updated_by` (uuid, nullable)

**RLS Policies:**
- DELETE: Admins can delete → `is_current_user_admin()`
- INSERT: Admins can insert → `is_current_user_admin()`
- UPDATE: Admins can update → `is_current_user_admin()`
- SELECT: Public can view active → `is_active = true`

---

### 4. conversation_deletions
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `conversation_id` (uuid, NOT NULL)
- `user_id` (uuid, NOT NULL)
- `deleted_at` (timestamp with time zone, default: now())
- `created_at` (timestamp with time zone, default: now())

**RLS Policies:**
- INSERT: Users can delete their own → `user_id = auth.uid()`
- DELETE: Users can remove deletions → `user_id = auth.uid()`
- SELECT: Users can view own → `user_id = auth.uid()`

---

### 5. conversations
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `listing_id` (uuid, nullable)
- `buyer_id` (uuid, NOT NULL)
- `seller_id` (uuid, NOT NULL)
- `last_message` (text, nullable)
- `last_message_at` (timestamp with time zone, nullable)
- `buyer_unread_count` (integer, default: 0)
- `seller_unread_count` (integer, default: 0)
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())
- `is_admin_warning` (boolean, default: false)

**RLS Policies:**
- INSERT: Users can create → `buyer_id = auth.uid() OR seller_id = auth.uid()`
- UPDATE: Users can update own → `buyer_id = auth.uid() OR seller_id = auth.uid()`
- SELECT: Users can view own → `buyer_id = auth.uid() OR seller_id = auth.uid()`

---

### 6. deal_analytics_a7e285ba
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `created_at` (timestamp with time zone, default: now())
- `deal_id` (uuid, NOT NULL)
- `retailer_profile_id` (uuid, NOT NULL)
- `event_type` (text, NOT NULL)
- `user_id` (uuid, nullable)

**RLS Policies:**
- SELECT: Admin can view all → `is_admin(auth.uid())`
- SELECT: Retailer users can view their own analytics
- INSERT: Service role can insert → `true`

---

### 7. deal_images
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `created_at` (timestamp with time zone, default: now())
- `deal_id` (uuid, NOT NULL)
- `image_url` (text, NOT NULL)
- `display_order` (integer, default: 0)

**RLS Policies:**
- SELECT: Public can view deal images (for active deals)
- ALL: Retailer users can manage their deal images

---

### 8. deal_types
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `created_at` (timestamp with time zone, default: now())
- `name` (text, NOT NULL)
- `color` (text, default: '#3B82F6')
- `display_order` (integer, default: 0)

**RLS Policies:**
- SELECT: Anyone can view → `true`

---

### 9. deals
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())
- `retailer_profile_id` (uuid, NOT NULL)
- `deal_type_id` (uuid, nullable)
- `title` (text, NOT NULL)
- `description` (text, nullable)
- `price` (numeric, NOT NULL)
- `original_price` (numeric, nullable)
- `external_url` (text, NOT NULL)
- `expires_at` (timestamp with time zone, NOT NULL)
- `archived_at` (timestamp with time zone, nullable)
- `status` (text, default: 'active')
- `view_count` (integer, default: 0)
- `save_count` (integer, default: 0)

**RLS Policies:**
- SELECT: Public can view active deals
- INSERT: Retailer users can create their own deals
- DELETE: Retailer users can delete their own deals
- UPDATE: Retailer users can update their own deals
- SELECT: Retailer users can view their own deals

---

### 10. deals_banners_a7e285ba
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `name` (text, NOT NULL)
- `link` (text, default: '')
- `pc_image_url` (text, nullable)
- `mobile_image_url` (text, nullable)
- `display_order` (integer, NOT NULL, default: 0)
- `is_active` (boolean, NOT NULL, default: true)
- `updated_by` (uuid, nullable)
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())

**RLS Policies:**
- SELECT: Public can view active → `is_active = true`
- ALL: Service role has full access → `auth.role() = 'service_role'`

---

### 11. digest_tracking_a7e285ba
- `id` (integer, NOT NULL, default: 1)
- `last_digest_sent_at` (timestamp with time zone, NOT NULL, default: now())
- `updated_at` (timestamp with time zone, default: now())

**RLS Policies:**
- ❌ NO POLICIES SHOWN (likely service_role only)

---

### 12. email_verification_tokens
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `user_id` (uuid, NOT NULL)
- `email` (text, NOT NULL)
- `token` (text, NOT NULL)
- `verification_code` (text, NOT NULL)
- `expires_at` (timestamp with time zone, NOT NULL)
- `created_at` (timestamp with time zone, default: now())
- `verified_at` (timestamp with time zone, nullable)
- `type` (text, NOT NULL, default: 'email_verification')

**RLS Policies:**
- ALL: Service role has full access → `true`
- SELECT: Users can view their own → `auth.uid() = user_id`

---

### 13. kv_store_a7e285ba
- `key` (text, NOT NULL, PRIMARY KEY)
- `value` (jsonb, NOT NULL)

**RLS Policies:**
- ❌ NO POLICIES SHOWN (likely service_role only)

---

### 14. marketplace_listings
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `seller_id` (uuid, NOT NULL)
- `title` (text, NOT NULL)
- `description` (text, NOT NULL)
- `price` (numeric, NOT NULL)
- `category` (text, NOT NULL)
- `condition` (text, NOT NULL)
- `location` (text, NOT NULL)
- `images` (ARRAY, default: '{}')

**RLS Policies:**
- SELECT: Listings are publicly readable → `true`
- DELETE: Users can delete own → `seller_id = auth.uid()`
- INSERT: Users can insert own → `seller_id = auth.uid()`
- UPDATE: Users can update own → `seller_id = auth.uid()`

---

### 15. messages
**RLS Policies:**
- INSERT: Users can insert messages (complex conversation check)
- UPDATE: Users can update own → `sender_id = auth.uid()`
- SELECT: Users can view conversation messages

---

### 16. migration_log
**RLS Policies:**
- SELECT: Admins can view → `is_current_user_admin()`
- INSERT: System can insert → `true`
- UPDATE: System can update → `true`

---

### 17. notifications
**RLS Policies:**
- INSERT: Admins can insert → `is_current_user_admin()`
- DELETE: Users can delete own → `user_id = auth.uid()`
- UPDATE: Users can update own → `user_id = auth.uid()`
- SELECT: Users can view own → `user_id = auth.uid()`

---

### 18. order_items
**RLS Policies:**
- SELECT: Sellers can view sold items
- SELECT: Users can view own order items

---

### 19. orders
**RLS Policies:**
- INSERT: Users can insert own → `user_id = auth.uid()`
- UPDATE: Users can update own → `user_id = auth.uid()`
- SELECT: Users can view own → `user_id = auth.uid()`

---

### 20. platform_policies
**RLS Policies:**
- INSERT: Admins can insert → `is_current_user_admin()`
- UPDATE: Admins can update → `is_current_user_admin()`
- SELECT: Admins can view all → `is_current_user_admin()`
- SELECT: Anyone can read → `true`
- DELETE: Only admins can delete → `is_current_user_admin()`

---

### 21. post_comments
**RLS Policies:**
- SELECT: Comments are publicly readable → `true`
- DELETE: Users can delete own → `user_id = auth.uid()`
- INSERT: Users can insert → `user_id = auth.uid()`
- UPDATE: Users can update own → `user_id = auth.uid()`

---

### 22. post_likes
**RLS Policies:**
- SELECT: Likes are publicly readable → `true`
- DELETE: Users can delete own → `user_id = auth.uid()`
- INSERT: Users can insert own → `user_id = auth.uid()`

---

### 23. promotion_analytics
**RLS Policies:**
- SELECT: Users can view own promotion analytics

---

### 24. promotional_banners
**RLS Policies:**
- ALL: Admins can manage → `true`
- SELECT: Public can view active → `is_active = true`

---

### 25. promotions
**RLS Policies:**
- INSERT: Users can insert own → `user_id = auth.uid()`
- UPDATE: Users can update own → `user_id = auth.uid()`
- SELECT: Users can view own → `user_id = auth.uid()`

---

### 26. reported_content
**RLS Policies:**
- INSERT: Users can create reports → `reporter_id = auth.uid()`
- SELECT: Users can view own reports → `reporter_id = auth.uid()`

---

### 27. reports (LEGACY)
**RLS Policies:**
- INSERT: Users can create legacy reports → `reporter_id = auth.uid()`
- SELECT: Users can view own legacy reports → `reporter_id = auth.uid()`

---

### 28. reports_a7e285ba (NEW)
**RLS Policies:**
- DELETE: Admins can delete → `is_current_user_admin()`
- UPDATE: Admins can update → `is_current_user_admin()`
- SELECT: Admins can view all → `is_current_user_admin()`
- INSERT: Users can create reports → `reporter_id = auth.uid()`
- SELECT: Users can view their own reports → `reporter_id = auth.uid()`

---

### 29. retailer_profiles
**RLS Policies:**
- SELECT: Public can view active → `is_active = true`
- UPDATE: Retailer users can update their own → `owner_user_id = auth.uid()`
- SELECT: Retailer users can view their own → `owner_user_id = auth.uid()`

---

### 30. saved_deals
**RLS Policies:**
- INSERT: Users can save → `user_id = auth.uid()`
- DELETE: Users can unsave → `user_id = auth.uid()`
- SELECT: Users can view their own saved deals → `user_id = auth.uid()`

---

### 31. saved_items
**RLS Policies:**
- DELETE: Users can delete own → `user_id = auth.uid()`
- INSERT: Users can insert own → `user_id = auth.uid()`
- SELECT: Users can view own → `user_id = auth.uid()`

---

### 32. search_history
**RLS Policies:**
- INSERT: Anyone can insert → `true`
- SELECT: Users can view own → `user_id = auth.uid()`

---

### 33. user_addresses
**RLS Policies:**
- DELETE: Users can delete own → `user_id = auth.uid()`
- INSERT: Users can insert own → `user_id = auth.uid()`
- UPDATE: Users can update own → `user_id = auth.uid()`
- SELECT: Users can view own → `user_id = auth.uid()`

---

### 34. user_preferences
**RLS Policies:**
- DELETE: Users can delete own → `auth.uid() = user_id`
- INSERT: Users can insert own → `auth.uid() = user_id`
- UPDATE: Users can update own → `auth.uid() = user_id`
- SELECT: Users can view own → `auth.uid() = user_id`

---

### 35. user_profiles
**RLS Policies:**
- SELECT: User profiles are publicly readable → `true`
- INSERT: Users can insert own → `id = auth.uid()`
- UPDATE: Users can update own → `id = auth.uid()`

---

### 36. user_reviews
**RLS Policies:**
- SELECT: Reviews are publicly readable → `true`
- INSERT: Users can insert → `reviewer_id = auth.uid()`
- UPDATE: Users can update own → `reviewer_id = auth.uid()`

---

### 37. user_settings
**RLS Policies:**
- INSERT: Users can insert own → `user_id = auth.uid()`
- UPDATE: Users can update own → `user_id = auth.uid()`
- SELECT: Users can view own → `user_id = auth.uid()`

---

### 38. vehicles
**RLS Policies:**
- SELECT: Vehicles are publicly readable → `true`

---

## 🚨 CRITICAL ADMIN SYSTEM ISSUES

### ⚠️ TWO CONFLICTING ADMIN CHECK FUNCTIONS:

1. **`is_admin(user_id UUID)`** - Checks `auth.users.raw_app_meta_data` (BROKEN/INSECURE)
2. **`is_current_user_admin()`** - Unknown implementation

### ⚠️ INCONSISTENT USAGE:

- `deal_analytics_a7e285ba` uses: `is_admin(auth.uid())`
- `admin_actions`, `banner_positions`, `migration_log`, `notifications`, `platform_policies`, `reports_a7e285ba` use: `is_current_user_admin()`

### ✅ SOLUTION NEEDED:

**Replace BOTH functions to check ONLY `admins_a7e285ba` table!**

---

## 📝 INCOMPLETE DATA WARNING

The marketplace_listings table appears truncated. Additional columns may exist beyond `images`.

---

**Last Updated:** January 2, 2026  
**Total Tables:** 38  
**RLS Status:** All Enabled  
**Admin System:** BROKEN - Needs Unification