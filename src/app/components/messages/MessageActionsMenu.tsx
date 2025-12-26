import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Paperclip, Smile, Zap, Mic } from 'lucide-react';
import { Button } from '../ui/button';
import { VoiceRecorder } from './VoiceRecorder';
import { EmojiPicker } from './EmojiPicker';
import { QuickRepliesPicker } from './QuickRepliesPicker';

interface MessageActionsMenuProps {
  onFileSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEmojiSelect?: (emoji: string) => void;
  onQuickReplySelect?: (text: string) => void;
  onVoiceRecorded: (audioBlob: Blob, duration: number) => void;
  uploading?: boolean;
  isMobile: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

export function MessageActionsMenu({
  onFileSelect,
  onEmojiSelect,
  onQuickReplySelect,
  onVoiceRecorded,
  uploading,
  isMobile,
  fileInputRef,
}: MessageActionsMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const handleToggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  const handleFileClick = () => {
    fileInputRef?.current?.click();
    setShowMenu(false);
  };

  const handleVoiceClick = () => {
    setShowVoiceRecorder(true);
    setShowMenu(false);
  };

  const handleEmojiClick = () => {
    setShowEmojiPicker(true);
    setShowMenu(false);
  };

  const handleQuickRepliesClick = () => {
    setShowQuickReplies(true);
    setShowMenu(false);
  };

  const handleVoiceRecorded = (audioBlob: Blob, duration: number) => {
    setShowVoiceRecorder(false);
    onVoiceRecorded(audioBlob, duration);
  };

  const handleVoiceCancel = () => {
    setShowVoiceRecorder(false);
  };

  return (
    <>
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggleMenu}
          className={`text-gray-400 hover:text-[#FACC15] ${isMobile ? 'p-2 h-auto' : 'mb-1'} ${showMenu ? 'bg-[#FACC15]/10 text-[#FACC15]' : ''}`}
          title="Plus d'actions"
        >
          <Plus className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
        </Button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-2">
                <h3 className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">Actions rapides</h3>
                
                {/* Message vocal */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  onClick={handleVoiceClick}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Message vocal
                </Button>

                {/* Pièce jointe */}
                {onFileSelect && fileInputRef && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-50"
                    onClick={handleFileClick}
                    disabled={uploading}
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Pièce jointe
                  </Button>
                )}

                {/* Emoji */}
                {onEmojiSelect && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-50"
                    onClick={handleEmojiClick}
                  >
                    <Smile className="w-4 h-4 mr-2" />
                    Emoji
                  </Button>
                )}

                {/* Réponses rapides */}
                {onQuickReplySelect && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-50"
                    onClick={handleQuickRepliesClick}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Réponses rapides
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voice Recorder Modal */}
      <AnimatePresence>
        {showVoiceRecorder && (
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecorded}
            onClose={handleVoiceCancel}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && onEmojiSelect && (
          <div className="absolute bottom-full left-0 mb-2 z-[60]">
            <EmojiPicker
              onEmojiSelect={(emoji) => {
                onEmojiSelect(emoji);
                setShowEmojiPicker(false);
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Quick Replies Picker */}
      <AnimatePresence>
        {showQuickReplies && onQuickReplySelect && (
          <QuickRepliesPicker
            onSelect={(text) => {
              onQuickReplySelect(text);
              setShowQuickReplies(false);
            }}
            onClose={() => setShowQuickReplies(false)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </>
  );
}
