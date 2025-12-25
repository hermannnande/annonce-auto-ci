-- =====================================================
-- ANNONCEAUTO.CI - CONFIGURATION STORAGE
-- Version: 1.0
-- Date: 22 Décembre 2024
-- Description: Bucket pour images des véhicules
-- =====================================================

-- ⚠️ IMPORTANT: Ce fichier doit être exécuté APRÈS avoir créé
-- le bucket "vehicle-images" dans Supabase Dashboard > Storage

-- =====================================================
-- POLICIES POUR LE BUCKET "vehicle-images"
-- =====================================================

-- 1. Tout le monde peut LIRE les images (public)
CREATE POLICY "Public can view vehicle images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-images');

-- 2. Users authentifiés peuvent UPLOADER des images
CREATE POLICY "Authenticated users can upload vehicle images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND auth.role() = 'authenticated'
  );

-- 3. Users peuvent SUPPRIMER leurs propres images
-- Format: vehicle-images/{user_id}/{filename}
CREATE POLICY "Users can delete own vehicle images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Users peuvent METTRE À JOUR leurs propres images
CREATE POLICY "Users can update own vehicle images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vehicle-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Admins peuvent TOUT faire
CREATE POLICY "Admins can manage all vehicle images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'vehicle-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =====================================================
-- CONFIGURATION DU BUCKET (via Dashboard)
-- =====================================================

/*
  INSTRUCTIONS POUR CRÉER LE BUCKET DANS SUPABASE DASHBOARD:
  
  1. Aller dans: Storage > Create a new bucket
  
  2. Paramètres:
     - Nom: vehicle-images
     - Public: ✅ Yes (activé)
     - File size limit: 5242880 (5 MB)
     - Allowed MIME types: image/jpeg,image/png,image/webp,image/jpg
  
  3. Cliquer "Create bucket"
  
  4. Exécuter ce fichier SQL dans SQL Editor
*/

-- =====================================================
-- FONCTIONS UTILITAIRES POUR STORAGE
-- =====================================================

-- Fonction pour nettoyer les images orphelines
-- (images qui n'appartiennent plus à aucune annonce)
CREATE OR REPLACE FUNCTION cleanup_orphan_images()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_image_url TEXT;
  v_image_path TEXT;
BEGIN
  -- Récupérer toutes les URLs d'images dans le storage
  FOR v_image_url IN 
    SELECT name FROM storage.objects 
    WHERE bucket_id = 'vehicle-images'
  LOOP
    -- Vérifier si l'image est utilisée dans une annonce
    IF NOT EXISTS (
      SELECT 1 FROM listings
      WHERE v_image_url = ANY(images)
    ) THEN
      -- Supprimer l'image orpheline
      DELETE FROM storage.objects
      WHERE bucket_id = 'vehicle-images' AND name = v_image_url;
      
      v_deleted_count := v_deleted_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir la taille totale utilisée par un user
CREATE OR REPLACE FUNCTION get_user_storage_size(p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  v_total_size BIGINT;
BEGIN
  SELECT COALESCE(SUM((metadata->>'size')::BIGINT), 0)
  INTO v_total_size
  FROM storage.objects
  WHERE bucket_id = 'vehicle-images'
  AND (storage.foldername(name))[1] = p_user_id::text;
  
  RETURN v_total_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- LIMITES ET QUOTAS
-- =====================================================

-- Créer une table pour suivre les quotas de storage par user
CREATE TABLE IF NOT EXISTS storage_quotas (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  max_storage_bytes BIGINT DEFAULT 52428800, -- 50 MB par défaut
  current_storage_bytes BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour storage_quotas
ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quota"
  ON storage_quotas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage quotas"
  ON storage_quotas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Trigger pour mettre à jour current_storage_bytes
CREATE OR REPLACE FUNCTION update_storage_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_size BIGINT;
BEGIN
  -- Extraire l'user_id du path
  v_user_id := ((storage.foldername(NEW.name))[1])::UUID;
  
  -- Calculer la nouvelle taille
  v_size := get_user_storage_size(v_user_id);
  
  -- Mettre à jour le quota
  INSERT INTO storage_quotas (user_id, current_storage_bytes)
  VALUES (v_user_id, v_size)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    current_storage_bytes = v_size,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_storage_usage
  AFTER INSERT OR UPDATE OR DELETE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'vehicle-images' OR OLD.bucket_id = 'vehicle-images')
  EXECUTE FUNCTION update_storage_quota();

-- =====================================================
-- TESTS
-- =====================================================

-- Afficher les stats de storage
CREATE OR REPLACE VIEW storage_stats AS
SELECT
  (SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'vehicle-images') AS total_images,
  (SELECT pg_size_pretty(SUM((metadata->>'size')::BIGINT)) FROM storage.objects WHERE bucket_id = 'vehicle-images') AS total_size,
  (SELECT COUNT(DISTINCT (storage.foldername(name))[1]) FROM storage.objects WHERE bucket_id = 'vehicle-images') AS users_with_images;

-- =====================================================
-- FIN DE LA CONFIGURATION STORAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Configuration Storage terminée avec succès !';
  RAISE NOTICE '📸 Bucket: vehicle-images';
  RAISE NOTICE '🔐 Policies RLS créées';
  RAISE NOTICE '📊 Quotas et tracking activés';
  RAISE NOTICE '⚠️ N''oubliez pas de créer le bucket dans le Dashboard !';
END $$;
