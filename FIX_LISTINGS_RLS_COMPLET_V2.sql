-- Script pour corriger TOUTES les politiques RLS de la table listings
-- Version SAFE : Supprime TOUTES les policies existantes d'abord

-- ========================================
-- 1. SUPPRIMER TOUTES LES POLICIES EXISTANTES
-- ========================================

DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'listings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON listings', pol.policyname);
    END LOOP;
END $$;

-- ========================================
-- 2. CRÉER LES NOUVELLES POLICIES
-- ========================================

-- ✅ SELECT : Tout le monde peut voir les annonces actives
CREATE POLICY "Public can view active listings"
  ON listings FOR SELECT
  USING (status = 'active' OR status = 'approved');

-- ✅ SELECT : Les vendeurs peuvent voir TOUTES leurs propres annonces (tous statuts)
CREATE POLICY "Vendors can view own listings"
  ON listings FOR SELECT
  USING (auth.uid() = user_id);

-- ✅ SELECT : Les admins peuvent voir toutes les annonces
CREATE POLICY "Admins can view all listings"
  ON listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- ✅ INSERT : Les utilisateurs authentifiés (vendeurs) peuvent créer des annonces
CREATE POLICY "Authenticated users can insert listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ✅ UPDATE : Les vendeurs peuvent modifier leurs propres annonces
CREATE POLICY "Vendors can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ✅ UPDATE : Les admins peuvent modifier toutes les annonces
CREATE POLICY "Admins can update all listings"
  ON listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- ✅ DELETE : Les vendeurs peuvent supprimer leurs propres annonces
CREATE POLICY "Vendors can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ✅ DELETE : Les admins peuvent supprimer toutes les annonces
CREATE POLICY "Admins can delete all listings"
  ON listings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- ========================================
-- 3. VÉRIFIER QUE RLS EST ACTIVÉ
-- ========================================

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. REFRESH DU CACHE
-- ========================================

COMMENT ON TABLE listings IS 'Annonces de véhicules avec RLS policies complètes - Fixed v2';
NOTIFY pgrst, 'reload schema';

-- ========================================
-- ✅ TERMINÉ
-- ========================================

-- Vérifier que les policies sont bien créées :
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'listings' ORDER BY policyname;



