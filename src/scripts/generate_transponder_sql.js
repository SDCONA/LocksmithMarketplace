#!/usr/bin/env node
/**
 * Transponder Fitment Data Extractor (Node.js version)
 * =====================================================
 * Extracts transponder data from all React component files and generates
 * a complete SQL file for the transponder database.
 *
 * Usage:
 *     node scripts/generate_transponder_sql.js
 *
 * Requirements: Node.js 14+
 */

const fs = require('fs');
const path = require('path');

// Difficulty mapping based on transponder complexity
const DIFFICULTY_MAP = {
  // Level 1 - Common models
  commonModels: ['Focus', 'Fiesta', 'Corolla', 'Civic', 'Golf', 'Mondeo', '3-Series', 'Explorer', 'F-150', 'Camry', 'Accord', 'X5', 'Mustang', 'Giulietta', 'Cooper'],
  
  // Level 5 - Ultra complex/encrypted
  ultraComplex: ['BDC2', 'encrypted', 'AES', 'Hitag Pro', 'ID4A', 'ID49', 'DST-AES', 'AA Keys', 'BA Keys'],
  
  // Level 4 - Very complex
  veryComplex: ['ID8E', 'Sokymat', 'Crypto 3', 'ID47', 'Hitag3', 'Hitag Extended'],
  
  // Level 3 - Complex/rare
  complex: ['ID13', 'ID33', 'ID60', 'ID73', 'VATS', 'PassKey', 'fixed', '4D64', 'ID11', 'ID12'],
  
  // Level 2 - Moderate (default for most)
  moderate: ['ID46', 'ID48', 'Hitag2', 'Crypto 2', 'ID63', '4D', 'Crypto 48']
};

/**
 * Extract start and end years from year string
 */
function extractYearRange(yearStr) {
  yearStr = yearStr.trim();
  
  // Handle single year
  if (/^\d{4}$/.test(yearStr)) {
    const year = parseInt(yearStr);
    return [year, year];
  }
  
  // Handle range with em-dash or hyphen
  const rangeMatch = yearStr.match(/(\d{4})\s*[–—-]\s*(\d{4})/);
  if (rangeMatch) {
    return [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
  }
  
  // Handle open-ended (e.g., "2015+", "2015–")
  const openMatch = yearStr.match(/(\d{4})\s*[+–—-]\s*$/);
  if (openMatch) {
    return [parseInt(openMatch[1]), null];
  }
  
  // Default fallback
  console.warn(`Warning: Could not parse year range '${yearStr}', using 2000 as default`);
  return [2000, null];
}

/**
 * Determine difficulty level (1-5) based on model and transponder
 */
function determineDifficulty(model, transponder) {
  const modelLower = model.toLowerCase();
  const transponderUpper = transponder.toUpperCase();
  
  // Check if it's a common model (Level 1)
  for (const common of DIFFICULTY_MAP.commonModels) {
    if (modelLower.includes(common.toLowerCase())) {
      // But bump up if it has complex transponder
      for (const complex of DIFFICULTY_MAP.ultraComplex) {
        if (transponderUpper.includes(complex.toUpperCase())) {
          return 4;
        }
      }
      return 1;
    }
  }
  
  // Check ultra complex transponders (Level 5)
  for (const tech of DIFFICULTY_MAP.ultraComplex) {
    if (transponderUpper.includes(tech.toUpperCase())) {
      return 5;
    }
  }
  
  // Check very complex (Level 4)
  for (const tech of DIFFICULTY_MAP.veryComplex) {
    if (transponderUpper.includes(tech.toUpperCase())) {
      return 4;
    }
  }
  
  // Check complex/rare (Level 3)
  for (const tech of DIFFICULTY_MAP.complex) {
    if (transponderUpper.includes(tech.toUpperCase())) {
      return 3;
    }
  }
  
  // Default moderate (Level 2)
  return 2;
}

/**
 * Determine if vehicle is a car or motorcycle
 */
function determineCategory(make, model) {
  const motorcycleKeywords = [
    'motorcycle', 'bike', 'ninja', 'yzf', 'cbr', 'gsxr', 'r1200gs', 'k1600', 
    'f650gs', 'f800gs', 'kawasaki', 'yamaha', 'c600', 'c650', 'scooter'
  ];
  
  const makeModel = `${make} ${model}`.toLowerCase();
  
  for (const keyword of motorcycleKeywords) {
    if (makeModel.includes(keyword)) {
      return 'motorcycle';
    }
  }
  
  return 'car';
}

/**
 * Parse a single TransponderPage.tsx file
 */
function parseTransponderFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract brand name from filename
  let brand = path.basename(filePath, '.tsx').replace('TransponderPage', '');
  
  // Special handling for multi-word brands
  if (brand === 'AlfaRomeo') brand = 'Alfa Romeo';
  else if (brand === 'LandRover') brand = 'Land Rover';
  
  // Find the data array
  const arrayMatch = content.match(/const\s+\w+TransponderData\s*=\s*\[(.*?)\];/s);
  
  if (!arrayMatch) {
    console.warn(`Warning: Could not find transponder data in ${path.basename(filePath)}`);
    return [];
  }
  
  const arrayContent = arrayMatch[1];
  
  // Extract individual objects
  const entries = [];
  const objRegex = /\{\s*model:\s*"([^"]+)",\s*years:\s*"([^"]+)",\s*transponder:\s*"([^"]+)"(?:,\s*oemKey:\s*"([^"]*)")?\s*\}/g;
  
  let match;
  while ((match = objRegex.exec(arrayContent)) !== null) {
    const model = match[1].trim();
    const years = match[2].trim();
    const transponder = match[3].trim();
    const oemKey = match[4] ? match[4].trim() : '—';
    
    const [yearStart, yearEnd] = extractYearRange(years);
    const difficulty = determineDifficulty(model, transponder);
    const category = determineCategory(brand, model);
    
    entries.push({
      make: brand,
      model,
      years,
      yearStart,
      yearEnd,
      transponder,
      oemKey,
      category,
      difficulty
    });
  }
  
  return entries;
}

