-- ============================================
-- SYSTÈME DE BADGES ET RÉPUTATION VENDEURS
-- ============================================

-- 1. Table pour les badges des vendeurs
CREATE TABLE IF NOT EXISTS vendor_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL, -- 'verified', 'top_seller', 'fast_responder', 'trusted', 'premium'
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, badge_type)
);

-- 2. Table pour les avis/notes des vendeurs
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(vendor_id, buyer_id, listing_id)
);

-- 3. Vue pour les statistiques des vendeurs
CREATE OR REPLACE VIEW vendor_stats AS
SELECT
  p.id as vendor_id,
  p.full_name,
  p.user_type,
  p.created_at as member_since,
  
  -- Nombre d'annonces
  (SELECT COUNT(*) FROM listings WHERE user_id = p.id) as total_listings,
  (SELECT COUNT(*) FROM listings WHERE user_id = p.id AND status = 'active') as active_listings,
  (SELECT COUNT(*) FROM listings WHERE user_id = p.id AND status = 'sold') as sold_listings,
  
  -- Avis
  (SELECT COUNT(*) FROM vendor_reviews WHERE vendor_id = p.id) as total_reviews,
  (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) FROM vendor_reviews WHERE vendor_id = p.id) as avg_rating,
  
  -- Badges
  (SELECT COUNT(*) FROM vendor_badges WHERE user_id = p.id) as total_badges,
  (SELECT array_agg(badge_type) FROM vendor_badges WHERE user_id = p.id) as badges,
  
  -- Temps de réponse moyen (en heures)
  (
    SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (m2.created_at - m1.created_at)) / 3600)::numeric, 1), 0)
    FROM messages m1
    JOIN messages m2 ON m2.conversation_id = m1.conversation_id
    JOIN conversations c ON c.id = m1.conversation_id
    WHERE c.seller_id = p.id
    AND m1.sender_id != p.id
    AND m2.sender_id = p.id
    AND m2.created_at > m1.created_at
    AND m2.created_at = (
      SELECT MIN(created_at) 
      FROM messages 
      WHERE conversation_id = m1.conversation_id 
      AND sender_id = p.id 
      AND created_at > m1.created_at
    )
  ) as avg_response_time_hours,
  
  -- Taux de réponse (%)
  (
    SELECT COALESCE(ROUND(
      (COUNT(DISTINCT c.id)::numeric / 
       NULLIF((SELECT COUNT(*) FROM conversations WHERE seller_id = p.id), 0)) * 100, 
      0), 0)
    FROM conversations c
    WHERE c.seller_id = p.id
    AND EXISTS (
      SELECT 1 FROM messages 
      WHERE conversation_id = c.id 
      AND sender_id = p.id
    )
  ) as response_rate

FROM profiles p
WHERE p.user_type IN ('vendor', 'admin');

-- 4. Fonction pour attribuer automatiquement les badges
CREATE OR REPLACE FUNCTION update_vendor_badges(p_vendor_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats RECORD;
BEGIN
  -- Récupérer les stats du vendeur
  SELECT * INTO v_stats FROM vendor_stats WHERE vendor_id = p_vendor_id;
  
  IF v_stats IS NULL THEN
    RETURN;
  END IF;
  
  -- Badge "Top Seller" : 10+ ventes
  IF v_stats.sold_listings >= 10 THEN
    INSERT INTO vendor_badges (user_id, badge_type)
    VALUES (p_vendor_id, 'top_seller')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Badge "Fast Responder" : Temps de réponse < 2h et taux de réponse > 90%
  IF v_stats.avg_response_time_hours < 2 AND v_stats.response_rate > 90 THEN
    INSERT INTO vendor_badges (user_id, badge_type)
    VALUES (p_vendor_id, 'fast_responder')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Badge "Trusted" : Note >= 4.5 et 10+ avis
  IF v_stats.avg_rating >= 4.5 AND v_stats.total_reviews >= 10 THEN
    INSERT INTO vendor_badges (user_id, badge_type)
    VALUES (p_vendor_id, 'trusted')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Badge "Verified" : À attribuer manuellement par admin
  
  -- Badge "Premium" : 50+ annonces actives
  IF v_stats.active_listings >= 50 THEN
    INSERT INTO vendor_badges (user_id, badge_type)
    VALUES (p_vendor_id, 'premium')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
END;
$$;

-- 5. Index pour performance
CREATE INDEX IF NOT EXISTS idx_vendor_badges_user_id ON vendor_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_buyer_id ON vendor_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_rating ON vendor_reviews(rating);

-- 6. RLS Policies
ALTER TABLE vendor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les badges
CREATE POLICY "Anyone can view badges" ON vendor_badges
  FOR SELECT
  USING (true);

-- Tout le monde peut voir les avis
CREATE POLICY "Anyone can view reviews" ON vendor_reviews
  FOR SELECT
  USING (true);

-- Les acheteurs peuvent créer des avis
CREATE POLICY "Buyers can create reviews" ON vendor_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Les acheteurs peuvent modifier leurs propres avis
CREATE POLICY "Buyers can update own reviews" ON vendor_reviews
  FOR UPDATE
  USING (auth.uid() = buyer_id);

-- Admins peuvent gérer tous les badges
CREATE POLICY "Admins can manage badges" ON vendor_badges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- 7. Permissions
GRANT SELECT ON vendor_stats TO authenticated;
GRANT EXECUTE ON FUNCTION update_vendor_badges(UUID) TO authenticated;

-- 8. Commentaires
COMMENT ON TABLE vendor_badges IS 'Badges des vendeurs (vérifié, top seller, etc.)';
COMMENT ON TABLE vendor_reviews IS 'Avis et notes laissés par les acheteurs';
COMMENT ON VIEW vendor_stats IS 'Statistiques agrégées des vendeurs';
COMMENT ON FUNCTION update_vendor_badges(UUID) IS 'Attribue automatiquement les badges selon les critères';

