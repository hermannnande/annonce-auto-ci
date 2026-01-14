-- ================================================================
-- SYSTÈME D'AUTO-MODÉRATION DES ANNONCES
-- ================================================================
-- Objectif: Approuver automatiquement les annonces après 5 minutes
-- si elles passent les vérifications de base (vraiment un véhicule)
-- ================================================================

-- ================================================================
-- 1. FONCTION DE VALIDATION AUTOMATIQUE
-- ================================================================
-- Vérifie qu'une annonce est vraiment un véhicule et pas du spam

CREATE OR REPLACE FUNCTION is_listing_valid_vehicle(listing_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
  v_title_lower TEXT;
  v_desc_lower TEXT;
  v_vehicle_keywords TEXT[] := ARRAY[
    'voiture', 'auto', 'vehicule', 'véhicule', 'car', 'suv', 'berline', 
    'break', 'coupé', 'coupe', 'cabriolet', 'pickup', 'camion', 'truck',
    'essence', 'diesel', 'hybride', 'électrique', 'electric',
    'automatique', 'manuelle', 'boite', 'boîte', 'transmission',
    'km', 'kilometre', 'kilométrage', 'mileage',
    'portes', 'places', 'cylindres', 'chevaux', 'cv', 'hp',
    'neuf', 'occasion', 'importé', 'import'
  ];
  v_brand_list TEXT[] := ARRAY[
    'toyota', 'mercedes', 'bmw', 'audi', 'volkswagen', 'ford', 'peugeot',
    'renault', 'nissan', 'honda', 'hyundai', 'kia', 'mazda', 'lexus',
    'volvo', 'land rover', 'jeep', 'chevrolet', 'citroen', 'citroën',
    'fiat', 'alfa romeo', 'jaguar', 'porsche', 'tesla', 'subaru',
    'mitsubishi', 'suzuki', 'dacia', 'skoda', 'seat', 'opel',
    'mini', 'smart', 'chrysler', 'dodge', 'cadillac', 'buick',
    'gmc', 'ram', 'infiniti', 'acura', 'genesis', 'lincoln'
  ];
  v_keyword TEXT;
  v_has_vehicle_keyword BOOLEAN := FALSE;
  v_has_valid_brand BOOLEAN := FALSE;
BEGIN
  -- Récupérer l'annonce
  SELECT * INTO v_listing
  FROM listings
  WHERE id = listing_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- ✅ VALIDATION 1: Champs obligatoires remplis
  IF v_listing.title IS NULL OR LENGTH(TRIM(v_listing.title)) < 5 THEN
    RAISE NOTICE 'Auto-modération: titre trop court ou vide';
    RETURN FALSE;
  END IF;

  IF v_listing.brand IS NULL OR LENGTH(TRIM(v_listing.brand)) < 2 THEN
    RAISE NOTICE 'Auto-modération: marque manquante';
    RETURN FALSE;
  END IF;

  IF v_listing.model IS NULL OR LENGTH(TRIM(v_listing.model)) < 1 THEN
    RAISE NOTICE 'Auto-modération: modèle manquant';
    RETURN FALSE;
  END IF;

  -- ✅ VALIDATION 2: Prix cohérent (entre 100 000 et 500 000 000 FCFA)
  IF v_listing.price < 100000 OR v_listing.price > 500000000 THEN
    RAISE NOTICE 'Auto-modération: prix incohérent (% FCFA)', v_listing.price;
    RETURN FALSE;
  END IF;

  -- ✅ VALIDATION 3: Année cohérente (entre 1990 et année actuelle + 1)
  IF v_listing.year < 1990 OR v_listing.year > EXTRACT(YEAR FROM NOW()) + 1 THEN
    RAISE NOTICE 'Auto-modération: année incohérente (%)', v_listing.year;
    RETURN FALSE;
  END IF;

  -- ✅ VALIDATION 4: Kilométrage cohérent (entre 0 et 1 000 000 km)
  IF v_listing.mileage < 0 OR v_listing.mileage > 1000000 THEN
    RAISE NOTICE 'Auto-modération: kilométrage incohérent (% km)', v_listing.mileage;
    RETURN FALSE;
  END IF;

  -- ✅ VALIDATION 5: Au moins une image
  IF v_listing.images IS NULL OR array_length(v_listing.images, 1) IS NULL OR array_length(v_listing.images, 1) < 1 THEN
    RAISE NOTICE 'Auto-modération: aucune image';
    RETURN FALSE;
  END IF;

  -- ✅ VALIDATION 6: Vérifier que le titre ou description contient des mots-clés véhicules
  v_title_lower := LOWER(COALESCE(v_listing.title, ''));
  v_desc_lower := LOWER(COALESCE(v_listing.description, ''));

  FOREACH v_keyword IN ARRAY v_vehicle_keywords LOOP
    IF v_title_lower LIKE '%' || v_keyword || '%' OR v_desc_lower LIKE '%' || v_keyword || '%' THEN
      v_has_vehicle_keyword := TRUE;
      EXIT;
    END IF;
  END LOOP;

  -- ✅ VALIDATION 7: Vérifier que la marque est dans la liste des marques connues
  FOREACH v_keyword IN ARRAY v_brand_list LOOP
    IF LOWER(v_listing.brand) LIKE '%' || v_keyword || '%' THEN
      v_has_valid_brand := TRUE;
      EXIT;
    END IF;
  END LOOP;

  -- Si pas de mot-clé véhicule ET marque inconnue → suspect
  IF NOT v_has_vehicle_keyword AND NOT v_has_valid_brand THEN
    RAISE NOTICE 'Auto-modération: pas de mots-clés véhicules ni marque valide';
    RETURN FALSE;
  END IF;

  -- ✅ Toutes les validations passées
  RETURN TRUE;
END;
$$;

-- ================================================================
-- 2. FONCTION D'AUTO-APPROBATION
-- ================================================================
-- Approuve automatiquement les annonces en attente depuis >5 min
-- si elles passent la validation

CREATE OR REPLACE FUNCTION auto_approve_pending_listings()
RETURNS TABLE(
  approved_count INTEGER,
  rejected_count INTEGER,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
  v_approved INTEGER := 0;
  v_rejected INTEGER := 0;
  v_details JSONB := '[]'::JSONB;
  v_cutoff_time TIMESTAMPTZ;
BEGIN
  -- Seuil: annonces créées il y a plus de 5 minutes
  v_cutoff_time := NOW() - INTERVAL '5 minutes';

  -- Parcourir les annonces en attente depuis >5 min
  FOR v_listing IN
    SELECT id, title, brand, model, created_at, user_id
    FROM listings
    WHERE status = 'pending'
      AND created_at <= v_cutoff_time
    ORDER BY created_at ASC
  LOOP
    -- Vérifier si c'est un véhicule valide
    IF is_listing_valid_vehicle(v_listing.id) THEN
      -- ✅ APPROUVER
      UPDATE listings
      SET 
        status = 'active',
        updated_at = NOW()
      WHERE id = v_listing.id;

      v_approved := v_approved + 1;
      v_details := v_details || jsonb_build_object(
        'id', v_listing.id,
        'title', v_listing.title,
        'action', 'approved',
        'reason', 'auto-modération: validations OK'
      );

      RAISE NOTICE 'Auto-approuvé: % (%, %)', v_listing.title, v_listing.brand, v_listing.model;

    ELSE
      -- ❌ REJETER (validation échouée)
      UPDATE listings
      SET 
        status = 'rejected',
        updated_at = NOW()
      WHERE id = v_listing.id;

      v_rejected := v_rejected + 1;
      v_details := v_details || jsonb_build_object(
        'id', v_listing.id,
        'title', v_listing.title,
        'action', 'rejected',
        'reason', 'auto-modération: validations échouées'
      );

      RAISE NOTICE 'Auto-rejeté: % (validation échouée)', v_listing.title;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_approved, v_rejected, v_details;
END;
$$;

-- ================================================================
-- 3. FONCTION PUBLIQUE POUR TESTER
-- ================================================================
-- Permet de tester la validation d'une annonce spécifique

CREATE OR REPLACE FUNCTION test_auto_moderation(listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_valid BOOLEAN;
  v_listing RECORD;
BEGIN
  SELECT * INTO v_listing FROM listings WHERE id = listing_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Annonce introuvable'
    );
  END IF;

  v_is_valid := is_listing_valid_vehicle(listing_id);

  RETURN jsonb_build_object(
    'success', true,
    'listing_id', listing_id,
    'title', v_listing.title,
    'current_status', v_listing.status,
    'is_valid', v_is_valid,
    'would_be_approved', v_is_valid,
    'created_at', v_listing.created_at,
    'age_minutes', EXTRACT(EPOCH FROM (NOW() - v_listing.created_at)) / 60
  );
END;
$$;

-- ================================================================
-- 4. PERMISSIONS
-- ================================================================

GRANT EXECUTE ON FUNCTION is_listing_valid_vehicle(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION auto_approve_pending_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION test_auto_moderation(UUID) TO authenticated;

-- ================================================================
-- 5. COMMENTAIRES
-- ================================================================

COMMENT ON FUNCTION is_listing_valid_vehicle IS 'Vérifie qu''une annonce est un véhicule valide (champs obligatoires + cohérence + mots-clés)';
COMMENT ON FUNCTION auto_approve_pending_listings IS 'Approuve automatiquement les annonces en pending depuis >5min si elles sont valides';
COMMENT ON FUNCTION test_auto_moderation IS 'Test la validation auto-modération sur une annonce spécifique';

-- ================================================================
-- 6. NOTES D'UTILISATION
-- ================================================================
-- Pour exécuter manuellement l'auto-modération:
--   SELECT * FROM auto_approve_pending_listings();
--
-- Pour tester une annonce spécifique:
--   SELECT test_auto_moderation('uuid-de-l-annonce');
--
-- Pour automatiser (2 options):
--   OPTION A: pg_cron (extension Supabase)
--     SELECT cron.schedule(
--       'auto-approve-listings',
--       '*/5 * * * *', -- Toutes les 5 minutes
--       $$ SELECT auto_approve_pending_listings(); $$
--     );
--
--   OPTION B: Edge Function appelée par un webhook externe (ex: GitHub Actions, cron-job.org)
