-- ============================================
-- FIX : FONCTION MANQUANTE increment_session_page_views
-- ============================================
-- Correction de l'erreur 404 sur RPC increment_session_page_views
-- Date : 26 Décembre 2024

-- ============================================
-- 1. CRÉER LA FONCTION MANQUANTE
-- ============================================

CREATE OR REPLACE FUNCTION increment_session_page_views(p_session_id VARCHAR)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE analytics_sessions
  SET page_views = page_views + 1
  WHERE session_id = p_session_id;
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION increment_session_page_views(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_session_page_views(VARCHAR) TO anon;

-- ============================================
-- 2. VÉRIFIER QUE LA TABLE EXISTE
-- ============================================

-- Si analytics_sessions n'existe pas, la créer
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_views INTEGER DEFAULT 1,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  referrer TEXT,
  landing_page TEXT,
  is_bounce BOOLEAN DEFAULT true,
  duration_seconds INTEGER DEFAULT 0
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at DESC);

-- ============================================
-- 3. VÉRIFIER LES POLICIES
-- ============================================

-- S'assurer que RLS est activé
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre les insertions/updates
DROP POLICY IF EXISTS "Public can upsert analytics_sessions" ON analytics_sessions;
CREATE POLICY "Public can upsert analytics_sessions" 
ON analytics_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- 4. TEST
-- ============================================

-- Test de la fonction (devrait retourner void sans erreur)
-- SELECT increment_session_page_views('test-session-123');

-- ============================================
-- RÉSUMÉ
-- ============================================

-- ✅ Fonction increment_session_page_views créée
-- ✅ Permissions accordées (authenticated + anon)
-- ✅ Table analytics_sessions vérifiée
-- ✅ Policies RLS configurées








