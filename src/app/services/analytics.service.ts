import { supabase } from '../lib/supabase';

// Vérifier si Supabase est configuré
const isSupabaseConfigured = (): boolean => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key && url !== 'your-project-url' && key !== 'your-anon-key');
  } catch {
    return false;
  }
};

export interface ViewRecord {
  listingId: string;
  userId?: string;
  timestamp: number;
  sessionId: string;
}

export interface ConversionRecord {
  listingId: string;
  userId: string;
  type: 'contact' | 'favorite' | 'boost';
  timestamp: number;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  pendingListings: number;
  totalViews: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  revenueGrowth: number;
  userGrowth: number;
}

export interface ListingStats {
  listingId: string;
  views: number;
  uniqueViews: number;
  conversions: number;
  conversionRate: number;
  averageViewDuration?: number;
}

export interface GeographicStats {
  city: string;
  listings: number;
  views: number;
  percentage: number;
}

class AnalyticsService {
  private sessionId: string;

  constructor() {
    // Créer un ID de session unique
    this.sessionId = this.getOrCreateSessionId();
  }

  /**
   * 🆕 Obtenir ou créer un ID de session
   */
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * 🆕 Enregistrer une vue d'annonce
   */
  async trackView(listingId: string, userId?: string): Promise<void> {
    const viewRecord: ViewRecord = {
      listingId,
      userId,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    // MODE DÉMO : Stocker dans localStorage
    if (!isSupabaseConfigured()) {
      const views = this.getStoredViews();
      views.push(viewRecord);
      localStorage.setItem('analytics_views', JSON.stringify(views));
      return;
    }

    // MODE RÉEL : Stocker dans Supabase
    try {
      await supabase.from('analytics_views').insert({
        listing_id: listingId,
        user_id: userId,
        session_id: this.sessionId,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur tracking vue:', error);
    }
  }

  /**
   * 🆕 Enregistrer une conversion (contact, favori, boost)
   */
  async trackConversion(
    listingId: string,
    userId: string,
    type: 'contact' | 'favorite' | 'boost'
  ): Promise<void> {
    const conversionRecord: ConversionRecord = {
      listingId,
      userId,
      type,
      timestamp: Date.now()
    };

    // MODE DÉMO
    if (!isSupabaseConfigured()) {
      const conversions = this.getStoredConversions();
      conversions.push(conversionRecord);
      localStorage.setItem('analytics_conversions', JSON.stringify(conversions));
      return;
    }

    // MODE RÉEL
    try {
      await supabase.from('analytics_conversions').insert({
        listing_id: listingId,
        user_id: userId,
        conversion_type: type,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur tracking conversion:', error);
    }
  }

  /**
   * 🆕 Obtenir les statistiques d'une annonce
   */
  async getListingStats(listingId: string): Promise<ListingStats> {
    // MODE DÉMO
    if (!isSupabaseConfigured()) {
      const views = this.getStoredViews().filter(v => v.listingId === listingId);
      const conversions = this.getStoredConversions().filter(c => c.listingId === listingId);
      
      // Calculer les vues uniques (par session)
      const uniqueSessions = new Set(views.map(v => v.sessionId));
      const uniqueViews = uniqueSessions.size;

      return {
        listingId,
        views: views.length,
        uniqueViews,
        conversions: conversions.length,
        conversionRate: views.length > 0 ? (conversions.length / views.length) * 100 : 0
      };
    }

    // MODE RÉEL
    try {
      const [viewsResult, conversionsResult] = await Promise.all([
        supabase
          .from('analytics_views')
          .select('*')
          .eq('listing_id', listingId),
        supabase
          .from('analytics_conversions')
          .select('*')
          .eq('listing_id', listingId)
      ]);

      const views = viewsResult.data || [];
      const conversions = conversionsResult.data || [];
      const uniqueSessions = new Set(views.map(v => v.session_id));

      return {
        listingId,
        views: views.length,
        uniqueViews: uniqueSessions.size,
        conversions: conversions.length,
        conversionRate: views.length > 0 ? (conversions.length / views.length) * 100 : 0
      };
    } catch (error) {
      console.error('Erreur récupération stats annonce:', error);
      return {
        listingId,
        views: 0,
        uniqueViews: 0,
        conversions: 0,
        conversionRate: 0
      };
    }
  }

  /**
   * 🆕 Obtenir les statistiques globales de la plateforme
   */
  async getPlatformStats(): Promise<PlatformStats> {
    // MODE DÉMO : Calculer à partir des données stockées + mock data enrichi
    if (!isSupabaseConfigured()) {
      const views = this.getStoredViews();
      const conversions = this.getStoredConversions();
      
      // Données mock enrichies avec calculs réels
      const mockUsers = 235;
      const activeUsers = Math.round(mockUsers * 0.8); // 80% actifs
      const totalListings = 892;
      const activeListings = Math.round(totalListings * 0.85);
      const soldListings = Math.round(totalListings * 0.08);
      const pendingListings = Math.round(totalListings * 0.07);
      
      // Stats calculées depuis le tracking
      const totalViews = views.length + 45000; // Base + tracking réel
      const totalConversions = conversions.length + 3500;
      const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 5.2;
      
      // Revenue (basé sur les conversions + mock)
      const totalRevenue = 1150000;
      const previousRevenue = 920000;
      const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
      
      // Croissance utilisateurs
      const previousUsers = 217;
      const userGrowth = ((mockUsers - previousUsers) / previousUsers) * 100;

      return {
        totalUsers: mockUsers,
        activeUsers,
        totalListings,
        activeListings,
        soldListings,
        pendingListings,
        totalViews,
        totalConversions,
        conversionRate,
        totalRevenue,
        revenueGrowth,
        userGrowth
      };
    }

    // MODE RÉEL : Récupérer depuis Supabase
    try {
      const [usersResult, listingsResult, viewsResult, conversionsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('listings').select('status', { count: 'exact' }),
        supabase.from('analytics_views').select('*', { count: 'exact' }),
        supabase.from('analytics_conversions').select('*', { count: 'exact' })
      ]);

      const totalUsers = usersResult.count || 0;
      const listings = listingsResult.data || [];
      const totalViews = viewsResult.count || 0;
      const totalConversions = conversionsResult.count || 0;

      // Calculer les utilisateurs actifs (connectés dans les 30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

      // Statistiques des annonces
      const activeListings = listings.filter(l => l.status === 'active').length;
      const soldListings = listings.filter(l => l.status === 'sold').length;
      const pendingListings = listings.filter(l => l.status === 'pending').length;

      // Taux de conversion
      const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

      // Revenus (calculer depuis les boosts et les recharges)
      const { data: boosts } = await supabase
        .from('boosts')
        .select('credits_used');
      
      const totalRevenue = (boosts || []).reduce((sum, boost) => sum + boost.credits_used, 0);

      // Croissance (comparer avec le mois précédent)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const { count: previousUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', lastMonth.toISOString());

      const userGrowth = previousUsers ? ((totalUsers - previousUsers) / previousUsers) * 100 : 0;
      const revenueGrowth = 15.8; // À calculer depuis l'historique

      return {
        totalUsers,
        activeUsers: activeUsers || 0,
        totalListings: listings.length,
        activeListings,
        soldListings,
        pendingListings,
        totalViews,
        totalConversions,
        conversionRate,
        totalRevenue,
        revenueGrowth,
        userGrowth
      };
    } catch (error) {
      console.error('Erreur récupération stats plateforme:', error);
      // Retourner des valeurs par défaut
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalListings: 0,
        activeListings: 0,
        soldListings: 0,
        pendingListings: 0,
        totalViews: 0,
        totalConversions: 0,
        conversionRate: 0,
        totalRevenue: 0,
        revenueGrowth: 0,
        userGrowth: 0
      };
    }
  }

  /**
   * 🆕 Obtenir les statistiques géographiques
   */
  async getGeographicStats(): Promise<GeographicStats[]> {
    // MODE DÉMO
    if (!isSupabaseConfigured()) {
      return [
        { city: 'Abidjan', listings: 520, views: 28500, percentage: 65 },
        { city: 'Yamoussoukro', listings: 125, views: 6800, percentage: 16 },
        { city: 'Bouaké', listings: 78, views: 4200, percentage: 10 },
        { city: 'San-Pédro', listings: 45, views: 2500, percentage: 6 },
        { city: 'Daloa', listings: 32, views: 1800, percentage: 3 }
      ];
    }

    // MODE RÉEL
    try {
      const { data: listings } = await supabase
        .from('listings')
        .select('location')
        .eq('status', 'active');

      if (!listings) return [];

      // Compter par ville
      const cityCount: Record<string, number> = {};
      listings.forEach(listing => {
        const city = listing.location || 'Autre';
        cityCount[city] = (cityCount[city] || 0) + 1;
      });

      const total = listings.length;
      
      // Convertir en tableau et calculer les pourcentages
      const stats = Object.entries(cityCount)
        .map(([city, count]) => ({
          city,
          listings: count,
          views: Math.round(count * 55), // Approximation: 55 vues par annonce en moyenne
          percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.listings - a.listings)
        .slice(0, 5); // Top 5

      return stats;
    } catch (error) {
      console.error('Erreur récupération stats géographiques:', error);
      return [];
    }
  }

  /**
   * 🆕 Obtenir les données pour le graphique de croissance des utilisateurs
   */
  async getUserGrowthData(days: number = 7): Promise<any[]> {
    // MODE DÉMO
    if (!isSupabaseConfigured()) {
      const mockData = [
        { date: '01 Déc', users: 120, active: 95 },
        { date: '05 Déc', users: 145, active: 112 },
        { date: '10 Déc', users: 178, active: 138 },
        { date: '15 Déc', users: 210, active: 165 },
        { date: '18 Déc', users: 235, active: 188 }
      ];
      return mockData;
    }

    // MODE RÉEL : À implémenter avec des données réelles
    return [];
  }

  /**
   * Helper: Récupérer les vues stockées
   */
  private getStoredViews(): ViewRecord[] {
    const stored = localStorage.getItem('analytics_views');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Helper: Récupérer les conversions stockées
   */
  private getStoredConversions(): ConversionRecord[] {
    const stored = localStorage.getItem('analytics_conversions');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 🆕 Nettoyer les anciennes données (garder seulement 90 jours)
   */
  cleanupOldData(): void {
    if (!isSupabaseConfigured()) {
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      
      // Nettoyer les vues
      const views = this.getStoredViews().filter(v => v.timestamp > ninetyDaysAgo);
      localStorage.setItem('analytics_views', JSON.stringify(views));
      
      // Nettoyer les conversions
      const conversions = this.getStoredConversions().filter(c => c.timestamp > ninetyDaysAgo);
      localStorage.setItem('analytics_conversions', JSON.stringify(conversions));
    }
  }
}

export const analyticsService = new AnalyticsService();

// Nettoyer les anciennes données au démarrage
analyticsService.cleanupOldData();
