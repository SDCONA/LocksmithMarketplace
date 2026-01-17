# 🗂️ MARKETPLACE AUTO-ARCHIVE SYSTEM

**Status:** ✅ **FIXED** (January 12, 2026)  
**Issue:** Listings were NOT auto-archiving after 7 days  
**Solution:** 2 code changes + 1 SQL setup

---

## 🐛 **WHAT WAS BROKEN:**

1. ❌ **New listings didn't set expiry timestamp** → Stayed active forever
2. ❌ **No automated cron job** → Archive endpoint never called automatically
3. ⚠️ **Existing listings had NULL expires_at** → Couldn't be archived

---

## ✅ **WHAT WAS FIXED:**

### **1. Backend: New Listings Now Set Expiry** 
**File:** `/supabase/functions/server/index.tsx` (Line ~1673)

**BEFORE:**
```typescript
status: 'active',
// ❌ No expiry timestamp
```

**AFTER:**
```typescript
status: 'active',
expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // ✅ Auto-archive after 7 days
```

**Impact:** All new listings created after this fix will auto-expire after exactly 7 days.

---

### **2. Cron Job: Daily Auto-Archive** 
**File:** `/supabase/functions/cron-archive-listings/index.ts` (NEW)

**What it does:**
- Runs every day at midnight UTC
- Calls `/listings/archive-expired` endpoint
- Archives all listings where `expires_at < NOW()`
- Logs how many listings were archived

**Schedule:** `0 0 * * *` (Cron format: daily at midnight)

---

### **3. SQL Setup: Backfill + Automation** 
**File:** `/MARKETPLACE_AUTO_ARCHIVE_SETUP.sql`

**What it does:**
1. Backfills `expires_at` for existing active listings (7 days from creation)
2. Enables `pg_cron` extension
3. Creates daily cron job in PostgreSQL
4. Provides verification queries

---

## 🚀 **HOW TO COMPLETE THE FIX:**

### **Option A: PostgreSQL Cron (Recommended)**

1. **Open Supabase SQL Editor**
2. **Copy and run** `/MARKETPLACE_AUTO_ARCHIVE_SETUP.sql`
3. **Verify** cron job created:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'archive-expired-marketplace-listings';
   ```
4. **Done!** ✅ System will auto-archive daily

---

### **Option B: Supabase Edge Function Cron**

1. **Deploy the cron function:**
   ```bash
   supabase functions deploy cron-archive-listings
   ```

2. **Go to Supabase Dashboard** → Edge Functions → `cron-archive-listings`

3. **Add Cron Schedule:**
   - Click "Add Cron Job"
   - Schedule: `0 0 * * *`
   - Save

4. **Done!** ✅ Edge Function will run daily

---

## 📊 **HOW IT WORKS NOW:**

```
┌─────────────────────────────────────────────────────────┐
│ USER CREATES LISTING                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Backend sets:                                            │
│ - status: 'active'                                       │
│ - expires_at: NOW() + 7 days  ◄── NEW!                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Listing visible in marketplace for 7 days               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ CRON JOB (Daily at Midnight UTC)                         │
│ Checks: expires_at < NOW()  ◄── AUTOMATED!              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Auto-archive:                                            │
│ - status: 'archived'                                     │
│ - archived_at: NOW()                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Listing appears in "Archived Listings" page             │
│ User can relist for another 7 days                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 **VERIFICATION COMMANDS:**

### **Check if cron job exists:**
```sql
SELECT * FROM cron.job WHERE jobname = 'archive-expired-marketplace-listings';
```

### **See which listings will be archived next:**
```sql
SELECT id, title, expires_at, NOW() - expires_at AS overdue_by
FROM marketplace_listings
WHERE status = 'active' AND expires_at < NOW()
ORDER BY expires_at ASC;
```

### **Count listings by status:**
```sql
SELECT status, COUNT(*) 
FROM marketplace_listings 
GROUP BY status;
```

### **Check recent archived listings:**
```sql
SELECT id, title, created_at, expires_at, archived_at
FROM marketplace_listings
WHERE status = 'archived'
ORDER BY archived_at DESC
LIMIT 10;
```

---

## 🧪 **MANUAL TESTING:**

### **Test 1: Create a new listing**
1. Create a listing via UI
2. Check database:
   ```sql
   SELECT id, title, created_at, expires_at 
   FROM marketplace_listings 
   WHERE status = 'active' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
3. **Expected:** `expires_at` should be `created_at + 7 days` ✅

### **Test 2: Force archive now**
1. Create a test listing
2. Manually set expiry to past:
   ```sql
   UPDATE marketplace_listings 
   SET expires_at = NOW() - INTERVAL '1 hour' 
   WHERE id = 'YOUR_LISTING_ID';
   ```
3. Run archive manually:
   ```sql
   UPDATE marketplace_listings 
   SET status = 'archived', archived_at = NOW() 
   WHERE status = 'active' AND expires_at < NOW();
   ```
4. **Expected:** Test listing should be archived ✅

### **Test 3: Verify cron runs**
1. Check cron job logs (if using pg_cron):
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'archive-expired-marketplace-listings')
   ORDER BY start_time DESC 
   LIMIT 5;
   ```
2. **Expected:** See daily runs at midnight ✅

---

## 📋 **SUMMARY OF CHANGES:**

| File | Change | Status |
|------|--------|--------|
| `/supabase/functions/server/index.tsx` | Added `expires_at` to listing creation | ✅ **DONE** |
| `/supabase/functions/cron-archive-listings/index.ts` | Created cron edge function | ✅ **DONE** |
| `/MARKETPLACE_AUTO_ARCHIVE_SETUP.sql` | SQL setup script | ✅ **DONE** |
| `/MARKETPLACE_AUTO_ARCHIVE_README.md` | Documentation | ✅ **DONE** |

---

## ⚠️ **IMPORTANT NOTES:**

1. **Existing listings:** Need to run SQL backfill script to set `expires_at`
2. **Timezone:** All times are UTC (cron runs at midnight UTC)
3. **Relist:** Users can relist archived listings for another 7 days
4. **Grace period:** None - listings archive exactly 7 days after creation
5. **Manual archive:** Users can manually archive anytime via UI

---

## 🎯 **NEXT STEPS:**

1. ✅ Code changes deployed (already done)
2. ⏳ **YOU NEED TO DO:** Run `/MARKETPLACE_AUTO_ARCHIVE_SETUP.sql` in Supabase SQL Editor
3. ⏳ **Optional:** Deploy cron edge function OR use pg_cron (choose one)
4. ✅ Test by creating a new listing and verifying `expires_at` is set

---

## 🆘 **TROUBLESHOOTING:**

### **Listings still not archiving?**

**Check 1:** Verify cron job exists
```sql
SELECT * FROM cron.job WHERE jobname = 'archive-expired-marketplace-listings';
```

**Check 2:** Verify listings have expiry
```sql
SELECT COUNT(*) FROM marketplace_listings WHERE status = 'active' AND expires_at IS NULL;
-- Should return 0
```

**Check 3:** Check cron execution logs
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'archive-expired-marketplace-listings')
ORDER BY start_time DESC;
```

**Check 4:** Manually trigger archive
```sql
UPDATE marketplace_listings 
SET status = 'archived', archived_at = NOW() 
WHERE status = 'active' AND expires_at < NOW();
```

---

## 📞 **SUPPORT:**

If issues persist after running setup SQL:
1. Check Supabase logs for errors
2. Verify `pg_cron` extension is enabled
3. Check service role permissions
4. Try Edge Function cron instead of pg_cron

---

**System fixed and ready for deployment! 🚀**

**Last Updated:** January 12, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
