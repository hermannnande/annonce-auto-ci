import { supabase, type Listing } from '../lib/supabase';

export interface ListingFilters {
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  location?: string;
  search?: string;
}

export interface CreateListingData {
  title: string;
  description?: string;
  price: number;
  year: number;
  mileage: number;
  brand: string;
  model: string;
  fuel_type: string; // Accepte français ET anglais
  transmission: string; // Accepte français ET anglais
  condition: string; // Accepte français ET anglais
  location: string;
  images: string[];
  color?: string;
  doors?: number;
}

// Mode DÉMO - localStorage fallback
const DEMO_MODE = false; // ✅ Mode Supabase ACTIVÉ
const DEMO_LISTINGS_KEY = 'annonceauto_demo_listings';

// Fonctions de conversion FR → Format base de données (avec majuscules)
function convertCondition(condition: string): string {
  const map: Record<string, string> = {
    'neuf': 'Neuf',
    'new': 'Neuf',
    'occasion': 'Occasion',
    'used': 'Occasion',
    'importé': 'Importé',
    'imported': 'Importé'
  };
  return map[condition.toLowerCase()] || 'Occasion';
}

function convertTransmission(transmission: string): string {
  const map: Record<string, string> = {
    'manuelle': 'Manuelle',
    'manual': 'Manuelle',
    'automatique': 'Automatique',
    'automatic': 'Automatique'
  };
  return map[transmission.toLowerCase()] || 'Manuelle';
}

function convertFuelType(fuelType: string): string {
  const map: Record<string, string> = {
    'essence': 'Essence',
    'gasoline': 'Essence',
    'diesel': 'Diesel',
    'electrique': 'Électrique',
    'electric': 'Électrique',
    'électrique': 'Électrique',
    'hybride': 'Hybride',
    'hybrid': 'Hybride'
  };
  return map[fuelType.toLowerCase()] || 'Essence';
}

class ListingsService {
  private readonly LISTING_CARD_SELECT =
    // ⚡ Perf: on évite de récupérer description, etc. sur les pages liste
    'id,user_id,title,brand,model,year,price,mileage,fuel_type,transmission,condition,location,images,status,views,is_boosted,boost_until,boost_expires_at,featured,created_at,updated_at';

  private readonly cache = new Map<string, { at: number; data: Listing[] }>();
  private readonly CACHE_TTL_MS = 30_000; // 30s (stale-while-revalidate simple)

  private makeCacheKey(prefix: string, obj: unknown): string {
    try {
      return `${prefix}:${JSON.stringify(obj)}`;
    } catch {
      return `${prefix}:${String(obj)}`;
    }
  }

