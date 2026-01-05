# CRITICAL: Lishi Database Schema & Implementation Notes

## ⚠️ ALWAYS READ THIS BEFORE MODIFYING LISHI SYSTEM ⚠️

---

## Database Table: `hub_lishi_tools`

### **ACTUAL COLUMN STRUCTURE** (DO NOT DEVIATE FROM THIS):

```sql
CREATE TABLE hub_lishi_tools (
  id SERIAL PRIMARY KEY,
  tool_name TEXT NOT NULL,
  tool_code TEXT,
  brand TEXT NOT NULL,
  compatibility TEXT[],      -- ⚠️ Array of strings, NOT JSON objects!
  years TEXT,
  notes TEXT,
  profile TEXT,
  image_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ❌ COMMON MISTAKES TO AVOID

### 1. **WRONG: Using `fitment_data` column**
```javascript
// ❌ THIS WILL FAIL - Column does not exist!
{
  tool_name: 'HU36',
  brand: 'Mercedes-Benz',
  fitment_data: [
    { years: '1977-1985', model: '230' }  // ❌ WRONG!
  ]
}
```

### 2. **✅ CORRECT: Using `compatibility` array**
```javascript
// ✅ THIS WORKS - Correct schema
{
  tool_name: 'Original Lishi 2-in-1 Pick and Decoder HU36',
  tool_code: 'HU36',
  brand: 'Mercedes-Benz',
  compatibility: [
    'Mercedes 230 1977 – 1985',      // ✅ Format: "Brand Model Year – Year"
    'Mercedes 240D 1977 – 1985',     // Note: Use en dash (–) not hyphen (-)
    'Mercedes 280CE 1977 – 1985'
  ],
  years: '1973-1985',     // ✅ Overall year range
  notes: 'Depths: 1-4, Tool Spaces: 1-10',
  profile: 'HU36 / MB1 / M2',
  image_path: 'mercedes-benz-hu36'
}
```

---

## 🔑 KEY RULES

### Rule 1: Column Names
- ✅ Use: `compatibility` (TEXT[] array)
- ❌ Never use: `fitment_data` (does not exist)

### Rule 2: Data Format in `compatibility`
- ✅ Format: `'Brand Model StartYear – EndYear'` (single string with en dash)
- ✅ Example: `'Mercedes C Class 1997 – 2009'`, `'Chrysler Crossfire 2003 – 2008'`
- ✅ Display: Shows as clean list, one per line
- ❌ Never use objects: `{ years: '...', model: '...' }`
- ❌ Never use hyphens: Use en dash (–) not regular hyphen (-) for year ranges

### Rule 3: Image Paths
- ✅ Format: `'brand-name-toolcode'` (lowercase, hyphens)
- ✅ Example: `'mercedes-benz-hu36'`, `'mercedes-benz-hu64'`
- Full URL: `https://{projectId}.supabase.co/storage/v1/object/public/make-a7e285ba-hub-images/lishi-tools/{image_path}.png`

### Rule 4: Brand Names
- ✅ Use exact capitalization: `'Mercedes-Benz'`
- ✅ Use hyphens for multi-word brands: `'Alfa Romeo'` → `'Alfa Romeo'`
- ✅ Lishi page slugs: `'lishi-mercedes'`, `'lishi-alfa-romeo'`

---

## 📋 FRONTEND DISPLAY LOGIC

The `LishiBrandPage.tsx` component handles both formats:

1. **Priority 1:** Checks for `fitment_data` (legacy, structured format)
2. **Priority 2:** Falls back to `compatibility` (current format - array of strings)

```typescript
// Frontend will display compatibility as badges:
// "1997-2009 C Class" → Blue badge pill
```

---

## 🔄 AUTO-INSERT SYSTEM

### How It Works:
1. **First Visit:** When a brand page is visited and NO tools exist for that brand
2. **Auto-Insert Triggers:** Inserts predefined tools into database
3. **Subsequent Visits:** Loads from database (no re-insert)

### Mercedes-Benz Special Case:
- Has a **refresh endpoint**: `/make-server-a7e285ba/hub/lishi-tools/refresh-mercedes`
- **Deletes** existing Mercedes-Benz tools
- **Inserts** both HU36 and HU64 fresh data
- Called on every page load for Mercedes-Benz

---

## 🛠️ ADDING NEW TOOLS

### Template for Adding New Lishi Tool:

```javascript
{
  tool_name: 'Original Lishi 2-in-1 Pick and Decoder TOOLCODE',
  tool_code: 'TOOLCODE',                    // e.g., 'HU36', 'HU64'
  brand: 'Brand-Name',                       // EXACT capitalization
  compatibility: [                           // Array of strings!
    'YEAR-RANGE Model Name',
    '2005-2010 Model X',
    '2011-2015 Model Y'
  ],
  years: 'YEAR-YEAR',                       // Overall range
  notes: 'Technical specs and notes',
  profile: 'Profile code',
  image_path: 'brand-name-toolcode'         // lowercase-hyphenated
}
```

---

## 🚨 ERROR MESSAGES TO WATCH FOR

### Error: `"Could not find the 'fitment_data' column"`
**Cause:** Trying to insert data with `fitment_data` field  
**Fix:** Change to `compatibility` array format

### Error: `"column 'compatibility' is of type text[] but expression is of type json"`
**Cause:** Passing objects instead of strings in compatibility array  
**Fix:** Use string format: `'1997-2009 C Class'` not `{ years: '...', model: '...' }`

---

## 📍 ROUTING SYSTEM

### URL Hash Format:
- Main Hub: `#hub`
- Lishi Catalog: `#hub-lishi-catalog`
- Brand Page: `#hub-lishi-mercedes`, `#hub-lishi-bmw`, etc.

### Navigation Functions:
- ✅ Use: `navigateToPage('lishi-mercedes')` - Sets hash + state
- ❌ Never use: `setCurrentPage()` alone - Breaks refresh behavior

---

## 📦 STORAGE BUCKET

### Bucket Name: `make-a7e285ba-hub-images`
### Folder Structure:
```
make-a7e285ba-hub-images/
└── lishi-tools/
    ├── mercedes-benz-hu36.png
    ├── mercedes-benz-hu64.png
    └── [other-brand-toolcode].png
```

---

## ✅ PRE-FLIGHT CHECKLIST

Before adding/modifying Lishi tools:

- [ ] Using `compatibility` array (not `fitment_data`)
- [ ] Compatibility items are strings, not objects
- [ ] Brand name matches exactly (case-sensitive)
- [ ] Image path follows format: `brand-name-toolcode`
- [ ] Using `navigateToPage()` for routing (not just `setCurrentPage()`)
- [ ] Tool code is uppercase (e.g., 'HU36', 'HU64')

---

## 🔗 RELATED FILES

- **Database Schema:** Supabase `hub_lishi_tools` table
- **Server Routes:** `/supabase/functions/server/index.tsx` (lines 6500-7000)
- **Frontend Component:** `/components/lishi/LishiBrandPage.tsx`
- **Routing Logic:** `/components/HubSection.tsx`
- **Brand Pages:** `/components/lishi/*LishiPage.tsx`

---

## 📝 CURRENT BRANDS WITH DATA

✅ **Mercedes-Benz** - HU36, HU64 (auto-refresh on load)

---

**Last Updated:** 2026-01-04  
**Status:** Active - DO NOT IGNORE THIS DOCUMENT