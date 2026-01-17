-- ═══════════════════════════════════════════════════════════════
-- 🗄️ TRANSPONDER FITMENT DATABASE - CENTRALIZED DATA
-- Created: January 11, 2026
-- Version: 1.0.0
-- Purpose: Centralized transponder data for lookup features
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- TABLE: transponder_fitments
-- Centralized transponder compatibility database
-- ────────────────────────────────────────────────────────────────

CREATE TABLE transponder_fitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vehicle Information
  vehicle_make VARCHAR(50) NOT NULL,
  vehicle_model VARCHAR(100) NOT NULL,
  vehicle_years VARCHAR(30) NOT NULL,        -- Display: "2012-2015" or "2014+"
  year_start INTEGER NOT NULL,                -- Numeric: 2012
  year_end INTEGER,                           -- Numeric: 2015 (NULL for "2014+")
  platform_code VARCHAR(50),                  -- "F30", "E90", etc.
  
  -- Transponder Information
  transponder_type VARCHAR(150) NOT NULL,     -- "ID49 / Hitag Pro"
  oem_key VARCHAR(150),                       -- For some brands (mostly Ford)
  
  -- Game Metadata
  category VARCHAR(20) DEFAULT 'car',         -- 'car' or 'motorcycle'
  difficulty_level INTEGER DEFAULT 2,         -- 1 (easy) to 5 (hard)
  
  -- Analytics & Tracking
  times_asked INTEGER DEFAULT 0,              -- How many times in game
  times_correct INTEGER DEFAULT 0,            -- How many correct answers
  accuracy_rate DECIMAL(5,2) DEFAULT 0,       -- Auto-calculated %
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_difficulty CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  CONSTRAINT valid_category CHECK (category IN ('car', 'motorcycle')),
  CONSTRAINT valid_accuracy CHECK (accuracy_rate >= 0 AND accuracy_rate <= 100),
  CONSTRAINT valid_year_range CHECK (year_start >= 1940 AND year_start <= 2030)
);

-- Indexes for optimal game query performance
CREATE INDEX idx_fitments_make ON transponder_fitments(vehicle_make);
CREATE INDEX idx_fitments_difficulty ON transponder_fitments(difficulty_level);
CREATE INDEX idx_fitments_year_range ON transponder_fitments(year_start, year_end);
CREATE INDEX idx_fitments_category ON transponder_fitments(category);
CREATE INDEX idx_fitments_make_difficulty ON transponder_fitments(vehicle_make, difficulty_level);
CREATE INDEX idx_fitments_transponder_type ON transponder_fitments(transponder_type);

-- RLS Policies
ALTER TABLE transponder_fitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view transponder fitments"
  ON transponder_fitments FOR SELECT
  USING (true);

-- Only server (admin client) can insert/update
-- No INSERT/UPDATE policies for regular users

-- ────────────────────────────────────────────────────────────────
-- FUNCTION: Auto-update updated_at timestamp
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_transponder_fitments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transponder_fitments_timestamp
  BEFORE UPDATE ON transponder_fitments
  FOR EACH ROW
  EXECUTE FUNCTION update_transponder_fitments_updated_at();

-- ────────────────────────────────────────────────────────────────
-- FUNCTION: Update accuracy rate after game
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_transponder_accuracy(
  p_vehicle_make VARCHAR(50),
  p_vehicle_model VARCHAR(100),
  p_vehicle_years VARCHAR(30),
  p_is_correct BOOLEAN
)
RETURNS void AS $$
BEGIN
  UPDATE transponder_fitments
  SET 
    times_asked = times_asked + 1,
    times_correct = times_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    accuracy_rate = CASE 
      WHEN times_asked + 1 > 0 THEN 
        ((times_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END)::DECIMAL / (times_asked + 1)) * 100
      ELSE 0 
    END
  WHERE vehicle_make = p_vehicle_make
    AND vehicle_model = p_vehicle_model
    AND vehicle_years = p_vehicle_years;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- ✅ TABLE CREATED - Ready for data insertion
-- ═══════════════════════════════════════════════════════════════

-- Next step: Run the INSERT statements from separate file
-- The data will be extracted from all 47 TransponderPage components
-- Total expected records: ~2000-3000 entries

-- To populate this table, run: TRANSPONDER_DATA_INSERT.sql