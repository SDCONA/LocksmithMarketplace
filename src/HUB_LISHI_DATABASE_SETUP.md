# Hub Lishi Tools - Database Setup Guide

## Overview
This guide explains how to set up and use the Lishi tools database system for the Hub section.

---

## 📊 Database Architecture

### Table: `hub_lishi_tools`

**Columns:**
- `id` - Auto-incrementing primary key
- `tool_name` - Full name of the Lishi tool (e.g., "HU66 Lishi 2-in-1 Pick & Decoder")
- `tool_code` - Short code (e.g., "HU66", "HON66")
- `brand` - Car brand name (e.g., "Acura", "BMW", "Ford")
- `compatibility` - JSONB array of compatible models (e.g., `["MDX", "RDX", "TLX"]`)
- `years` - Year range as text (e.g., "2007-2020", "2015-Present")
- `notes` - Additional notes (e.g., "6 cuts", "Works with ignition only")
- `profile` - Key profile type (e.g., "HU66")
- `image_path` - Path to image in Hub storage bucket (e.g., "lishi/acura/hu66.jpg")
- `created_at` - Timestamp when created
- `updated_at` - Timestamp when last updated (auto-updates)

**Indexes:**
- `idx_hub_lishi_tools_brand` - Fast lookups by brand
- `idx_hub_lishi_tools_tool_code` - Fast lookups by tool code
- `idx_hub_lishi_tools_created_at` - Ordering by creation date

---

## 🔒 Security (RLS Policies)

**Public Read Access:**
- ✅ Anyone can view Lishi tools (no authentication required)

**Admin-Only Write Access:**
- ✅ Only admins can INSERT new tools
- ✅ Only admins can UPDATE existing tools
- ✅ Only admins can DELETE tools

**Security Note:** All write operations are protected by the `admins_a7e285ba` table.

---

## 🚀 Setup Instructions

### Step 1: Run the SQL Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `/database/hub_lishi_tools_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** or press `Ctrl/Cmd + Enter`
7. You should see: "Success. No rows returned"

### Step 2: Verify Table Creation

1. In Supabase Dashboard, go to **Table Editor**
2. Look for the table: `hub_lishi_tools`
3. Verify it has all the columns listed above
4. Check **Policies** tab to ensure RLS is enabled

### Step 3: Test the API (Optional)

You can test the API routes using curl or Postman:

```bash
# Get all Lishi tools
curl https://dpqbngyjehjjjohbxyhq.supabase.co/functions/v1/make-server-a7e285ba/hub/lishi-tools \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Get Lishi tools for Acura
curl "https://dpqbngyjehjjjohbxyhq.supabase.co/functions/v1/make-server-a7e285ba/hub/lishi-tools?brand=Acura" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 📡 API Routes

All routes are prefixed with: `/make-server-a7e285ba/hub/lishi-tools`

### 1. GET All Tools or Filter by Brand
```
GET /make-server-a7e285ba/hub/lishi-tools
GET /make-server-a7e285ba/hub/lishi-tools?brand=Acura
```

**Response:**
```json
{
  "tools": [
    {
      "id": 1,
      "tool_name": "HU66 Lishi 2-in-1 Pick & Decoder",
      "tool_code": "HU66",
      "brand": "Acura",
      "compatibility": ["MDX", "RDX", "TLX"],
      "years": "2007-2020",
      "notes": "6 cuts",
      "profile": "HU66",
      "image_path": "lishi/acura/hu66.jpg",
      "created_at": "2025-01-04T...",
      "updated_at": "2025-01-04T..."
    }
  ]
}
```

### 2. GET Single Tool by ID
```
GET /make-server-a7e285ba/hub/lishi-tools/:id
```

### 3. POST Create New Tool (Admin Only)
```
POST /make-server-a7e285ba/hub/lishi-tools
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "tool_name": "HU66 Lishi 2-in-1 Pick & Decoder",
  "tool_code": "HU66",
  "brand": "Acura",
  "compatibility": ["MDX", "RDX", "TLX"],
  "years": "2007-2020",
  "notes": "6 cuts",
  "profile": "HU66",
  "image_path": "lishi/acura/hu66.jpg"
}
```

### 4. PUT Update Tool (Admin Only)
```
PUT /make-server-a7e285ba/hub/lishi-tools/:id
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "tool_name": "Updated Tool Name",
  "notes": "Updated notes"
}
```

### 5. DELETE Tool (Admin Only)
```
DELETE /make-server-a7e285ba/hub/lishi-tools/:id
Authorization: Bearer {admin_access_token}
```

### 6. POST Bulk Insert (Admin Only)
```
POST /make-server-a7e285ba/hub/lishi-tools/bulk
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "tools": [
    {
      "tool_name": "HU66 Lishi 2-in-1",
      "tool_code": "HU66",
      "brand": "Acura",
      "compatibility": ["MDX", "RDX"]
    },
    {
      "tool_name": "HON66 Lishi 2-in-1",
      "tool_code": "HON66",
      "brand": "Acura",
      "compatibility": ["ILX"]
    }
  ]
}
```

---

## 🎯 Workflow: Adding Data from Screenshots

### When You Send Me Screenshots:

**I will:**
1. ✅ Extract all tool information from the screenshot
2. ✅ Organize the data into the proper format
3. ✅ Generate a bulk insert SQL statement or API call
4. ✅ Provide you with the formatted data to insert

**Example Output:**
```sql
INSERT INTO hub_lishi_tools (tool_name, tool_code, brand, compatibility, years, notes, profile)
VALUES
  ('HU66 Lishi 2-in-1 Pick & Decoder', 'HU66', 'Acura', '["MDX", "RDX", "TLX"]', '2007-2020', '6 cuts', 'HU66'),
  ('HON66 Lishi 2-in-1 Pick & Decoder', 'HON66', 'Acura', '["ILX", "NSX"]', '2013-2020', '6 cuts', 'HON66');
