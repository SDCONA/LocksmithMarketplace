-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎮 TRANSPONDER MASTER GAME - COMPLETE game_sessions TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
-- Created: January 16, 2026
-- Purpose: Complete game sessions table with save/resume functionality
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase → SQL Editor → New Query
-- 2. Copy this ENTIRE file
-- 3. Paste and click "Run" (or Ctrl+Enter)
-- 4. Done! ✅
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop existing table if exists (WARNING: This deletes all game session data!)
-- Comment out the next line if you want to preserve existing data
DROP TABLE IF EXISTS game_sessions CASCADE;

-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User identification (nullable for guest mode)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id TEXT, -- For guest users (stored in localStorage)
  
  -- Game metadata
  game_mode TEXT NOT NULL CHECK (game_mode IN ('classic', 'practice', 'endless', 'daily', 'expert')),
  
  -- Final statistics (when game completes)
  final_score INTEGER NOT NULL DEFAULT 0,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  player_level INTEGER NOT NULL DEFAULT 1,
  accuracy DECIMAL(5,2) DEFAULT 0.00,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Save & Resume functionality
  is_paused BOOLEAN DEFAULT false,
  answered_question_ids UUID[] DEFAULT '{}', -- Changed to UUID[] for proper foreign key support
  current_lives INTEGER DEFAULT 3,
  current_streak INTEGER DEFAULT 0,
  current_score INTEGER DEFAULT 0,
  current_power_ups JSONB DEFAULT '{"timeBoost": 3, "fiftyFifty": 2, "skip": 2, "doublePoints": 1, "shield": 1}'::jsonb,
  
  -- Constraints
  CONSTRAINT valid_accuracy CHECK (accuracy >= 0 AND accuracy <= 100),
  CONSTRAINT valid_lives CHECK (current_lives >= 0),
  CONSTRAINT valid_scores CHECK (final_score >= 0 AND current_score >= 0)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Index for finding user's games
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id) WHERE user_id IS NOT NULL;

-- Index for finding guest games
CREATE INDEX idx_game_sessions_guest_id ON game_sessions(guest_id) WHERE guest_id IS NOT NULL;

-- Index for finding paused games quickly
CREATE INDEX idx_game_sessions_paused ON game_sessions(user_id, is_paused) WHERE is_paused = true;

-- Index for leaderboard queries (completed games only)
CREATE INDEX idx_game_sessions_leaderboard ON game_sessions(game_mode, final_score DESC, completed_at DESC) 
  WHERE completed_at IS NOT NULL AND user_id IS NOT NULL;

-- Index for user stats aggregation
CREATE INDEX idx_game_sessions_completed ON game_sessions(user_id, completed_at) 
  WHERE completed_at IS NOT NULL;

-- Index for daily/weekly leaderboards
CREATE INDEX idx_game_sessions_date_range ON game_sessions(completed_at, game_mode, final_score DESC)
  WHERE completed_at IS NOT NULL AND user_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own game sessions
DROP POLICY IF EXISTS "Users can view own game sessions" ON game_sessions;
CREATE POLICY "Users can view own game sessions"
  ON game_sessions FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own game sessions
DROP POLICY IF EXISTS "Users can insert own game sessions" ON game_sessions;
CREATE POLICY "Users can insert own game sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own game sessions
DROP POLICY IF EXISTS "Users can update own game sessions" ON game_sessions;
CREATE POLICY "Users can update own game sessions"
  ON game_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own game sessions
DROP POLICY IF EXISTS "Users can delete own game sessions" ON game_sessions;
CREATE POLICY "Users can delete own game sessions"
  ON game_sessions FOR DELETE
  USING (user_id = auth.uid());

-- Policy: Public can view leaderboard (completed games only, no personal data)
DROP POLICY IF EXISTS "Public can view completed games for leaderboard" ON game_sessions;
CREATE POLICY "Public can view completed games for leaderboard"
  ON game_sessions FOR SELECT
  USING (completed_at IS NOT NULL AND is_paused = false);

-- Policy: Admins can view all game sessions
DROP POLICY IF EXISTS "Admins can view all game sessions" ON game_sessions;
CREATE POLICY "Admins can view all game sessions"
  ON game_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins_a7e285ba 
      WHERE user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGER FOR updated_at
-- ═══════════════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;
CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMENTS FOR DOCUMENTATION
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE game_sessions IS 'Stores all Transponder Master game sessions with save/resume support';
COMMENT ON COLUMN game_sessions.user_id IS 'User ID from auth.users (null for guests)';
COMMENT ON COLUMN game_sessions.guest_id IS 'Temporary ID for guest users (stored in localStorage)';
COMMENT ON COLUMN game_sessions.is_paused IS 'True if player clicked Save & Exit during level complete screen';
COMMENT ON COLUMN game_sessions.answered_question_ids IS 'Array of transponder_fitments IDs already answered (to avoid repeats)';
COMMENT ON COLUMN game_sessions.current_lives IS 'Lives remaining when game was paused';
COMMENT ON COLUMN game_sessions.current_streak IS 'Current answer streak when game was paused';
COMMENT ON COLUMN game_sessions.current_score IS 'Current score when game was paused (may differ from final_score)';
COMMENT ON COLUMN game_sessions.current_power_ups IS 'JSON object with remaining power-ups when paused';
COMMENT ON COLUMN game_sessions.completed_at IS 'Timestamp when game ended (null for paused/incomplete games)';

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'game_sessions' 
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'game_sessions';

-- Check RLS policies
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'game_sessions';

-- ═══════════════════════════════════════════════════════════════════════════════
-- SUCCESS! ✅
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Backend routes will now be able to save/load game sessions
-- 3. Leaderboard will populate with real data
-- 4. Users can save and resume games
-- 
-- ═══════════════════════════════════════════════════════════════════════════════
