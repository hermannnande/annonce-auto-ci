import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Service pour gérer les boosts d'annonces
 */
class BoostService {
  /**
   * 🆕 Vérifier et désactiver les boosts expirés
   * Cette fonction devrait être appelée régulièrement (par exemple au chargement de l'app)
   */
  async checkExpiredBoosts(): Promise<void> {
    // Ne rien faire si Supabase n'est pas configuré (mode DÉMO)
    if (!isSupabaseConfigured) {
      return;
    }

    try {
      const now = new Date().toISOString();

      // 1. Désactiver les boosts expirés dans la table boosts
      const { error: boostsError } = await supabase
        .from('boosts')
        .update({ is_active: false })
        .eq('is_active', true)
        .lt('ends_at', now);

      if (boostsError) {
        console.error('Erreur désactivation boosts expirés:', boostsError);
      }

      // 2. Mettre à jour les annonces dont le boost a expiré
      const { error: listingsError } = await supabase
        .from('listings')
        .update({ is_boosted: false })
        .eq('is_boosted', true)
        .lt('boost_until', now);

      if (listingsError) {
        console.error('Erreur mise à jour annonces boostées expirées:', listingsError);
      }
    } catch (error) {
      // Ignorer silencieusement les erreurs en mode DÉMO
      if (isSupabaseConfigured) {
        console.error('Erreur vérification boosts expirés:', error);
      }
    }
  }

  /**
   * 🆕 Obtenir les statistiques de boost pour un utilisateur
   */
  async getUserBoostStats(userId: string): Promise<{
    totalBoosts: number;
    activeBoosts: number;
    totalCreditsSpent: number;
    totalDays: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('boosts')
        .select('credits_used, duration_days, is_active')
        .eq('user_id', userId);

      if (error || !data) {
        return {
          totalBoosts: 0,
          activeBoosts: 0,
          totalCreditsSpent: 0,
          totalDays: 0
        };
      }

      return {
        totalBoosts: data.length,
        activeBoosts: data.filter(b => b.is_active).length,
        totalCreditsSpent: data.reduce((sum, b) => sum + (b.credits_used || 0), 0),
        totalDays: data.reduce((sum, b) => sum + (b.duration_days || 0), 0)
      };
    } catch (error) {
      console.error('Erreur stats boosts utilisateur:', error);
      return {
        totalBoosts: 0,
        activeBoosts: 0,
        totalCreditsSpent: 0,
        totalDays: 0
      };
    }
  }

  /**
   * 🆕 Obtenir tous les boosts actifs (ADMIN)
   */
  async getAllActiveBoosts(): Promise<any[]> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('boosts')
        .select('*, listings(title, brand, model, price), profiles(full_name, email)')
        .eq('is_active', true)
        .gt('ends_at', now)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération boosts actifs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur récupération boosts actifs:', error);
      return [];
    }
  }

  /**
   * 🆕 Obtenir les statistiques globales de boost (ADMIN)
   */
  async getGlobalBoostStats(): Promise<{
    totalBoosts: number;
    activeBoosts: number;
    totalCreditsSpent: number;
    totalRevenue: number;
  }> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('boosts')
        .select('credits_used, is_active, ends_at');

      if (error || !data) {
        return {
          totalBoosts: 0,
          activeBoosts: 0,
          totalCreditsSpent: 0,
          totalRevenue: 0
        };
      }

      const activeBoosts = data.filter(b => b.is_active && b.ends_at > now);

      return {
        totalBoosts: data.length,
        activeBoosts: activeBoosts.length,
        totalCreditsSpent: data.reduce((sum, b) => sum + (b.credits_used || 0), 0),
        totalRevenue: data.reduce((sum, b) => sum + (b.credits_used || 0) * 100, 0) // 1 crédit = 100 FCFA
      };
    } catch (error) {
      console.error('Erreur stats globales boosts:', error);
      return {
        totalBoosts: 0,
        activeBoosts: 0,
        totalCreditsSpent: 0,
        totalRevenue: 0
      };
    }
  }

  /**
   * 🆕 Vérifier si une annonce peut être boostée
   */
  async canBoostListing(listingId: string): Promise<{ 
    canBoost: boolean; 
    reason?: string;
    currentBoostEndsAt?: string;
  }> {
    try {
      const { data: listing, error } = await supabase
        .from('listings')
        .select('is_boosted, boost_until, status')
        .eq('id', listingId)
        .single();

      if (error || !listing) {
        return { canBoost: false, reason: 'Annonce introuvable' };
      }

      if (listing.status !== 'active') {
        return { canBoost: false, reason: 'L\'annonce doit être active pour être boostée' };
      }

      if (listing.is_boosted) {
        const boostEndsAt = new Date(listing.boost_until || '');
        const now = new Date();

        if (boostEndsAt > now) {
          return { 
            canBoost: false, 
            reason: 'Cette annonce est déjà boostée',
            currentBoostEndsAt: listing.boost_until
          };
        }
      }

      return { canBoost: true };
    } catch (error) {
      console.error('Erreur vérification éligibilité boost:', error);
      return { canBoost: false, reason: 'Erreur lors de la vérification' };
    }
  }

  /**
   * 🆕 Renouveler ou étendre un boost existant
   */
  async extendBoost(
    listingId: string,
    userId: string,
    additionalDays: number,
    creditsUsed: number
  ): Promise<{ error: Error | null }> {
    try {
      const { data: listing } = await supabase
        .from('listings')
        .select('boost_until')
        .eq('id', listingId)
        .single();

      let newEndDate = new Date();
      
      // Si le boost est toujours actif, on étend à partir de la date de fin actuelle
      if (listing?.boost_until && new Date(listing.boost_until) > new Date()) {
        newEndDate = new Date(listing.boost_until);
      }
      
      newEndDate.setDate(newEndDate.getDate() + additionalDays);

      // Créer un nouveau boost
      const { error: boostError } = await supabase
        .from('boosts')
        .insert({
          listing_id: listingId,
          user_id: userId,
          duration_days: additionalDays,
          credits_used: creditsUsed,
          ends_at: newEndDate.toISOString(),
          is_active: true
        });

      if (boostError) {
        return { error: boostError as Error };
      }

      // Mettre à jour l'annonce
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          is_boosted: true,
          boost_until: newEndDate.toISOString()
        })
        .eq('id', listingId);

      if (updateError) {
        return { error: updateError as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur extension boost:', error);
      return { error: error as Error };
    }
  }
}

export const boostService = new BoostService();