import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile } from 'lucide-react';
import { Button } from '../ui/button';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
  smileys: ['😊', '😂', '😍', '🥰', '😎', '🤩', '😢', '😭', '😡', '🤔', '👍', '👎', '👏', '🙏', '💪'],
  vehicles: ['🚗', '🚙', '🚕', '🚌', '🚐', '🏎️', '🚓', '🚑', '🚒', '🛻', '🏍️', '🛵'],
  symbols: ['✅', '❌', '⭐', '🎉', '🔥', '💯', '💰', '💵', '📱', '📞', '📧', '⏰']
};

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-gray-400 hover:text-[#FACC15]"
      >
        <Smile className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Emoji Picker Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-xl shadow-2xl border-2 border-gray-200 w-64 overflow-hidden"
            >
              {/* Categories */}
              <div className="flex border-b bg-gray-50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedCategory('smileys');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                    selectedCategory === 'smileys'
                      ? 'text-[#FACC15] border-b-2 border-[#FACC15] bg-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  😊 Smileys
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedCategory('vehicles');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                    selectedCategory === 'vehicles'
                      ? 'text-[#FACC15] border-b-2 border-[#FACC15] bg-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🚗 Véhicules
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedCategory('symbols');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                    selectedCategory === 'symbols'
                      ? 'text-[#FACC15] border-b-2 border-[#FACC15] bg-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ⭐ Symboles
                </button>
              </div>

              {/* Emojis Grid */}
              <div className="p-3 grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {EMOJI_CATEGORIES[selectedCategory].map((emoji, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEmojiClick(emoji);
                    }}
                    className="text-2xl hover:bg-gray-100 rounded-lg p-1 transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

