-- ============================================
-- FIX : BUCKET MESSAGE-AUDIOS
-- ============================================
-- Date : 26 Décembre 2024

-- ============================================
-- ÉTAPE 1 : CRÉER LE BUCKET (via Dashboard)
-- ============================================

-- ⚠️ Le bucket DOIT être créé via le Dashboard Supabase :
-- 1. Va sur : https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/storage/buckets
-- 2. Clique "New bucket"
-- 3. Name : message-audios
-- 4. Public : OFF (bucket privé)
-- 5. File size limit : 5 MB (5242880)
-- 6. Allowed MIME types : audio/webm, audio/ogg, audio/wav, audio/mpeg
-- 7. Clique "Create bucket"

-- ============================================
-- ÉTAPE 2 : POLICIES STORAGE (après création bucket)
-- ============================================

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Users can upload audio for own messages" ON storage.objects;
DROP POLICY IF EXISTS "Conversation participants can read audios" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own audios" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audios" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload to message-audios" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read from message-audios" ON storage.objects;

-- ============================================
-- POLICIES SIMPLIFIÉES (pour que ça marche)
-- ============================================

-- Policy 1 : Upload - Tous les utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated can upload to message-audios"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-audios');

-- Policy 2 : Lecture - Tous les utilisateurs authentifiés peuvent lire
CREATE POLICY "Authenticated can read from message-audios"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'message-audios');

-- Policy 3 : Update - Tous les utilisateurs authentifiés peuvent modifier
CREATE POLICY "Authenticated can update message-audios"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'message-audios')
WITH CHECK (bucket_id = 'message-audios');

-- Policy 4 : Delete - Tous les utilisateurs authentifiés peuvent supprimer
CREATE POLICY "Authenticated can delete from message-audios"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'message-audios');

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Lister les policies du bucket
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- ============================================
-- RÉSUMÉ
-- ============================================

-- ✅ Bucket créé (via Dashboard)
-- ✅ Policies simplifiées pour authentifiés
-- ✅ Upload/Lecture/Update/Delete autorisés

-- Note : Ces policies sont permissives pour le développement.
-- En production, utiliser les policies plus restrictives du fichier
-- FIX_STORAGE_VOCAL_RLS_URGENT.sql









