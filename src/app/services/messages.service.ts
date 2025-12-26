import { supabase } from '../lib/supabase';

// ========================================
// TYPES
// ========================================

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message: string | null;
  last_message_at: string;
  buyer_unread_count: number;
  seller_unread_count: number;
  status: 'active' | 'archived' | 'blocked';
  created_at: string;
  updated_at: string;
  // Relations
  listing?: {
    title: string;
    brand: string;
    model: string;
    price: number;
    images: string[];
  };
  buyer?: {
    id: string;
    full_name: string;
    phone: string;
    avatar_url?: string;
  };
  seller?: {
    id: string;
    full_name: string;
    phone: string;
    avatar_url?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  attachments?: MessageAttachment[];
  reply_to_id?: string | null;
  // Relations
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  reply_to?: Message;
}

export interface MessageAttachment {
  type: 'image' | 'document' | 'video';
  url: string;
  name: string;
  size?: number;
  thumbnail?: string;
}

export interface ConversationWithDetails extends Conversation {
  listing_title?: string;
  listing_brand?: string;
  listing_model?: string;
  listing_price?: number;
  listing_images?: string[];
  buyer_name?: string;
  buyer_phone?: string;
  buyer_avatar?: string;
  seller_name?: string;
  seller_phone?: string;
  seller_avatar?: string;
  total_messages?: number;
}

// ========================================
// SERVICE
// ========================================

class MessagesService {
  // ========================================
  // CONVERSATIONS
  // ========================================

