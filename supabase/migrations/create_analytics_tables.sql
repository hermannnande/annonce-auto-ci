-- ============================================
-- TABLES D'ANALYTICS - TRACKING COMPLET
-- ============================================

-- 1. Table principale pour tracker toutes les actions
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'listing_view', 'search', 'click', 'conversion'
  page_url TEXT,
  page_title VARCHAR(255),
  referrer TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  
  -- Données spécifiques selon le type d'événement
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  search_query TEXT,
  conversion_type VARCHAR(50), -- 'credit_purchase', 'boost_purchase', 'listing_published'
  conversion_value DECIMAL(10, 2),
  
  -- Metadata JSON pour données supplémentaires
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table pour les sessions utilisateur (agrégation par session)
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  referrer TEXT,
  landing_page TEXT,
  exit_page TEXT,
  converted BOOLEAN DEFAULT FALSE,
  conversion_value DECIMAL(10, 2) DEFAULT 0
);

-- 3. Table pour statistiques journalières (précalculées pour performance)
CREATE TABLE IF NOT EXISTS analytics_daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration_seconds INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Listings
  listings_published INTEGER DEFAULT 0,
  listings_viewed INTEGER DEFAULT 0,
  unique_listings_viewed INTEGER DEFAULT 0,
  
  -- Conversions
  total_conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Engagement
  total_searches INTEGER DEFAULT 0,
  total_favorites INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table pour les pages les plus visitées
CREATE TABLE IF NOT EXISTS analytics_top_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page_seconds INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,
  exit_rate DECIMAL(5, 2) DEFAULT 0,
  
  UNIQUE(page_url, date),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table pour les utilisateurs en ligne (temps réel)
CREATE TABLE IF NOT EXISTS analytics_online_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_page TEXT,
  device_type VARCHAR(50),
  
  UNIQUE(session_id)
);

-- ============================================
-- INDEX POUR PERFORMANCE
-- ============================================

-- Index sur analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_listing_id ON analytics_events(listing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_url ON analytics_events(page_url);

-- Index sur analytics_sessions
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);

-- Index sur analytics_daily_stats
CREATE INDEX IF NOT EXISTS idx_analytics_daily_stats_date ON analytics_daily_stats(date DESC);

-- Index sur analytics_top_pages
CREATE INDEX IF NOT EXISTS idx_analytics_top_pages_date ON analytics_top_pages(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_top_pages_views ON analytics_top_pages(views DESC);

-- Index sur analytics_online_users
CREATE INDEX IF NOT EXISTS idx_analytics_online_users_last_seen ON analytics_online_users(last_seen DESC);

-- ============================================
-- FONCTION POUR NETTOYER LES UTILISATEURS INACTIFS
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_offline_users()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM analytics_online_users
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$;

-- ============================================
-- RLS (Row Level Security) - Optionnel
-- ============================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_top_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_online_users ENABLE ROW LEVEL SECURITY;

-- Politique: Admins peuvent tout voir
CREATE POLICY "Admins can view all analytics" ON analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all sessions" ON analytics_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view daily stats" ON analytics_daily_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view top pages" ON analytics_top_pages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view online users" ON analytics_online_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique: Service role peut tout faire
CREATE POLICY "Service role can do anything on analytics_events" ON analytics_events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can do anything on analytics_sessions" ON analytics_sessions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can do anything on analytics_daily_stats" ON analytics_daily_stats
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can do anything on analytics_top_pages" ON analytics_top_pages
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can do anything on analytics_online_users" ON analytics_online_users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- VUES POUR REQUÊTES FRÉQUENTES
-- ============================================

-- Vue pour stats en temps réel
CREATE OR REPLACE VIEW analytics_realtime_stats AS
SELECT
  COUNT(DISTINCT session_id) as active_sessions,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as events_last_hour,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') as events_last_minute
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '5 minutes';

-- Vue pour top pages aujourd'hui
CREATE OR REPLACE VIEW analytics_today_top_pages AS
SELECT
  page_url,
  page_title,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_visitors
FROM analytics_events
WHERE event_type = 'page_view'
  AND created_at >= CURRENT_DATE
GROUP BY page_url, page_title
ORDER BY views DESC
LIMIT 10;

-- ============================================
-- COMMENTAIRES
-- ============================================
COMMENT ON TABLE analytics_events IS 'Tous les événements trackés sur le site';
COMMENT ON TABLE analytics_sessions IS 'Sessions utilisateur agrégées';
COMMENT ON TABLE analytics_daily_stats IS 'Statistiques quotidiennes précalculées';
COMMENT ON TABLE analytics_top_pages IS 'Pages les plus visitées par jour';
COMMENT ON TABLE analytics_online_users IS 'Utilisateurs actuellement en ligne';



