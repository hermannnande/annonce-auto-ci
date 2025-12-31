/**
 * Service Analytics - Tracking complet du site
 * 
 * Ce service gère :
 * - Tracking des pages vues
 * - Tracking des événements utilisateur
 * - Détection automatique du device, browser, OS
 * - Session management
 * - Heartbeat pour utilisateurs en ligne
 */

import { supabase, isSupabaseConfigured } from '../app/lib/supabase';
import { UAParser } from 'ua-parser-js';

// Types
export interface AnalyticsEvent {
  event_type: 'page_view' | 'listing_view' | 'search' | 'click' | 'conversion' | 'favorite' | 'message' | 'boost';
  page_url?: string;
  page_title?: string;
  referrer?: string;
  listing_id?: string;
  search_query?: string;
  conversion_type?: string;
  conversion_value?: number;
  metadata?: Record<string, any>;
}

export interface SessionInfo {
  session_id: string;
  device_type: string;
  browser: string;
  os: string;
  user_agent: string;
}

interface GeoInfo {
  country?: string;
  city?: string;
}

class AnalyticsService {
  private sessionId: string;
  private sessionInfo: SessionInfo | null = null;
  private geoInfo: GeoInfo | null = null;
  private geoInfoPromise: Promise<GeoInfo | null> | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastPageView: string | null = null;
  private canIncrementSessionPageViews: boolean = true;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initSession();
  }

  /**
   * Initialise la session et démarre le heartbeat
   */
  private async initSession() {
    // Si Supabase n'est pas configuré, ne rien faire
    if (!isSupabaseConfigured) {
      console.log('[Analytics] Supabase non configuré - tracking désactivé');
      return;
    }
    
    this.sessionInfo = this.getSessionInfo();
    // Best-effort: enrichir avec une géolocalisation IP (pays/ville)
    // pour alimenter la section "Répartition géographique" du dashboard admin.
    await this.ensureGeoInfo();
    await this.startSession();
    this.startHeartbeat();
    
    // Track page view au chargement
    this.trackPageView();
    
    // Track page view lors des changements de route
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => this.trackPageView());
    }
  }

  /**
   * Génère ou récupère un ID de session
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Récupère les informations de session (device, browser, OS)
   */
  private getSessionInfo(): SessionInfo {
    if (typeof window === 'undefined') {
      return {
        session_id: this.sessionId,
        device_type: 'unknown',
        browser: 'unknown',
        os: 'unknown',
        user_agent: 'unknown',
      };
    }

    const parser = new UAParser(window.navigator.userAgent);
    const result = parser.getResult();

    return {
      session_id: this.sessionId,
      device_type: result.device.type || 'desktop',
      browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
      os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
      user_agent: window.navigator.userAgent,
    };
  }

  /**
   * Récupère (et cache) la géolocalisation IP (pays / ville).
   * Objectif: remplir analytics_events.country/city et analytics_sessions.country/city.
   *
   * NOTE: la géoloc est best-effort (peut échouer / être bloquée) → on ne bloque jamais l'app.
   */
  private async ensureGeoInfo(): Promise<GeoInfo | null> {
    if (typeof window === 'undefined') return null;
    if (this.geoInfo) return this.geoInfo;
    if (this.geoInfoPromise) return this.geoInfoPromise;

    this.geoInfoPromise = (async () => {
      try {
        const cached = sessionStorage.getItem('analytics_geo_v1');
        if (cached) {
          const parsed = JSON.parse(cached) as GeoInfo;
          this.geoInfo = parsed;
          return parsed;
        }

        // Appel IP geolocation (sans token). Peut être rate-limited, donc timeout court.
        const controller = new AbortController();
        const t = window.setTimeout(() => controller.abort(), 2500);
        const res = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        }).finally(() => window.clearTimeout(t));

        if (!res.ok) throw new Error(`Geo lookup failed: ${res.status}`);
        const json: any = await res.json();

        const geo: GeoInfo = {
          country: json?.country_name || json?.country || undefined,
          city: json?.city || undefined,
        };

        this.geoInfo = geo;
        sessionStorage.setItem('analytics_geo_v1', JSON.stringify(geo));
        return geo;
      } catch (e) {
        // Silencieux: pas de geo → la section villes/pays restera vide.
        return null;
      } finally {
        this.geoInfoPromise = null;
      }
    })();

    return this.geoInfoPromise;
  }

  /**
   * Démarre une nouvelle session
   */
  private async startSession() {
    if (!this.sessionInfo) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const geo = await this.ensureGeoInfo();

      await supabase.from('analytics_sessions').upsert({
        session_id: this.sessionId,
        user_id: user?.id || null,
        started_at: new Date().toISOString(),
        device_type: this.sessionInfo.device_type,
        browser: this.sessionInfo.browser,
        os: this.sessionInfo.os,
        country: geo?.country || null,
        city: geo?.city || null,
        referrer: typeof window !== 'undefined' ? document.referrer : null,
        landing_page: typeof window !== 'undefined' ? window.location.href : null,
      }, {
        onConflict: 'session_id',
      });
    } catch (error) {
      console.error('Error starting analytics session:', error);
    }
  }

  /**
   * Démarre le heartbeat pour tracker les utilisateurs en ligne
   */
  private startHeartbeat() {
    if (typeof window === 'undefined') return;

    // Heartbeat toutes les 30 secondes
    this.heartbeatInterval = setInterval(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('analytics_online_users').upsert({
          user_id: user?.id || null,
          session_id: this.sessionId,
          last_seen: new Date().toISOString(),
          current_page: window.location.pathname,
          device_type: this.sessionInfo?.device_type,
        }, {
          onConflict: 'session_id',
        });
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    }, 30000); // 30 secondes

    // Nettoyer au déchargement de la page
    window.addEventListener('beforeunload', () => {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
    });
  }

  /**
   * Track un événement générique
   */
  async trackEvent(event: AnalyticsEvent) {
    // Si Supabase n'est pas configuré, ne rien faire (mode silencieux)
    if (!isSupabaseConfigured) {
      console.log('[Analytics] Supabase non configuré - événement ignoré:', event.event_type);
      return;
    }
    
    if (!this.sessionInfo) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const geo = await this.ensureGeoInfo();

      await supabase.from('analytics_events').insert({
        event_type: event.event_type,
        page_url: event.page_url || (typeof window !== 'undefined' ? window.location.href : null),
        page_title: event.page_title || (typeof window !== 'undefined' ? document.title : null),
        referrer: event.referrer || (typeof window !== 'undefined' ? document.referrer : null),
        user_id: user?.id || null,
        session_id: this.sessionId,
        user_agent: this.sessionInfo.user_agent,
        device_type: this.sessionInfo.device_type,
        browser: this.sessionInfo.browser,
        os: this.sessionInfo.os,
        country: geo?.country || null,
        city: geo?.city || null,
        listing_id: event.listing_id || null,
        search_query: event.search_query || null,
        conversion_type: event.conversion_type || null,
        conversion_value: event.conversion_value || null,
        metadata: event.metadata || {},
      });

      // Incrémenter le compteur de pages vues dans la session
      if (event.event_type === 'page_view' && this.canIncrementSessionPageViews) {
        const { error: rpcError } = await supabase.rpc('increment_session_page_views', {
          p_session_id: this.sessionId,
        });

        // Si la fonction n'existe pas (404 / schema cache), on arrête de la rappeler
        // pour éviter de polluer la console et le réseau.
        const msg = (rpcError as any)?.message as string | undefined;
        const code = (rpcError as any)?.code as string | undefined;
        if (rpcError && (code === 'PGRST202' || msg?.includes('Could not find the function') || msg?.includes('schema cache'))) {
          this.canIncrementSessionPageViews = false;
        }
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Track une page vue
   */
  async trackPageView(customUrl?: string, customTitle?: string) {
    if (typeof window === 'undefined') return;

    const pageUrl = customUrl || window.location.href;
    const pageTitle = customTitle || document.title;

    // Éviter de tracker la même page plusieurs fois de suite
    if (this.lastPageView === pageUrl) return;
    this.lastPageView = pageUrl;

    await this.trackEvent({
      event_type: 'page_view',
      page_url: pageUrl,
      page_title: pageTitle,
    });
  }

  /**
   * Track une vue d'annonce
   */
  async trackListingView(listingId: string, listingTitle: string) {
    await this.trackEvent({
      event_type: 'listing_view',
      listing_id: listingId,
      metadata: { listing_title: listingTitle },
    });
  }

  /**
   * Track une recherche
   */
  async trackSearch(query: string, resultsCount: number) {
    await this.trackEvent({
      event_type: 'search',
      search_query: query,
      metadata: { results_count: resultsCount },
    });
  }

  /**
   * Track un clic
   */
  async trackClick(elementName: string, elementType: string) {
    await this.trackEvent({
      event_type: 'click',
      metadata: {
        element_name: elementName,
        element_type: elementType,
      },
    });
  }

  /**
   * Track une conversion
   */
  async trackConversion(type: string, value: number, metadata?: Record<string, any>) {
    await this.trackEvent({
      event_type: 'conversion',
      conversion_type: type,
      conversion_value: value,
      metadata,
    });
  }

  // ============================================
  // STATS PAR ANNONCE (POUR VENDEURS)
  // ============================================

  /**
   * Récupère les stats globales d'une annonce
   */
  async getListingStats(listingId: string) {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase non configuré') };
    }

    try {
      // Récupérer les stats analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('listing_analytics')
        .select('*')
        .eq('listing_id', listingId)
        .single();

      if (analyticsError) {
        console.error('Error fetching listing analytics:', analyticsError);
        return { data: null, error: analyticsError };
      }

      // Récupérer les infos de boost depuis la table listings
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('is_boosted, boost_until')
        .eq('id', listingId)
        .single();

      if (listingError) {
        console.warn('Error fetching listing boost info:', listingError);
      }

      // Récupérer la date de début du boost depuis la table boosts (dernier boost actif)
      const { data: boostData, error: boostError } = await supabase
        .from('boosts')
        .select('started_at, ends_at')
        .eq('listing_id', listingId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (boostError && boostError.code !== 'PGRST116') {
        console.warn('Error fetching boost info:', boostError);
      }

      // Combiner toutes les données
      const combinedData = {
        ...analyticsData,
        is_boosted: listingData?.is_boosted || false,
        boost_until: listingData?.boost_until || null,
        boost_started_at: boostData?.started_at || null,
      };

      return { data: combinedData, error: null };
    } catch (error: any) {
      console.error('Error fetching listing stats:', error);
      return { data: null, error };
    }
  }

  /**
   * Récupère l'évolution des vues par jour (30 derniers jours)
   */
  async getListingViewsEvolution(listingId: string) {
    if (!isSupabaseConfigured) {
      return { data: [], error: new Error('Supabase non configuré') };
    }

    try {
      const { data, error } = await supabase.rpc('get_listing_views_evolution', {
        p_listing_id: listingId,
      });

      return { data: data || [], error };
    } catch (error: any) {
      console.error('Error fetching views evolution:', error);
      return { data: [], error };
    }
  }

  /**
   * Récupère les heures de pic de trafic
   */
  async getListingPeakHours(listingId: string) {
    if (!isSupabaseConfigured) {
      return { data: [], error: new Error('Supabase non configuré') };
    }

    try {
      const { data, error } = await supabase.rpc('get_listing_peak_hours', {
        p_listing_id: listingId,
      });

      return { data: data || [], error };
    } catch (error: any) {
      console.error('Error fetching peak hours:', error);
      return { data: [], error };
    }
  }

  /**
   * Récupère les stats par jour de la semaine
   */
  async getListingWeekdayStats(listingId: string) {
    if (!isSupabaseConfigured) {
      return { data: [], error: new Error('Supabase non configuré') };
    }

    try {
      const { data, error } = await supabase.rpc('get_listing_weekday_stats', {
        p_listing_id: listingId,
      });

      return { data: data || [], error };
    } catch (error: any) {
      console.error('Error fetching weekday stats:', error);
      return { data: [], error };
    }
  }

  /**
   * Récupère toutes les stats d'une annonce (all-in-one)
   */
  async getAllListingStats(listingId: string) {
    const [stats, evolution, peakHours, weekdayStats] = await Promise.all([
      this.getListingStats(listingId),
      this.getListingViewsEvolution(listingId),
      this.getListingPeakHours(listingId),
      this.getListingWeekdayStats(listingId),
    ]);

    return {
      stats: stats.data,
      evolution: evolution.data,
      peakHours: peakHours.data,
      weekdayStats: weekdayStats.data,
      errors: {
        stats: stats.error,
        evolution: evolution.error,
        peakHours: peakHours.error,
        weekdayStats: weekdayStats.error,
      },
    };
  }

  /**
   * Track un favori
   */
  async trackFavorite(listingId: string) {
    await this.trackEvent({
      event_type: 'favorite',
      listing_id: listingId,
    });
  }

  /**
   * Track un message
   */
  async trackMessage(listingId: string) {
    await this.trackEvent({
      event_type: 'message',
      listing_id: listingId,
    });
  }

  /**
   * Track un boost
   */
  async trackBoost(listingId: string, boostType: string, cost: number) {
    await this.trackEvent({
      event_type: 'boost',
      listing_id: listingId,
      conversion_type: boostType,
      conversion_value: cost,
    });
  }

  // ============================================
  // MÉTHODES POUR RÉCUPÉRER LES STATS (ADMIN)
  // ============================================

  private toDateTimeBounds(startDate: string, endDate: string): { start: string; end: string } {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }

  /**
   * Récupère le nombre d'utilisateurs en ligne
   */
  async getOnlineUsers(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('analytics_online_users')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting online users:', error);
      return 0;
    }
  }

  /**
   * Récupère les stats temps réel
   */
  async getRealtimeStats() {
    try {
      const { data, error } = await supabase
        .from('analytics_realtime_stats')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      // Fallback "vraies données" sans dépendre d'une vue SQL
      try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const [
          eventsLastHour,
          eventsLastMinute,
          activeSessions,
        ] = await Promise.all([
          supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', oneHourAgo.toISOString()),
          supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', oneMinuteAgo.toISOString()),
          supabase
            .from('analytics_online_users')
            .select('*', { count: 'exact', head: true })
            .gte('last_seen', fiveMinutesAgo.toISOString()),
        ]);

        return {
          events_last_hour: eventsLastHour.count || 0,
          events_last_minute: eventsLastMinute.count || 0,
          active_sessions: activeSessions.count || 0,
        };
      } catch (fallbackError) {
        console.error('Error getting realtime stats (fallback):', fallbackError);
        return { events_last_hour: 0, events_last_minute: 0, active_sessions: 0 };
      }
    }
  }

  /**
   * Récupère les pages les plus visitées aujourd'hui
   */
  async getTodayTopPages(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('analytics_today_top_pages')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      // Fallback "vraies données" sans vue SQL: on agrège côté client sur les page_view du jour.
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // On limite volontairement pour éviter de télécharger trop d'événements si le trafic est élevé.
        const { data, error: qError } = await supabase
          .from('analytics_events')
          .select('page_url, page_title, session_id')
          .eq('event_type', 'page_view')
          .gte('created_at', startOfDay.toISOString())
          .order('created_at', { ascending: false })
          .limit(5000);

        if (qError) throw qError;

        const byUrl: Record<string, { page_url: string; page_title?: string; views: number; sessions: Set<string> }> = {};
        (data || []).forEach((row: any) => {
          const url = row.page_url || 'unknown';
          if (!byUrl[url]) {
            byUrl[url] = {
              page_url: url,
              page_title: row.page_title || undefined,
              views: 0,
              sessions: new Set<string>(),
            };
          }
          byUrl[url].views += 1;
          if (row.session_id) byUrl[url].sessions.add(row.session_id);
          if (!byUrl[url].page_title && row.page_title) byUrl[url].page_title = row.page_title;
        });

        return Object.values(byUrl)
          .map((v) => ({
            page_url: v.page_url,
            page_title: v.page_title,
            views: v.views,
            unique_visitors: v.sessions.size,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, limit);
      } catch (fallbackError) {
        console.error('Error getting top pages (fallback):', fallbackError);
      return [];
      }
    }
  }

  /**
   * Récupère les pages les plus visitées sur une période (start/end inclus)
   */
  async getTopPages(startDate: string, endDate: string, limit = 10) {
    try {
      const { start, end } = this.toDateTimeBounds(startDate, endDate);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('page_url, page_title, session_id')
        .eq('event_type', 'page_view')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })
        .limit(50000);

      if (error) throw error;

      const byUrl: Record<string, { page_url: string; page_title?: string; views: number; sessions: Set<string> }> = {};
      (data || []).forEach((row: any) => {
        const url = row.page_url || 'unknown';
        if (!byUrl[url]) {
          byUrl[url] = { page_url: url, page_title: row.page_title || undefined, views: 0, sessions: new Set<string>() };
        }
        byUrl[url].views += 1;
        if (row.session_id) byUrl[url].sessions.add(row.session_id);
        if (!byUrl[url].page_title && row.page_title) byUrl[url].page_title = row.page_title;
      });

      return Object.values(byUrl)
        .map((v) => ({
          page_url: v.page_url,
          page_title: v.page_title,
          views: v.views,
          unique_visitors: v.sessions.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top pages (range):', error);
      return [];
    }
  }

  /**
   * Récupère les stats quotidiennes
   */
  async getDailyStats(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('analytics_daily_stats')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      // Si la table est vide (pas de job d'agrégation), fallback sur un calcul depuis analytics_events.
      if (data && data.length > 0) return data;
      throw new Error('analytics_daily_stats empty');
    } catch (error) {
      // Fallback "vraies données" depuis analytics_events (page_view) groupé par jour.
      try {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const CREDIT_FCFA_RATE = 100; // 1 crédit = 100 FCFA (utilisé partout dans l'app)

        const [{ data, error: qError }, { data: profilesData, error: pErr }, { data: purchasesData, error: rErr }] =
          await Promise.all([
            supabase
              .from('analytics_events')
              .select('created_at, session_id')
              .eq('event_type', 'page_view')
              .gte('created_at', start.toISOString())
              .lte('created_at', end.toISOString())
              .order('created_at', { ascending: true })
              .limit(50000),
            // Nouveaux utilisateurs: basé sur profiles.created_at
            supabase
              .from('profiles')
              .select('created_at')
              .gte('created_at', start.toISOString())
              .lte('created_at', end.toISOString())
              .limit(50000),
            // Revenus: achats de crédits complétés (amount = crédits) → conversion FCFA via rate
            supabase
              .from('credits_transactions')
              .select('created_at, amount')
              .eq('type', 'purchase')
              .eq('payment_status', 'completed')
              .gte('created_at', start.toISOString())
              .lte('created_at', end.toISOString())
              .limit(50000),
          ]);

        if (qError) throw qError;
        // On ne bloque pas le dashboard si profiles/credits_transactions ont une policy restrictive,
        // mais on essaie de remplir au mieux (sinon: 0).
        if (pErr) console.warn('[Analytics] getDailyStats: profiles query failed:', pErr);
        if (rErr) console.warn('[Analytics] getDailyStats: credits_transactions query failed:', rErr);

        const byDay: Record<
          string,
          {
            date: string;
            total_page_views: number;
            sessions: Set<string>;
            new_users: number;
            revenue: number;
          }
        > = {};
        (data || []).forEach((row: any) => {
          const d = new Date(row.created_at);
          const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
          if (!byDay[key]) {
            byDay[key] = { date: key, total_page_views: 0, sessions: new Set<string>(), new_users: 0, revenue: 0 };
          }
          byDay[key].total_page_views += 1;
          if (row.session_id) byDay[key].sessions.add(row.session_id);
        });

        (profilesData || []).forEach((row: any) => {
          const d = new Date(row.created_at);
          const key = d.toISOString().slice(0, 10);
          if (!byDay[key]) {
            byDay[key] = { date: key, total_page_views: 0, sessions: new Set<string>(), new_users: 0, revenue: 0 };
          }
          byDay[key].new_users += 1;
        });

        (purchasesData || []).forEach((row: any) => {
          const d = new Date(row.created_at);
          const key = d.toISOString().slice(0, 10);
          if (!byDay[key]) {
            byDay[key] = { date: key, total_page_views: 0, sessions: new Set<string>(), new_users: 0, revenue: 0 };
          }
          const credits = Number(row.amount || 0) || 0;
          byDay[key].revenue += credits * CREDIT_FCFA_RATE;
        });

        // Remplir les jours manquants entre start et end pour avoir un graphe régulier.
        const results: any[] = [];
        const cursor = new Date(start);
        while (cursor <= end) {
          const key = cursor.toISOString().slice(0, 10);
          const entry = byDay[key];
          results.push({
            date: key,
            total_page_views: entry?.total_page_views || 0,
            unique_visitors: entry?.sessions.size || 0,
            new_users: entry?.new_users || 0,
            revenue: entry?.revenue || 0,
          });
          cursor.setDate(cursor.getDate() + 1);
        }

        return results;
      } catch (fallbackError) {
        console.error('Error getting daily stats (fallback):', fallbackError);
      return [];
      }
    }
  }

  /**
   * Récupère les stats de conversion
   */
  async getConversionStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('conversion_type, conversion_value, created_at')
        .eq('event_type', 'conversion')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting conversion stats:', error);
      return [];
    }
  }

  /**
   * Récupère les stats par device
   */
  async getDeviceStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('device_type')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Compter les devices
      const deviceCounts: Record<string, number> = {};
      data?.forEach((event: any) => {
        const device = event.device_type || 'unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      return Object.entries(deviceCounts).map(([device, count]) => ({
        device,
        count,
      }));
    } catch (error) {
      console.error('Error getting device stats:', error);
      return [];
    }
  }

  async getDeviceStatsRange(startDate: string, endDate: string) {
    try {
      const { start, end } = this.toDateTimeBounds(startDate, endDate);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('device_type')
        .eq('event_type', 'page_view')
        .gte('created_at', start)
        .lte('created_at', end)
        .limit(50000);

      if (error) throw error;

      const deviceCounts: Record<string, number> = {};
      data?.forEach((event: any) => {
        const device = event.device_type || 'unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      return Object.entries(deviceCounts).map(([device, count]) => ({ device, count }));
    } catch (error) {
      console.error('Error getting device stats (range):', error);
      return [];
    }
  }

  /**
   * Récupère les stats géographiques
   */
  async getGeographicStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('country, city')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Compter par pays et ville
      const countryCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};

      data?.forEach((event: any) => {
        if (event.country) {
          countryCounts[event.country] = (countryCounts[event.country] || 0) + 1;
        }
        if (event.city) {
          cityCounts[event.city] = (cityCounts[event.city] || 0) + 1;
        }
      });

      return {
        countries: Object.entries(countryCounts)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count),
        cities: Object.entries(cityCounts)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      };
    } catch (error) {
      console.error('Error getting geographic stats:', error);
      return { countries: [], cities: [] };
    }
  }

  async getGeographicStatsRange(startDate: string, endDate: string) {
    try {
      const { start, end } = this.toDateTimeBounds(startDate, endDate);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('country, city')
        .eq('event_type', 'page_view')
        .gte('created_at', start)
        .lte('created_at', end)
        .limit(50000);

      if (error) throw error;

      const countryCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};
      data?.forEach((event: any) => {
        if (event.country) countryCounts[event.country] = (countryCounts[event.country] || 0) + 1;
        if (event.city) cityCounts[event.city] = (cityCounts[event.city] || 0) + 1;
      });

      return {
        countries: Object.entries(countryCounts)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count),
        cities: Object.entries(cityCounts)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      };
    } catch (error) {
      console.error('Error getting geographic stats (range):', error);
      return { countries: [], cities: [] };
    }
  }

  /**
   * Récupère les stats d'engagement
   */
  async getEngagementStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type')
        .in('event_type', ['favorite', 'message', 'boost'])
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const counts: Record<string, number> = {
        favorite: 0,
        message: 0,
        boost: 0,
      };

      data?.forEach((event: any) => {
        counts[event.event_type] = (counts[event.event_type] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Error getting engagement stats:', error);
      return { favorite: 0, message: 0, boost: 0 };
    }
  }

  async getEngagementStatsRange(startDate: string, endDate: string) {
    try {
      const { start, end } = this.toDateTimeBounds(startDate, endDate);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type')
        .in('event_type', ['favorite', 'message', 'boost'])
        .gte('created_at', start)
        .lte('created_at', end)
        .limit(50000);

      if (error) throw error;

      const counts: Record<string, number> = { favorite: 0, message: 0, boost: 0 };
      data?.forEach((event: any) => {
        counts[event.event_type] = (counts[event.event_type] || 0) + 1;
      });
      return counts;
    } catch (error) {
      console.error('Error getting engagement stats (range):', error);
      return { favorite: 0, message: 0, boost: 0 };
    }
  }

  /**
   * Récupère les annonces les plus consultées
   */
  async getTopListings(days = 30, limit = 10) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('listing_id')
        .eq('event_type', 'listing_view')
        .not('listing_id', 'is', null)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Compter les vues par annonce
      const listingCounts: Record<string, number> = {};
      data?.forEach((event: any) => {
        if (event.listing_id) {
          listingCounts[event.listing_id] = (listingCounts[event.listing_id] || 0) + 1;
        }
      });

      // Trier et limiter
      const topListings = Object.entries(listingCounts)
        .map(([listing_id, views]) => ({ listing_id, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);

      return topListings;
    } catch (error) {
      console.error('Error getting top listings:', error);
      return [];
    }
  }

  /**
   * Récupère le trafic par heure (dernières 24h)
   */
  async getHourlyTraffic() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Grouper par heure
      const hourCounts: Record<string, number> = {};
      data?.forEach((event: any) => {
        const hour = new Date(event.created_at).getHours();
        const hourKey = `${hour}:00`;
        hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
      });

      return Object.entries(hourCounts).map(([hour, count]) => ({
        hour,
        count,
      }));
    } catch (error) {
      console.error('Error getting hourly traffic:', error);
      return [];
    }
  }

  /**
   * Trafic par heure sur une période: agrégation par heure (00-23) sur tous les jours de la période.
   */
  async getHourlyTrafficRange(startDate: string, endDate: string) {
    try {
      const { start, end } = this.toDateTimeBounds(startDate, endDate);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: true })
        .limit(50000);

      if (error) throw error;

      const counts = Array.from({ length: 24 }, () => 0);
      (data || []).forEach((row: any) => {
        const d = new Date(row.created_at);
        const h = d.getHours();
        if (h >= 0 && h <= 23) counts[h] += 1;
      });

      return counts.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}h`,
        count,
      }));
    } catch (error) {
      console.error('Error getting hourly traffic (range):', error);
      return [];
    }
  }
}

// Créer une instance unique
export const analyticsService = new AnalyticsService();

