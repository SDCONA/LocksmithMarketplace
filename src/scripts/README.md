# Transponder Data Extraction Scripts

## Overview

These scripts automatically extract transponder fitment data from all brand-specific React component files and generate a complete SQL file for the transponder database.

## Why Use These Scripts?

The manual SQL file (`TRANSPONDER_FITMENTS_DATA.sql`) only contained **3 brands** (BMW, Audi, Ford) with ~300 entries. However, you have **47 brand-specific transponder pages** in your codebase containing over **2,000 vehicle entries**!

These scripts will:
- ✅ Extract data from all 47 `*TransponderPage.tsx` files
- ✅ Parse year ranges automatically (e.g., "2004–2010" → year_start: 2004, year_end: 2010)
- ✅ Assign intelligent difficulty levels (1-5) based on transponder complexity
- ✅ Categorize vehicles as 'car' or 'motorcycle'
- ✅ Generate a complete, ready-to-run SQL file

## Available Scripts

### 1. Node.js Version (Recommended)
**File:** `generate_transponder_sql.js`

**Requirements:** Node.js (already available in Figma Make)

**Usage:**
```bash
node scripts/generate_transponder_sql.js
```

### 2. Python Version
**File:** `generate_transponder_sql.py`

**Requirements:** Python 3.6+

**Usage:**
```bash
python3 scripts/generate_transponder_sql.py
```

## Output

Both scripts generate the same file:
```
TRANSPONDER_FITMENTS_DATA_ALL_BRANDS.sql
```

This SQL file will contain:
- Complete table structure with indexes
- RLS policies for security
- INSERT statements for all 2000+ vehicle entries
- Organized by brand (alphabetically)
- Verification queries

## Running the Generated SQL

1. **Run the extraction script:**
   ```bash
   node scripts/generate_transponder_sql.js
   ```

2. **Open Supabase SQL Editor:**
   - Go to your Supabase project
   - Navigate to SQL Editor

3. **Copy and paste the generated SQL:**
   - Open `TRANSPONDER_FITMENTS_DATA_ALL_BRANDS.sql`
   - Copy all contents
   - Paste into Supabase SQL Editor

4. **Execute:**
   - Click "Run" to create the table and insert all data

## Difficulty Level Logic

The script assigns difficulty levels (1-5) based on:

### Level 1 - Easy (Common Models)
- Popular vehicles: Focus, Fiesta, Corolla, Civic, Golf, 3-Series, F-150, etc.
- Common transponders: ID46, ID48, Hitag2

### Level 2 - Moderate (Default)
- Most standard vehicles
- Common transponder types

### Level 3 - Complex (Rare/Older)
- Fixed-code transponders: ID13, ID33
- Older systems: VATS, PassKey
- Less common models

### Level 4 - Very Complex
- Advanced crypto: ID47, Hitag3, Sokymat ID8E
- Extended Hitag systems

### Level 5 - Ultra Complex
- Encrypted systems: BDC2, AES, Hitag Pro
- Latest technology: ID49, DST-AES, ID4A
- Newest vehicles with encrypted keys

## Data Quality

The scripts automatically:
- Parse year ranges (handles "2015+", "2004–2010", "1996", etc.)
- Escape SQL special characters
- Detect motorcycles vs cars
- Handle missing OEM keys (defaults to "—")
- Validate transponder data format

## Troubleshooting

### "Could not find transponder data"
- Ensure all `*TransponderPage.tsx` files follow the pattern:
  ```typescript
  const xxxTransponderData = [
    { model: "...", years: "...", transponder: "...", oemKey: "..." },
    ...
  ];
  ```

### "Could not parse year range"
- Check for unusual year formats
- Script handles: "2004–2010", "2015+", "1996"
- Warning will be logged but script continues

### Missing entries
- Verify all brand files are in `/components` directory
- Check filename pattern: `*TransponderPage.tsx`

## Verification After Import

Run these queries in Supabase to verify data:

```sql
-- 1. Count total entries
SELECT COUNT(*) FROM transponder_fitments;

-- 2. Count by brand
SELECT vehicle_make, COUNT(*) as total 
FROM transponder_fitments 
GROUP BY vehicle_make 
ORDER BY total DESC;

-- 3. Count by difficulty
SELECT difficulty_level, COUNT(*) as total 
FROM transponder_fitments 
GROUP BY difficulty_level 
ORDER BY difficulty_level;

-- 4. Test random question (difficulty 2)
SELECT * FROM transponder_fitments 
WHERE difficulty_level = 2 
ORDER BY RANDOM() 
LIMIT 1;

-- 5. Check for motorcycles
SELECT COUNT(*) FROM transponder_fitments WHERE category = 'motorcycle';
```

## Expected Results

After running the script, you should have:
- **~2,000+ total entries** (vs 300 in old file)
- **47 brands** (vs 3 in old file)
- **Both cars and motorcycles**
- **Balanced difficulty distribution**
- **Complete year range coverage** (1995-2026+)

## Next Steps

After importing the data:
1. ✅ Verify data in Supabase
2. 🎮 Start building the Transponder Master game frontend
3. 🔧 Implement question generation logic
4. 📊 Test difficulty balance
5. 🎨 Create game UI components

## Support

If you encounter any issues:
1. Check the console output for warnings
2. Verify component file format
3. Ensure Node.js/Python is installed correctly
4. Check file permissions

---

**Created:** January 11, 2026
**Last Updated:** January 11, 2026