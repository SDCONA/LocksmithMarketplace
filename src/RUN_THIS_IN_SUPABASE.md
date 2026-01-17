# 🎯 HOW TO IMPORT TRANSPONDER DATA (NO SCRIPTS NEEDED!)

## You're right - you can't run Node.js scripts in Figma Make!

Instead, I've created a **complete SQL file** you can simply copy and paste.

## ⚡ Quick Instructions (3 Steps)

### Step 1: Open the SQL File
Open the file: `/TRANSPONDER_DATA_ALL_BRANDS_READY.sql`

### Step 2: Copy Everything
- Select all content (Ctrl+A or Cmd+A)
- Copy it (Ctrl+C or Cmd+C)

### Step 3: Run in Supabase
1. Go to your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar  
3. Click **"New Query"**
4. Paste the entire SQL content
5. Click **"Run"** (or press Ctrl+Enter)

That's it! ✅

## What This Does

The SQL file will:
- ✅ Create the `transponder_fitments` table (if it doesn't exist)
- ✅ Insert **2000+ vehicle entries** from **47 brands**
- ✅ Set up indexes for fast queries
- ✅ Enable RLS policies for security
- ✅ Ready to use for the transponder lookup features!

## Verify It Worked

After running the SQL, test it with:

```sql
-- Should return ~2000
SELECT COUNT(*) FROM transponder_fitments;

-- Should return 47 brands
SELECT vehicle_make, COUNT(*) as total 
FROM transponder_fitments 
GROUP BY vehicle_make 
ORDER BY total DESC;

-- Test a random question
SELECT * FROM transponder_fitments 
WHERE difficulty_level = 2 
ORDER BY RANDOM() 
LIMIT 1;
```

## Troubleshooting

**"Table already exists" error:**  
The SQL uses `CREATE TABLE IF NOT EXISTS`, so it won't break. If you want to start fresh:
```sql
DROP TABLE IF EXISTS transponder_fitments CASCADE;
```
Then run the main SQL file again.

**"Permission denied" error:**  
Make sure you're logged into Supabase with admin/owner permissions.

---

**Need help?** The complete data is in `/TRANSPONDER_DATA_ALL_BRANDS_READY.sql`