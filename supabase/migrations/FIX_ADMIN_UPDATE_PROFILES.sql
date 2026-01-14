-- ============================================
-- FIX: Permettre aux admins de modifier les profils (crédits)
-- Date: 27 Décembre 2024
-- ============================================

-- 1. Policy pour permettre aux admins de UPDATE n'importe quel profil
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- 2. Policy pour permettre aux admins d'insérer des transactions de crédits
-- (vérifier si elle existe déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'credits_transactions' 
    AND policyname = 'Admins can insert transactions'
  ) THEN
    CREATE POLICY "Admins can insert transactions"
      ON credits_transactions FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.user_type = 'admin'
        )
      );
  END IF;
END $$;

-- 3. Policy pour permettre aux utilisateurs d'insérer leurs propres transactions (achat, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'credits_transactions' 
    AND policyname = 'Users can insert own transactions'
  ) THEN
    CREATE POLICY "Users can insert own transactions"
      ON credits_transactions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Après exécution, vérifiez avec :
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
-- SELECT * FROM pg_policies WHERE tablename = 'credits_transactions';








