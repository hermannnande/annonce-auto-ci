import { supabase } from '../lib/supabase';

/**
 * Interface pour une notification
 */
export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
  created_at: string;
}

/**
 * Service de gestion des notifications
 * Notifications in-app pour les utilisateurs
 */
class NotificationsService {
  /**
   * Récupérer toutes les notifications d'un utilisateur
   */
  async getUserNotifications(userId: string): Promise<{
    notifications: Notification[];
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération notifications:', error);
        return { notifications: [], error: error as Error };
      }

      return { notifications: data as Notification[], error: null };
    } catch (error) {
      console.error('Exception récupération notifications:', error);
      return { notifications: [], error: error as Error };
    }
  }

  /**
   * Récupérer les notifications non lues
   */
  async getUnreadNotifications(userId: string): Promise<{
    notifications: Notification[];
    count: number;
    error: Error | null;
  }> {
    try {
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération notifications non lues:', error);
        return { notifications: [], count: 0, error: error as Error };
      }

      return {
        notifications: data as Notification[],
        count: count || 0,
        error: null,
      };
    } catch (error) {
      console.error('Exception récupération notifications non lues:', error);
      return { notifications: [], count: 0, error: error as Error };
    }
  }

  /**
   * Créer une notification
   */
  async createNotification(
    userId: string,
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    actionUrl?: string,
    actionLabel?: string
  ): Promise<{ notification: Notification | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          read: false,
          action_url: actionUrl,
          action_label: actionLabel,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur création notification:', error);
        return { notification: null, error: error as Error };
      }

      console.log(`🔔 Notification créée pour ${userId}:`, title);

      return { notification: data as Notification, error: null };
    } catch (error) {
      console.error('Exception création notification:', error);
      return { notification: null, error: error as Error };
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Erreur marquage notification comme lue:', error);
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception marquage notification comme lue:', error);
      return { error: error as Error };
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Erreur marquage toutes notifications comme lues:', error);
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception marquage toutes notifications comme lues:', error);
      return { error: error as Error };
    }
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Erreur suppression notification:', error);
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception suppression notification:', error);
      return { error: error as Error };
    }
  }

  /**
   * Supprimer toutes les notifications lues
   */
  async deleteReadNotifications(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('read', true);

      if (error) {
        console.error('Erreur suppression notifications lues:', error);
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception suppression notifications lues:', error);
      return { error: error as Error };
    }
  }

  // ==========================================
  // NOTIFICATIONS PRÉDÉFINIES (HELPERS)
  // ==========================================

  /**
   * Notification: Annonce approuvée
   */
  async notifyListingApproved(userId: string, listingId: string, listingTitle: string): Promise<void> {
    await this.createNotification(
      userId,
      'success',
      '✅ Annonce approuvée',
      `Votre annonce "${listingTitle}" a été approuvée et est maintenant visible.`,
      `/annonce/${listingId}`,
      'Voir l\'annonce'
    );
  }

  /**
   * Notification: Annonce rejetée
   */
  async notifyListingRejected(
    userId: string,
    listingId: string,
    listingTitle: string,
    reason?: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'error',
      '❌ Annonce rejetée',
      `Votre annonce "${listingTitle}" a été rejetée. ${reason ? `Raison: ${reason}` : ''}`,
      `/dashboard/vendeur/mes-annonces`,
      'Voir mes annonces'
    );
  }

  /**
   * Notification: Boost expiré
   */
  async notifyBoostExpired(userId: string, listingId: string, listingTitle: string): Promise<void> {
    await this.createNotification(
      userId,
      'warning',
      '⏰ Boost expiré',
      `Le boost de votre annonce "${listingTitle}" a expiré.`,
      `/dashboard/vendeur/booster`,
      'Renouveler le boost'
    );
  }

  /**
   * Notification: Crédits faibles
   */
  async notifyLowCredits(userId: string, remainingCredits: number): Promise<void> {
    await this.createNotification(
      userId,
      'warning',
      '💳 Crédits faibles',
      `Il vous reste seulement ${remainingCredits} crédits. Rechargez pour continuer à publier.`,
      '/dashboard/vendeur/recharger',
      'Recharger'
    );
  }

  /**
   * Notification: Paiement confirmé
   */
  async notifyPaymentConfirmed(userId: string, amount: number, credits: number): Promise<void> {
    await this.createNotification(
      userId,
      'success',
      '💰 Paiement confirmé',
      `Votre paiement de ${amount} FCFA a été confirmé. Vous avez reçu ${credits} crédits.`,
      '/dashboard/vendeur',
      'Voir mon solde'
    );
  }

  /**
   * Notification: Nouvelle vue sur l'annonce
   */
  async notifyNewView(userId: string, listingId: string, listingTitle: string): Promise<void> {
    // Ne pas notifier pour chaque vue (trop de notifications)
    // Peut-être faire un résumé quotidien
  }

  /**
   * Notification: Nouveau favori
   */
  async notifyNewFavorite(userId: string, listingId: string, listingTitle: string): Promise<void> {
    await this.createNotification(
      userId,
      'info',
      '❤️ Nouveau favori',
      `Votre annonce "${listingTitle}" a été ajoutée aux favoris.`,
      `/annonce/${listingId}`,
      'Voir l\'annonce'
    );
  }

  /**
   * Notification: Crédits attribués par admin
   */
  async notifyCreditsGranted(userId: string, amount: number, reason: string): Promise<void> {
    await this.createNotification(
      userId,
      'success',
      '🎁 Crédits reçus',
      `Vous avez reçu ${amount} crédits. ${reason}`,
      '/dashboard/vendeur',
      'Voir mon solde'
    );
  }

  /**
   * Notification: Bienvenue (nouveau compte)
   */
  async notifyWelcome(userId: string, userName: string, initialCredits: number): Promise<void> {
    await this.createNotification(
      userId,
      'success',
      '👋 Bienvenue !',
      `Bienvenue ${userName} ! Vous avez reçu ${initialCredits} crédits de bienvenue pour commencer.`,
      '/dashboard/vendeur/publier',
      'Publier une annonce'
    );
  }
}

export const notificationsService = new NotificationsService();
