import { supabase } from '../lib/supabase';
import type { Favorite } from '../lib/supabase';

/**
 * Service de gestion des favoris
 * Permet aux utilisateurs de sauvegarder leurs annonces préférées
 */
class FavoritesService {
  /**
   * Récupérer tous les favoris d'un utilisateur
   */
  async getUserFavorites(userId: string): Promise<{ favorites: Favorite[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          listing:listings(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération favoris:', error);
        return { favorites: [], error: error as Error };
      }

      return { favorites: data as Favorite[], error: null };
    } catch (error) {
      console.error('Exception récupération favoris:', error);
      return { favorites: [], error: error as Error };
    }
  }

  /**
   * Vérifier si une annonce est dans les favoris
   */
  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    try {
      // IMPORTANT:
      // `.single()` déclenche un HTTP 406 (Not Acceptable) si 0 ligne est retournée,
      // ce qui pollue la console/réseau alors que "pas en favori" est un cas normal.
      // On utilise donc une requête qui retourne un tableau (0 ou 1 élément).
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .limit(1);

      if (error) {
        console.error('Erreur vérification favori:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Exception vérification favori:', error);
      return false;
    }
  }

  /**
   * Ajouter une annonce aux favoris
   */
  async addFavorite(userId: string, listingId: string): Promise<{ error: Error | null }> {
    try {
      // Vérifier si déjà en favoris
      const alreadyFavorite = await this.isFavorite(userId, listingId);
      if (alreadyFavorite) {
        return { error: new Error('Déjà dans vos favoris') };
      }

      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          listing_id: listingId,
        });

      if (error) {
        console.error('Erreur ajout favori:', error);
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception ajout favori:', error);
      return { error: error as Error };
    }
  }

  /**
   * Retirer une annonce des favoris
   */
  async removeFavorite(userId: string, listingId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);

      if (error) {
        console.error('Erreur suppression favori:', error);
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception suppression favori:', error);
      return { error: error as Error };
    }
  }

  /**
   * Basculer le statut favori (toggle)
   */
  async toggleFavorite(userId: string, listingId: string): Promise<{ isFavorite: boolean; error: Error | null }> {
    try {
      const currentlyFavorite = await this.isFavorite(userId, listingId);

      if (currentlyFavorite) {
        const { error } = await this.removeFavorite(userId, listingId);
        return { isFavorite: false, error };
      } else {
        const { error } = await this.addFavorite(userId, listingId);
        return { isFavorite: true, error };
      }
    } catch (error) {
      console.error('Exception toggle favori:', error);
      return { isFavorite: false, error: error as Error };
    }
  }

  /**
   * Compter le nombre de favoris pour une annonce
   */
  async getFavoriteCount(listingId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', listingId);

      if (error) {
        console.error('Erreur comptage favoris:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Exception comptage favoris:', error);
      return 0;
    }
  }

  /**
   * Récupérer les IDs des annonces favorites d'un utilisateur
   */
  async getFavoriteListingIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur récupération IDs favoris:', error);
        return [];
      }

      return data?.map((fav) => fav.listing_id) || [];
    } catch (error) {
      console.error('Exception récupération IDs favoris:', error);
      return [];
    }
  }
}

export const favoritesService = new FavoritesService();
