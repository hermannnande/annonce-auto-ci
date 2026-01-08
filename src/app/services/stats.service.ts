import { supabase } from '../lib/supabase';

interface GlobalStats {
  totalUsers: number;
  totalVendors: number;
  totalAdmins: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  rejectedListings: number;
  soldListings: number;
  totalViews: number;
  totalRevenue: number;
  totalBoosts: number;
}

interface VendorDetailedStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  rejectedListings: number;
  boostedListings: number;
  totalViews: number;
  totalFavorites: number;
  averagePrice: number;
  viewsData: Array<{ date: string; views: number }>;
}

interface RevenueData {
  date: string;
  revenue: number;
  boosts: number;
}

class StatsService {
  /**
   * Statistiques globales pour l'admin
   */
  async getGlobalStats(): Promise<GlobalStats> {
    try {
      // Compter les utilisateurs par type
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalVendors } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'vendor');

      const { count: totalAdmins } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'admin');

      // Compter les annonces par statut
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      const { count: activeListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: pendingListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: rejectedListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      const { count: soldListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sold');

      // Somme des vues
      const { data: viewsData } = await supabase
        .from('listings')
        .select('views');

      const totalViews = viewsData?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0;

      // Compter les annonces boostées
      const { count: totalBoosts } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_boosted', true);

      // Somme des revenus (transactions de crédits)
      const { data: transactions } = await supabase
        .from('credits_transactions')
        .select('amount')
        .eq('type', 'purchase');

      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        totalVendors: totalVendors || 0,
        totalAdmins: totalAdmins || 0,
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        pendingListings: pendingListings || 0,
        rejectedListings: rejectedListings || 0,
        soldListings: soldListings || 0,
        totalViews,
        totalRevenue,
        totalBoosts: totalBoosts || 0,
      };
    } catch (error) {
      console.error('Erreur récupération stats globales:', error);
      return {
        totalUsers: 0,
        totalVendors: 0,
        totalAdmins: 0,
        totalListings: 0,
        activeListings: 0,
        pendingListings: 0,
        rejectedListings: 0,
        soldListings: 0,
        totalViews: 0,
        totalRevenue: 0,
        totalBoosts: 0,
      };
    }
  }

  /**
   * Statistiques détaillées pour un vendeur
   */
  async getVendorDetailedStats(userId: string): Promise<VendorDetailedStats> {
    try {
      // Récupérer toutes les annonces du vendeur
      const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId);

      if (!listings) {
        return this.getEmptyVendorStats();
      }

      const totalListings = listings.length;
      const activeListings = listings.filter(l => l.status === 'active').length;
      const pendingListings = listings.filter(l => l.status === 'pending').length;
      const soldListings = listings.filter(l => l.status === 'sold').length;
      const rejectedListings = listings.filter(l => l.status === 'rejected').length;
      const boostedListings = listings.filter(l => l.is_boosted).length;

      const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
      
      // Calculer le prix moyen
      const prices = listings.map(l => l.price).filter(p => p > 0);
      const averagePrice = prices.length > 0 
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length 
        : 0;

      // Compter les favoris
      const { count: totalFavorites } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .in('listing_id', listings.map(l => l.id));

      // Données de vues par jour (7 derniers jours)
      const viewsData = await this.getViewsDataForVendor(userId);

      return {
        totalListings,
        activeListings,
        pendingListings,
        soldListings,
        rejectedListings,
        boostedListings,
        totalViews,
        totalFavorites: totalFavorites || 0,
        averagePrice,
        viewsData,
      };
    } catch (error) {
      console.error('Erreur récupération stats vendeur:', error);
      return this.getEmptyVendorStats();
    }
  }

  /**
   * Données de vues pour les 7 derniers jours
   */
  private async getViewsDataForVendor(userId: string): Promise<Array<{ date: string; views: number }>> {
    try {
      // Récupérer les vues tracking des 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: viewsTracking } = await supabase
        .from('views_tracking')
        .select('viewed_at, listing_id')
        .gte('viewed_at', sevenDaysAgo.toISOString())
        .order('viewed_at', { ascending: true });

      if (!viewsTracking || viewsTracking.length === 0) {
        return this.getEmptyViewsData();
      }

      // Récupérer les IDs des annonces du vendeur
      const { data: vendorListings } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', userId);

      const vendorListingIds = vendorListings?.map(l => l.id) || [];

      // Filtrer les vues pour les annonces du vendeur
      const vendorViews = viewsTracking.filter(v => vendorListingIds.includes(v.listing_id));

      // Grouper par jour
      const viewsByDate = new Map<string, number>();
      // getDay(): 0=Dim, 1=Lun, ... 6=Sam
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];
        const dateStr = date.toISOString().split('T')[0];
        
        const viewsCount = vendorViews.filter(v => 
          v.viewed_at.startsWith(dateStr)
        ).length;
        
        viewsByDate.set(dayName, viewsCount);
      }

      return Array.from(viewsByDate.entries()).map(([date, views]) => ({ date, views }));
    } catch (error) {
      console.error('Erreur récupération données de vues:', error);
      return this.getEmptyViewsData();
    }
  }

  /**
   * Données de revenus par mois (pour admin)
   */
  async getRevenueData(months: number = 6): Promise<RevenueData[]> {
    try {
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - months);

      // Récupérer les transactions
      const { data: transactions } = await supabase
        .from('credits_transactions')
        .select('amount, type, created_at')
        .gte('created_at', monthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (!transactions || transactions.length === 0) {
        return this.getEmptyRevenueData(months);
      }

      // Grouper par mois
      const revenueByMonth = new Map<string, { revenue: number; boosts: number }>();
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

      // Initialiser les 6 derniers mois
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = monthNames[date.getMonth()];
        revenueByMonth.set(monthName, { revenue: 0, boosts: 0 });
      }

      // Remplir avec les vraies données
      transactions.forEach(t => {
        const date = new Date(t.created_at);
        const monthName = monthNames[date.getMonth()];
        
        if (revenueByMonth.has(monthName)) {
          const current = revenueByMonth.get(monthName)!;
          
          if (t.type === 'purchase') {
            current.revenue += t.amount;
          } else if (t.type === 'boost') {
            current.boosts += Math.abs(t.amount);
          }
        }
      });

      return Array.from(revenueByMonth.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        boosts: data.boosts,
      }));
    } catch (error) {
      console.error('Erreur récupération données de revenus:', error);
      return this.getEmptyRevenueData(months);
    }
  }

  /**
   * Stats vides pour vendeur
   */
  private getEmptyVendorStats(): VendorDetailedStats {
    return {
      totalListings: 0,
      activeListings: 0,
      pendingListings: 0,
      soldListings: 0,
      rejectedListings: 0,
      boostedListings: 0,
      totalViews: 0,
      totalFavorites: 0,
      averagePrice: 0,
      viewsData: this.getEmptyViewsData(),
    };
  }

  /**
   * Données de vues vides
   */
  private getEmptyViewsData(): Array<{ date: string; views: number }> {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days.map(date => ({ date, views: 0 }));
  }

  /**
   * Données de revenus vides
   */
  private getEmptyRevenueData(months: number): RevenueData[] {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const result: RevenueData[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = monthNames[date.getMonth()];
      result.push({ date: monthName, revenue: 0, boosts: 0 });
    }

    return result;
  }

  /**
   * Annonces en attente (pour admin)
   */
  async getPendingListings(limit: number = 10) {
    try {
      const { data: listings, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return listings || [];
    } catch (error) {
      console.error('Erreur récupération annonces en attente:', error);
      return [];
    }
  }

  /**
   * Transactions récentes (pour admin)
   */
  async getRecentTransactions(limit: number = 10) {
    try {
      const { data: transactions, error } = await supabase
        .from('credits_transactions')
        .select(`
          *,
          profiles!credits_transactions_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return transactions || [];
    } catch (error) {
      console.error('Erreur récupération transactions récentes:', error);
      return [];
    }
  }
}

export const statsService = new StatsService();




