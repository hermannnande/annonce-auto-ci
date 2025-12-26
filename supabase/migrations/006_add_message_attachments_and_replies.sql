-- ========================================
-- AJOUT DES PIÈCES JOINTES ET RÉPONSES
-- ========================================

-- Ajouter les colonnes pour pièces jointes et réponses
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Index pour les réponses
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id);

-- Commentaires pour documentation
COMMENT ON COLUMN messages.attachments IS 'Array JSON des pièces jointes: [{type: "image", url: "...", name: "..."}]';
COMMENT ON COLUMN messages.reply_to_id IS 'ID du message auquel ce message répond';

-- ========================================
-- BUCKET STORAGE POUR MESSAGES
-- ========================================

-- Le bucket sera créé via l'interface Supabase ou via code
-- Nom suggéré: "message-attachments"
-- Politique: RLS activée, lecture publique pour les participants de la conversation

-- ========================================
-- ✅ Migration terminée !
-- ========================================




