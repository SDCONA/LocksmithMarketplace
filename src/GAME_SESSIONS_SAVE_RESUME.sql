-- =====================================================
-- ADD SAVE & RESUME COLUMNS TO game_sessions
-- =====================================================
-- Created: January 12, 2026
-- Purpose: Enable players to save progress and resume games later
-- 
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add columns for save/resume functionality
ALTER TABLE game_sessions 
  ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS answered_question_ids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS current_lives INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_score INTEGER DEFAULT 0;

-- Add index for finding paused games quickly
CREATE INDEX IF NOT EXISTS idx_game_sessions_paused 
  ON game_sessions(user_id, is_paused) 
  WHERE is_paused = true;

-- Add comment for documentation
COMMENT ON COLUMN game_sessions.is_paused IS 'True if player clicked Save & Exit during level complete screen';
COMMENT ON COLUMN game_sessions.answered_question_ids IS 'Array of transponder_fitments IDs already answered (to avoid repeats)';
COMMENT ON COLUMN game_sessions.current_lives IS 'Lives remaining when game was paused';
COMMENT ON COLUMN game_sessions.current_streak IS 'Current answer streak when game was paused';
COMMENT ON COLUMN game_sessions.current_score IS 'Current score when game was paused (may differ from final score field)';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify columns were added:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'game_sessions' 
-- AND column_name IN ('is_paused', 'answered_question_ids', 'current_lives', 'current_streak', 'current_score');
