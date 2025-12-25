import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChatBox } from '../../components/messages/ChatBox';
import { AdminConversationsList } from '../../components/messages/AdminConversationsList';
import { ConversationMonitorPanel } from '../../components/messages/ConversationMonitorPanel';
import { messagesService, Conversation, ConversationWithDetails } from '../../services/messages.service';
import { useAuth } from '../../context/AuthContext';
import { Loader2, MessageCircle, TrendingUp, MessageSquare, Clock, AlertCircle, Shield } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { StatCard } from '../../components/dashboard/StatCard';
import { useIsMobile } from '../../hooks/useIsMobile';

export function AdminMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedConversationDetails, setSelectedConversationDetails] = useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const [stats, setStats] = useState({
    totalConversations: 0,
    conversationsLast7Days: 0,
    totalMessages: 0,
    messagesLast7Days: 0,
    totalUnreadMessages: 0,
    avgResponseTimeMinutes: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    
    // Charger toutes les conversations (admin peut tout voir)
    const fetchedConversations = await messagesService.getAllConversations();
    setConversations(fetchedConversations);
    
    // Charger les statistiques
    const fetchedStats = await messagesService.getMessagingStats();
    setStats(fetchedStats);
    
    // Sélectionner automatiquement la première conversation
    if (fetchedConversations.length > 0 && !selectedConversation) {
      // Convertir ConversationWithDetails en Conversation pour le ChatBox
      const firstConv = fetchedConversations[0];
      const conversation: Conversation = {
        id: firstConv.id,
        listing_id: firstConv.listing_id,
        buyer_id: firstConv.buyer_id,
        seller_id: firstConv.seller_id,
        last_message: firstConv.last_message,
        last_message_at: firstConv.last_message_at,
        buyer_unread_count: firstConv.buyer_unread_count,
        seller_unread_count: firstConv.seller_unread_count,
        status: firstConv.status,
        created_at: firstConv.created_at,
        updated_at: firstConv.updated_at,
        listing: firstConv.listing_title ? {
          title: firstConv.listing_title,
          brand: firstConv.listing_brand || '',
          model: firstConv.listing_model || '',
          price: firstConv.listing_price || 0,
          images: firstConv.listing_images || []
        } : undefined,
        buyer: firstConv.buyer_name ? {
          id: firstConv.buyer_id,
          full_name: firstConv.buyer_name,
          phone: firstConv.buyer_phone || '',
          avatar_url: firstConv.buyer_avatar
        } : undefined,
        seller: firstConv.seller_name ? {
          id: firstConv.seller_id,
          full_name: firstConv.seller_name,
          phone: firstConv.seller_phone || '',
          avatar_url: firstConv.seller_avatar
        } : undefined
      };
      setSelectedConversation(conversation);
    }
    
    setLoading(false);
  };

  const handleSelectConversation = async (conv: ConversationWithDetails) => {
    // Sauvegarder les détails complets
    setSelectedConversationDetails(conv);
    
    // Convertir ConversationWithDetails en Conversation
    const conversation: Conversation = {
      id: conv.id,
      listing_id: conv.listing_id,
      buyer_id: conv.buyer_id,
      seller_id: conv.seller_id,
      last_message: conv.last_message,
      last_message_at: conv.last_message_at,
      buyer_unread_count: conv.buyer_unread_count,
      seller_unread_count: conv.seller_unread_count,
      status: conv.status,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      listing: conv.listing_title ? {
        title: conv.listing_title,
        brand: conv.listing_brand || '',
        model: conv.listing_model || '',
        price: conv.listing_price || 0,
        images: conv.listing_images || []
      } : undefined,
      buyer: conv.buyer_name ? {
        id: conv.buyer_id,
        full_name: conv.buyer_name,
        phone: conv.buyer_phone || '',
        avatar_url: conv.buyer_avatar
      } : undefined,
      seller: conv.seller_name ? {
        id: conv.seller_id,
        full_name: conv.seller_name,
        phone: conv.seller_phone || '',
        avatar_url: conv.seller_avatar
      } : undefined
    };
    setSelectedConversation(conversation);
  };

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#FACC15] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des messages...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            Surveillance & Anti-Arnaque
          </h1>
          <p className="text-gray-600">
            Suivez toutes les conversations et détectez les activités suspectes en temps réel
          </p>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Total Conversations"
              value={stats.totalConversations.toString()}
              change={`+${stats.conversationsLast7Days} cette semaine`}
              changeType="increase"
              icon={MessageSquare}
              iconBg="from-blue-400 to-blue-600"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Messages Envoyés"
              value={stats.totalMessages.toString()}
              change={`+${stats.messagesLast7Days} cette semaine`}
              changeType="increase"
              icon={TrendingUp}
              iconBg="from-green-400 to-green-600"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Messages Non Lus"
              value={stats.totalUnreadMessages.toString()}
              change="À traiter"
              changeType={stats.totalUnreadMessages > 0 ? "decrease" : "neutral"}
              icon={AlertCircle}
              iconBg="from-red-400 to-red-600"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Temps de Réponse Moyen"
              value={`${stats.avgResponseTimeMinutes || 0}min`}
              change="Derniers 7 jours"
              changeType="neutral"
              icon={Clock}
              iconBg="from-purple-400 to-purple-600"
            />
          </motion.div>
        </div>

        {/* Messages Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ height: 'calc(100vh - 450px)' }}>
          {/* Liste des conversations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3 h-full"
          >
            <AdminConversationsList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id || null}
              onSelectConversation={handleSelectConversation}
            />
          </motion.div>

          {/* Chat box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-6 h-full"
          >
            {selectedConversation ? (
              <div className="h-full flex flex-col">
                {/* Info Banner Admin */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-3 mb-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Mode Surveillance :</span>
                    <span>
                      <strong className="text-blue-900">{selectedConversation.buyer?.full_name}</strong> (acheteur) 
                      ↔ <strong className="text-blue-900">{selectedConversation.seller?.full_name}</strong> (vendeur)
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <ChatBox conversation={selectedConversation} />
                </div>
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center h-full border-2 border-dashed border-blue-300 bg-blue-50">
                <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-sm text-blue-700 text-center max-w-md">
                  Choisissez une conversation pour surveiller les échanges et détecter les activités suspectes
                </p>
              </Card>
            )}
          </motion.div>

          {/* Panel de surveillance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-3 h-full overflow-y-auto"
          >
            {selectedConversationDetails ? (
              <ConversationMonitorPanel conversation={selectedConversationDetails} />
            ) : (
              <Card className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500">
                  Les détails et outils de surveillance apparaîtront ici
                </p>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}




