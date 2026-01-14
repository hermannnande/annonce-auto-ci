-- Vérification des boosts (dates, cohérences) - AnnonceAuto.ci
-- À exécuter dans Supabase -> SQL Editor

-- 1) Derniers boosts créés (historique)
SELECT
  id,
  listing_id,
  user_id,
  duration_days,
  credits_used,
  started_at,
  ends_at,
  is_active,
  created_at
FROM boosts
ORDER BY created_at DESC
LIMIT 50;

-- 2) Annonces actuellement marquées comme boostées (cohérence)
SELECT
  id,
  title,
  user_id,
  status,
  is_boosted,
  boost_until,
  NOW() AS now,
  (boost_until IS NOT NULL AND boost_until > NOW()) AS boost_actif
FROM listings
WHERE is_boosted = true
ORDER BY boost_until DESC NULLS LAST
LIMIT 50;

-- 3) Incohérences à corriger (boost flag true mais date vide/expirée)
SELECT
  id,
  title,
  user_id,
  status,
  is_boosted,
  boost_until
FROM listings
WHERE is_boosted = true
  AND (boost_until IS NULL OR boost_until <= NOW())
ORDER BY boost_until ASC NULLS FIRST
LIMIT 200;

-- 4) Boosts actifs mais annonce non marquée boostée (incohérence inverse)
-- (si tu utilises le champ `is_active` dans boosts)
SELECT
  b.id AS boost_id,
  b.listing_id,
  b.user_id,
  b.ends_at,
  b.is_active,
  l.is_boosted,
  l.boost_until,
  l.status
FROM boosts b
JOIN listings l ON l.id = b.listing_id
WHERE b.is_active = true
  AND b.ends_at > NOW()
  AND (l.is_boosted = false OR l.boost_until IS NULL OR l.boost_until <= NOW())
ORDER BY b.ends_at DESC
LIMIT 200;