  /**
   * Créer ou récupérer une conversation existante
   */
  async getOrCreateConversation(
    listingId: string,
    buyerId: string,
    sellerId: string
  ): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        p_listing_id: listingId,
        p_buyer_id: buyerId,
        p_seller_id: sellerId
      });

      if (error) {
        console.error('Erreur création conversation:', error);
        return { conversation: null, error: error as Error };
      }

      // Récupérer les détails de la conversation
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(title, brand, model, price, images),
          buyer:profiles!buyer_id(id, full_name, phone, avatar_url),
          seller:profiles!seller_id(id, full_name, phone, avatar_url)
        `)
        .eq('id', data)
        .single();

      if (fetchError) {
        return { conversation: null, error: fetchError as Error };
      }

      return { conversation: conversation as Conversation, error: null };
    } catch (error) {
      console.error('Erreur getOrCreateConversation:', error);
      return { conversation: null, error: error as Error };
    }
  }

  /**
   * Récupérer toutes les conversations d'un utilisateur
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(title, brand, model, price, images),
          buyer:profiles!buyer_id(id, full_name, phone, avatar_url),
          seller:profiles!seller_id(id, full_name, phone, avatar_url)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération conversations:', error);
        return [];
      }

      return (data || []) as Conversation[];
    } catch (error) {
      console.error('Erreur getUserConversations:', error);
      return [];
    }
  }

  /**
   * Récupérer une conversation par ID
   */
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(title, brand, model, price, images),
          buyer:profiles!buyer_id(id, full_name, phone, avatar_url),
          seller:profiles!seller_id(id, full_name, phone, avatar_url)
        `)
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('Erreur récupération conversation:', error);
        return null;
      }

      return data as Conversation;
    } catch (error) {
      console.error('Erreur getConversationById:', error);
      return null;
    }
  }

  /**
   * Marquer une conversation comme lue
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await supabase.rpc('mark_conversation_as_read', {
        p_conversation_id: conversationId,
        p_user_id: userId
      });
    } catch (error) {
      console.error('Erreur markConversationAsRead:', error);
    }
  }

  /**
   * Archiver une conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    try {
      await supabase
        .from('conversations')
        .update({ status: 'archived' })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Erreur archiveConversation:', error);
    }
  }

  // ========================================
  // MESSAGES
  // ========================================

  /**
   * Récupérer les messages d'une conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url),
          reply_to:messages!reply_to_id(
            id,
            content,
            attachments,
            sender:profiles!sender_id(id, full_name, avatar_url)
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur récupération messages:', error);
        return [];
      }

      return (data || []) as Message[];
    } catch (error) {
      console.error('Erreur getMessages:', error);
      return [];
    }
  }

  /**
   * Envoyer un message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    attachments?: MessageAttachment[],
    replyToId?: string | null
  ): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content?.trim() || '',
          attachments: attachments || [],
          reply_to_id: replyToId
        })
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Erreur envoi message:', error);
        return { message: null, error: error as Error };
      }

      return { message: data as Message, error: null };
    } catch (error) {
      console.error('Erreur sendMessage:', error);
      return { message: null, error: error as Error };
    }
  }

  /**
   * Envoyer un message vocal
   */
  async sendVoiceMessage(
    conversationId: string,
    senderId: string,
    audioUrl: string,
    audioDuration: number
  ): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: '',
          audio_url: audioUrl,
          audio_duration: audioDuration,
          attachments: []
        })
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Erreur envoi message vocal:', error);
        return { message: null, error: error as Error };
      }

      return { message: data as Message, error: null };
    } catch (error) {
      console.error('Erreur sendVoiceMessage:', error);
      return { message: null, error: error as Error };
    }
  }

  /**
   * Uploader une pièce jointe
   */
  async uploadAttachment(
    file: File,
    conversationId: string
  ): Promise<{ attachment: MessageAttachment | null; error: Error | null }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${conversationId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload du fichier
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur upload:', error);
        return { attachment: null, error: error as Error };
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      // Déterminer le type de fichier
      let type: 'image' | 'document' | 'video' = 'document';
      if (file.type.startsWith('image/')) {
        type = 'image';
      } else if (file.type.startsWith('video/')) {
        type = 'video';
      }

      const attachment: MessageAttachment = {
        type,
        url: publicUrl,
        name: file.name,
        size: file.size
      };

      return { attachment, error: null };
    } catch (error) {
      console.error('Erreur uploadAttachment:', error);
      return { attachment: null, error: error as Error };
    }
  }

  // ========================================
  // ADMIN
  // ========================================

  /**
   * Récupérer toutes les conversations (Admin uniquement)
   */
  async getAllConversations(): Promise<ConversationWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('admin_conversations_view')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération conversations admin:', error);
        return [];
      }

      return (data || []) as ConversationWithDetails[];
    } catch (error) {
      console.error('Erreur getAllConversations:', error);
      return [];
    }
  }

  /**
   * Récupérer les statistiques de messagerie (Admin)
   */
  async getMessagingStats(): Promise<{
    totalConversations: number;
    conversationsLast7Days: number;
    totalMessages: number;
    messagesLast7Days: number;
    totalUnreadMessages: number;
    avgResponseTimeMinutes: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('admin_messages_stats')
        .select('*')
        .single();

      if (error) {
        console.error('Erreur récupération stats:', error);
        return {
          totalConversations: 0,
          conversationsLast7Days: 0,
          totalMessages: 0,
          messagesLast7Days: 0,
          totalUnreadMessages: 0,
          avgResponseTimeMinutes: 0
        };
      }

      return {
        totalConversations: data.total_conversations || 0,
        conversationsLast7Days: data.conversations_last_7_days || 0,
        totalMessages: data.total_messages || 0,
        messagesLast7Days: data.messages_last_7_days || 0,
        totalUnreadMessages: data.total_unread_messages || 0,
        avgResponseTimeMinutes: data.avg_response_time_minutes || 0
      };
    } catch (error) {
      console.error('Erreur getMessagingStats:', error);
      return {
        totalConversations: 0,
        conversationsLast7Days: 0,
        totalMessages: 0,
        messagesLast7Days: 0,
        totalUnreadMessages: 0,
        avgResponseTimeMinutes: 0
      };
    }
  }

  // ========================================
  // TEMPS RÉEL (Subscriptions)
  // ========================================

  /**
   * S'abonner aux nouveaux messages d'une conversation
   */
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Récupérer les détails du message avec le sender et le message cité
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!sender_id(id, full_name, avatar_url),
              reply_to:messages!reply_to_id(
                id,
                content,
                attachments,
                sender:profiles!sender_id(id, full_name, avatar_url)
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            callback(data as Message);
          }
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * S'abonner aux mises à jour de conversations
   */
  subscribeToConversations(userId: string, callback: (conversation: Conversation) => void) {
    const subscription = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `buyer_id=eq.${userId}`
        },
        async (payload) => {
          const conversation = await this.getConversationById(payload.new.id);
          if (conversation) {
            callback(conversation);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `seller_id=eq.${userId}`
        },
        async (payload) => {
          const conversation = await this.getConversationById(payload.new.id);
          if (conversation) {
            callback(conversation);
          }
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * Se désabonner d'un channel
   */
  unsubscribe(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }

  // ========================================
  // INDICATEUR DE FRAPPE (Typing Indicator)
  // ========================================

  /**
   * Émettre un événement de frappe
   */
  sendTypingIndicator(conversationId: string, userId: string, userName: string, isTyping: boolean) {
    const channel = supabase.channel(`typing:${conversationId}`);
    
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: userId,
        user_name: userName,
        is_typing: isTyping,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * S'abonner aux événements de frappe d'une conversation
   */
  subscribeToTyping(
    conversationId: string, 
    currentUserId: string,
    callback: (data: { user_id: string; user_name: string; is_typing: boolean }) => void
  ) {
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        // Ne pas afficher son propre indicateur de frappe
        if (payload.payload.user_id !== currentUserId) {
          callback(payload.payload);
        }
      })
      .subscribe();

    return channel;
  }

  // ========================================
  // NOTIFICATIONS SONORES
  // ========================================

  private notificationSound: HTMLAudioElement | null = null;

  /**
   * Initialiser le son de notification
   */
  initNotificationSound() {
    if (typeof window !== 'undefined') {
      // Créer un son de notification simple avec Web Audio API
      this.notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleWMcI3G41teleV0TA0yYy+Z3HxNFqOh3BQ0DL27G8YJmPTOY6Jl/MjVuqOShlEYaR6Dv1Zp+UAQdWKbq1JyKZzg1aaXS1Z+PZjYlYp7X3qKLcUY1XZjU3qGPdEoxYZzf7JZ2Xjk9h8bph38+Hl+y8f9zOR0LTq7+8HcmAwRFqPLlZSgJEE2t7/dwLwoCQaDy/GonAgNCn/b4aCsDCUqq9PhtMQQIP6T5/2gmBQtJp/X4bTAECT+k+P9nJgQKSKj2+W0xBgxDpPf/ZyYFCkin9fluMQYMQ6P3/2YmBApIqPf5bjIGDEOj9/9mJgQKSKj3+W4yBgxDo/f/ZiYECkio9/luMgYMQ6P3/2YmBApIqPf5bjIGDEOj9/9mJgQKSKj3+W4yBgw=');
    }
  }

  /**
   * Jouer le son de notification
   */
  playNotificationSound() {
    if (this.notificationSound) {
      this.notificationSound.currentTime = 0;
      this.notificationSound.volume = 0.5;
      this.notificationSound.play().catch(() => {
        // Ignorer les erreurs de lecture audio (permissions)
      });
    }
  }
}

export const messagesService = new MessagesService();




