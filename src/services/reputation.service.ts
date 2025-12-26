/**
 * Service pour gérer la réputation et les badges des vendeurs
 */

import { supabase, isSupabaseConfigured } from '../app/lib/supabase';

export type BadgeType = 'verified' | 'top_seller' | 'fast_responder' | 'trusted' | 'premium';

export interface Badge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
}

export interface VendorReview {
  id: string;
  vendor_id: string;
  buyer_id: string;
  buyer_name?: string;
  listing_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface VendorStats {
  vendor_id: string;
  full_name: string;
  user_type: string;
  member_since: string;
  total_listings: number;
  active_listings: number;
  sold_listings: number;
  total_reviews: number;
  avg_rating: number;
  total_badges: number;
  badges: BadgeType[];
  avg_response_time_hours: number;
  response_rate: number;
}

export const BADGE_INFO: Record<BadgeType, { label: string; icon: string; color: string; description: string }> = {
  verified: {
    label: 'Vérifié',
    icon: '✓',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Identité vérifiée par l\'équipe',
  },
  top_seller: {
    label: 'Top Vendeur',
    icon: '🏆',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    description: '10+ véhicules vendus',
  },
  fast_responder: {
    label: 'Réponse Rapide',
    icon: '⚡',
    color: 'bg-green-100 text-green-700 border-green-300',
    description: 'Répond en moins de 2h',
  },
  trusted: {
    label: 'Vendeur de Confiance',
    icon: '⭐',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    description: 'Note 4.5+ avec 10+ avis',
  },
  premium: {
    label: 'Vendeur Premium',
    icon: '💎',
    color: 'bg-pink-100 text-pink-700 border-pink-300',
    description: '50+ annonces actives',
  },
};

class ReputationService {
  /**
   * Récupère les stats d'un vendeur
   */
  async getVendorStats(vendorId: string): Promise<VendorStats | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('vendor_stats')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Reputation] Error fetching vendor stats:', error);
      return null;
    }
  }

  /**
   * Récupère les badges d'un vendeur
   */
  async getVendorBadges(vendorId: string): Promise<Badge[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('vendor_badges')
        .select('*')
        .eq('user_id', vendorId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Reputation] Error fetching badges:', error);
      return [];
    }
  }

  /**
   * Récupère les avis d'un vendeur
   */
  async getVendorReviews(vendorId: string, limit = 10): Promise<VendorReview[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('vendor_reviews')
        .select(`
          *,
          buyer:buyer_id (
            full_name
          )
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(review => ({
        ...review,
        buyer_name: (review as any).buyer?.full_name || 'Acheteur',
      }));
    } catch (error) {
      console.error('[Reputation] Error fetching reviews:', error);
      return [];
    }
  }

  /**
   * Ajoute un avis pour un vendeur
   */
  async addReview(vendorId: string, buyerId: string, listingId: string, rating: number, comment?: string) {
    if (!isSupabaseConfigured) return { error: 'Supabase non configuré' };

    try {
      const { data, error } = await supabase
        .from('vendor_reviews')
        .insert({
          vendor_id: vendorId,
          buyer_id: buyerId,
          listing_id: listingId,
          rating,
          comment,
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour les badges du vendeur
      await this.updateVendorBadges(vendorId);

      return { data, error: null };
    } catch (error: any) {
      console.error('[Reputation] Error adding review:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Met à jour les badges d'un vendeur selon ses performances
   */
  async updateVendorBadges(vendorId: string) {
    if (!isSupabaseConfigured) return;

    try {
      await supabase.rpc('update_vendor_badges', {
        p_vendor_id: vendorId,
      });
    } catch (error) {
      console.error('[Reputation] Error updating badges:', error);
    }
  }

  /**
   * Ajoute manuellement un badge (admin uniquement)
   */
  async addBadge(vendorId: string, badgeType: BadgeType) {
    if (!isSupabaseConfigured) return { error: 'Supabase non configuré' };

    try {
      const { data, error } = await supabase
        .from('vendor_badges')
        .insert({
          user_id: vendorId,
          badge_type: badgeType,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('[Reputation] Error adding badge:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Supprime un badge (admin uniquement)
   */
  async removeBadge(vendorId: string, badgeType: BadgeType) {
    if (!isSupabaseConfigured) return { error: 'Supabase non configuré' };

    try {
      const { error } = await supabase
        .from('vendor_badges')
        .delete()
        .eq('user_id', vendorId)
        .eq('badge_type', badgeType);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('[Reputation] Error removing badge:', error);
      return { error: error.message };
    }
  }

  /**
   * Calcule le score de réputation global (0-100)
   */
  calculateReputationScore(stats: VendorStats): number {
    let score = 0;

    // Note moyenne (40 points max)
    score += (stats.avg_rating / 5) * 40;

    // Nombre de ventes (30 points max)
    score += Math.min((stats.sold_listings / 50) * 30, 30);

    // Taux de réponse (15 points max)
    score += (stats.response_rate / 100) * 15;

    // Temps de réponse (15 points max)
    const responseScore = Math.max(0, 1 - (stats.avg_response_time_hours / 24));
    score += responseScore * 15;

    return Math.round(score);
  }

  /**
   * Obtient le niveau de réputation textuel
   */
  getReputationLevel(score: number): { level: string; color: string } {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600' };
    if (score >= 75) return { level: 'Très bon', color: 'text-blue-600' };
    if (score >= 60) return { level: 'Bon', color: 'text-yellow-600' };
    if (score >= 40) return { level: 'Moyen', color: 'text-orange-600' };
    return { level: 'À améliorer', color: 'text-red-600' };
  }
}

export const reputationService = new ReputationService();

