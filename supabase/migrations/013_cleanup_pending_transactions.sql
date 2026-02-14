-- ============================================
-- Migration 013: Nettoyage des transactions pending
-- Date: 14 Février 2026
-- ============================================

-- 1) Marquer comme "failed" toutes les transactions pending de plus de 24h
-- Ces transactions sont des paiements abandonnés ou des webhooks manqués
UPDATE credits_transactions
SET 
  payment_status = 'failed',
  description = description || ' [Auto-nettoyage: pending > 24h, marqué failed le ' || NOW()::date::text || ']'
WHERE payment_status = 'pending'
  AND created_at < NOW() - INTERVAL '24 hours';

-- 2) Créer une fonction réutilisable pour le nettoyage futur
-- Cette fonction peut être appelée depuis le frontend admin ou via un cron
CREATE OR REPLACE FUNCTION cleanup_stale_pending_transactions(
  hours_threshold INTEGER DEFAULT 24
)
RETURNS TABLE(
  cleaned_count INTEGER,
  cleaned_amount BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INTEGER;
  v_amount BIGINT;
BEGIN
  -- Compter avant le nettoyage
  SELECT COUNT(*), COALESCE(SUM(amount * 100), 0)
  INTO v_count, v_amount
  FROM credits_transactions
  WHERE payment_status = 'pending'
    AND created_at < NOW() - (hours_threshold || ' hours')::INTERVAL;

  -- Marquer comme failed
  UPDATE credits_transactions
  SET 
    payment_status = 'failed',
    description = description || ' [Nettoyage auto: pending > ' || hours_threshold || 'h]'
  WHERE payment_status = 'pending'
    AND created_at < NOW() - (hours_threshold || ' hours')::INTERVAL;

  RETURN QUERY SELECT v_count, v_amount;
END;
$$;

-- 3) Accorder les permissions
GRANT EXECUTE ON FUNCTION cleanup_stale_pending_transactions(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_stale_pending_transactions(INTEGER) TO service_role;

-- 4) Vérifier le résultat
SELECT 
  payment_status,
  COUNT(*) as nombre,
  SUM(amount) as total_credits,
  SUM(amount * 100) as total_fcfa
FROM credits_transactions
WHERE type = 'purchase'
GROUP BY payment_status
ORDER BY payment_status;
