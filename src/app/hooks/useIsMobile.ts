import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fonction pour vérifier la taille de l'écran
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Vérifier au chargement
    checkMobile();

    // Écouter les changements de taille
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}


