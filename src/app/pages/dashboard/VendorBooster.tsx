import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Star,
  Crown,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronRight,
  Wallet,
  Clock,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listingsService } from '../../services/listings.service';
import { creditsService } from '../../services/credits.service';
import { toast } from 'sonner';
import type { Listing } from '../../lib/supabase';

// Plans de boost SIMPLIFIÉS avec tarifs clairs
const boostPlans = [
  {
    id: '7days',
    name: '7 jours',
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    credits: 30,
    fcfa: 3000,
    durationDays: 7,
    badge: '⚡ BOOST',
    boost: '10× plus de vues',
    features: ['Top Annonces', 'Badge spécial', 'Support prioritaire']
  },
  {
    id: '14days',
    name: '14 jours',
    icon: Star,
    color: 'from-purple-500 to-purple-600',
    credits: 50,
    fcfa: 5000,
    durationDays: 14,
    badge: '⭐ PREMIUM',
    boost: '20× plus de vues',
    popular: true,
    features: ['Top Annonces', 'Réseaux sociaux', 'Analytics']
  },
  {
    id: '21days',
    name: '21 jours',
    icon: Crown,
    color: 'from-yellow-500 to-yellow-600',
    credits: 60,
    fcfa: 6000,
    durationDays: 21,
    badge: '👑 VIP',
    boost: '30× plus de vues',
    features: ['Top Annonces', 'Support VIP 24/7', 'Newsletter']
  }
];

