import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, X } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface ContactSellerButtonProps {
  onCall: () => void;
  onWhatsApp: () => void;
  onMessage: () => void;
  sellerPhone?: string;
}

export function ContactSellerButton({
  onCall,
  onWhatsApp,
  onMessage,
  sellerPhone
}: ContactSellerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton flottant - Visible uniquement sur mobile */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-8 py-4 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] rounded-full shadow-2xl font-semibold whitespace-nowrap flex items-center gap-2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.3 
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Phone className="w-5 h-5" />
        <span>Contacter le vendeur</span>
      </motion.button>

      {/* Modal avec les options - Visible uniquement sur mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Contacter le vendeur
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Options de contact */}
              <div className="p-6 space-y-3">
                {/* Bouton Téléphone */}
                <motion.button
                  onClick={() => {
                    onCall();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] rounded-2xl shadow-lg hover:shadow-xl transition-all font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">Appeler</div>
                    {sellerPhone && (
                      <div className="text-sm opacity-80">{sellerPhone}</div>
                    )}
                  </div>
                </motion.button>

                {/* Bouton WhatsApp */}
                <motion.button
                  onClick={() => {
                    onWhatsApp();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-[#25D366] to-[#20BA5A] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <WhatsAppIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">WhatsApp</div>
                    <div className="text-sm opacity-80">Message instantané</div>
                  </div>
                </motion.button>

                {/* Bouton Message */}
                <motion.button
                  onClick={() => {
                    onMessage();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-white border-2 border-gray-200 text-[#0F172A] rounded-2xl shadow-lg hover:border-[#FACC15] hover:bg-[#FACC15]/5 transition-all font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">Envoyer un message</div>
                    <div className="text-sm text-gray-500">Via la messagerie</div>
                  </div>
                </motion.button>
              </div>

              {/* Info sécurité */}
              <div className="px-6 pb-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs text-blue-800 text-center">
                    ℹ️ Ne partagez jamais d'informations bancaires ou de codes par message
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

