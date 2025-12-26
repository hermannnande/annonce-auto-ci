-- ========================================
-- SCRIPT D'APPLICATION DES MODIFICATIONS
-- À EXÉCUTER DANS SUPABASE SQL EDITOR
-- ========================================

-- 1. Ajouter les colonnes à la table messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- 2. Index pour les réponses
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id);

-- 3. Commentaires pour documentation
COMMENT ON COLUMN messages.attachments IS 'Array JSON des pièces jointes: [{type: "image", url: "...", name: "..."}]';
COMMENT ON COLUMN messages.reply_to_id IS 'ID du message auquel ce message répond';

-- ========================================
-- ✅ Migration SQL terminée !
-- ========================================

-- ÉTAPE SUIVANTE : Créer le bucket Storage
-- Allez dans Storage → Create bucket
-- Nom: message-attachments
-- Public bucket: OUI (pour accès direct aux fichiers)
-- RLS activée: OUI

-- Ensuite, créez ces politiques RLS pour le bucket:

-- Politique 1: Lecture (SELECT)
-- Nom: "Users can view attachments in their conversations"
-- Target roles: authenticated
-- Policy definition (SELECT):
/*
bucket_id = 'message-attachments' AND (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    AND storage.foldername(name)[1] = c.id::text
  )
)
*/

-- Politique 2: Upload (INSERT)
-- Nom: "Users can upload attachments to their conversations"
-- Target roles: authenticated
-- Policy definition (INSERT):
/*
bucket_id = 'message-attachments' AND (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    AND storage.foldername(name)[1] = c.id::text
  )
)
*/

-- Politique 3: Suppression (DELETE)
-- Nom: "Users can delete their own attachments"
-- Target roles: authenticated
-- Policy definition (DELETE):
/*
bucket_id = 'message-attachments' AND (
  auth.uid() IN (
    SELECT sender_id FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE storage.foldername(name)[1] = c.id::text
  )
)
*/




