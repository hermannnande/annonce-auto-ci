import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Force le scroll en haut à chaque navigation (changement de pathname).
 * Utile quand on clique une annonce depuis une liste scrollée.
 */
export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // "auto" = immédiat, évite l'effet smooth involontaire
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}

