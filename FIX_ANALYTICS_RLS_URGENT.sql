-- ============================================
-- FIX URGENT : RLS POLICIES ANALYTICS
-- ============================================
-- Correction de l'erreur 403 Forbidden sur analytics_online_users
-- Date : 26 Décembre 2024

-- Problème : Les utilisateurs ne peuvent pas insérer dans analytics_online_users
-- Solution : Ajouter policies INSERT/UPDATE pour tous

-- ============================================
-- 1. CORRIGER ANALYTICS_ONLINE_USERS
-- ============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Anyone can insert/update analytics_online_users" ON analytics_online_users;
DROP POLICY IF EXISTS "Service role can do anything on analytics_online_users" ON analytics_online_users;

-- Policy 1 : Tout le monde peut INSERT/UPDATE (pour le heartbeat)
CREATE POLICY "Public can upsert analytics_online_users" 
ON analytics_online_users
FOR ALL
USING (true)
WITH CHECK (true);

-- Policy 2 : Admins peuvent SELECT
CREATE POLICY "Admins can view analytics_online_users" 
ON analytics_online_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- ============================================
-- 2. CORRIGER ANALYTICS_SESSIONS
-- ============================================

-- Vérifier et corriger analytics_sessions
DROP POLICY IF EXISTS "Anyone can insert/update analytics_sessions" ON analytics_sessions;

CREATE POLICY "Public can upsert analytics_sessions" 
ON analytics_sessions
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view analytics_sessions" 
ON analytics_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- ============================================
-- 3. CORRIGER ANALYTICS_EVENTS
-- ============================================

-- Vérifier et corriger analytics_events
DROP POLICY IF EXISTS "Anyone can insert analytics_events" ON analytics_events;

CREATE POLICY "Public can insert analytics_events" 
ON analytics_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view analytics_events" 
ON analytics_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- ============================================
-- 4. VÉRIFICATION
-- ============================================

-- Vérifier les policies créées
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('analytics_online_users', 'analytics_sessions', 'analytics_events')
ORDER BY tablename, policyname;

-- ============================================
-- 5. TEST
-- ============================================

-- Test INSERT sur analytics_online_users (devrait marcher maintenant)
-- INSERT INTO analytics_online_users (session_id, current_page, device_type, last_seen)
-- VALUES ('test-session-' || gen_random_uuid()::text, '/test', 'desktop', NOW())
-- ON CONFLICT (session_id) DO UPDATE SET last_seen = NOW();

-- Si aucune erreur : ✅ CORRIGÉ !

-- ============================================
-- RÉSUMÉ
-- ============================================

-- ✅ Analytics_online_users : INSERT/UPDATE autorisé pour tous
-- ✅ Analytics_sessions : INSERT/UPDATE autorisé pour tous
-- ✅ Analytics_events : INSERT autorisé pour tous
-- ✅ Admins peuvent SELECT sur toutes les tables

-- Cette configuration permet :
-- - Tracking anonyme (sans authentification)
-- - Heartbeat fonctionnel
-- - Dashboard admin opérationnel









