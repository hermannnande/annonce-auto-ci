import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { 
  DEFAULT_QUICK_REPLIES, 
  CATEGORY_LABELS, 
  CATEGORY_COLORS,
  QuickReply 
} from '../../data/quickReplies';

interface QuickRepliesPickerProps {
  onSelect: (text: string) => void;
  onClose: () => void;
}

export function QuickRepliesPicker({ onSelect, onClose }: QuickRepliesPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuickReply['category'] | 'all'>('all');

  // Filtrer les réponses selon la recherche et la catégorie
  const filteredReplies = DEFAULT_QUICK_REPLIES.filter((reply) => {
    const matchesSearch = reply.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || reply.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Grouper par catégorie
  const categories = Object.keys(CATEGORY_LABELS) as QuickReply['category'][];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', duration: 0.3 }}
      className="absolute bottom-full left-0 mb-2 w-[350px] max-w-[90vw] z-[60]"
    >
      <Card className="max-h-[450px] overflow-hidden shadow-2xl border-2 border-[#FACC15]/30">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-[#FACC15]/10 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#0F172A]" />
              </div>
              <h3 className="font-bold text-[#0F172A]">Réponses rapides</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une réponse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent text-sm"
              autoFocus
            />
          </div>

          {/* Filtres par catégorie */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#FACC15] text-[#0F172A]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ✨ Toutes
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? CATEGORY_COLORS[category]
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des réponses */}
        <div className="max-h-[250px] overflow-y-auto">
          {filteredReplies.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'Aucune réponse trouvée' : 'Aucune réponse dans cette catégorie'}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredReplies.map((reply) => (
                <motion.button
                  key={reply.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelect(reply.text);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${CATEGORY_COLORS[reply.category]} hover:border-[#FACC15]`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{reply.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] mb-1">
                        {CATEGORY_LABELS[reply.category]}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">{reply.text}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            💡 <strong>Astuce :</strong> Vous pouvez modifier le texte après l'insertion
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

