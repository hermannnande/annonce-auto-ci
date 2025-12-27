import { supabase } from '../lib/supabase';
import type { CreditTransaction, Profile } from '../lib/supabase';

/**
 * Service de gestion des crédits
 * Gère les transactions, achats et dépenses de crédits
 */
class CreditsService {
  /**
   * Récupérer le solde de crédits d'un utilisateur
   */
  async getUserCredits(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur récupération crédits:', error);
        return 0;
      }

      return data?.credits || 0;
    } catch (error) {
      console.error('Exception récupération crédits:', error);
      return 0;
    }
  }

  /**
   * Récupérer l'historique des transactions d'un utilisateur
   */
  async getUserTransactions(userId: string): Promise<{ transactions: CreditTransaction[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('credits_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération transactions:', error);
        return { transactions: [], error: error as Error };
      }

      return { transactions: data as CreditTransaction[], error: null };
    } catch (error) {
      console.error('Exception récupération transactions:', error);
      return { transactions: [], error: error as Error };
    }
  }

  /**
   * Ajouter des crédits à un utilisateur (achat, bonus, admin)
   */
  async addCredits(
    userId: string,
    amount: number,
    type: 'purchase' | 'bonus' | 'refund',
    description: string,
    paymentMethod?: string,
    paymentReference?: string
  ): Promise<{ error: Error | null }> {
    try {
      // Récupérer le solde actuel
      const currentCredits = await this.getUserCredits(userId);
      const newCredits = currentCredits + amount;

      // Démarrer une transaction
      const txType: CreditTransaction['type'] =
        type === 'purchase' ? 'purchase' : type === 'refund' ? 'refund' : 'gift'; // 'bonus' -> 'gift'

      const { error: transactionError } = await supabase
        .from('credits_transactions')
        .insert({
          user_id: userId,
          amount,
          balance_after: newCredits,
          type: txType,
          description,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          payment_status: 'completed',
        })

      if (transactionError) {
        console.error('Erreur création transaction:', transactionError);
        return { error: transactionError as Error };
      }

      // Mettre à jour le solde de l'utilisateur
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (updateError) {
        console.error('Erreur mise à jour crédits:', updateError);
        return { error: updateError as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception ajout crédits:', error);
      return { error: error as Error };
    }
  }

  /**
   * Dépenser des crédits (publication, boost, etc.)
   */
  async spendCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Récupérer le solde actuel
      const currentCredits = await this.getUserCredits(userId);

      // Vérifier si l'utilisateur a assez de crédits
      if (currentCredits < amount) {
        return {
          success: false,
          error: new Error('Crédits insuffisants'),
        };
      }

      const newCredits = currentCredits - amount;

      // Créer la transaction
      const { error: transactionError } = await supabase
        .from('credits_transactions')
        .insert({
          user_id: userId,
          amount: -amount, // Montant négatif pour une dépense
          balance_after: newCredits,
          type: 'boost',
          description,
          payment_status: 'completed',
        });

      if (transactionError) {
        console.error('Erreur création transaction:', transactionError);
        return { success: false, error: transactionError as Error };
      }

      // Mettre à jour le solde
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (updateError) {
        console.error('Erreur mise à jour crédits:', updateError);
        return { success: false, error: updateError as Error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Exception dépense crédits:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Rembourser des crédits (annulation, erreur)
   */
  async refundCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<{ error: Error | null }> {
    return this.addCredits(userId, amount, 'refund', description);
  }

  /**
   * Créer un paiement Mobile Money (Orange/MTN/Moov)
   */
  async createMobileMoneyPayment(
    userId: string,
    amount: number,
    creditsAmount: number,
    phoneNumber: string,
    operator: 'orange' | 'mtn' | 'moov'
  ): Promise<{ transactionId: string | null; error: Error | null }> {
    try {
      // Récupérer le solde actuel
      const currentCredits = await this.getUserCredits(userId);

      // Créer une transaction en attente
      const { data: transaction, error: transactionError } = await supabase
        .from('credits_transactions')
        .insert({
          user_id: userId,
          amount: creditsAmount,
          type: 'purchase',
          description: `Achat de ${creditsAmount} crédits via ${operator.toUpperCase()} Money`,
          payment_method: `${operator}_money`,
          payment_reference: phoneNumber,
          payment_status: 'pending',
          balance_after: currentCredits + creditsAmount,
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Erreur création paiement:', transactionError);
        return { transactionId: null, error: transactionError as Error };
      }

      // TODO: Intégrer avec l'API de paiement Mobile Money
      // Pour l'instant, on simule un paiement réussi après 5 secondes
      console.log(`🔄 Paiement ${operator} en cours...`, {
        amount,
        phone: phoneNumber,
        transactionId: transaction.id,
      });

      return { transactionId: transaction.id, error: null };
    } catch (error) {
      console.error('Exception création paiement:', error);
      return { transactionId: null, error: error as Error };
    }
  }

  /**
   * Confirmer un paiement Mobile Money
   */
  async confirmPayment(transactionId: string): Promise<{ error: Error | null }> {
    try {
      // Récupérer la transaction
      const { data: transaction, error: fetchError } = await supabase
        .from('credits_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError || !transaction) {
        return { error: new Error('Transaction introuvable') };
      }

      // Vérifier que la transaction est en attente
      if (transaction.payment_status !== 'pending') {
        return { error: new Error('Transaction déjà traitée') };
      }

      // Mettre à jour la transaction
      const { error: updateTxError } = await supabase
        .from('credits_transactions')
        .update({ payment_status: 'completed' })
        .eq('id', transactionId);

      if (updateTxError) {
        return { error: updateTxError as Error };
      }

      // Mettre à jour le solde de l'utilisateur
      const { error: updateCreditsError } = await supabase
        .from('profiles')
        .update({ credits: transaction.balance_after })
        .eq('id', transaction.user_id);

      if (updateCreditsError) {
        return { error: updateCreditsError as Error };
      }

      console.log('✅ Paiement confirmé:', transactionId);
      return { error: null };
    } catch (error) {
      console.error('Exception confirmation paiement:', error);
      return { error: error as Error };
    }
  }

  /**
   * Annuler un paiement
   */
  async cancelPayment(transactionId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('credits_transactions')
        // 'cancelled' n'existe pas dans le schéma actuel (voir migration).
        // On passe en 'failed' pour signifier un paiement abandonné.
        .update({ payment_status: 'failed' })
        .eq('id', transactionId);

      if (error) {
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception annulation paiement:', error);
      return { error: error as Error };
    }
  }

  /**
   * Récupérer les statistiques de crédits (pour admin)
   */
  async getCreditsStats(): Promise<{
    totalCreditsInCirculation: number;
    totalPurchases: number;
    totalSpent: number;
    totalRefunds: number;
    error: Error | null;
  }> {
    try {
      // Total des crédits en circulation
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('credits');

      if (profilesError) {
        throw profilesError;
      }

      const totalCreditsInCirculation = profiles?.reduce((sum, p) => sum + (p.credits || 0), 0) || 0;

      // Statistiques des transactions
      const { data: transactions, error: txError } = await supabase
        .from('credits_transactions')
        .select('type, amount, payment_status');

      if (txError) {
        throw txError;
      }

      const stats = transactions?.reduce(
        (acc, tx) => {
          if (tx.payment_status !== 'completed') return acc;

          switch (tx.type) {
            case 'purchase':
              acc.totalPurchases += tx.amount;
              break;
            case 'boost':
              acc.totalSpent += Math.abs(tx.amount);
              break;
            case 'refund':
              acc.totalRefunds += tx.amount;
              break;
            // gift/admin_adjustment: pas compté comme achat
          }
          return acc;
        },
        { totalPurchases: 0, totalSpent: 0, totalRefunds: 0 }
      ) || { totalPurchases: 0, totalSpent: 0, totalRefunds: 0 };

      return {
        totalCreditsInCirculation,
        ...stats,
        error: null,
      };
    } catch (error) {
      console.error('Exception statistiques crédits:', error);
      return {
        totalCreditsInCirculation: 0,
        totalPurchases: 0,
        totalSpent: 0,
        totalRefunds: 0,
        error: error as Error,
      };
    }
  }
}

export const creditsService = new CreditsService();
