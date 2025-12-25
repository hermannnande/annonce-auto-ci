import { motion, AnimatePresence } from 'motion/react';
import { X, Facebook, Twitter, Linkedin, Link2, Check, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
}

export function ShareModal({ isOpen, onClose, url, title, description }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
      '_blank'
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="relative overflow-hidden shadow-2xl border-0">
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-5 text-white relative">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-20 hover:bg-white/10 rounded-lg p-1"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Partager cette annonce</h2>
                      <p className="text-white/70 text-sm">Sur les réseaux sociaux</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Facebook */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={shareToFacebook}
                    className="w-full flex items-center gap-3 p-3 bg-[#1877F2] hover:bg-[#1665D8] text-white rounded-xl shadow-lg transition-all"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Facebook className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Partager sur Facebook</span>
                  </motion.button>

                  {/* Twitter */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={shareToTwitter}
                    className="w-full flex items-center gap-3 p-3 bg-[#1DA1F2] hover:bg-[#1A8CD8] text-white rounded-xl shadow-lg transition-all"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Twitter className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Partager sur Twitter</span>
                  </motion.button>

                  {/* WhatsApp */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={shareToWhatsApp}
                    className="w-full flex items-center gap-3 p-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl shadow-lg transition-all"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <span className="font-semibold">Partager sur WhatsApp</span>
                  </motion.button>

                  {/* LinkedIn */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={shareToLinkedIn}
                    className="w-full flex items-center gap-3 p-3 bg-[#0A66C2] hover:bg-[#095196] text-white rounded-xl shadow-lg transition-all"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Linkedin className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Partager sur LinkedIn</span>
                  </motion.button>

                  {/* Copier le lien */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl shadow-lg transition-all border-2 border-slate-200"
                  >
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Link2 className="w-5 h-5" />
                      )}
                    </div>
                    <span className="font-semibold">
                      {copied ? 'Lien copié !' : 'Copier le lien'}
                    </span>
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

