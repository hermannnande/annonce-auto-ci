import { useEffect } from 'react';
import { boostService } from '../services/boost.service';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * Hook pour vérifier et désactiver automatiquement les boosts expirés
 * À utiliser dans le composant principal de l'application
 */
export function useBoostChecker() {
  useEffect(() => {
    // Ne rien faire si Supabase n'est pas configuré (mode DÉMO)
    if (!isSupabaseConfigured) {
      return;
    }

    // Vérifier les boosts expirés au montage du composant
    const checkBoosts = async () => {
      await boostService.checkExpiredBoosts();
    };

    checkBoosts();

    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkBoosts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}