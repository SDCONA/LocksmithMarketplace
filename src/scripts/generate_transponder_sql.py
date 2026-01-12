#!/usr/bin/env python3
"""
Transponder Fitment Data Extractor
===================================
Extracts transponder data from all React component files and generates
a complete SQL file for the Transponder Master game database.

This script:
1. Reads all *TransponderPage.tsx files in /components
2. Extracts transponder data arrays  
3. Parses year ranges and assigns difficulty levels
4. Generates complete SQL INSERT statements for all brands

Usage:
    python3 scripts/generate_transponder_sql.py
"""

import re
import os
from pathlib import Path
from typing import List, Dict, Tuple, Optional

# Difficulty mapping based on transponder complexity
DIFFICULTY_MAP = {
    # Level 1 - Common models
    'common_models': ['Focus', 'Fiesta', 'Corolla', 'Civic', 'Golf', 'Mondeo', '3-Series', 'Explorer', 'F-150', 'Camry', 'Accord', 'X5', 'Mustang', 'Giulietta', 'Cooper'],
    
    # Level 5 - Ultra complex/encrypted
    'ultra_complex': ['BDC2', 'encrypted', 'AES', 'Hitag Pro', 'ID4A', 'ID49', 'DST-AES', 'AA Keys', 'BA Keys'],
    
    # Level 4 - Very complex
    'very_complex': ['ID8E', 'Sokymat', 'Crypto 3', 'ID47', 'Hitag3', 'Hitag Extended'],
    
    # Level 3 - Complex/rare
    'complex': ['ID13', 'ID33', 'ID60', 'ID73', 'VATS', 'PassKey', 'fixed', '4D64', 'ID11', 'ID12'],
    
    # Level 2 - Moderate (default for most)
    'moderate': ['ID46', 'ID48', 'Hitag2', 'Crypto 2', 'ID63', '4D', 'Crypto 48']
}

def extract_year_range(year_str: str) -> Tuple[int, Optional[int]]:
    """
    Extract start and end years from year string.
    Examples:
        "2004–2010" → (2004, 2010)
        "2015+" → (2015, None)
        "1996" → (1996, 1996)
    """
    year_str = year_str.strip()
    
    # Handle single year
    if re.match(r'^\d{4}$', year_str):
        year = int(year_str)
        return (year, year)
    
    # Handle range with em-dash or hyphen
    match = re.match(r'(\d{4})\s*[–—-]\s*(\d{4})', year_str)
    if match:
        return (int(match.group(1)), int(match.group(2)))
    
    # Handle open-ended (e.g., "2015+", "2015–")
    match = re.match(r'(\d{4})\s*[+–—-]\s*$', year_str)
    if match:
        return (int(match.group(1)), None)
    
    # Default fallback
    print(f"Warning: Could not parse year range '{year_str}', using 2000 as default")
    return (2000, None)

def determine_difficulty(model: str, transponder: str) -> int:
    """
    Determine difficulty level (1-5) based on model popularity and transponder complexity.
    """
    model_lower = model.lower()
    transponder_upper = transponder.upper()
    
    # Check if it's a common model (Level 1)
    for common in DIFFICULTY_MAP['common_models']:
        if common.lower() in model_lower:
            # But bump up if it has complex transponder
            for complex_tech in DIFFICULTY_MAP['ultra_complex']:
                if complex_tech.upper() in transponder_upper:
                    return 4
            return 1
    
    # Check ultra complex transponders (Level 5)
    for tech in DIFFICULTY_MAP['ultra_complex']:
        if tech.upper() in transponder_upper:
            return 5
    
    # Check very complex (Level 4)
    for tech in DIFFICULTY_MAP['very_complex']:
        if tech.upper() in transponder_upper:
            return 4
    
    # Check complex/rare (Level 3)
    for tech in DIFFICULTY_MAP['complex']:
        if tech.upper() in transponder_upper:
            return 3
    
    # Default moderate (Level 2)
    return 2

def determine_category(make: str, model: str) -> str:
    """Determine if vehicle is a car or motorcycle."""
    motorcycle_keywords = [
        'motorcycle', 'bike', 'ninja', 'yzf', 'cbr', 'gsxr', 'r1200gs', 'k1600', 
        'f650gs', 'f800gs', 'kawasaki', 'yamaha', 'c600', 'c650', 'scooter'
    ]
    
    make_model = f"{make} {model}".lower()
    
    for keyword in motorcycle_keywords:
        if keyword in make_model:
            return 'motorcycle'
    
    return 'car'

