import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Search, Archive, Filter, SortDesc } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Conversation } from '../../services/messages.service';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';

type FilterType = 'all' | 'unread' | 'archived';
type SortType = 'date' | 'vehicle';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId: string;
}

export function ConversationsList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('date');
  const [showFilters, setShowFilters] = useState(false);

  // Compter les messages non lus
  const getUnreadCount = (conv: Conversation) => {
    return currentUserId === conv.buyer_id 
      ? conv.buyer_unread_count 
      : conv.seller_unread_count;
  };

  // Filtrer les conversations par recherche et filtre
  const filteredConversations = conversations
    .filter((conv) => {
      const otherUser = currentUserId === conv.buyer_id ? conv.seller : conv.buyer;
      const searchLower = searchQuery.toLowerCase();
      
      // Filtre de recherche
      const matchesSearch = (
        otherUser?.full_name?.toLowerCase().includes(searchLower) ||
        conv.listing?.brand?.toLowerCase().includes(searchLower) ||
        conv.listing?.model?.toLowerCase().includes(searchLower) ||
        conv.last_message?.toLowerCase().includes(searchLower)
      );

      if (!matchesSearch) return false;

      // Filtre par type
      if (filterType === 'unread') {
        return getUnreadCount(conv) > 0;
      } else if (filterType === 'archived') {
        return conv.status === 'archived';
      }
      
      return conv.status !== 'archived'; // 'all' exclut les archivés
    })
    .sort((a, b) => {
      // Tri
      if (sortType === 'date') {
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      } else if (sortType === 'vehicle') {
        const vehicleA = `${a.listing?.brand} ${a.listing?.model}`.toLowerCase();
        const vehicleB = `${b.listing?.brand} ${b.listing?.model}`.toLowerCase();
        return vehicleA.localeCompare(vehicleB);
      }
      return 0;
    });

  if (conversations.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center h-full p-8 text-center border-0 shadow-xl">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-[#0F172A] mb-2">Aucune conversation</h3>
        <p className="text-sm text-gray-500">
          Vos conversations apparaîtront ici
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full border-0 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#FACC15]" />
            Messages
          </h2>
          
          {/* Filter Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`${showFilters ? 'text-[#FACC15]' : 'text-gray-500'} hover:text-[#FACC15]`}
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#FACC15] focus:outline-none text-sm"
          />
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-3 border-t">
                {/* Filter Buttons */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Filtrer par</label>
                  <div className="flex gap-2">
                    <Button
                      variant={filterType === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('all')}
                      className={filterType === 'all' ? 'bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24]' : ''}
                    >
                      Tous
                    </Button>
                    <Button
                      variant={filterType === 'unread' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('unread')}
                      className={filterType === 'unread' ? 'bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24]' : ''}
                    >
                      Non lus
                    </Button>
                    <Button
                      variant={filterType === 'archived' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('archived')}
                      className={filterType === 'archived' ? 'bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24]' : ''}
                    >
                      Archivés
                    </Button>
                  </div>
                </div>

                {/* Sort Buttons */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block flex items-center gap-1">
                    <SortDesc className="w-3 h-3" />
                    Trier par
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={sortType === 'date' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortType('date')}
                      className={sortType === 'date' ? 'bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24]' : ''}
                    >
                      Date
                    </Button>
                    <Button
                      variant={sortType === 'vehicle' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortType('vehicle')}
                      className={sortType === 'vehicle' ? 'bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24]' : ''}
                    >
                      Véhicule
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <p className="text-sm text-gray-500">Aucun résultat</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation, index) => {
              const otherUser = currentUserId === conversation.buyer_id ? conversation.seller : conversation.buyer;
              const unreadCount = getUnreadCount(conversation);
              const isSelected = conversation.id === selectedConversationId;

              return (
                <motion.button
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-[#FACC15]/10 border-l-4 border-[#FACC15]' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-full flex items-center justify-center overflow-hidden">
                        {otherUser?.avatar_url ? (
                          <img 
                            src={otherUser.avatar_url} 
                            alt={otherUser.full_name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-lg font-bold text-[#0F172A]">
                            {otherUser?.full_name?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      
                      {/* Unread badge */}
                      {unreadCount > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-xs font-bold text-white">{unreadCount}</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name and Time */}
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold truncate ${unreadCount > 0 ? 'text-[#0F172A]' : 'text-gray-700'}`}>
                          {otherUser?.full_name || 'Utilisateur'}
                        </h4>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { 
                            addSuffix: false, 
                            locale: fr 
                          })}
                        </span>
                      </div>

                      {/* Vehicle Info */}
                      <div className="flex items-center gap-2 mb-1">
                        {conversation.listing?.images?.[0] && (
                          <img 
                            src={conversation.listing.images[0]} 
                            alt="" 
                            className="w-6 h-6 rounded object-cover"
                          />
                        )}
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.listing?.brand} {conversation.listing?.model}
                        </p>
                      </div>

                      {/* Last Message */}
                      <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-[#0F172A]' : 'text-gray-500'}`}>
                        {conversation.last_message || 'Aucun message'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t bg-gray-50 text-center">
        <p className="text-xs text-gray-500">
          {filteredConversations.length} conversation{filteredConversations.length > 1 ? 's' : ''}
          {conversations.reduce((sum, conv) => sum + getUnreadCount(conv), 0) > 0 && (
            <span className="ml-2 text-red-500 font-semibold">
              • {conversations.reduce((sum, conv) => sum + getUnreadCount(conv), 0)} non lu{conversations.reduce((sum, conv) => sum + getUnreadCount(conv), 0) > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>
    </Card>
  );
}




