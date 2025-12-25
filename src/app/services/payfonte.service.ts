import { supabase } from '../lib/supabase';

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

      // Appeler la Supabase Edge Function qui gère l'API Payfonte
      const { data, error } = await supabase.functions.invoke('payfonte-create-checkout', {
        body: params
      });

      if (error) {
        console.error('❌ Erreur création checkout:', error);
        return {
          success: false,
          error: {
            message: error.message || 'Erreur lors de la création du checkout'
          }
        };
      }

      if (!data || !data.success) {
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

      // Appeler la Supabase Edge Function qui vérifie le paiement
      const { data, error } = await supabase.functions.invoke('payfonte-verify-payment', {
        body: { reference }
      });

      if (error) {
        console.error('❌ Erreur vérification paiement:', error);
        return {
          success: false,
          error: {
            message: error.message || 'Erreur lors de la vérification du paiement'
          }
        };
      }

      if (!data || !data.success) {
        return {
          success: false,
          error: {
            message: data?.error?.message || 'Erreur inconnue'
          }
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



