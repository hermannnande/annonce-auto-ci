import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Home,
  CreditCard,
  Zap,
  Clock,
  Calendar,
  Download,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function ThankYouPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);

  // Get parameters from URL
  const amount = searchParams.get('amount') || '10,000';
  const credits = searchParams.get('credits') || '10';
  const method = searchParams.get('method') || 'Mobile Money';
  const transactionId = searchParams.get('transactionId') || `TXN${Date.now()}`;

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Confetti animation
  const confettiColors = ['#0F172A', '#FACC15', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];
  const confettiElements = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-[#0F172A]/10 to-[#3B82F6]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-[#FACC15]/10 to-[#FBBF24]/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiElements.map((confetti) => (
            <motion.div
              key={confetti.id}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: confetti.color,
                left: `${confetti.left}%`,
                top: '-10%',
              }}
              animate={{
                y: ['0vh', '110vh'],
                rotate: [0, 360],
                opacity: [1, 0],
              }}
              transition={{
                duration: confetti.duration,
                delay: confetti.delay,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="inline-flex mb-6"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-2xl opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl sm:text-5xl font-bold text-[#0F172A] mb-4"
          >
            Recharge réussie !
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg sm:text-xl text-gray-600 mb-2"
          >
            Votre compte a été crédité avec succès
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-[#0F172A] px-6 py-2 rounded-full font-semibold"
          >
            <Sparkles className="w-5 h-5 text-[#FACC15]" />
            +{credits} crédits ajoutés
          </motion.div>
        </motion.div>

        {/* Transaction Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 sm:p-8 border-0 shadow-2xl bg-white/80 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#0F172A]">Récapitulatif de la transaction</h2>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Confirmée
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {/* Amount */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Montant payé</p>
                    <p className="font-bold text-[#0F172A]">{amount} FCFA</p>
                  </div>
                </div>
              </div>

              {/* Credits */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#0F172A]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Crédits reçus</p>
                    <p className="font-bold text-[#0F172A]">{credits} crédits</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Méthode de paiement</p>
                    <p className="font-bold text-[#0F172A]">{method}</p>
                  </div>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID de transaction</p>
                    <p className="font-bold text-[#0F172A] text-sm">{transactionId}</p>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date et heure</p>
                    <p className="font-bold text-[#0F172A]">
                      {new Date().toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Receipt */}
            <Button
              variant="outline"
              className="w-full border-2 border-gray-300 hover:border-[#0F172A] hover:bg-gray-50 transition-all"
              onClick={() => {
                console.log('Downloading receipt...');
                alert('Téléchargement du reçu...');
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le reçu
            </Button>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#FACC15] rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-[#0F172A]" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Prochaines étapes</h3>
                <p className="text-gray-300 text-sm">
                  Utilisez vos crédits pour booster vos annonces et augmenter leur visibilité. La publication d'annonces est gratuite !
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => navigate('/dashboard/vendor')}
                className="bg-white text-[#0F172A] hover:bg-gray-100 font-semibold"
              >
                <Home className="w-4 h-4 mr-2" />
                Retour au dashboard
              </Button>
              <Button
                onClick={() => navigate('/publish')}
                className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#FACC15] text-[#0F172A] font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Publier une annonce
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600 text-sm">
            Un email de confirmation a été envoyé à votre adresse.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Pour toute question, contactez notre service client : support@annonceauto.ci
          </p>
        </motion.div>
      </div>
    </div>
  );
}