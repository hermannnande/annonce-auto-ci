-- ============================================
-- CONFIRMER TOUS LES COMPTES EXISTANTS
-- ============================================
-- Ce script confirme tous les comptes qui ne sont pas encore confirmés

-- Option 1 : Confirmer UN compte spécifique
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'TON-EMAIL@example.com';  -- ⚠️ REMPLACE PAR TON EMAIL

-- Option 2 : Confirmer TOUS les comptes non confirmés
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Vérification : Voir tous les utilisateurs
SELECT 
  id,
  email, 
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ✅ Si email_confirmed_at n'est plus NULL, c'est bon !




