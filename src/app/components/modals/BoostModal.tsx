import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Star, Crown, CheckCircle, Wallet, ArrowRight, ArrowLeft, Loader2, BadgeDollarSign } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { creditsService } from '../../services/credits.service';
import { listingsService } from '../../services/listings.service';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import type { Listing } from '../../lib/supabase';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onBoostSuccess?: () => void;
}

// Plans de boost (identiques à VendorBooster)
const boostPlans = [
  {
    id: '7days',
    name: 'Boost 7 jours',
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    credits: 30,
    durationDays: 7,
    estimatedViews: '10× plus de vues',
    priceFCFA: 3000,
  },
  {
    id: '14days',
    name: 'Boost 14 jours',
    icon: Star,
    color: 'from-purple-500 to-purple-600',
    credits: 50,
    durationDays: 14,
    estimatedViews: '20× plus de vues',
    popular: true,
    priceFCFA: 5000,
  },
  {
    id: '21days',
    name: 'Boost 21 jours',
    icon: Crown,
    color: 'from-yellow-500 to-yellow-600',
    credits: 60,
    durationDays: 21,
    estimatedViews: '30× plus de vues',
    priceFCFA: 6000,
  }
];

type Step = 'select-plan' | 'confirm' | 'insufficient-credits';

export function BoostModal({ isOpen, onClose, listing, onBoostSuccess }: BoostModalProps) {
  const { user, profile, fetchUserProfile } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('select-plan');
  const [userCredits, setUserCredits] = useState(0);
  const [boosting, setBoosting] = useState(false);

  const selectedPlan = boostPlans.find(p => p.id === selectedPlanId);

  useEffect(() => {
    if (isOpen && user) {
      loadCredits();
    }
  }, [isOpen, user]);

  const loadCredits = async () => {
    if (!user) return;
    try {
      const balance = await creditsService.getUserCredits(user.id);
      setUserCredits(balance);
    } catch (error) {
      console.error('Erreur chargement crédits:', error);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = boostPlans.find(p => p.id === planId);
    
    if (!plan) return;

    // Vérifier si l'utilisateur a assez de crédits
    if (userCredits < plan.credits) {
      setCurrentStep('insufficient-credits');
    } else {
      setCurrentStep('confirm');
    }
  };

  const handleBoost = async () => {
    if (!selectedPlan || !user) return;

    setBoosting(true);
    toast.loading('Application du boost en cours...', { id: 'apply-boost' });

    try {
      // 1. Dépenser les crédits
      const { success, error: spendError } = await creditsService.spendCredits(
        user.id,
        selectedPlan.credits,
        `Boost ${selectedPlan.name} pour l'annonce "${listing.title}"`
      );

      if (!success || spendError) {
        throw spendError || new Error('Échec de la dépense des crédits');
      }

      // 2. Appliquer le boost à l'annonce
      const { error: boostError } = await listingsService.boostListing(
        listing.id,
        user.id,
        selectedPlan.durationDays,
        selectedPlan.credits
      );

      if (boostError) {
        // Rembourser les crédits en cas d'erreur
        await creditsService.refundCredits(
          user.id,
          selectedPlan.credits,
          'Remboursement suite à erreur boost'
        );
        throw boostError;
      }

      toast.success(
        `🎉 Boost appliqué avec succès ! Votre annonce est maintenant en position privilégiée pour ${selectedPlan.durationDays} jours.`,
        { duration: 5000, id: 'apply-boost' }
      );

      // Rafraîchir le profil et fermer le modal
      if (user) {
        await fetchUserProfile(user.id);
      }
      
      onBoostSuccess?.();
      onClose();

    } catch (error: any) {
      console.error('Erreur boost:', error);
      toast.error(error.message || 'Erreur lors de l\'application du boost', { id: 'apply-boost' });
    } finally {
      setBoosting(false);
    }
  };

  const handleRecharge = () => {
    // Rediriger vers la page de recharge
    window.location.href = '/dashboard/vendeur/recharge';
  };

  const handleReset = () => {
    setCurrentStep('select-plan');
    setSelectedPlanId(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* DESKTOP VERSION - Full featured modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl z-[60]"
          >
            <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
              {/* Desktop Header */}
              <div className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#0F172A] mb-1">
                      🚀 Booster cette annonce
                    </h2>
                    <p className="text-sm text-[#0F172A]/80">
                      {listing.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                      <Wallet className="w-5 h-5 text-[#0F172A]" />
                      <span className="text-base font-semibold text-[#0F172A]">
                        {userCredits.toLocaleString()} crédits
                      </span>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-[#0F172A]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {currentStep === 'select-plan' && (
                    <motion.div
                      key="desktop-select"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <h3 className="text-lg font-bold text-[#0F172A] mb-6">
                        Choisissez votre formule de boost
                      </h3>

                      <div className="grid grid-cols-3 gap-6">
                        {boostPlans.map((plan) => (
                          <Card
                            key={plan.id}
                            onClick={() => handleSelectPlan(plan.id)}
                            className={cn(
                              "p-6 border-2 cursor-pointer transition-all hover:shadow-xl relative",
                              selectedPlanId === plan.id
                                ? 'border-[#FACC15] shadow-xl bg-[#FACC15]/5 scale-105'
                                : 'border-gray-200'
                            )}
                          >
                            {plan.popular && (
                              <div className="absolute -top-3 -right-3">
                                <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                                  🔥 POPULAIRE
                                </span>
                              </div>
                            )}

                            <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                              <plan.icon className="w-8 h-8 text-white" />
                            </div>

                            <h4 className="text-xl font-bold text-[#0F172A] mb-3">
                              {plan.name}
                            </h4>

                            <div className="mb-4">
                              <span className="text-4xl font-extrabold text-[#0F172A]">
                                {plan.credits}
                              </span>
                              <span className="text-sm text-gray-600 ml-1">crédits</span>
                            </div>

                            <div className="inline-block px-4 py-2 bg-blue-50 rounded-lg mb-4">
                              <p className="text-sm font-bold text-blue-800">
                                {plan.estimatedViews}
                              </p>
                            </div>

                            <div className="space-y-2 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Top Annonces</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Badge spécial</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>{plan.durationDays} jours</span>
                              </div>
                            </div>

                            {selectedPlanId === plan.id && (
                              <div className="absolute top-4 left-4">
                                <div className="w-7 h-7 bg-[#FACC15] rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-[#0F172A]" />
                                </div>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'confirm' && selectedPlan && (
                    <motion.div
                      key="desktop-confirm"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="mb-4"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                      </Button>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-bold text-[#0F172A] mb-4">
                            Plan sélectionné
                          </h3>
                          <Card className={`p-6 bg-gradient-to-br ${selectedPlan.color} text-white`}>
                            <selectedPlan.icon className="w-12 h-12 mb-3" />
                            <h4 className="text-2xl font-bold mb-2">{selectedPlan.name}</h4>
                            <p className="text-3xl font-extrabold">{selectedPlan.credits} crédits</p>
                            <p className="mt-2 text-white/80">{selectedPlan.estimatedViews}</p>
                          </Card>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-[#0F172A] mb-4">
                            Récapitulatif
                          </h3>
                          <Card className="p-6 bg-gradient-to-br from-[#FACC15]/10 to-[#FBBF24]/5 border-2 border-[#FACC15]">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-600">Coût du boost</span>
                                <span className="text-xl font-bold text-[#FACC15]">
                                  {selectedPlan.credits} crédits
                                </span>
                              </div>
                              <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-600">Votre solde</span>
                                <span className="text-lg font-bold text-[#0F172A]">
                                  {userCredits} crédits
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-green-700 font-medium">Nouveau solde</span>
                                <span className="text-xl font-bold text-green-600">
                                  {(userCredits - selectedPlan.credits).toLocaleString()} crédits
                                </span>
                              </div>
                            </div>

                            <Button
                              onClick={handleBoost}
                              disabled={boosting}
                              className="w-full h-14 mt-6 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg font-bold text-lg"
                            >
                              {boosting ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Application en cours...
                                </>
                              ) : (
                                <>
                                  <BadgeDollarSign className="w-6 h-6 mr-2" />
                                  Activer le boost maintenant
                                </>
                              )}
                            </Button>
                          </Card>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'insufficient-credits' && selectedPlan && (
                    <motion.div
                      key="desktop-insufficient"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-12 h-12 text-red-600" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-[#0F172A] mb-3">
                        Crédits insuffisants
                      </h3>
                      
                      <p className="text-base text-gray-600 mb-8">
                        Il vous faut <span className="font-bold text-[#FACC15]">{selectedPlan.credits} crédits</span> pour ce boost,
                        mais vous n'en avez que <span className="font-bold">{userCredits}</span>.
                      </p>

                      <Card className="p-6 bg-blue-50 border-2 border-blue-200 mb-8 max-w-md mx-auto">
                        <p className="text-lg text-blue-800">
                          <span className="font-bold">Crédits manquants: {selectedPlan.credits - userCredits}</span>
                          <br />
                          <span className="text-base">≈ {((selectedPlan.credits - userCredits) * 100).toLocaleString()} FCFA</span>
                        </p>
                      </Card>

                      <div className="flex gap-4 justify-center">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="h-12 px-8"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Retour
                        </Button>
                        <Button
                          onClick={handleRecharge}
                          className="h-12 px-8 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold"
                        >
                          Recharger mon compte
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* MOBILE VERSION - Bottom sheet optimized */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-[70]"
          >
            <Card className="border-0 shadow-2xl bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Handle bar */}
              <div className="flex justify-center py-2 bg-white">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Mobile Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#0F172A]">
                      🚀 Booster
                    </h2>
                    <p className="text-xs text-[#0F172A]/70 truncate">
                      {listing.title}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-[#0F172A]" />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <Wallet className="w-4 h-4 text-[#0F172A]" />
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {userCredits} crédits
                  </span>
                </div>
              </div>

              {/* Mobile Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  {currentStep === 'select-plan' && (
                    <motion.div
                      key="mobile-select"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <div className="space-y-3">
                        {boostPlans.map((plan) => (
                          <Card
                            key={plan.id}
                            onClick={() => handleSelectPlan(plan.id)}
                            className={cn(
                              "p-4 border-2 cursor-pointer transition-all active:scale-98",
                              selectedPlanId === plan.id
                                ? 'border-[#FACC15] bg-[#FACC15]/5 shadow-lg'
                                : 'border-gray-200'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-14 h-14 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center shadow-md`}>
                                <plan.icon className="w-7 h-7 text-white" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-base font-bold text-[#0F172A]">
                                    {plan.name}
                                  </h4>
                                  {plan.popular && (
                                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                                      🔥
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl font-extrabold text-[#0F172A]">
                                    {plan.credits}
                                  </span>
                                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                    {plan.estimatedViews}
                                  </span>
                                </div>
                              </div>

                              {selectedPlanId === plan.id && (
                                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'confirm' && selectedPlan && (
                    <motion.div
                      key="mobile-confirm"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="mb-4"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                      </Button>

                      <Card className="p-4 bg-gradient-to-br from-[#FACC15]/10 to-[#FBBF24]/5 border-2 border-[#FACC15]">
                        <h3 className="text-base font-bold text-[#0F172A] mb-4">
                          Confirmation
                        </h3>

                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span className="text-sm text-gray-600">Plan</span>
                            <span className="text-sm font-bold text-[#0F172A]">
                              {selectedPlan.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <span className="text-sm text-gray-600">Coût</span>
                            <span className="text-base font-bold text-[#FACC15]">
                              {selectedPlan.credits} crédits
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-sm text-green-700">Nouveau solde</span>
                            <span className="text-base font-bold text-green-600">
                              {(userCredits - selectedPlan.credits).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={handleBoost}
                          disabled={boosting}
                          className="w-full h-12 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] shadow-lg font-bold"
                        >
                          {boosting ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              En cours...
                            </>
                          ) : (
                            <>
                              <BadgeDollarSign className="w-5 h-5 mr-2" />
                              Activer
                            </>
                          )}
                        </Button>
                      </Card>
                    </motion.div>
                  )}

                  {currentStep === 'insufficient-credits' && selectedPlan && (
                    <motion.div
                      key="mobile-insufficient"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-8 h-8 text-red-600" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                        Crédits insuffisants
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        Besoin: <span className="font-bold">{selectedPlan.credits}</span> • 
                        Vous avez: <span className="font-bold">{userCredits}</span>
                      </p>

                      <Card className="p-4 bg-blue-50 mb-6">
                        <p className="text-sm text-blue-800">
                          <span className="font-bold">Manque: {selectedPlan.credits - userCredits} crédits</span>
                          <br />
                          <span className="text-xs">≈ {((selectedPlan.credits - userCredits) * 100).toLocaleString()} F</span>
                        </p>
                      </Card>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="flex-1"
                        >
                          Retour
                        </Button>
                        <Button
                          onClick={handleRecharge}
                          className="flex-1 bg-[#FACC15] text-[#0F172A] font-bold"
                        >
                          Recharger
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
