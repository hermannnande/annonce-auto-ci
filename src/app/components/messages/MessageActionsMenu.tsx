import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Paperclip, Smile, Zap, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';

interface MessageActionsMenuProps {
  onAttachFile: () => void;
  onOpenEmoji: () => void;
  onOpenQuickReplies: () => void;
  uploading?: boolean;
}

export function MessageActionsMenu({
  onAttachFile,
  onOpenEmoji,
  onOpenQuickReplies,
  uploading = false,
}: MessageActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'attachment',
      label: 'Pièce jointe',
      icon: Paperclip,
      onClick: () => {
        onAttachFile();
        setIsOpen(false);
      },
      color: 'hover:bg-blue-50 hover:text-blue-600',
      disabled: uploading,
    },
    {
      id: 'emoji',
      label: 'Emoji',
      icon: Smile,
      onClick: () => {
        onOpenEmoji();
        setIsOpen(false);
      },
      color: 'hover:bg-yellow-50 hover:text-yellow-600',
    },
    {
      id: 'quick-replies',
      label: 'Réponses rapides',
      icon: Zap,
      onClick: () => {
        onOpenQuickReplies();
        setIsOpen(false);
      },
      color: 'hover:bg-purple-50 hover:text-purple-600',
    },
  ];

  return (
    <div className="relative">
      {/* Bouton principal */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`transition-all ${isOpen ? 'bg-[#FACC15]/20 text-[#FACC15]' : 'text-gray-400 hover:text-[#FACC15]'}`}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </Button>

      {/* Menu popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (ferme au clic) */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Popup menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-2xl border-2 border-[#FACC15]/30 overflow-hidden z-50 min-w-[220px]"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-[#FACC15]/10 to-transparent border-b">
                <p className="text-xs font-bold text-gray-700">Actions rapides</p>
              </div>

              {/* Actions list */}
              <div className="p-2">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${action.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer tip */}
              <div className="px-4 py-2 bg-gray-50 border-t">
                <p className="text-xs text-gray-500 text-center">
                  💡 Cliquez pour accéder aux actions
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

