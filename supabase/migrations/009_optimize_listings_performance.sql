-- =====================================================
-- MIGRATION: Optimisation performance annonces
-- Date: 8 Janvier 2025
-- Description: Améliore drastiquement la vitesse de chargement des annonces
-- =====================================================

-- ⚡ INDEX COMPOSITE pour tri optimisé
-- Permet de trier rapidement par (is_boosted DESC, created_at DESC)
-- sans avoir à scanner toute la table
CREATE INDEX IF NOT EXISTS idx_listings_boosted_created 
ON listings(is_boosted DESC, created_at DESC) 
WHERE status = 'active';

-- ⚡ INDEX pour recherche full-text optimisée
-- (si pas déjà créé)
CREATE INDEX IF NOT EXISTS idx_listings_fulltext_search 
ON listings USING GIN (
  to_tsvector('french', 
    COALESCE(title, '') || ' ' || 
    COALESCE(brand, '') || ' ' || 
    COALESCE(model, '') || ' ' || 
    COALESCE(description, '')
  )
);

-- ⚡ INDEX pour filtre par boost_until (boosts actifs)
-- Permet de filtrer rapidement les annonces boostées encore valides
CREATE INDEX IF NOT EXISTS idx_listings_boost_until 
ON listings(boost_until) 
WHERE is_boosted = true AND boost_until > NOW();

-- ⚡ ANALYZE pour mettre à jour les statistiques de la table
-- PostgreSQL utilisera ces stats pour choisir le meilleur plan de requête
ANALYZE listings;

-- ⚡ COMMENTAIRES pour documentation
COMMENT ON INDEX idx_listings_boosted_created IS 'Optimise le tri des annonces par boost et date (utilisé sur la page d''accueil et liste)';
COMMENT ON INDEX idx_listings_fulltext_search IS 'Optimise la recherche plein texte dans les annonces';
COMMENT ON INDEX idx_listings_boost_until IS 'Optimise le filtrage des annonces boostées encore actives';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

