-- ============================================
-- 🚨 FIX URGENT: Permettre aux admins de modifier les crédits
-- Exécute ce script dans Supabase SQL Editor
-- ============================================

-- 1. Permettre aux admins de modifier n'importe quel profil (pour ajuster les crédits)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- 2. Permettre aux admins d'insérer des transactions de crédits
CREATE POLICY "Admins can insert transactions"
  ON credits_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- 3. Permettre aux utilisateurs d'insérer leurs propres transactions (pour les achats)
CREATE POLICY "Users can insert own transactions"
  ON credits_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ✅ APRÈS EXÉCUTION:
-- - Retourne sur /dashboard/admin/credits
-- - Clique "Ajouter" sur un vendeur
-- - Les crédits devraient se mettre à jour !

