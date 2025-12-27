import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, X, Reply, ArrowLeft, User, MoreVertical } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { messagesService, Message, Conversation, MessageAttachment as AttachmentType } from '../../services/messages.service';
import { audioService } from '../../../services/audio.service';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageAttachment } from './MessageAttachment';
import { QuotedMessage } from './QuotedMessage';
import { SellerProfile } from './SellerProfile';
import { VehicleCardMini } from './VehicleCardMini';
import { DateSeparator } from './DateSeparator';
import { MessageActionsMenu } from './MessageActionsMenu';
import { VoicePlayer } from './VoicePlayer';
import { useIsMobile } from '../../hooks/useIsMobile';
import { shouldShowDateSeparator, getDateSeparatorLabel } from '../../utils/messageHelpers';

interface ChatBoxProps {
  conversation: Conversation;
  onBack?: () => void;
}

export function ChatBox({ conversation, onBack }: ChatBoxProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState('');
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showSellerProfile, setShowSellerProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const isMobile = useIsMobile();

  // Déterminer l'autre utilisateur
  const otherUser = user?.id === conversation.buyer_id ? conversation.seller : conversation.buyer;

  useEffect(() => {
    loadMessages();
    markAsRead();
    
    // Initialiser le son de notification
    messagesService.initNotificationSound();

    // S'abonner aux nouveaux messages en temps réel
    const messageSubscription = messagesService.subscribeToMessages(conversation.id, (message) => {
      // Éviter les doublons (si le message est déjà dans la liste)
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
      
      markAsRead();
      
      // Scroller vers le bas
      setTimeout(() => scrollToBottom(), 100);
      
      // Jouer le son si le message vient de l'autre utilisateur
      if (message.sender_id !== user?.id) {
        messagesService.playNotificationSound();
      }
    });

    // S'abonner aux indicateurs de frappe
    const typingSubscription = messagesService.subscribeToTyping(
      conversation.id,
      user?.id || '',
      (data) => {
        if (data.is_typing) {
          setIsOtherTyping(true);
          setTypingUserName(data.user_name);
        } else {
          setIsOtherTyping(false);
          setTypingUserName('');
        }
      }
    );

    return () => {
      messagesService.unsubscribe(messageSubscription);
      messagesService.unsubscribe(typingSubscription);
      // Nettoyer le timeout de frappe
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversation.id, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherTyping]); // Scroll quand messages changent OU quand quelqu'un tape

  const loadMessages = async () => {
    setLoading(true);
    const fetchedMessages = await messagesService.getMessages(conversation.id);
    setMessages(fetchedMessages);
    setLoading(false);
  };

  const markAsRead = async () => {
    if (user) {
      await messagesService.markConversationAsRead(conversation.id, user.id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && attachments.length === 0) || !user || sending) return;

    // Arrêter l'indicateur de frappe
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTypingIndicator(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setSending(true);
    const { message, error } = await messagesService.sendMessage(
      conversation.id,
      user.id,
      newMessage || '📎 Pièce jointe',
      attachments,
      replyingTo?.id
    );

    if (!error && message) {
      // Ajouter le message immédiatement à la liste (optimistic update)
      setMessages((prev) => [...prev, message]);
      
      // Réinitialiser le formulaire
      setNewMessage('');
      setAttachments([]);
      setReplyingTo(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Scroller vers le bas
      setTimeout(() => scrollToBottom(), 100);
    }
    
    setSending(false);
  };

  // Gérer l'upload de fichiers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Limite de taille (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
          continue;
        }

        const { attachment, error } = await messagesService.uploadAttachment(file, conversation.id);
        
        if (error) {
          alert(`Erreur lors de l'upload de ${file.name}`);
          continue;
        }

        if (attachment) {
          setAttachments(prev => [...prev, attachment]);
        }
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload des fichiers');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleReplyTo = (message: Message) => {
    setReplyingTo(message);
    textareaRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Fonction pour envoyer l'indicateur de frappe
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (user && profile) {
      messagesService.sendTypingIndicator(
        conversation.id,
        user.id,
        profile.full_name || 'Utilisateur',
        isTyping
      );
    }
  }, [conversation.id, user, profile]);

  // Gérer l'insertion d'emoji
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    // Remettre le focus sur le textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Gérer l'enregistrement vocal
  const handleVoiceRecorded = async (audioBlob: Blob, duration: number) => {
    if (!user) return;

    setSending(true);
    try {
      // Upload l'audio vers Supabase Storage
      const audioUrl = await audioService.uploadAudio(audioBlob, user.id);

      // Envoyer le message vocal
      const { message: newMessage, error } = await messagesService.sendVoiceMessage(
        conversation.id,
        user.id,
        audioUrl,
        duration
      );

      if (error) {
        console.error('Erreur envoi message vocal:', error);
        alert('Impossible d\'envoyer le message vocal');
      } else if (newMessage) {
        // Ajouter le message immédiatement à la liste (optimistic update)
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Erreur handleVoiceRecorded:', error);
      alert('Erreur lors de l\'envoi du message vocal');
    } finally {
      setSending(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;

    // Gérer l'indicateur de frappe
    if (!isTypingRef.current && e.target.value.length > 0) {
      isTypingRef.current = true;
      sendTypingIndicator(true);
    }

    // Réinitialiser le timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Arrêter l'indicateur de frappe après 2 secondes d'inactivité
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendTypingIndicator(false);
      }
    }, 2000);
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
      </Card>
    );
  }

  return (
    <>
      <Card className={`flex flex-col h-full border-0 shadow-xl ${isMobile ? 'relative' : ''}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b bg-gradient-to-r from-white to-gray-50 ${
          isMobile 
            ? 'p-2 sticky top-0 left-0 right-0 z-10 shadow-md' 
            : 'p-4'
        }`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Bouton retour (mobile uniquement) */}
            {isMobile && onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-[#FACC15] p-1 h-auto flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            {/* Avatar */}
            <div 
              className={`bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform flex-shrink-0 ${
                isMobile ? 'w-9 h-9' : 'w-12 h-12'
              }`}
              onClick={() => setShowSellerProfile(true)}
            >
              {otherUser?.avatar_url ? (
                <img src={otherUser.avatar_url} alt={otherUser.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className={`font-bold text-[#0F172A] ${isMobile ? 'text-sm' : 'text-lg'}`}>
                  {otherUser?.full_name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 
                className={`font-bold text-[#0F172A] truncate cursor-pointer hover:text-[#FACC15] transition-colors ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}
                onClick={() => setShowSellerProfile(true)}
              >
                {otherUser?.full_name || 'Utilisateur'}
              </h3>
              <p className={`text-gray-500 truncate ${isMobile ? 'text-xs' : 'text-xs'}`}>
                {conversation.listing?.brand} {conversation.listing?.model}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-500 hover:text-[#FACC15] ${isMobile ? 'p-1 h-auto' : ''}`}
              onClick={() => setShowSellerProfile(true)}
              title="Voir le profil"
            >
              <User className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
            </Button>
            
            {!isMobile && (
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#FACC15]">
                <MoreVertical className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto space-y-4 bg-gray-50/30 ${isMobile ? 'p-2 pb-4' : 'p-4'}`}>
        {/* Vehicle Card Mini */}
        {conversation.listing && (
          <VehicleCardMini 
            listing={{
              id: conversation.listing_id,
              title: `${conversation.listing.brand} ${conversation.listing.model}`,
              brand: conversation.listing.brand,
              model: conversation.listing.model,
              price: conversation.listing.price,
              year: 2020, // À adapter selon vos données
              images: conversation.listing.images || [],
              status: 'active' // À adapter selon vos données
            }}
          />
        )}

        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwn = message.sender_id === user?.id;
            const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
            const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1]);

            return (
              <div key={message.id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <DateSeparator label={getDateSeparatorLabel(new Date(message.created_at))} />
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${isMobile ? 'gap-1' : 'gap-2'} ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}
                >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {showAvatar ? (
                    <div className={`bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-full flex items-center justify-center overflow-hidden ${
                      isMobile ? 'w-6 h-6' : 'w-8 h-8'
                    }`}>
                      {message.sender?.avatar_url ? (
                        <img src={message.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className={`font-bold text-[#0F172A] ${isMobile ? 'text-xs' : 'text-xs'}`}>
                          {message.sender?.full_name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className={isMobile ? 'w-6 h-6' : 'w-8 h-8'} />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${isMobile ? 'max-w-[80%]' : 'max-w-[70%]'}`}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`rounded-2xl ${
                      isMobile ? 'px-3 py-2' : 'px-4 py-2.5'
                    } ${
                      isOwn
                        ? 'bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A]'
                        : 'bg-white text-gray-800 shadow-md'
                    } ${
                      isOwn
                        ? 'rounded-tr-sm'
                        : 'rounded-tl-sm'
                    }`}
                  >
                    {/* Message cité */}
                    {message.reply_to_id && message.reply_to && (
                      <div className={isMobile ? 'mb-1' : 'mb-2'}>
                        <QuotedMessage message={message.reply_to} compact />
                      </div>
                    )}

                    {/* Message vocal */}
                    {message.audio_url && (
                      <div className={message.content ? (isMobile ? 'mb-1' : 'mb-2') : ''}>
                        <VoicePlayer 
                          audioUrl={message.audio_url} 
                          duration={message.audio_duration || 0}
                        />
                      </div>
                    )}

                    {/* Contenu du message */}
                    {message.content && (
                      <p className={`whitespace-pre-wrap break-words ${isMobile ? 'text-sm' : 'text-sm'}`}>
                        {message.content}
                      </p>
                    )}

                    {/* Pièces jointes */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className={`space-y-2 ${message.content ? (isMobile ? 'mt-1' : 'mt-2') : ''}`}>
                        {message.attachments.map((attachment, idx) => (
                          <MessageAttachment key={idx} attachment={attachment} compact />
                        ))}
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Actions et timestamp */}
                  <div className={`flex items-center mt-1 ${isMobile ? 'gap-1 px-1' : 'gap-2 px-2'}`}>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: fr })}
                      {isOwn && message.is_read && <span className="ml-1 text-[#FACC15]">✓✓</span>}
                    </p>
                    
                    {/* Bouton de réponse */}
                    {!isOwn && !isMobile && (
                      <button
                        onClick={() => handleReplyTo(message)}
                        className="text-gray-400 hover:text-[#FACC15] transition-colors opacity-0 group-hover:opacity-100"
                        title="Répondre"
                      >
                        <Reply className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
              </div>
            );
          })}
        </AnimatePresence>
        
        {/* Indicateur de frappe */}
        <AnimatePresence>
          {isOtherTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-4 py-2"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-md">
                {/* Animation de frappe */}
                <div className="flex items-center gap-1">
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-500 italic">
                  {typingUserName} est en train d'écrire...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSend} 
        className={`border-t bg-white ${isMobile ? 'p-2 sticky bottom-0 left-0 right-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]' : 'p-4'}`}
      >
        {/* Message en réponse */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${isMobile ? 'mb-2' : 'mb-3'} relative`}
            >
              <QuotedMessage message={replyingTo} compact={isMobile} />
              <button
                onClick={cancelReply}
                className="absolute top-1 right-1 p-0.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pièces jointes en cours */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`${isMobile ? 'mb-2' : 'mb-3'} flex flex-wrap gap-2`}
            >
              {attachments.map((attachment, index) => (
                <MessageAttachment
                  key={index}
                  attachment={attachment}
                  onRemove={() => handleRemoveAttachment(index)}
                  compact
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex items-end ${isMobile ? 'gap-1' : 'gap-2'}`}>
          {/* Input de fichier caché */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* 🆕 Menu Actions organisé (Pièce jointe, Emoji, Réponses rapides, Message vocal) */}
          <MessageActionsMenu
            onFileSelect={handleFileSelect}
            onEmojiSelect={handleEmojiSelect}
            onQuickReplySelect={(text) => {
              setNewMessage(text);
              textareaRef.current?.focus();
            }}
            onVoiceRecorded={handleVoiceRecorded}
            uploading={uploading}
            isMobile={isMobile}
            fileInputRef={fileInputRef}
          />

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={isMobile ? "Message..." : "Écrivez votre message..."}
              rows={1}
              className={`w-full bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#FACC15] focus:outline-none resize-none transition-all ${
                isMobile 
                  ? 'px-3 py-2 text-sm' 
                  : 'px-4 py-3 pr-12'
              }`}
              style={{ maxHeight: isMobile ? '80px' : '120px' }}
            />
          </div>

          {/* Send button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              disabled={(!newMessage.trim() && attachments.length === 0) || sending}
              className={`bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] hover:from-[#FBBF24] hover:to-[#F59E0B] rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isMobile ? 'h-9 w-9 p-0' : 'h-12 w-12'
              }`}
            >
              {sending ? (
                <Loader2 className={`animate-spin ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              ) : (
                <Send className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
              )}
            </Button>
          </motion.div>
        </div>

        {/* Text d'aide - Masqué sur mobile */}
        {!isMobile && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
          </p>
        )}
      </form>
    </Card>

    {/* Profil du vendeur */}
    {showSellerProfile && otherUser && (
      <SellerProfile
        seller={otherUser}
        onClose={() => setShowSellerProfile(false)}
      />
    )}
    </>
  );
}




