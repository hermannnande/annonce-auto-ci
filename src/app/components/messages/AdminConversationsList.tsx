import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Flag, 
  Download, 
  Eye, 
  Search,
  Filter,
  Users,
  Car,
  Clock
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ConversationWithDetails } from '../../services/messages.service';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdminConversationsListProps {
  conversations: ConversationWithDetails[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: ConversationWithDetails) => void;
}

type FilterType = 'all' | 'flagged' | 'recent' | 'active';

export function AdminConversationsList({
  conversations,
  selectedConversationId,
  onSelectConversation
}: AdminConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrer les conversations
  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase();
    
    // Recherche
    const matchesSearch = (
      conv.buyer_name?.toLowerCase().includes(searchLower) ||
      conv.seller_name?.toLowerCase().includes(searchLower) ||
      conv.listing_brand?.toLowerCase().includes(searchLower) ||
      conv.listing_model?.toLowerCase().includes(searchLower) ||
      conv.last_message?.toLowerCase().includes(searchLower)
    );

    if (!matchesSearch) return false;

    // Filtre par type
    if (filterType === 'flagged') {
      // À implémenter: conversations signalées
      return false;
    } else if (filterType === 'recent') {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(conv.last_message_at) > dayAgo;
    } else if (filterType === 'active') {
      return conv.status === 'active';
    }
    
    return true;
  });

  return (
    <Card className="flex flex-col h-full border-0 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Surveillance
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`${showFilters ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher (utilisateurs, véhicules...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t">
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Filtrer par</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className={filterType === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    Toutes
                  </Button>
                  <Button
                    variant={filterType === 'recent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('recent')}
                    className={filterType === 'recent' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    Récentes (24h)
                  </Button>
                  <Button
                    variant={filterType === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('active')}
                    className={filterType === 'active' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    Actives
                  </Button>
                  <Button
                    variant={filterType === 'flagged' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('flagged')}
                    className={filterType === 'flagged' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    Signalées
                  </Button>
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
              const isSelected = conversation.id === selectedConversationId;
              const totalMessages = conversation.total_messages || 0;
              const totalUnread = conversation.buyer_unread_count + conversation.seller_unread_count;

              return (
                <motion.button
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-4 text-left hover:bg-blue-50 transition-colors ${
                    isSelected ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="space-y-2">
                    {/* Users */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">{conversation.buyer_name}</span>
                        <span className="text-gray-400">↔</span>
                        <span className="font-semibold text-gray-900">{conversation.seller_name}</span>
                      </div>
                      {totalUnread > 0 && (
                        <Badge className="bg-red-500">{totalUnread}</Badge>
                      )}
                    </div>

                    {/* Vehicle */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Car className="w-4 h-4" />
                      <span>{conversation.listing_brand} {conversation.listing_model}</span>
                      {conversation.listing_price && (
                        <span className="ml-auto font-semibold text-[#FACC15]">
                          {new Intl.NumberFormat('fr-FR').format(conversation.listing_price)} FCFA
                        </span>
                      )}
                    </div>

                    {/* Last Message */}
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.last_message || 'Aucun message'}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(conversation.last_message_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{totalMessages} msg</span>
                        {conversation.status === 'blocked' && (
                          <Badge variant="destructive" className="text-xs">Bloqué</Badge>
                        )}
                      </div>
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
          {filteredConversations.length} conversation{filteredConversations.length > 1 ? 's' : ''} • 
          {conversations.reduce((sum, conv) => sum + (conv.buyer_unread_count + conv.seller_unread_count), 0)} non lu{conversations.reduce((sum, conv) => sum + (conv.buyer_unread_count + conv.seller_unread_count), 0) > 1 ? 's' : ''}
        </p>
      </div>
    </Card>
  );
}



