-- ============================================
-- STATS PAR ANNONCE POUR VENDEURS
-- Permet aux vendeurs de voir les stats de leurs propres annonces
-- ============================================

-- 1. Politique RLS : Les vendeurs peuvent voir les stats de leurs annonces
CREATE POLICY "Vendors can view stats for own listings" ON analytics_events
  FOR SELECT
  USING (
    -- Si l'événement concerne une annonce
    listing_id IS NOT NULL 
    AND
    -- Et que l'annonce appartient au vendeur connecté
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = analytics_events.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- 2. Vue pour statistiques par annonce (pour vendeurs)
CREATE OR REPLACE VIEW listing_analytics AS
SELECT 
  l.id as listing_id,
  l.user_id,
  l.title,
  
  -- Vues totales
  COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'listing_view') as total_views,
  
  -- Vues aujourd'hui
  COUNT(DISTINCT ae.id) FILTER (
    WHERE ae.event_type = 'listing_view' 
    AND ae.created_at >= CURRENT_DATE
  ) as views_today,
  
  -- Vues hier
  COUNT(DISTINCT ae.id) FILTER (
    WHERE ae.event_type = 'listing_view' 
    AND ae.created_at >= CURRENT_DATE - INTERVAL '1 day'
    AND ae.created_at < CURRENT_DATE
  ) as views_yesterday,
  
  -- Vues cette semaine
  COUNT(DISTINCT ae.id) FILTER (
    WHERE ae.event_type = 'listing_view' 
    AND ae.created_at >= date_trunc('week', CURRENT_DATE)
  ) as views_this_week,
  
  -- Visiteurs uniques
  COUNT(DISTINCT ae.session_id) FILTER (WHERE ae.event_type = 'listing_view') as unique_visitors,
  
  -- Favoris
  (SELECT COUNT(*) FROM favorites f WHERE f.listing_id = l.id) as total_favorites,
  
  -- Messages (conversations initiées pour cette annonce)
  (SELECT COUNT(*) FROM conversations c WHERE c.listing_id = l.id) as total_conversations,
  
  -- Taux de conversion (vues → messages)
  CASE 
    WHEN COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'listing_view') > 0
    THEN ROUND(
      (SELECT COUNT(*) FROM conversations c WHERE c.listing_id = l.id)::NUMERIC / 
      COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'listing_view')::NUMERIC * 100,
      2
    )
    ELSE 0
  END as conversion_rate,
  
  -- Dernière vue
  MAX(ae.created_at) FILTER (WHERE ae.event_type = 'listing_view') as last_view_at,
  
  -- Moyenne de vues par jour (depuis publication)
  CASE 
    WHEN EXTRACT(EPOCH FROM (NOW() - l.created_at)) / 86400 > 0
    THEN ROUND(
      COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'listing_view')::NUMERIC / 
      (EXTRACT(EPOCH FROM (NOW() - l.created_at)) / 86400),
      1
    )
    ELSE 0
  END as avg_views_per_day

FROM listings l
LEFT JOIN analytics_events ae ON ae.listing_id = l.id
GROUP BY l.id, l.user_id, l.title;

-- 3. Fonction pour obtenir l'évolution des vues par jour (30 derniers jours)
CREATE OR REPLACE FUNCTION get_listing_views_evolution(p_listing_id UUID)
RETURNS TABLE (
  date DATE,
  views BIGINT,
  unique_visitors BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(ae.created_at) as date,
    COUNT(*) as views,
    COUNT(DISTINCT ae.session_id) as unique_visitors
  FROM analytics_events ae
  WHERE ae.listing_id = p_listing_id
    AND ae.event_type = 'listing_view'
    AND ae.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(ae.created_at)
  ORDER BY DATE(ae.created_at) ASC;
END;
$$;

-- 4. Fonction pour obtenir les heures de pic de trafic
CREATE OR REPLACE FUNCTION get_listing_peak_hours(p_listing_id UUID)
RETURNS TABLE (
  hour INTEGER,
  views BIGINT,
  day_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM ae.created_at)::INTEGER as hour,
    COUNT(*) as views,
    TO_CHAR(ae.created_at, 'Day') as day_name
  FROM analytics_events ae
  WHERE ae.listing_id = p_listing_id
    AND ae.event_type = 'listing_view'
    AND ae.created_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY EXTRACT(HOUR FROM ae.created_at), TO_CHAR(ae.created_at, 'Day')
  ORDER BY views DESC
  LIMIT 10;
END;
$$;

-- 5. Fonction pour obtenir les stats par jour de la semaine
CREATE OR REPLACE FUNCTION get_listing_weekday_stats(p_listing_id UUID)
RETURNS TABLE (
  day_of_week INTEGER,
  day_name TEXT,
  views BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(DOW FROM ae.created_at)::INTEGER as day_of_week,
    TO_CHAR(ae.created_at, 'Day') as day_name,
    COUNT(*) as views
  FROM analytics_events ae
  WHERE ae.listing_id = p_listing_id
    AND ae.event_type = 'listing_view'
    AND ae.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY EXTRACT(DOW FROM ae.created_at), TO_CHAR(ae.created_at, 'Day')
  ORDER BY day_of_week;
END;
$$;

-- ============================================
-- PERMISSIONS
-- ============================================

-- Les vendeurs peuvent voir leurs propres stats
GRANT SELECT ON listing_analytics TO authenticated;

-- Les vendeurs peuvent exécuter les fonctions pour leurs annonces
GRANT EXECUTE ON FUNCTION get_listing_views_evolution(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_listing_peak_hours(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_listing_weekday_stats(UUID) TO authenticated;

-- ============================================
-- COMMENTAIRES
-- ============================================
COMMENT ON VIEW listing_analytics IS 'Vue agrégée des statistiques par annonce pour les vendeurs';
COMMENT ON FUNCTION get_listing_views_evolution(UUID) IS 'Retourne l''évolution des vues par jour sur 30 jours';
COMMENT ON FUNCTION get_listing_peak_hours(UUID) IS 'Retourne les heures de pic de trafic';
COMMENT ON FUNCTION get_listing_weekday_stats(UUID) IS 'Retourne les statistiques par jour de la semaine';