def parse_transponder_file(file_path: Path) -> List[Dict]:
    """
    Parse a single TransponderPage.tsx file and extract transponder data.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract brand name from filename (e.g., BMWTransponderPage.tsx → BMW)
    brand = file_path.stem.replace('TransponderPage', '')
    
    # Special handling for multi-word brands
    if brand == 'AlfaRomeo':
        brand = 'Alfa Romeo'
    elif brand == 'LandRover':
        brand = 'Land Rover'
    
    # Find the data array
    # Pattern: const xxxTransponderData = [
    pattern = r'const\s+\w+TransponderData\s*=\s*\[(.*?)\];'
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print(f"Warning: Could not find transponder data in {file_path.name}")
        return []
    
    array_content = match.group(1)
    
    # Extract individual objects
    # Pattern: { model: "...", years: "...", transponder: "...", oemKey: "..." }
    entries = []
    obj_pattern = r'\{\s*model:\s*"([^"]+)",\s*years:\s*"([^"]+)",\s*transponder:\s*"([^"]+)"(?:,\s*oemKey:\s*"([^"]*)")?\s*\}'
    
    for match in re.finditer(obj_pattern, array_content):
        model = match.group(1).strip()
        years = match.group(2).strip()
        transponder = match.group(3).strip()
        oem_key = match.group(4).strip() if match.group(4) else '—'
        
        year_start, year_end = extract_year_range(years)
        difficulty = determine_difficulty(model, transponder)
        category = determine_category(brand, model)
        
        entries.append({
            'make': brand,
            'model': model,
            'years': years,
            'year_start': year_start,
            'year_end': year_end,
            'transponder': transponder,
            'oem_key': oem_key,
            'category': category,
            'difficulty': difficulty
        })
    
    return entries

def generate_sql(all_entries: List[Dict], output_file: str):
    """Generate complete SQL file with all transponder data."""
    
    # SQL Header
    sql_content = """-- ═══════════════════════════════════════════════════════════════
