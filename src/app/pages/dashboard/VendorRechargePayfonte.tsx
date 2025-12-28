import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Shield,
  Loader2,
  Zap,
  Sparkles,
  ArrowLeft,
  Phone,
  History,
  Clock,
  TrendingUp,
  TrendingDown,
  Gift
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { creditsService } from '../../services/credits.service';
import { payfonteService } from '../../services/payfonte.service';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';

// Montants rapides suggérés - SIMPLIFIÉS
const quickAmounts = [
  { value: 5000, credits: 50, label: '5,000 F', popular: false },
  { value: 10000, credits: 100, label: '10,000 F', popular: true },
  { value: 25000, credits: 250, label: '25,000 F', popular: true },
  { value: 50000, credits: 500, label: '50,000 F', popular: false },
];

export function VendorRecharge() {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'processing'>('select');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    loadBalance();
    loadTransactions();
    // Pré-remplir le numéro de téléphone si disponible
    if (profile?.phone) {
      setPhoneNumber(profile.phone);
    }
  }, [user, profile]);

  const loadTransactions = async () => {
    if (!user) return;
    
    setLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from('credits_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erreur chargement transactions:', error);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Exception chargement transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadBalance = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const balance = await creditsService.getUserCredits(user.id);
      setCurrentBalance(balance);
    } catch (error) {
      console.error('Erreur chargement solde:', error);
      toast.error('Erreur lors du chargement du solde');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!amount || parseInt(amount) < 1000) {
      toast.error('Le montant minimum est de 1,000 FCFA');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 8) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!user || !profile) {
      toast.error('Utilisateur non connecté');
      return;
    }

    try {
      setProcessing(true);
      setStep('processing');

      const amountNum = parseInt(amount);
      const credits = Math.floor(amountNum / 100); // 1 crédit = 100 FCFA

      console.log('🚀 Création checkout Payfonte...', { amountNum, credits });

      // Créer le checkout Payfonte
      const result = await payfonteService.createCreditsPurchaseCheckout(
        user.id,
        amountNum,
        credits,
        profile.email || user.email || '',
        profile.full_name || 'Utilisateur',
        phoneNumber
      );

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Erreur lors de la création du paiement');
      }

      console.log('✅ Checkout créé:', result.data);

      // Rediriger vers Payfonte
      toast.success('Redirection vers la page de paiement...');
      
      setTimeout(() => {
        window.location.href = result.data!.shortURL || result.data!.url;
      }, 1000);

    } catch (error: any) {
      console.error('❌ Erreur paiement:', error);
      toast.error(error.message || 'Erreur lors du paiement');
      setStep('select');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('select');
  };

  // Calculer les crédits
  const credits = amount ? Math.floor(parseInt(amount) / 100) : 0;

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
      <div className="max-w-4xl mx-auto p-4 pb-24 md:pb-4">
        {/* Header - Compact Mobile */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-2 flex items-center gap-2">
            💳 Recharger mon compte
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Achetez des crédits en quelques clics
          </p>
        </div>

        {/* Current Balance - Sticky on mobile */}
        <Card className="p-4 mb-6 border-2 border-[#FACC15] bg-gradient-to-br from-[#FACC15]/10 to-[#FBBF24]/5 sticky top-0 z-10 md:static">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#0F172A]" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Solde actuel</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {currentBalance.toLocaleString()} <span className="text-sm font-normal">crédits</span>
                </p>
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-[#FACC15]" />
          </div>
        </Card>

        {/* Steps Indicator - Simplified for mobile */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={cn("px-3 py-1 rounded-full text-sm font-medium", 
            step === 'select' ? "bg-[#FACC15] text-[#0F172A]" : "bg-gray-200 text-gray-600")}>
            ① Montant
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <span className={cn("px-3 py-1 rounded-full text-sm font-medium", 
            step === 'confirm' ? "bg-[#FACC15] text-[#0F172A]" : "bg-gray-200 text-gray-600")}>
            ② Confirmer
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <span className={cn("px-3 py-1 rounded-full text-sm font-medium", 
            step === 'processing' ? "bg-[#FACC15] text-[#0F172A]" : "bg-gray-200 text-gray-600")}>
            ③ Payer
          </span>
        </div>

        {/* Step: Select Amount */}
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Amounts - Grid responsive */}
              <Card className="p-4 md:p-6 border-0 shadow-lg">
                <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#FACC15]" />
                  Montants populaires
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickAmounts.map((item) => (
                    <motion.button
                      key={item.value}
                      onClick={() => handleQuickAmount(item.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all duration-200",
                        amount === item.value.toString()
                          ? 'border-[#FACC15] bg-[#FACC15]/10 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {item.popular && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                          🔥
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#0F172A] mb-1">
                          {item.label}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="w-3 h-3 text-[#FACC15]" />
                          <span className="text-sm text-gray-600 font-semibold">
                            {item.credits} crédits
                          </span>
                        </div>
                      </div>
                      {amount === item.value.toString() && (
                        <CheckCircle className="absolute top-2 left-2 w-5 h-5 text-[#FACC15]" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </Card>

              {/* Custom Amount - Simplified */}
              <Card className="p-4 md:p-6 border-0 shadow-lg">
                <h3 className="text-lg font-bold text-[#0F172A] mb-4">
                  Montant personnalisé
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Montant (minimum 1,000 FCFA)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Ex: 15000"
                        className="h-12 md:h-14 text-lg pr-16"
                        min="1000"
                        step="1000"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                        FCFA
                      </span>
                    </div>
                    {amount && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-gray-600 mt-2 flex items-center gap-1"
                      >
                        <Sparkles className="w-4 h-4 text-[#FACC15]" />
                        Vous recevrez <span className="font-bold text-[#FACC15]">{credits} crédits</span>
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Numéro de téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+225 07 00 00 00 00"
                        className="h-12 md:h-14 text-lg pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Desktop button */}
                  <Button
                    type="submit"
                    disabled={!amount || !phoneNumber}
                    className="hidden md:flex w-full h-14 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] hover:from-[#FBBF24] hover:to-[#F59E0B] text-lg font-bold shadow-lg"
                  >
                    Continuer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </Card>

              {/* Info */}
              <Card className="p-4 border-0 shadow-lg bg-blue-50">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold mb-1">🔒 Paiement 100% sécurisé</p>
                    <p>Orange Money, MTN, Moov, Wave acceptés</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="p-4 md:p-6 border-0 shadow-lg bg-gradient-to-br from-[#FACC15]/10 to-[#FBBF24]/5">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    className="text-gray-500 hover:text-[#0F172A]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Confirmez votre recharge
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600 text-sm">Montant</span>
                    <span className="text-xl font-bold text-[#0F172A]">
                      {parseInt(amount).toLocaleString()} F
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600 text-sm">Crédits reçus</span>
                    <span className="text-lg font-bold text-[#FACC15] flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {credits}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600 text-sm">Téléphone</span>
                    <span className="font-semibold text-[#0F172A] text-sm">{phoneNumber}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-700 text-sm font-medium">Nouveau solde</span>
                    <span className="text-lg font-bold text-green-600">
                      {(currentBalance + credits).toLocaleString()} crédits
                    </span>
                  </div>
                </div>

                {/* Desktop buttons */}
                <div className="hidden md:flex gap-3">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 h-12"
                    disabled={processing}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={processing}
                    className="flex-1 h-12 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] hover:from-[#FBBF24] hover:to-[#F59E0B] font-bold shadow-lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Payer maintenant
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="p-8 md:p-12 border-0 shadow-2xl text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-full flex items-center justify-center"
                >
                  <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-[#0F172A] animate-spin" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-2">
                  Redirection vers Payfonte...
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Vous allez être redirigé vers la page de paiement
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Mobile CTA - Select step */}
        {step === 'select' && amount && phoneNumber && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-2xl z-20"
          >
            <Button
              onClick={handleSubmit}
              className="w-full h-12 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg font-bold text-lg"
            >
              Continuer
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Fixed Mobile CTA - Confirm step */}
        {step === 'confirm' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-2xl z-20"
          >
            <Button
              onClick={handleConfirm}
              disabled={processing}
              className="w-full h-12 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg font-bold text-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payer maintenant
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Historique des transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-4 md:p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <History className="w-5 h-5 text-[#FACC15]" />
                Historique des transactions
              </h3>
              <span className="text-xs text-gray-500">
                {transactions.length} dernières
              </span>
            </div>

            {loadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#FACC15]" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune transaction pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  const isPurchase = tx.type === 'purchase';
                  const isBoost = tx.type === 'boost';
                  const isGift = tx.type === 'gift';
                  const isAdmin = tx.type === 'admin_adjustment';
                  
                  const getIcon = () => {
                    if (isPurchase) return <TrendingUp className="w-4 h-4" />;
                    if (isBoost) return <Zap className="w-4 h-4" />;
                    if (isGift) return <Gift className="w-4 h-4" />;
                    return <TrendingDown className="w-4 h-4" />;
                  };

                  const getStatusBadge = () => {
                    if (tx.payment_status === 'completed') {
                      return (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          ✓ Complété
                        </span>
                      );
                    } else if (tx.payment_status === 'pending') {
                      return (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          ⏳ En attente
                        </span>
                      );
                    } else if (tx.payment_status === 'failed') {
                      return (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          ✗ Échoué
                        </span>
                      );
                    }
                    return null;
                  };

                  const getTypeLabel = () => {
                    if (isPurchase) return 'Recharge';
                    if (isBoost) return 'Boost';
                    if (isGift) return 'Cadeau';
                    if (isAdmin) return 'Ajustement';
                    return tx.type;
                  };

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}>
                          {getIcon()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#0F172A]">
                            {getTypeLabel()}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-bold",
                          isPositive ? "text-green-600" : "text-red-600"
                        )}>
                          {isPositive ? '+' : ''}{tx.amount} crédits
                        </p>
                        {getStatusBadge()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