```

---

## 📝 Data Entry Tips

### Compatibility Field
- Store as JSON array: `["Model1", "Model2", "Model3"]`
- Use model names without years
- Examples: `["Civic", "Accord", "CR-V"]`

### Years Field
- Store as text string
- Examples: `"2007-2020"`, `"2015-Present"`, `"All Years"`

### Tool Code
- Use standard Lishi codes: `HU66`, `HON66`, `MIT8`, etc.
- Keep it short and recognizable

### Brand
- Use exact brand names matching the brand selector
- Examples: `"Acura"`, `"BMW"`, `"Ford"`
- Use same capitalization across all entries

---

## 🔄 Frontend Integration

The frontend automatically:
- ✅ Fetches tools from the database when you open a brand page
- ✅ Displays loading spinner while fetching
- ✅ Shows error message if fetch fails
- ✅ Displays "No tools available" if brand has no data yet
- ✅ Renders all tool information in a clean card layout

**No frontend code changes needed** when adding new tools - just insert data into the database!

---

## 🛠️ Updating Other Brand Pages

All 47 brand pages need to be updated to fetch from the database. I can do this by:

1. Creating a reusable component
2. Passing the brand name as a prop
3. Each page fetches its own brand data

**Would you like me to update all 47 brand pages now, or wait until you start adding data?**

---

## 📊 Sample Data

Here's an example of how data should look for a complete brand:

```json
[
  {
    "tool_name": "HU66 Lishi 2-in-1 Pick & Decoder",
    "tool_code": "HU66",
    "brand": "Acura",
    "compatibility": ["MDX", "RDX", "TLX", "ZDX"],
    "years": "2007-2020",
    "notes": "6 cuts, works with ignition and doors",
    "profile": "HU66",
    "image_path": "lishi/acura/hu66.jpg"
  },
  {
    "tool_name": "HON66 Lishi 2-in-1 Pick & Decoder",
    "tool_code": "HON66",
    "brand": "Acura",
    "compatibility": ["ILX", "NSX", "RLX"],
    "years": "2013-2020",
    "notes": "6 cuts, Honda profile",
    "profile": "HON66",
    "image_path": "lishi/acura/hon66.jpg"
  }
]
```

---

## ✅ Checklist

Before adding data:
- [ ] SQL schema has been run in Supabase
- [ ] Table `hub_lishi_tools` exists
- [ ] RLS policies are enabled
- [ ] Server routes are working
- [ ] You are logged in as an admin (for write operations)

Ready to add data:
- [ ] Screenshot received
- [ ] Data extracted and formatted
- [ ] Bulk insert statement generated
- [ ] Data inserted into database
- [ ] Frontend automatically displays new data

---

## 🎉 You're All Set!

The system is now ready to receive Lishi tool data. Just send me screenshots and I'll:
1. Extract the data
2. Format it properly
3. Generate the SQL or API call
4. You run it in Supabase
5. Data appears automatically on the frontend!

**Send your first screenshot whenever you're ready!** 📸
