-- ✅ Vérifier toutes les annonces et leur statut
SELECT 
  id,
  title,
  brand,
  model,
  price,
  status,
  created_at,
  user_id
FROM listings
ORDER BY created_at DESC;

-- ✅ Compter les annonces par statut
SELECT 
  status,
  COUNT(*) as count
FROM listings
GROUP BY status;

-- ✅ Si tu n'as AUCUNE annonce active, active-les toutes
-- (À exécuter seulement si besoin)
-- UPDATE listings
-- SET status = 'active'
-- WHERE status = 'pending';




