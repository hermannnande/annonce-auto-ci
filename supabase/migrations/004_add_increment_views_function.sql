-- ✅ Créer la fonction pour incrémenter les vues
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE listings
  SET 
    views = COALESCE(views, 0) + 1,
    updated_at = NOW()
  WHERE id = listing_id;
END;
$$;

-- ✅ Donner les permissions
GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO anon, authenticated;




