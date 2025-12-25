-- Fonction pour incrémenter le compteur de pages vues dans une session
CREATE OR REPLACE FUNCTION increment_session_page_views(p_session_id VARCHAR)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE analytics_sessions
  SET page_views = page_views + 1
  WHERE session_id = p_session_id;
END;
$$;


