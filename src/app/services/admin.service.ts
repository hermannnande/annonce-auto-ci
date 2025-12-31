import { supabase } from '../lib/supabase';
import type { Listing, Profile, CreditTransaction } from '../lib/supabase';

/**
 * Service d'administration
 * Fonctions réservées aux administrateurs
 * 
 * ⚠️ SÉCURITÉ:
 * - Les vérifications de permissions admin sont faites par les RLS Policies Supabase
 * - Les routes frontend sont protégées par ProtectedRoute (requiredUserType="admin")
 * - Même si ces méthodes sont appelées côté client, Supabase refusera les requêtes
 *   si l'utilisateur n'a pas user_type = 'admin'
 */
class AdminService {
  /**
   * Récupérer toutes les annonces en attente de modération
   */
  async getPendingListings(): Promise<{ listings: Listing[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération annonces en attente:', error);
        return { listings: [], error: error as Error };
      }

      return { listings: data as Listing[], error: null };
    } catch (error) {
      console.error('Exception récupération annonces en attente:', error);
      return { listings: [], error: error as Error };
    }
  }

  /**
   * Récupérer toutes les annonces (tous statuts)
   */
  async getAllListings(): Promise<{ listings: Listing[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération toutes les annonces:', error);
        return { listings: [], error: error as Error };
      }

      return { listings: data as Listing[], error: null };
    } catch (error) {
      console.error('Exception récupération toutes les annonces:', error);
      return { listings: [], error: error as Error };
    }
  }

  /**
   * Approuver une annonce
   */
  async approveListing(listingId: string, adminId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      if (error) {
        console.error('Erreur approbation annonce:', error);
        return { error: error as Error };
      }

      // TODO: Envoyer une notification au vendeur
      console.log(`✅ Annonce ${listingId} approuvée par admin ${adminId}`);

      return { error: null };
    } catch (error) {
      console.error('Exception approbation annonce:', error);
      return { error: error as Error };
    }
  }

  /**
   * Rejeter une annonce
   */
  async rejectListing(
    listingId: string,
    adminId: string,
    reason?: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      if (error) {
        console.error('Erreur rejet annonce:', error);
        return { error: error as Error };
      }

      // TODO: Envoyer une notification au vendeur avec la raison du rejet
      console.log(`❌ Annonce ${listingId} rejetée par admin ${adminId}`, { reason });

      return { error: null };
    } catch (error) {
      console.error('Exception rejet annonce:', error);
      return { error: error as Error };
    }
  }

  /**
   * Supprimer une annonce (admin uniquement)
   */
  async deleteListing(listingId: string, adminId: string): Promise<{ error: Error | null }> {
    try {
      // Suppression définitive (admin).
      // NOTE: si la base refuse la suppression (FK), on affichera l'erreur côté UI.
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) {
        console.error('Erreur suppression annonce:', error);
        return { error: error as Error };
      }

      console.log(`🗑️ Annonce ${listingId} supprimée par admin ${adminId}`);

      return { error: null };
    } catch (error) {
      console.error('Exception suppression annonce:', error);
      return { error: error as Error };
    }
  }

  /**
   * Récupérer tous les utilisateurs
   */
  async getAllUsers(): Promise<{ users: Profile[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération utilisateurs:', error);
        return { users: [], error: error as Error };
      }

      return { users: data as Profile[], error: null };
    } catch (error) {
      console.error('Exception récupération utilisateurs:', error);
      return { users: [], error: error as Error };
    }
  }

  /**
   * Modifier le type d'utilisateur (vendor <-> admin)
   */
  async updateUserType(
    userId: string,
    userType: 'vendor' | 'admin',
    adminId: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', userId);

      if (error) {
        console.error('Erreur modification type utilisateur:', error);
        return { error: error as Error };
      }

      console.log(`👤 Utilisateur ${userId} changé en ${userType} par admin ${adminId}`);

      return { error: null };
    } catch (error) {
      console.error('Exception modification type utilisateur:', error);
      return { error: error as Error };
    }
  }

  /**
   * Suspendre/Activer un utilisateur
   */
  async toggleUserStatus(
    userId: string,
    suspend: boolean,
    adminId: string
  ): Promise<{ error: Error | null }> {
    try {
      // TODO: Ajouter un champ 'suspended' dans la table profiles
      // Pour l'instant, on log juste l'action
      console.log(`${suspend ? '🚫' : '✅'} Utilisateur ${userId} ${suspend ? 'suspendu' : 'activé'} par admin ${adminId}`);

      return { error: null };
    } catch (error) {
      console.error('Exception toggle statut utilisateur:', error);
      return { error: error as Error };
    }
  }

  /**
   * Attribuer des crédits à un utilisateur (bonus admin)
   */
  async grantCredits(
    userId: string,
    amount: number,
    adminId: string,
    reason: string
  ): Promise<{ error: Error | null }> {
    try {
      // Utiliser le service de crédits
      const { creditsService } = await import('./credits.service');
      
      const { error } = await creditsService.addCredits(
        userId,
        amount,
        'bonus',
        `Bonus admin: ${reason}`
      );

      if (error) {
        return { error };
      }

      console.log(`💰 Admin ${adminId} a attribué ${amount} crédits à ${userId}: ${reason}`);

      return { error: null };
    } catch (error) {
      console.error('Exception attribution crédits:', error);
      return { error: error as Error };
    }
  }

  /**
   * Récupérer les statistiques globales de la plateforme
   */
  async getPlatformStats(): Promise<{
    totalUsers: number;
    totalVendors: number;
    totalAdmins: number;
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    rejectedListings: number;
    totalViews: number;
    totalFavorites: number;
    totalCreditsTransactions: number;
    error: Error | null;
  }> {
    try {
      // Compter les utilisateurs
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalVendors, error: vendorsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'vendor');

      const { count: totalAdmins, error: adminsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'admin');

      // Compter les annonces
      const { count: totalListings, error: listingsError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      const { count: activeListings, error: activeError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: pendingListings, error: pendingError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: rejectedListings, error: rejectedError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      // Compter les vues
      const { data: listings, error: viewsError } = await supabase
        .from('listings')
        .select('views');

      const totalViews = listings?.reduce((sum, l) => sum + (l.views || 0), 0) || 0;

      // Compter les favoris
      const { count: totalFavorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });

      // Compter les transactions
      const { count: totalCreditsTransactions, error: txError } = await supabase
        .from('credits_transactions')
        .select('*', { count: 'exact', head: true });

      if (usersError || vendorsError || adminsError || listingsError || activeError || 
          pendingError || rejectedError || viewsError || favoritesError || txError) {
        throw new Error('Erreur récupération statistiques');
      }

      return {
        totalUsers: totalUsers || 0,
        totalVendors: totalVendors || 0,
        totalAdmins: totalAdmins || 0,
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        pendingListings: pendingListings || 0,
        rejectedListings: rejectedListings || 0,
        totalViews,
        totalFavorites: totalFavorites || 0,
        totalCreditsTransactions: totalCreditsTransactions || 0,
        error: null,
      };
    } catch (error) {
      console.error('Exception statistiques plateforme:', error);
      return {
        totalUsers: 0,
        totalVendors: 0,
        totalAdmins: 0,
        totalListings: 0,
        activeListings: 0,
        pendingListings: 0,
        rejectedListings: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalCreditsTransactions: 0,
        error: error as Error,
      };
    }
  }

  /**
   * Récupérer les transactions récentes (pour monitoring)
   */
  async getRecentTransactions(limit: number = 50): Promise<{
    transactions: CreditTransaction[];
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('credits_transactions')
        .select(`
          *,
          profile:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur récupération transactions récentes:', error);
        return { transactions: [], error: error as Error };
      }

      return { transactions: data as CreditTransaction[], error: null };
    } catch (error) {
      console.error('Exception récupération transactions récentes:', error);
      return { transactions: [], error: error as Error };
    }
  }

  /**
   * Rechercher des utilisateurs
   */
  async searchUsers(query: string): Promise<{ users: Profile[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erreur recherche utilisateurs:', error);
        return { users: [], error: error as Error };
      }

      return { users: data as Profile[], error: null };
    } catch (error) {
      console.error('Exception recherche utilisateurs:', error);
      return { users: [], error: error as Error };
    }
  }
}

export const adminService = new AdminService();
