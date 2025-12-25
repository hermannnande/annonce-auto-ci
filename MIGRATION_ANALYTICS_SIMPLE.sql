-- ============================================
-- MIGRATION SIMPLIFIÉE - SYSTÈME ANALYTICS
-- Copiez tout ce fichier et exécutez-le dans Supabase SQL Editor
-- ============================================

-- 1. Créer les tables principales
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  page_url TEXT,
  page_title VARCHAR(255),
  referrer TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  listing_id UUID,
  search_query TEXT,
  conversion_type VARCHAR(50),
  conversion_value DECIMAL(10, 2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_views INTEGER DEFAULT 0,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  referrer TEXT,
  landing_page TEXT
);

CREATE TABLE IF NOT EXISTS analytics_online_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_page TEXT,
  device_type VARCHAR(50)
);

-- 2. Créer les index pour performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_online_users_last_seen ON analytics_online_users(last_seen DESC);

-- 3. Fonction pour incrémenter page_views
CREATE OR REPLACE FUNCTION increment_session_page_views(p_session_id VARCHAR)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE analytics_sessions
  SET page_views = page_views + 1
  WHERE session_id = p_session_id;
END;
$$;

-- 4. Activer RLS (Row Level Security)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_online_users ENABLE ROW LEVEL SECURITY;

-- 5. Politique: Tout le monde peut insérer (pour le tracking)
CREATE POLICY IF NOT EXISTS "Anyone can insert analytics_events" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can insert/update analytics_sessions" ON analytics_sessions
  FOR ALL
  USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can insert/update analytics_online_users" ON analytics_online_users
  FOR ALL
  USING (true);

-- 6. Politique: Admins peuvent tout voir
CREATE POLICY IF NOT EXISTS "Admins can view all analytics_events" ON analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all analytics_sessions" ON analytics_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all analytics_online_users" ON analytics_online_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- TERMINÉ!
-- Si aucune erreur n'apparaît, les tables sont créées avec succès.


