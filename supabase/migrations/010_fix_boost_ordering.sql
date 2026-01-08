-- =====================================================
-- MIGRATION: Corriger le tri des annonces boostées
-- Date: 8 Janvier 2025
-- Description: S'assure que les annonces boostées restent en tête pendant leur période
-- =====================================================

-- 1. Vérifier si la colonne boost_until existe, sinon la créer
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'listings' AND column_name = 'boost_until'
    ) THEN
        -- Si boost_expires_at existe, la renommer
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'listings' AND column_name = 'boost_expires_at'
        ) THEN
            ALTER TABLE listings RENAME COLUMN boost_expires_at TO boost_until;
            RAISE NOTICE 'Colonne boost_expires_at renommée en boost_until';
        ELSE
            -- Sinon créer la colonne boost_until
            ALTER TABLE listings ADD COLUMN boost_until TIMESTAMPTZ;
            RAISE NOTICE 'Colonne boost_until créée';
        END IF;
    END IF;
END $$;

-- 2. Créer une fonction pour vérifier si un boost est actif
CREATE OR REPLACE FUNCTION is_boost_active(is_boosted BOOLEAN, boost_until TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_boosted AND boost_until IS NOT NULL AND boost_until > NOW();
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Créer un index fonctionnel pour optimiser le tri
-- Cet index permet de trier directement par boost actif + date
CREATE INDEX IF NOT EXISTS idx_listings_active_boost_created 
ON listings(
    (CASE WHEN is_boost_active(is_boosted, boost_until) THEN 1 ELSE 0 END) DESC,
    created_at DESC
)
WHERE status = 'active';

-- 4. Nettoyer les boosts expirés (mettre is_boosted à false)
-- Cela évite d'avoir des annonces avec is_boosted=true mais boost expiré
UPDATE listings
SET is_boosted = false
WHERE is_boosted = true 
AND (boost_until IS NULL OR boost_until <= NOW());

-- 5. Créer un trigger pour désactiver automatiquement les boosts expirés
CREATE OR REPLACE FUNCTION auto_disable_expired_boosts()
RETURNS TRIGGER AS $$
BEGIN
    -- Si on met à jour une ligne et que le boost est expiré, désactiver is_boosted
    IF NEW.is_boosted = true AND (NEW.boost_until IS NULL OR NEW.boost_until <= NOW()) THEN
        NEW.is_boosted = false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger (s'il n'existe pas déjà)
DROP TRIGGER IF EXISTS trigger_auto_disable_expired_boosts ON listings;
CREATE TRIGGER trigger_auto_disable_expired_boosts
    BEFORE INSERT OR UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION auto_disable_expired_boosts();

-- 6. Analyser la table pour optimiser les requêtes
ANALYZE listings;

-- 7. Commentaires
COMMENT ON FUNCTION is_boost_active IS 'Vérifie si un boost est actif (non expiré)';
COMMENT ON INDEX idx_listings_active_boost_created IS 'Optimise le tri des annonces par boost actif et date de création';
COMMENT ON TRIGGER trigger_auto_disable_expired_boosts ON listings IS 'Désactive automatiquement is_boosted quand boost_until est expiré';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

