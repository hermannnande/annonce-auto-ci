-- =====================================================
-- MIGRATION: Passer price de INTEGER à BIGINT
-- =====================================================
-- Raison: Les prix des véhicules en FCFA dépassent 2 147 483 647
-- (limite INTEGER). Exemple: 7 000 000 000 FCFA = erreur 22003

-- Étape 1: Supprimer les vues qui dépendent de listings.price
DROP VIEW IF EXISTS top_listings CASCADE;
DROP VIEW IF EXISTS global_stats CASCADE;

-- Étape 2: Modifier le type de la colonne price
ALTER TABLE public.listings
ALTER COLUMN price TYPE BIGINT
USING price::BIGINT;

-- Étape 3: Recréer les vues

-- Vue: Statistiques globales
CREATE OR REPLACE VIEW global_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'vendor') AS total_vendors,
  (SELECT COUNT(*) FROM listings WHERE status = 'active') AS total_active_listings,
  (SELECT COUNT(*) FROM listings WHERE status = 'pending') AS pending_listings,
  (SELECT SUM(credits) FROM profiles) AS total_credits_in_circulation,
  (SELECT SUM(amount) FROM credits_transactions WHERE amount > 0 AND type = 'purchase') AS total_credits_purchased,
  (SELECT SUM(amount) FROM credits_transactions WHERE amount < 0) AS total_credits_spent,
  (SELECT COUNT(*) FROM favorites) AS total_favorites,
  (SELECT SUM(views) FROM listings) AS total_views;

-- Vue: Top annonces (par vues)
CREATE OR REPLACE VIEW top_listings AS
SELECT
  l.*,
  p.full_name AS seller_name,
  p.phone AS seller_phone,
  p.verified AS seller_verified
FROM listings l
JOIN profiles p ON l.user_id = p.id
WHERE l.status = 'active'
ORDER BY l.views DESC
LIMIT 20;

-- Vérification
SELECT 
  column_name, 
  data_type,
  CASE 
    WHEN data_type = 'bigint' THEN '✅ BIGINT OK'
    ELSE '❌ ERREUR: devrait être BIGINT'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'listings'
  AND column_name = 'price';

-- Message de succès
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration price INTEGER → BIGINT terminée !';
  RAISE NOTICE '💰 Les prix jusqu''à 9 223 372 036 854 775 807 sont maintenant supportés';
  RAISE NOTICE '🔄 Vues global_stats et top_listings recréées';
END $$;




