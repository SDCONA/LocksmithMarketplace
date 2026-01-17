# ⚡ MARKETPLACE AUTO-ARCHIVE - QUICK START

**Status:** ✅ Code Fixed | ⏳ SQL Setup Required

---

## 🚀 **WHAT I FIXED (Done Automatically):**

✅ **Backend code updated** - New listings now set `expires_at`  
✅ **Cron function created** - `/supabase/functions/cron-archive-listings/index.ts`  
✅ **Documentation created** - Complete setup guide  
✅ **Database docs updated** - Schema reference updated  

---

## ⏳ **WHAT YOU NEED TO DO (One Time):**

### **Option A: PostgreSQL Cron (5 minutes)**

1. **Open Supabase SQL Editor**
2. **Run this file:** `/MARKETPLACE_AUTO_ARCHIVE_SETUP.sql`
3. **Done!** ✅

### **Option B: Edge Function Cron (5 minutes)**

1. **Deploy function:**
   ```bash
   supabase functions deploy cron-archive-listings
   ```

2. **Supabase Dashboard** → Edge Functions → `cron-archive-listings`

3. **Add Cron:** Schedule `0 0 * * *`

4. **Done!** ✅

---

## 🎯 **PICK ONE AND GO!**

Both options work the same. Pick whichever you prefer:

- **PostgreSQL Cron** = Runs inside database
- **Edge Function** = Runs as serverless function

---

## ✅ **VERIFY IT'S WORKING:**

Create a test listing → Check database:

```sql
SELECT id, title, expires_at 
FROM marketplace_listings 
WHERE status = 'active' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected:** `expires_at` should be 7 days from now ✅

---

## 📚 **FULL DOCS:**

- **Setup Guide:** `/MARKETPLACE_AUTO_ARCHIVE_README.md`
- **SQL Script:** `/MARKETPLACE_AUTO_ARCHIVE_SETUP.sql`
- **Cron Function:** `/supabase/functions/cron-archive-listings/index.ts`

---

**That's it! 5 minutes to fix the auto-archive system. 🚀**
