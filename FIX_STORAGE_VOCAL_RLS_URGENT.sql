-- ============================================
-- FIX URGENT : RLS POLICIES STORAGE VOCAUX
-- ============================================
-- Correction des policies pour le bucket message-audios
-- Date : 26 Décembre 2024

-- Problème : Messages vocaux disparaissent car upload bloqué
-- Solution : Configurer les 2 policies Storage

-- ============================================
-- PRÉALABLE : VÉRIFIER QUE LE BUCKET EXISTE
-- ============================================

-- Si le bucket n'existe pas, le créer via Dashboard :
-- Storage → Create Bucket → Name: message-audios → Private

-- Ou via SQL (si extension storage activée) :
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'message-audios',
--   'message-audios',
--   false,
--   5242880, -- 5 MB max
--   ARRAY['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg']
-- );

-- ============================================
-- 1. SUPPRIMER ANCIENNES POLICIES (si existent)
-- ============================================

DROP POLICY IF EXISTS "Users can upload audio for own messages" ON storage.objects;
DROP POLICY IF EXISTS "Conversation participants can read audios" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload to message-audios" ON storage.objects;
DROP POLICY IF EXISTS "Public can read from message-audios" ON storage.objects;

-- ============================================
-- 2. POLICY UPLOAD (INSERT)
-- ============================================

-- Les utilisateurs authentifiés peuvent uploader dans leur dossier
CREATE POLICY "Users can upload audio for own messages"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-audios'
  AND (storage.foldername(name))[1] = 'messages'
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- ============================================
-- 3. POLICY LECTURE (SELECT)
-- ============================================

-- Les participants de la conversation peuvent lire les audios
CREATE POLICY "Conversation participants can read audios"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-audios'
  AND EXISTS (
    SELECT 1 
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.audio_url LIKE ('%' || (storage.objects.name)::text || '%')
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- ============================================
-- 4. POLICY UPDATE (Optionnel - permet remplacement)
-- ============================================

CREATE POLICY "Users can update own audios"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'message-audios'
  AND (storage.foldername(name))[1] = 'messages'
  AND (storage.foldername(name))[2] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'message-audios'
  AND (storage.foldername(name))[1] = 'messages'
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- ============================================
-- 5. POLICY DELETE (Optionnel - permet suppression)
-- ============================================

CREATE POLICY "Users can delete own audios"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-audios'
  AND (storage.foldername(name))[1] = 'messages'
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- ============================================
-- 6. VÉRIFICATION
-- ============================================

-- Lister toutes les policies Storage
SELECT 
  policyname,
  tablename,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%audio%' OR policyname LIKE '%message%'
ORDER BY policyname;

-- ============================================
-- 7. TEST (dans l'application)
-- ============================================

-- Test 1 : Enregistrer un message vocal
-- Test 2 : Vérifier l'upload dans Storage → message-audios
-- Test 3 : Vérifier la lecture (lecteur audio fonctionne)
-- Test 4 : Vérifier que seuls les participants peuvent lire

-- ============================================
-- STRUCTURE ATTENDUE DU PATH
-- ============================================

-- Format du chemin d'upload :
-- messages/{user_id}/{timestamp}.webm
-- Exemple : messages/123e4567-e89b-12d3-a456-426614174000/1735238400000.webm

-- ============================================
-- ALTERNATIVE : POLICIES PLUS PERMISSIVES (dev)
-- ============================================

-- Si les policies ci-dessus sont trop strictes pour le dev :

-- DROP POLICY IF EXISTS "Users can upload audio for own messages" ON storage.objects;
-- DROP POLICY IF EXISTS "Conversation participants can read audios" ON storage.objects;

-- CREATE POLICY "Authenticated can upload to message-audios"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'message-audios');

-- CREATE POLICY "Authenticated can read from message-audios"
-- ON storage.objects
-- FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'message-audios');

-- ⚠️ Attention : Ces policies sont moins sécurisées, à utiliser uniquement en dev !

-- ============================================
-- RÉSUMÉ
-- ============================================

-- ✅ Policy Upload : Utilisateurs peuvent uploader dans messages/{leur_uid}/
-- ✅ Policy Lecture : Participants conversation peuvent lire les audios
-- ✅ Policy Update : Utilisateurs peuvent modifier leurs propres audios
-- ✅ Policy Delete : Utilisateurs peuvent supprimer leurs propres audios

-- Cette configuration permet :
-- - Upload sécurisé des messages vocaux
-- - Lecture limitée aux participants de la conversation
-- - Pas d'accès aux audios des autres conversations






