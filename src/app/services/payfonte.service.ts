import { supabase } from '../lib/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

async function getValidAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at ?? 0;

  // Rafraîchir si le token expire bientôt (ou est déjà expiré)
  if (expiresAt && expiresAt <= now + 30) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed.session?.access_token) return refreshed.session.access_token;
  }

  return session.access_token;
}

async function refreshAndGetAccessToken(): Promise<string | null> {
  const { data: refreshed, error } = await supabase.auth.refreshSession();
  if (error) {
    console.warn('⚠️ refreshSession a échoué:', error);
  }
  return refreshed.session?.access_token || null;
}

function isInvalidJwtResponse(payload: any): boolean {
  const msg = (payload?.message || payload?.error?.message || '').toString();
  return msg.toLowerCase().includes('invalid jwt');
}

/**
 * Service de paiement Payfonte
 * Gère toutes les transactions de paiement via Payfonte
 */

// Types Payfonte
export interface PayfonteUser {
  email: string;
  phoneNumber: string;
  name: string;
}

export interface CreateCheckoutParams {
  reference: string;
  amount: number;
  currency: string;
  country: string;
  user: PayfonteUser;
  narration: string;
  redirectURL: string;
  customerBearsCharge?: boolean;
  metadata?: Record<string, any>;
}