export function VendorBooster() {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1); // Étapes : 1=Choix plan, 2=Choix annonce, 3=Confirmation
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [boosting, setBoosting] = useState(false);
  const [showListingSheet, setShowListingSheet] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const [listings, credits] = await Promise.all([
        listingsService.getUserListings(user.id),
        creditsService.getUserCredits(user.id)
      ]);
      setUserListings(listings);
      setUserCredits(credits);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep(2);
  };

  const handleListingSelect = (listingId: string) => {
    setSelectedListing(listingId);
    setShowListingSheet(false);
    setStep(3);
  };

  const handleBoost = async () => {
    if (!selectedPlan || !selectedListing) return;

    const plan = boostPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    if (userCredits < plan.credits) {
      toast.error(
        `Crédits insuffisants. Il vous faut ${plan.credits} crédits.`,
        {
          duration: 5000,
          action: {
            label: 'Recharger',
            onClick: () => window.location.href = '/dashboard/vendeur/recharge'
          }
        }
      );
      return;
    }

    try {
      setBoosting(true);

      const { error: spendError } = await creditsService.spendCredits(
        user!.id,
        plan.credits,
        `Boost ${plan.name}`
      );

      if (spendError) throw spendError;

      const { error: boostError } = await listingsService.boostListing(
        selectedListing,
        user!.id,
        plan.durationDays,
        plan.credits
      );

      if (boostError) {
        await creditsService.refundCredits(user!.id, plan.credits, 'Remboursement boost');
        throw boostError;
      }

      toast.success(`🎉 Boost activé pour ${plan.name} !`, { duration: 5000 });
      
      await loadData();
      setSelectedPlan('');
      setSelectedListing(null);
      setStep(1);

    } catch (error) {
      console.error('Erreur boost:', error);
      toast.error('Erreur lors du boost');
    } finally {
      setBoosting(false);
    }
  };

  const selectedPlanData = boostPlans.find(p => p.id === selectedPlan);
  const selectedListingData = userListings.find(l => l.id === selectedListing);
  const availableListings = userListings.filter(l => !l.is_boosted);

  if (loading) {
    return (
      <DashboardLayout userType="vendor">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="vendor">
      <div className="max-w-4xl mx-auto pb-24 md:pb-6">
        {/* Header compact avec solde */}
        <div className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-1">
                Booster une annonce
              </h1>
              <p className="text-[#0F172A]/80 text-sm">
                Vendez 3x plus rapidement
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Wallet className="w-5 h-5 text-[#0F172A]" />
                <span className="text-sm text-[#0F172A]/80">Solde</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-[#0F172A]">
                {userCredits}
              </p>
              <Button
                size="sm"
                onClick={() => window.location.href = '/dashboard/vendeur/recharge'}
                className="mt-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs h-7"
              >
                Recharger
              </Button>
            </div>
          </div>
        </div>

        {/* Indicateur d'étapes mobile-friendly */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all ${
                  step >= num
                    ? 'bg-[#FACC15] text-[#0F172A]'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {num}
              </div>
              {num < 3 && (
                <ChevronRight
                  className={`w-4 h-4 md:w-5 md:h-5 mx-1 ${
                    step > num ? 'text-[#FACC15]' : 'text-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ÉTAPE 1 : Choix du plan */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-[#0F172A] mb-4 text-center">
                Choisissez votre durée
              </h2>

              {boostPlans.map((plan) => (
                <Card
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`p-4 md:p-6 cursor-pointer border-2 transition-all hover:shadow-lg ${
                    plan.popular ? 'border-[#FACC15] shadow-md' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <plan.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg md:text-xl font-bold text-[#0F172A]">
                            {plan.name}
                          </h3>
                          {plan.popular && (
                            <span className="px-2 py-0.5 bg-[#FACC15] text-[#0F172A] text-xs font-bold rounded">
                              POPULAIRE
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {plan.boost}
                          </span>
                          <span>•</span>
                          <span>{plan.badge}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl md:text-3xl font-bold text-[#0F172A]">
                        {plan.credits}
                      </p>
                      <p className="text-xs text-gray-500">crédits</p>
                      <p className="text-xs text-gray-400 mt-1">
                        ({plan.fcfa.toLocaleString()} F)
                      </p>
                    </div>
                  </div>

                  {/* Features en liste compacte */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {plan.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-50 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* ÉTAPE 2 : Choix de l'annonce */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-gray-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Choisissez l'annonce
                </h2>
                <div className="w-20" /> {/* Spacer for centering */}
              </div>

              {/* Récap du plan sélectionné */}
              {selectedPlanData && (
                <Card className="p-4 bg-gradient-to-r from-[#FACC15]/10 to-[#FBBF24]/10 border-[#FACC15]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <selectedPlanData.icon className="w-8 h-8 text-[#FACC15]" />
                      <div>
                        <p className="font-bold text-[#0F172A]">{selectedPlanData.name}</p>
                        <p className="text-sm text-gray-600">{selectedPlanData.boost}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-[#0F172A]">
                      {selectedPlanData.credits} crédits
                    </p>
                  </div>
                </Card>
              )}

              {/* Liste des annonces */}
              {availableListings.length === 0 ? (
                <Card className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Aucune annonce disponible</p>
                  <Button
                    onClick={() => window.location.href = '/publier'}
                    className="bg-[#FACC15] hover:bg-[#FBBF24] text-[#0F172A]"
                  >
                    Publier une annonce
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {availableListings.slice(0, 6).map((listing) => (
                    <Card
                      key={listing.id}
                      onClick={() => handleListingSelect(listing.id)}
                      className="p-3 cursor-pointer border-2 border-gray-200 hover:border-[#FACC15] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200'}
                          alt={listing.title}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#0F172A] truncate">
                            {listing.title}
                          </h4>
                          <p className="text-lg font-bold text-[#FACC15]">
                            {listing.price.toLocaleString()} F
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ÉTAPE 3 : Confirmation */}
          {step === 3 && selectedPlanData && selectedListingData && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="text-gray-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Confirmation
                </h2>
                <div className="w-20" />
              </div>

              {/* Récapitulatif visuel */}
              <Card className="p-6 bg-gradient-to-br from-[#FACC15]/10 to-[#FBBF24]/10">
                <h3 className="font-bold text-[#0F172A] mb-4 text-center">
                  Récapitulatif de votre boost
                </h3>

                {/* Plan */}
                <div className="mb-4 p-4 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${selectedPlanData.color} rounded-lg flex items-center justify-center`}>
                      <selectedPlanData.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Durée</p>
                      <p className="font-bold text-[#0F172A]">{selectedPlanData.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#0F172A]">
                        {selectedPlanData.credits}
                      </p>
                      <p className="text-xs text-gray-500">crédits</p>
                    </div>
                  </div>
                </div>

                {/* Annonce */}
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Annonce à booster</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedListingData.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200'}
                      alt={selectedListingData.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#0F172A] truncate">
                        {selectedListingData.title}
                      </h4>
                      <p className="text-lg font-bold text-[#FACC15]">
                        {selectedListingData.price.toLocaleString()} F
                      </p>
                    </div>
                  </div>
                </div>

                {/* Avantages */}
                <div className="mt-4 p-4 bg-green-50 rounded-xl">
                  <p className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Avantages inclus
                  </p>
                  <ul className="space-y-1">
                    {selectedPlanData.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-green-700 flex items-center gap-2">
                        <span className="w-1 h-1 bg-green-500 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Vérification crédits */}
              {userCredits < selectedPlanData.credits && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-800 mb-1">
                        Crédits insuffisants
                      </p>
                      <p className="text-sm text-red-700 mb-3">
                        Il vous manque {selectedPlanData.credits - userCredits} crédits
                      </p>
                      <Button
                        size="sm"
                        onClick={() => window.location.href = '/dashboard/vendeur/recharge'}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Recharger maintenant
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton CTA fixe en bas sur mobile */}
        {step === 3 && selectedPlanData && selectedListingData && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl md:relative md:mt-6 md:border-0 md:shadow-none md:bg-transparent md:p-0 z-50">
            <Button
              onClick={handleBoost}
              disabled={boosting || userCredits < selectedPlanData.credits}
              className="w-full h-14 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold text-lg shadow-lg disabled:opacity-50"
            >
              {boosting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Activation...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Activer le boost
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