/**
 * Generate SQL file with all transponder data
 */
function generateSQL(allEntries, outputFile) {
  let sqlContent = `-- ═══════════════════════════════════════════════════════════════
-- 🎮 TRANSPONDER FITMENTS DATABASE - ALL BRANDS COMPLETE
-- Generated: ${new Date().toISOString().split('T')[0]}
-- Version: 2.0.0
-- Purpose: Complete transponder fitment data for Transponder Master game
-- ═══════════════════════════════════════════════════════════════
--
-- This file contains:
-- ✅ 47 Vehicle Brands (Cars + Motorcycles)
-- ✅ ${allEntries.length}+ Vehicle Entries
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

`;
  
  // Group entries by make
  const entriesByMake = {};
  allEntries.forEach(entry => {
    if (!entriesByMake[entry.make]) {
      entriesByMake[entry.make] = [];
    }
    entriesByMake[entry.make].push(entry);
  });
  
  // Generate INSERT statements for each make
  const makes = Object.keys(entriesByMake).sort();
  
  makes.forEach(make => {
    const entries = entriesByMake[make];
    
    sqlContent += `\n-- ═══════════════════════════════════════════════════════════════\n`;
    sqlContent += `-- ${make.toUpperCase()} (${entries.length} entries)\n`;
    sqlContent += `-- ═══════════════════════════════════════════════════════════════\n`;
    sqlContent += `INSERT INTO transponder_fitments (vehicle_make, vehicle_model, vehicle_years, year_start, year_end, transponder_type, oem_key, category, difficulty_level) VALUES\n`;
    
    entries.forEach((entry, i) => {
      const yearEndStr = entry.yearEnd !== null ? entry.yearEnd : 'NULL';
      const oemKeyEscaped = entry.oemKey.replace(/'/g, "''");
      const modelEscaped = entry.model.replace(/'/g, "''");
      const transponderEscaped = entry.transponder.replace(/'/g, "''");
      
      const line = `('${entry.make}', '${modelEscaped}', '${entry.years}', ${entry.yearStart}, ${yearEndStr}, '${transponderEscaped}', '${oemKeyEscaped}', '${entry.category}', ${entry.difficulty})`;
      
      if (i < entries.length - 1) {
        sqlContent += line + ',\n';
      } else {
        sqlContent += line + ';\n';
      }
    });
  });
  
  // Footer
  sqlContent += `
-- ═══════════════════════════════════════════════════════════════
-- ✅ DATA INSERTION COMPLETE
-- ═══════════════════════════════════════════════════════════════
--
-- Total entries inserted: ${allEntries.length}
-- Total brands: ${makes.length}
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
`;
  
  // Write to file
  fs.writeFileSync(outputFile, sqlContent, 'utf-8');
  
  console.log(`✅ SQL file generated: ${outputFile}`);
  console.log(`   Total entries: ${allEntries.length}`);
  console.log(`   Total brands: ${makes.length}`);
}

/**
 * Main execution function
 */
function main() {
  console.log('🔍 Transponder Fitment Data Extractor (Node.js)');
  console.log('='.repeat(60));
  
  // Find all transponder page files
  const componentsDir = path.join(__dirname, '..', 'components');
  const files = fs.readdirSync(componentsDir);
  const transponderFiles = files.filter(f => f.endsWith('TransponderPage.tsx'));
  
  console.log(`\n📂 Found ${transponderFiles.length} transponder page files`);
  
  const allEntries = [];
  
  // Parse each file
  transponderFiles.sort().forEach(filename => {
    const filePath = path.join(componentsDir, filename);
    process.stdout.write(`   Processing ${filename}... `);
    const entries = parseTransponderFile(filePath);
    allEntries.push(...entries);
    console.log(`${entries.length} entries`);
  });
  
  console.log(`\n✅ Extracted ${allEntries.length} total entries`);
  
  // Generate SQL
  const outputFile = path.join(__dirname, '..', 'TRANSPONDER_FITMENTS_DATA_ALL_BRANDS.sql');
  generateSQL(allEntries, outputFile);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Complete! You can now run the SQL file in Supabase.');
  console.log('='.repeat(60));
}

// Run the script
main();