export interface PayfonteCheckoutResponse {
  success: boolean;
  data?: {
    id: string;
    url: string;
    shortURL: string;
    reference: string;
    amount: number;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaymentVerificationResponse {
  success: boolean;
  data?: {
    reference: string;
    amount: number;
    status: 'success' | 'failed' | 'pending' | 'cancelled';
    currency: string;
    paidAt?: string;
    customer?: PayfonteUser;
  };
  error?: {
    message: string;
  };
}

class PayfonteService {
  /**
   * Créer un checkout Payfonte via Supabase Edge Function
   */
  async createCheckout(params: CreateCheckoutParams): Promise<PayfonteCheckoutResponse> {
    try {
      console.log('🔄 Création checkout Payfonte:', params);

      // IMPORTANT: on force un refresh juste avant paiement (évite les sessions "cassées"/tokens expirés)
      let accessToken = await refreshAndGetAccessToken();
      if (!accessToken) accessToken = await getValidAccessToken();

      if (!accessToken) {
        console.error('❌ Pas de session active');
        return {
          success: false,
          error: { message: 'Session expirée. Déconnecte-toi puis reconnecte-toi avant de payer.' }
        };
      }

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Supabase URL/ANON KEY non configurés');
        return {
          success: false,
          error: { message: 'Configuration Supabase manquante' }
        };
      }

      const call = async (token: string) => {
        const res = await fetch(`${supabaseUrl}/functions/v1/payfonte-create-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(params),
        });

        const data = await res.json().catch(() => null);
        return { res, data };
      };

      // 1) Appel normal
      let { res, data } = await call(accessToken);

      // 2) Si JWT invalide, refresh + retry une seule fois
      if (res.status === 401 && isInvalidJwtResponse(data)) {
        console.warn('⚠️ JWT invalide détecté, refresh session + retry...');
        const refreshed = await refreshAndGetAccessToken();
        if (refreshed) {
          accessToken = refreshed;
          ({ res, data } = await call(accessToken));
        }
      }

      if (!res.ok) {
        console.error('❌ Erreur Edge Function (HTTP):', res.status, res.statusText);
        console.error('❌ Réponse Edge Function:', JSON.stringify(data, null, 2));
        return {
          success: false,
          error: {
            message: isInvalidJwtResponse(data)
              ? 'Session invalide. Déconnecte-toi puis reconnecte-toi et réessaie.'
              : (data?.error?.message || data?.message || `Erreur paiement (HTTP ${res.status})`)
          }
        };
      }

      if (!data || !data.success) {
        console.error('❌ Réponse Edge Function (success=false):', JSON.stringify(data, null, 2));
        return {
          success: false,
          error: {
            message: data?.error?.message || 'Erreur inconnue'
          }
        };
      }

      console.log('✅ Checkout créé:', data.data);
      return {
        success: true,
        data: data.data
      };

    } catch (error: any) {
      console.error('❌ Exception création checkout:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Une erreur inattendue est survenue'
        }
      };
    }
  }

  /**
   * Vérifier le statut d'un paiement via Supabase Edge Function
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      console.log('🔍 Vérification paiement:', reference);

      let accessToken = await refreshAndGetAccessToken();
      if (!accessToken) accessToken = await getValidAccessToken();

      if (!accessToken) {
        console.error('❌ Pas de session active');
        return {
          success: false,
          error: { message: 'Session expirée. Déconnecte-toi puis reconnecte-toi avant de vérifier un paiement.' }
        };
      }

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Supabase URL/ANON KEY non configurés');
        return {
          success: false,
          error: { message: 'Configuration Supabase manquante' }
        };
      }

      const call = async (token: string) => {
        const res = await fetch(`${supabaseUrl}/functions/v1/payfonte-verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json().catch(() => null);
        return { res, data };
      };

      let { res, data } = await call(accessToken);
      if (res.status === 401 && isInvalidJwtResponse(data)) {
        console.warn('⚠️ JWT invalide détecté, refresh session + retry...');
        const refreshed = await refreshAndGetAccessToken();
        if (refreshed) {
          accessToken = refreshed;
          ({ res, data } = await call(accessToken));
        }
      }

      if (!res.ok) {
        console.error('❌ Erreur Edge Function (HTTP):', res.status, res.statusText);
        console.error('❌ Réponse Edge Function:', JSON.stringify(data, null, 2));
        return {
          success: false,
          error: {
            message: isInvalidJwtResponse(data)
              ? 'Session invalide. Déconnecte-toi puis reconnecte-toi et réessaie.'
              : (data?.error?.message || data?.message || `Erreur vérification (HTTP ${res.status})`)
          }
        };
      }

      if (!data || !data.success) {
        return {
          success: false,
          error: { message: data?.error?.message || 'Erreur inconnue' }
        };
      }

      console.log('✅ Paiement vérifié:', data.data);
      return {
        success: true,
        data: data.data
      };

    } catch (error: any) {
      console.error('❌ Exception vérification paiement:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Une erreur inattendue est survenue'
        }
      };
    }
  }

  /**
   * Générer une référence unique pour la transaction
   */
  generateReference(prefix: string = 'ANNONCE'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Créer une transaction de recharge de crédits
   */
  async createCreditsPurchaseCheckout(
    userId: string,
    amount: number,
    credits: number,
    userEmail: string,
    userName: string,
    userPhone: string
  ): Promise<PayfonteCheckoutResponse> {
    const reference = this.generateReference('CREDITS');
    const redirectURL = `${window.location.origin}/payfonte/callback?type=credits`;

    return this.createCheckout({
      reference,
      amount, // Montant en plus petite unité (ex: 100000 pour 100 000 FCFA)
      currency: 'XOF',
      country: 'CI',
      user: {
        email: userEmail,
        phoneNumber: userPhone,
        name: userName
      },
      narration: `Recharge de ${credits} crédits - AnnonceAuto.ci`,
      redirectURL,
      customerBearsCharge: false,
      metadata: {
        userId,
        credits,
        type: 'credits_purchase'
      }
    });
  }

  /**
   * Créer une transaction de boost d'annonce
   */
  async createBoostCheckout(
    userId: string,
    listingId: string,
    planId: string,
    amount: number,
    userEmail: string,
    userName: string,
    userPhone: string
  ): Promise<PayfonteCheckoutResponse> {
    const reference = this.generateReference('BOOST');
    const redirectURL = `${window.location.origin}/payfonte/callback?type=boost`;

    return this.createCheckout({
      reference,
      amount,
      currency: 'XOF',
      country: 'CI',
      user: {
        email: userEmail,
        phoneNumber: userPhone,
        name: userName
      },
      narration: `Boost d'annonce - Plan ${planId} - AnnonceAuto.ci`,
      redirectURL,
      customerBearsCharge: false,
      metadata: {
        userId,
        listingId,
        planId,
        type: 'boost'
      }
    });
  }
}

export const payfonteService = new PayfonteService();




