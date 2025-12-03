-- ============================================
-- MIGRATION: Add images support to messages
-- ============================================

-- Add images column to messages table
-- This will store an array of image URLs (stored in Supabase Storage)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add index for messages with images (for faster queries)
CREATE INDEX IF NOT EXISTS idx_messages_with_images 
ON messages(conversation_id) 
WHERE images IS NOT NULL AND array_length(images, 1) > 0;

-- Update RLS policies if needed (messages should already have proper RLS from initial schema)
-- No changes needed since we're just adding a column to existing table

COMMENT ON COLUMN messages.images IS 'Array of image URLs stored in Supabase Storage (max 5 per message)';
