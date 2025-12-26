-- ============================================
-- MESSAGES VOCAUX - MIGRATION
-- ============================================

-- 1. Ajouter les colonnes audio
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_duration INTEGER DEFAULT 0;

-- 2. Ajouter un index pour la performance
CREATE INDEX IF NOT EXISTS idx_messages_audio_url 
ON messages(audio_url) 
WHERE audio_url IS NOT NULL;

-- 3. Commentaires
COMMENT ON COLUMN messages.audio_url IS 'URL du fichier audio (Supabase Storage)';
COMMENT ON COLUMN messages.audio_duration IS 'Durée du message vocal en secondes';

