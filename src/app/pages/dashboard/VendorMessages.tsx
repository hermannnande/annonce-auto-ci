import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChatBox } from '../../components/messages/ChatBox';
import { ConversationsList } from '../../components/messages/ConversationsList';
import { messagesService, Conversation } from '../../services/messages.service';
import { useAuth } from '../../context/AuthContext';
import { Loader2, MessageCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { useIsMobile } from '../../hooks/useIsMobile';

export function VendorMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      loadConversations();
      
      // S'abonner aux mises à jour en temps réel
      const subscription = messagesService.subscribeToConversations(user.id, (conversation) => {
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === conversation.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = conversation;
            return updated.sort((a, b) => 
              new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
            );
          }
          return [conversation, ...prev];
        });
        
        // Mettre à jour la conversation sélectionnée si c'est la même
        if (selectedConversation?.id === conversation.id) {
          setSelectedConversation(conversation);
        }
      });

      return () => {
        messagesService.unsubscribe(subscription);
      };
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    const fetchedConversations = await messagesService.getUserConversations(user.id);
    setConversations(fetchedConversations);
    
    // Sur desktop, sélectionner automatiquement la première conversation
    if (fetchedConversations.length > 0 && !selectedConversation && !isMobile) {
      setSelectedConversation(fetchedConversations[0]);
    }
    
    setLoading(false);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <DashboardLayout userType="vendor">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#FACC15] mx-auto mb-4" />
            <p className="text-gray-600">Chargement de vos messages...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#0F172A]" />
            </div>
            Messages
          </h1>
          <p className="text-gray-600">
            Gérez vos conversations avec les clients intéressés par vos annonces
          </p>
        </motion.div>

        {/* Messages Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 250px)' }}>
          {/* VERSION MOBILE */}
          {isMobile ? (
            <>
              {/* Liste des conversations (visible si aucune conversation sélectionnée) */}
              {!selectedConversation && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full"
                >
                  <ConversationsList
                    conversations={conversations}
                    selectedConversationId={selectedConversation?.id || null}
                    onSelectConversation={handleSelectConversation}
                    currentUserId={user?.id || ''}
                  />
                </motion.div>
              )}

              {/* Chat box (visible si une conversation est sélectionnée) */}
              {selectedConversation && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full"
                >
                  <ChatBox 
                    conversation={selectedConversation} 
                    onBack={handleBackToList}
                  />
                </motion.div>
              )}
            </>
          ) : (
            /* VERSION DESKTOP */
            <>
              {/* Liste des conversations */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-1 h-full"
              >
                <ConversationsList
                  conversations={conversations}
                  selectedConversationId={selectedConversation?.id || null}
                  onSelectConversation={handleSelectConversation}
                  currentUserId={user?.id || ''}
                />
              </motion.div>

              {/* Chat box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 h-full"
              >
                {selectedConversation ? (
                  <ChatBox conversation={selectedConversation} />
                ) : (
                  <Card className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 bg-gray-50">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-sm text-gray-500 text-center max-w-md">
                      Choisissez une conversation dans la liste pour commencer à discuter avec vos clients
                    </p>
                  </Card>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}