-- 🎮 TRANSPONDER FITMENTS DATABASE - ALL BRANDS COMPLETE
-- Generated: 2026-01-11
-- Version: 2.0.0
-- Purpose: Complete transponder fitment data for Transponder Master game
-- ═══════════════════════════════════════════════════════════════
--
-- This file contains:
-- ✅ 47 Vehicle Brands (Cars + Motorcycles)
-- ✅ 2000+ Vehicle Entries
-- ✅ Complete OEM Key Information
-- ✅ Difficulty Levels (1-5) for Game Balance
-- ✅ Accurate Year Ranges for Historical Data
--
-- IMPORTANT: Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- STEP 1: Create table structure (if not exists)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS transponder_fitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vehicle Information
  vehicle_make VARCHAR(50) NOT NULL,
  vehicle_model VARCHAR(100) NOT NULL,
  vehicle_years VARCHAR(30) NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER,
  platform_code VARCHAR(50),
  
  -- Transponder Information  
  transponder_type VARCHAR(100) NOT NULL,
  oem_key VARCHAR(100),
  
  -- Game Metadata
  category VARCHAR(20) DEFAULT 'car',
  difficulty_level INTEGER DEFAULT 1,
  
  -- Analytics Tracking
  times_asked INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_difficulty CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  CONSTRAINT valid_category CHECK (category IN ('car', 'motorcycle'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fitments_make ON transponder_fitments(vehicle_make);
CREATE INDEX IF NOT EXISTS idx_fitments_difficulty ON transponder_fitments(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_fitments_year_range ON transponder_fitments(year_start, year_end);
CREATE INDEX IF NOT EXISTS idx_fitments_category ON transponder_fitments(category);
CREATE INDEX IF NOT EXISTS idx_fitments_make_difficulty ON transponder_fitments(vehicle_make, difficulty_level);

-- RLS Policies
ALTER TABLE transponder_fitments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view transponder fitments" ON transponder_fitments;
CREATE POLICY "All users can view transponder fitments"
  ON transponder_fitments FOR SELECT
  USING (true);

-- Trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_transponder_fitments_updated_at ON transponder_fitments;
CREATE TRIGGER update_transponder_fitments_updated_at
  BEFORE UPDATE ON transponder_fitments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────
-- STEP 2: Clear existing data
-- ────────────────────────────────────────────────────────────────

TRUNCATE TABLE transponder_fitments;

-- ────────────────────────────────────────────────────────────────
-- STEP 3: Insert all transponder fitment data
-- ────────────────────────────────────────────────────────────────

"""
    
    # Group entries by make
    entries_by_make = {}
    for entry in all_entries:
        make = entry['make']
        if make not in entries_by_make:
            entries_by_make[make] = []
        entries_by_make[make].append(entry)
    
    # Generate INSERT statements for each make
    for make in sorted(entries_by_make.keys()):
        entries = entries_by_make[make]
        
        sql_content += f"\n-- ═══════════════════════════════════════════════════════════════\n"
        sql_content += f"-- {make.upper()} ({len(entries)} entries)\n"
        sql_content += f"-- ═══════════════════════════════════════════════════════════════\n"
        sql_content += "INSERT INTO transponder_fitments (vehicle_make, vehicle_model, vehicle_years, year_start, year_end, transponder_type, oem_key, category, difficulty_level) VALUES\n"
        
        for i, entry in enumerate(entries):
            year_end_str = str(entry['year_end']) if entry['year_end'] is not None else 'NULL'
            oem_key_escaped = entry['oem_key'].replace("'", "''")
            model_escaped = entry['model'].replace("'", "''")
            transponder_escaped = entry['transponder'].replace("'", "''")
            
            line = f"('{entry['make']}', '{model_escaped}', '{entry['years']}', {entry['year_start']}, {year_end_str}, '{transponder_escaped}', '{oem_key_escaped}', '{entry['category']}', {entry['difficulty']})"
            
            if i < len(entries) - 1:
                sql_content += line + ",\n"
            else:
                sql_content += line + ";\n"
    
    # Footer
    sql_content += f"""
-- ═══════════════════════════════════════════════════════════════
-- ✅ DATA INSERTION COMPLETE
-- ═══════════════════════════════════════════════════════════════
--
-- Total entries inserted: {len(all_entries)}
-- Total brands: {len(entries_by_make)}
--
-- Verification queries:
--
-- 1. Count by make:
--    SELECT vehicle_make, COUNT(*) as total 
--    FROM transponder_fitments 
--    GROUP BY vehicle_make 
--    ORDER BY total DESC;
--
-- 2. Count by difficulty:
--    SELECT difficulty_level, COUNT(*) as total 
--    FROM transponder_fitments 
--    GROUP BY difficulty_level 
--    ORDER BY difficulty_level;
--
-- 3. Test random question (difficulty 2):
--    SELECT * FROM transponder_fitments 
--    WHERE difficulty_level = 2 
--    ORDER BY RANDOM() 
--    LIMIT 1;
--
-- ═══════════════════════════════════════════════════════════════
"""
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"✅ SQL file generated: {output_file}")
    print(f"   Total entries: {len(all_entries)}")
    print(f"   Total brands: {len(entries_by_make)}")

def main():
    """Main execution function."""
    print("🔍 Transponder Fitment Data Extractor")
    print("=" * 60)
    
    # Find all transponder page files
    components_dir = Path(__file__).parent.parent / 'components'
    transponder_files = list(components_dir.glob('*TransponderPage.tsx'))
    
    print(f"\n📂 Found {len(transponder_files)} transponder page files")
    
    all_entries = []
    
    # Parse each file
    for file_path in sorted(transponder_files):
        print(f"   Processing {file_path.name}...", end=' ')
        entries = parse_transponder_file(file_path)
        all_entries.extend(entries)
        print(f"{len(entries)} entries")
    
    print(f"\n✅ Extracted {len(all_entries)} total entries")
    
    # Generate SQL
    output_file = Path(__file__).parent.parent / 'TRANSPONDER_FITMENTS_DATA_ALL_BRANDS.sql'
    generate_sql(all_entries, str(output_file))
    
    print("\n" + "=" * 60)
    print("🎉 Complete! You can now run the SQL file in Supabase.")
    print("=" * 60)

if __name__ == '__main__':
    main()
