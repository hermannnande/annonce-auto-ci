import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  Eye,
  CreditCard,
  Phone as PhoneIcon,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface SafetyWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  actionType: 'message' | 'whatsapp' | 'call';
}

export function SafetyWarningModal({ 
  isOpen, 
  onClose, 
  onContinue,
  actionType 
}: SafetyWarningModalProps) {
  
  const getActionIcon = () => {
    switch (actionType) {
      case 'message':
        return <MessageCircle className="w-6 h-6" />;
      case 'whatsapp':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        );
      case 'call':
        return <PhoneIcon className="w-6 h-6" />;
    }
  };

  const getActionText = () => {
    switch (actionType) {
      case 'message':
        return 'Envoyer un message';
      case 'whatsapp':
        return 'Contacter sur WhatsApp';
      case 'call':
        return 'Appeler le vendeur';
    }
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-md sm:max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="relative overflow-hidden shadow-2xl border-0">
                {/* Header professionnel */}
                <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 px-4 py-4 sm:p-5 text-white relative overflow-hidden">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="absolute -right-8 -top-8 sm:-right-10 sm:-top-10"
                  >
                    <ShieldAlert className="w-32 h-32 sm:w-40 sm:h-40" />
                  </motion.div>
                  
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors z-20 hover:bg-white/10 rounded-lg p-1"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-xl shadow-lg"
                      >
                        <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                      </motion.div>
                      
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                          Conseils de sécurité
                        </h2>
                        <p className="text-white/70 text-xs sm:text-sm">
                          Avant de contacter le vendeur
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content professionnel */}
                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 bg-gray-50">
                  {/* Avertissements - Design professionnel */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2.5 sm:space-y-3"
                  >
                    {/* Point 1 - Rouge professionnel */}
                    <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg border-l-4 border-red-600 shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-red-50 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                        Ne payez jamais à distance
                      </p>
                    </div>

                    {/* Point 2 - Orange professionnel */}
                    <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg border-l-4 border-orange-600 shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                        Déplacez-vous pour voir le véhicule
                      </p>
                    </div>

                    {/* Point 3 - Bleu professionnel */}
                    <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg border-l-4 border-blue-600 shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                        Vérifiez tout avant d'acheter
                      </p>
                    </div>
                  </motion.div>

                  {/* Message final professionnel */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-3 sm:p-4 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg text-center"
                  >
                    <p className="text-xs sm:text-sm text-white leading-relaxed">
                      Payez <span className="font-bold text-amber-400">uniquement après inspection</span> sur place.
                    </p>
                  </motion.div>

                  {/* Actions - Compact mobile */}
                  <div className="flex gap-2 sm:gap-3 pt-1">
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-1 h-10 sm:h-11 text-xs sm:text-sm font-medium border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={onContinue}
                      className="flex-1 h-10 sm:h-11 text-xs sm:text-sm bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] hover:from-[#FBBF24] hover:to-[#F59E0B] font-bold shadow-lg hover:shadow-xl transition-all gap-1.5 sm:gap-2"
                    >
                      {getActionIcon()}
                      <span className="hidden xs:inline">{getActionText()}</span>
                      <span className="xs:hidden">Continuer</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

