-- Script pour corriger les politiques RLS de la table listings
-- Ce script supprime les anciennes policies et en crée de nouvelles complètes

-- ========================================
-- 1. SUPPRIMER LES ANCIENNES POLICIES
-- ========================================

DROP POLICY IF EXISTS "Public can view active listings" ON listings;
DROP POLICY IF EXISTS "Users can view own listings" ON listings;
DROP POLICY IF EXISTS "Vendors can insert own listings" ON listings;
DROP POLICY IF EXISTS "Vendors can update own listings" ON listings;
DROP POLICY IF EXISTS "Vendors can delete own listings" ON listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;

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

COMMENT ON TABLE listings IS 'Annonces de véhicules avec RLS policies complètes';
NOTIFY pgrst, 'reload schema';

-- ========================================
-- ✅ TERMINÉ
-- ========================================

-- Pour vérifier que les policies sont bien créées :
-- SELECT * FROM pg_policies WHERE tablename = 'listings';