  private getCached(key: string): Listing[] | null {
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < this.CACHE_TTL_MS) return hit.data;
    return null;
  }

  private setCached(key: string, data: Listing[]) {
    this.cache.set(key, { at: Date.now(), data });
  }
  private isMissingColumnError(err: unknown): boolean {
    const anyErr = err as any;
    const msg = (anyErr?.message as string | undefined) ?? '';
    const code = (anyErr?.code as string | undefined) ?? '';
    return (
      code === 'PGRST204' ||
      msg.includes("Could not find the 'boost_until' column") ||
      msg.includes("Could not find the 'boost_expires_at' column") ||
      msg.toLowerCase().includes('schema cache') ||
      msg.toLowerCase().includes('column') && msg.toLowerCase().includes('does not exist')
    );
  }

  private applyFilters(query: any, filters?: ListingFilters) {
    if (!filters) return query;

    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin);
    }
    if (filters.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax);
    }
    if (filters.yearMin !== undefined) {
      query = query.gte('year', filters.yearMin);
    }
    if (filters.yearMax !== undefined) {
      query = query.lte('year', filters.yearMax);
    }
    if (filters.fuelType) {
      query = query.eq('fuel_type', filters.fuelType);
    }
    if (filters.transmission) {
      query = query.eq('transmission', filters.transmission);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`
      );
    }

    return query;
  }

  private getBoostUntil(listing: Listing): string | undefined {
    const anyListing = listing as any;
    return (anyListing?.boost_until ?? anyListing?.boost_expires_at ?? undefined) as
      | string
      | undefined;
  }

  private isBoostActive(listing: Listing, nowMs: number): boolean {
    if (!listing.is_boosted) return false;
    const boostUntil = this.getBoostUntil(listing);
    if (!boostUntil) return false;
    const t = new Date(boostUntil).getTime();
    return Number.isFinite(t) && t > nowMs;
  }

  /**
   * Récupérer toutes les annonces avec filtres
   * @param filters - Filtres optionnels
   * @param limit - Nombre maximum d'annonces à récupérer (défaut: 300)
   */
  async getAllListings(filters?: ListingFilters, limit: number = 300): Promise<Listing[]> {
    if (DEMO_MODE) {
      // En mode DÉMO, retourner un tableau vide ou des données de démo
      const listingsData = localStorage.getItem(DEMO_LISTINGS_KEY);
      if (!listingsData) return [];
      
      const listings = JSON.parse(listingsData);
      return listings;
    }
    
    try {
      const nowIso = new Date().toISOString();
      const nowMs = Date.now();

      // ✅ Stratégie robuste:
      // 1) Charger d'abord les BOOSTS ACTIFS (is_boosted=true + boost_until > now)
      // 2) Charger ensuite le reste (en excluant les ids déjà récupérés)
      // => garantit que les annonces sponsorisées restent toujours en tête.

      const baseQuery = () =>
        this.applyFilters(
          supabase.from('listings').select(this.LISTING_CARD_SELECT).eq('status', 'active'),
          filters
        );

      const fetchBoostedActive = async (boostColumn: 'boost_until' | 'boost_expires_at') => {
        const q = baseQuery()
          .eq('is_boosted', true)
          .gt(boostColumn, nowIso)
          .order('created_at', { ascending: false })
          .limit(Math.min(100, limit)); // on ne veut pas exploser la limite

        const { data, error } = await q;
        return { data: (data as Listing[]) || [], error };
      };

      // ⚡ Cache: évite de re-taper Supabase quand on navigue entre pages
      const cacheKey = this.makeCacheKey('listings:getAll', { filters: filters || null, limit });
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      // 1) Boosts actifs
      let boostedActive: Listing[] = [];
      {
        const attempt1 = await fetchBoostedActive('boost_until');
        if (!attempt1.error) {
          boostedActive = attempt1.data;
        } else {
          // fallback compat si la colonne s'appelle boost_expires_at
          const attempt2 = await fetchBoostedActive('boost_expires_at');
          if (attempt2.error) {
            // si les deux échouent, on continue sans boosterActive (on loggue)
            console.error('Erreur récupération boosts actifs:', attempt2.error);
          } else {
            boostedActive = attempt2.data;
          }
        }
      }

      const remaining = Math.max(0, limit - boostedActive.length);
      if (remaining === 0) {
        // Tri final (au cas où) : boosts actifs en tête + date
        return boostedActive.sort((a, b) => {
          const aBoost = this.isBoostActive(a, nowMs) ? 1 : 0;
          const bBoost = this.isBoostActive(b, nowMs) ? 1 : 0;
          if (aBoost !== bBoost) return bBoost - aBoost;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }

      // 2) Reste des annonces
      let restQuery = baseQuery().order('created_at', { ascending: false }).limit(remaining);
      if (boostedActive.length > 0) {
        const ids = boostedActive.map((l) => l.id).filter(Boolean);
        // supabase-js attend: "(id1,id2,...)"
        restQuery = restQuery.not('id', 'in', `(${ids.join(',')})`);
      }

      const { data: restData, error: restError } = await restQuery;
      if (restError) {
        console.error('Erreur récupération annonces (reste):', restError);
        // on retourne quand même les boosts actifs en tête
        return boostedActive;
      }

      const combined = [...boostedActive, ...((restData as Listing[]) || [])];

      // Tri final : boosts actifs d'abord, puis date (sécurité)
      const result = combined.sort((a, b) => {
        const aBoost = this.isBoostActive(a, nowMs) ? 1 : 0;
        const bBoost = this.isBoostActive(b, nowMs) ? 1 : 0;
        if (aBoost !== bBoost) return bBoost - aBoost;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur récupération annonces:', error);
      return [];
    }
  }

  /**
   * ⚡ Perf: récupérer des annonces similaires sans charger toutes les annonces
   */
  async getSimilarListings(brand: string, excludeId: string, limit: number = 3): Promise<Listing[]> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(this.LISTING_CARD_SELECT)
        .eq('status', 'active')
        .eq('brand', brand)
        .neq('id', excludeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur récupération annonces similaires:', error);
        return [];
      }

      return (data as Listing[]) || [];
    } catch (error) {
      console.error('Erreur récupération annonces similaires:', error);
      return [];
    }
  }

  /**
   * Récupérer une annonce par ID
   */
  async getListingById(id: string): Promise<Listing | null> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur récupération annonce:', error);
        return null;
      }

      return data as Listing;
    } catch (error) {
      console.error('Erreur récupération annonce:', error);
      return null;
    }
  }

  /**
   * Récupérer les annonces d'un utilisateur
   */
  async getUserListings(userId: string, status?: string): Promise<Listing[]> {
    if (DEMO_MODE) {
      // En mode DÉMO, retourner un tableau vide
      return [];
    }
    
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur récupération annonces utilisateur:', error);
        return [];
      }

      return data as Listing[];
    } catch (error) {
      console.error('Erreur récupération annonces utilisateur:', error);
      return [];
    }
  }

  /**
   * Créer une nouvelle annonce
   */
  async createListing(userId: string, data: CreateListingData): Promise<{ listing: Listing | null; error: Error | null }> {
    try {
      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          user_id: userId,
          title: data.title,
          description: data.description,
          price: data.price,
          year: data.year,
          mileage: data.mileage,
          brand: data.brand,
          model: data.model,
          fuel_type: convertFuelType(data.fuel_type),
          transmission: convertTransmission(data.transmission),
          condition: convertCondition(data.condition),
          location: data.location,
          images: data.images,
          color: data.color,
          doors: data.doors,
          status: 'pending',
          views: 0,
          is_boosted: false,
          featured: false
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la création:', error);
        return { listing: null, error: error as Error };
      }

      return { listing: listing as Listing, error: null };
    } catch (error) {
      console.error('Erreur création annonce:', error);
      return { listing: null, error: error as Error };
    }
  }

  /**
   * Mettre à jour une annonce existante
   * ⚠️ Le statut repasse automatiquement à "pending" pour re-validation admin
   */
  async updateListing(listingId: string, userId: string, data: CreateListingData): Promise<{ listing: Listing | null; error: Error | null }> {
    try {
      // Vérifier que l'annonce appartient bien à l'utilisateur
      const { data: existingListing, error: checkError } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', listingId)
        .single();

      if (checkError || !existingListing) {
        return { listing: null, error: new Error('Annonce introuvable') };
      }

      if (existingListing.user_id !== userId) {
        return { listing: null, error: new Error('Vous n\'êtes pas autorisé à modifier cette annonce') };
      }

      // Mettre à jour l'annonce et REPASSER en "pending" pour re-validation
      const { data: updatedListing, error } = await supabase
        .from('listings')
        .update({
          title: data.title,
          description: data.description,
          price: data.price,
          year: data.year,
          mileage: data.mileage,
          brand: data.brand,
          model: data.model,
          fuel_type: convertFuelType(data.fuel_type),
          transmission: convertTransmission(data.transmission),
          condition: convertCondition(data.condition),
          location: data.location,
          images: data.images,
          color: data.color,
          doors: data.doors,
          status: 'pending', // ⚠️ IMPORTANT : Repasse en "pending" pour re-validation
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la mise à jour:', error);
        return { listing: null, error: error as Error };
      }

      return { listing: updatedListing as Listing, error: null };
    } catch (error) {
      console.error('Erreur mise à jour annonce:', error);
      return { listing: null, error: error as Error };
    }
  }

  /**
   * Alias pour createListing (compatibilité)
   */
  async createVehicle(userId: string, data: CreateListingData): Promise<{ listing: Listing | null; error: Error | null }> {
    return this.createListing(userId, data);
  }

  /**
   * Supprimer une annonce (avec vérification de propriété)
   */
  async deleteListing(listingId: string, userId: string): Promise<{ error: Error | null }> {
    try {
      // Vérifier que l'annonce appartient bien à l'utilisateur
      const { data: existingListing, error: checkError } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', listingId)
        .single();

      if (checkError || !existingListing) {
        return { error: new Error('Annonce introuvable') };
      }

      if (existingListing.user_id !== userId) {
        return { error: new Error('Vous n\'êtes pas autorisé à supprimer cette annonce') };
      }

      // Supprimer l'annonce
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) {
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur suppression annonce:', error);
      return { error: error as Error };
    }
  }

  /**
   * Incrémenter les vues d'une annonce
   */
  async incrementViews(id: string): Promise<void> {
    try {
      await supabase.rpc('increment_listing_views', { listing_id: id });
    } catch (error) {
      console.error('Erreur incrémentation vues:', error);
    }
  }

  /**
   * Booster une annonce
   */
  async boostListing(
    listingId: string, 
    userId: string, 
    durationDays: number, 
    creditsUsed: number
  ): Promise<{ error: Error | null }> {
    try {
      // Règle métier:
      // - Si l'annonce n'est pas boostée (ou boost expiré) => début = maintenant
      // - Si l'annonce est déjà boostée et encore active => on PROLONGE depuis boost_until
      const now = new Date();
      let baseStart = now;

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('boost_until, is_boosted, status, user_id')
        .eq('id', listingId)
        .single();

      if (listingError) {
        return { error: listingError as Error };
      }

      // Sécurité (et cohérence RLS): ne booster que l'annonce du propriétaire
      if (listing?.user_id && listing.user_id !== userId) {
        return { error: new Error('Vous ne pouvez pas booster une annonce qui ne vous appartient pas') };
      }

      // Optionnel: exiger une annonce active pour être boostée (sinon boost inutile)
      if (listing?.status && listing.status !== 'active') {
        return { error: new Error('L\'annonce doit être active pour être boostée') };
      }

      if (listing?.is_boosted && listing?.boost_until) {
        const currentEnd = new Date(listing.boost_until);
        if (currentEnd > now) {
          baseStart = currentEnd; // on prolonge après la fin actuelle
        }
      }

      const endsAt = new Date(baseStart);
      endsAt.setDate(endsAt.getDate() + durationDays);

      // Créer le boost
      // On tente d'inclure `started_at` si la colonne existe (sinon on retente sans)
      const boostInsertBase: any = {
        listing_id: listingId,
        user_id: userId,
        duration_days: durationDays,
        credits_used: creditsUsed,
        ends_at: endsAt.toISOString(),
        is_active: true,
      };

      let boostError: any = null;
      {
        const { error } = await supabase
          .from('boosts')
          .insert({ ...boostInsertBase, started_at: now.toISOString() });
        boostError = error;
      }

      // Si started_at n'existe pas dans le schéma (ou cache PostgREST), on retente sans started_at
      if (boostError) {
        const msg = (boostError as any)?.message as string | undefined;
        const code = (boostError as any)?.code as string | undefined;
        const isMissingColumn =
          code === 'PGRST204' ||
          msg?.includes("Could not find the 'started_at' column") ||
          msg?.includes('schema cache');

        if (isMissingColumn) {
          const { error: retryError } = await supabase
            .from('boosts')
            .insert(boostInsertBase);
          boostError = retryError;
        }
      }

      if (boostError) {
        return { error: boostError as Error };
      }

      // Mettre à jour l'annonce
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          is_boosted: true,
          boost_until: endsAt.toISOString()
        })
        .eq('id', listingId)
        .eq('user_id', userId);

      if (updateError) {
        return { error: updateError as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur boost annonce:', error);
      return { error: error as Error };
    }
  }

  /**
   * Changer le statut d'une annonce
   */
  async updateStatus(
    id: string, 
    status: 'active' | 'pending' | 'sold' | 'rejected' | 'archived'
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', id);

      if (error) {
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur changement statut:', error);
      return { error: error as Error };
    }
  }

  /**
   * Obtenir les statistiques des annonces d'un utilisateur
   */
  async getUserStats(userId: string): Promise<{
    total: number;
    active: number;
    sold: number;
    totalViews: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('status, views')
        .eq('user_id', userId);

      if (error || !data) {
        return { total: 0, active: 0, sold: 0, totalViews: 0 };
      }

      const stats = {
        total: data.length,
        active: data.filter(l => l.status === 'active').length,
        sold: data.filter(l => l.status === 'sold').length,
        totalViews: data.reduce((sum, l) => sum + (l.views || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Erreur stats utilisateur:', error);
      return { total: 0, active: 0, sold: 0, totalViews: 0 };
    }
  }

  /**
   * 🆕 Récupérer les annonces de l'utilisateur connecté (alias pour getUserListings)
   */
  async getMyVehicles(): Promise<Listing[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      return this.getUserListings(user.id);
    } catch (error) {
      console.error('Erreur récupération mes véhicules:', error);
      return [];
    }
  }

  /**
   * 🆕 Récupérer les annonces en attente de modération (ADMIN)
   */
  async getPendingVehicles(): Promise<Listing[]> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération annonces en attente:', error);
        return [];
      }

      return data as Listing[];
    } catch (error) {
      console.error('Erreur récupération annonces en attente:', error);
      return [];
    }
  }

  /**
   * 🆕 Modérer une annonce (ADMIN: approuver ou rejeter)
   */
  async moderateVehicle(
    listingId: string, 
    action: 'approve' | 'reject',
    rejectionReason?: string
  ): Promise<{ error: Error | null }> {
    try {
      const newStatus = action === 'approve' ? 'active' : 'rejected';
      
      const updates: any = {
        status: newStatus,
        moderated_at: new Date().toISOString()
      };

      if (action === 'reject' && rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', listingId);

      if (error) {
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur modération annonce:', error);
      return { error: error as Error };
    }
  }

  /**
   * 🆕 Obtenir l'historique des paiements (boosts)
   */
  async getPaymentHistory(userId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('boosts')
        .select('*, listings(title, brand, model)')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur récupération historique paiements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur récupération historique paiements:', error);
      return [];
    }
  }

  /**
   * 🆕 Obtenir les statistiques vendeur détaillées
   */
  async getVendorStats(userId: string): Promise<{
    totalListings: number;
    activeListings: number;
    soldListings: number;
    pendingListings: number;
    totalViews: number;
    averageViews: number;
    boostedListings: number;
    totalRevenue: number;
  }> {
    try {
      // Récupérer les annonces
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('status, views, is_boosted, price')
        .eq('user_id', userId);

      if (listingsError || !listings) {
        return {
          totalListings: 0,
          activeListings: 0,
          soldListings: 0,
          pendingListings: 0,
          totalViews: 0,
          averageViews: 0,
          boostedListings: 0,
          totalRevenue: 0
        };
      }

      const stats = {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'active').length,
        soldListings: listings.filter(l => l.status === 'sold').length,
        pendingListings: listings.filter(l => l.status === 'pending').length,
        totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
        averageViews: listings.length > 0 
          ? Math.round(listings.reduce((sum, l) => sum + (l.views || 0), 0) / listings.length)
          : 0,
        boostedListings: listings.filter(l => l.is_boosted).length,
        totalRevenue: listings
          .filter(l => l.status === 'sold')
          .reduce((sum, l) => sum + (l.price || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Erreur stats vendeur:', error);
      return {
        totalListings: 0,
        activeListings: 0,
        soldListings: 0,
        pendingListings: 0,
        totalViews: 0,
        averageViews: 0,
        boostedListings: 0,
        totalRevenue: 0
      };
    }
  }

  /**
   * 🆕 Obtenir les statistiques admin (globales)
   */
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    soldListings: number;
    rejectedListings: number;
    totalViews: number;
    totalBoosts: number;
    totalRevenue: number;
  }> {
    try {
      // Récupérer tous les utilisateurs
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Récupérer toutes les annonces
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('status, views, price');

      if (listingsError || !listings) {
        return {
          totalUsers: totalUsers || 0,
          totalListings: 0,
          activeListings: 0,
          pendingListings: 0,
          soldListings: 0,
          rejectedListings: 0,
          totalViews: 0,
          totalBoosts: 0,
          totalRevenue: 0
        };
      }

      // Récupérer tous les boosts
      const { count: totalBoosts } = await supabase
        .from('boosts')
        .select('*', { count: 'exact', head: true });

      const stats = {
        totalUsers: totalUsers || 0,
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'active').length,
        pendingListings: listings.filter(l => l.status === 'pending').length,
        soldListings: listings.filter(l => l.status === 'sold').length,
        rejectedListings: listings.filter(l => l.status === 'rejected').length,
        totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
        totalBoosts: totalBoosts || 0,
        totalRevenue: listings
          .filter(l => l.status === 'sold')
          .reduce((sum, l) => sum + (l.price || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Erreur stats admin:', error);
      return {
        totalUsers: 0,
        totalListings: 0,
        activeListings: 0,
        pendingListings: 0,
        soldListings: 0,
        rejectedListings: 0,
        totalViews: 0,
        totalBoosts: 0,
        totalRevenue: 0
      };
    }
  }
}

export const listingsService = new ListingsService();