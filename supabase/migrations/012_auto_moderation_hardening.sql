-- ================================================================
-- AUTO-MODÉRATION: HARDENING + COMPAT SERVICE_ROLE
-- ================================================================
-- - Ajoute des GRANT explicites pour service_role (Edge Function)
-- - Renseigne approved_at / rejected_at / reject_reason
-- - Sécurise les fonctions SECURITY DEFINER avec search_path
-- ================================================================

-- 1) Validation: sécuriser search_path
CREATE OR REPLACE FUNCTION is_listing_valid_vehicle(listing_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
  SELECT * INTO v_listing
  FROM listings
  WHERE id = listing_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Champs obligatoires (min)
  IF v_listing.title IS NULL OR LENGTH(TRIM(v_listing.title)) < 5 THEN
    RETURN FALSE;
  END IF;
  IF v_listing.brand IS NULL OR LENGTH(TRIM(v_listing.brand)) < 2 THEN
    RETURN FALSE;
  END IF;
  IF v_listing.model IS NULL OR LENGTH(TRIM(v_listing.model)) < 1 THEN
    RETURN FALSE;
  END IF;

  -- Cohérence
  IF v_listing.price < 100000 OR v_listing.price > 500000000 THEN
    RETURN FALSE;
  END IF;
  IF v_listing.year < 1990 OR v_listing.year > EXTRACT(YEAR FROM NOW()) + 1 THEN
    RETURN FALSE;
  END IF;
  IF v_listing.mileage < 0 OR v_listing.mileage > 1000000 THEN
    RETURN FALSE;
  END IF;

  -- Au moins une image (images TEXT[])
  IF v_listing.images IS NULL OR array_length(v_listing.images, 1) IS NULL OR array_length(v_listing.images, 1) < 1 THEN
    RETURN FALSE;
  END IF;

  v_title_lower := LOWER(COALESCE(v_listing.title, ''));
  v_desc_lower := LOWER(COALESCE(v_listing.description, ''));

  FOREACH v_keyword IN ARRAY v_vehicle_keywords LOOP
    IF v_title_lower LIKE '%' || v_keyword || '%' OR v_desc_lower LIKE '%' || v_keyword || '%' THEN
      v_has_vehicle_keyword := TRUE;
      EXIT;
    END IF;
  END LOOP;

  FOREACH v_keyword IN ARRAY v_brand_list LOOP
    IF LOWER(v_listing.brand) LIKE '%' || v_keyword || '%' THEN
      v_has_valid_brand := TRUE;
      EXIT;
    END IF;
  END LOOP;

  IF NOT v_has_vehicle_keyword AND NOT v_has_valid_brand THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- 2) Auto-approbation: renseigner approved_at / rejected_at / reject_reason + sécuriser search_path
CREATE OR REPLACE FUNCTION auto_approve_pending_listings()
RETURNS TABLE(
  approved_count INTEGER,
  rejected_count INTEGER,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_listing RECORD;
  v_approved INTEGER := 0;
  v_rejected INTEGER := 0;
  v_details JSONB := '[]'::JSONB;
  v_cutoff_time TIMESTAMPTZ;
BEGIN
  v_cutoff_time := NOW() - INTERVAL '5 minutes';

  FOR v_listing IN
    SELECT id, title, brand, model, created_at, user_id
    FROM listings
    WHERE status = 'pending'
      AND created_at <= v_cutoff_time
    ORDER BY created_at ASC
  LOOP
    IF is_listing_valid_vehicle(v_listing.id) THEN
      UPDATE listings
      SET
        status = 'active',
        approved_at = COALESCE(approved_at, NOW()),
        rejected_at = NULL,
        reject_reason = NULL,
        updated_at = NOW()
      WHERE id = v_listing.id;

      v_approved := v_approved + 1;
      v_details := v_details || jsonb_build_object(
        'id', v_listing.id,
        'title', v_listing.title,
        'action', 'approved',
        'reason', 'auto-modération: validations OK'
      );
    ELSE
      UPDATE listings
      SET
        status = 'rejected',
        rejected_at = COALESCE(rejected_at, NOW()),
        reject_reason = COALESCE(reject_reason, 'auto-modération: validations échouées'),
        approved_at = NULL,
        updated_at = NOW()
      WHERE id = v_listing.id;

      v_rejected := v_rejected + 1;
      v_details := v_details || jsonb_build_object(
        'id', v_listing.id,
        'title', v_listing.title,
        'action', 'rejected',
        'reason', 'auto-modération: validations échouées'
      );
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_approved, v_rejected, v_details;
END;
$$;

-- 3) Test helper: sécuriser search_path
CREATE OR REPLACE FUNCTION test_auto_moderation(listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_valid BOOLEAN;
  v_listing RECORD;
BEGIN
  SELECT * INTO v_listing FROM listings WHERE id = listing_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Annonce introuvable');
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

-- 4) GRANTS explicites (Edge Functions utilisent service_role)
GRANT EXECUTE ON FUNCTION is_listing_valid_vehicle(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auto_approve_pending_listings() TO service_role;
GRANT EXECUTE ON FUNCTION test_auto_moderation(UUID) TO authenticated, service_role;

COMMENT ON FUNCTION auto_approve_pending_listings IS 'Approuve automatiquement les annonces en pending depuis >5min si elles sont valides (hardening + service_role)';

