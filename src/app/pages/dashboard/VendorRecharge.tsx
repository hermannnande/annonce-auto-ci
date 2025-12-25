import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { motion } from 'motion/react';
import {
  Smartphone,
  Wallet,
  Zap,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Shield,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { creditsService } from '../../services/credits.service';
import { notificationsService } from '../../services/notifications.service';
import { toast } from 'sonner';

const mobileMoneyProviders = [
  {
    id: 'orange_money',
    name: 'Orange Money',
    logo: '🟠',
    color: 'from-orange-500 to-orange-600',
    fee: '1%'
  },
  {
    id: 'mtn_money',
    name: 'MTN Mobile Money',
    logo: '🟡',
    color: 'from-yellow-500 to-yellow-600',
    fee: '1%'
  },
  {
    id: 'moov_money',
    name: 'Moov Money',
    logo: '🔵',
    color: 'from-blue-500 to-blue-600',
    fee: '1%'
  },
  {
    id: 'wave',
    name: 'Wave',
    logo: '💙',
    color: 'from-cyan-500 to-cyan-600',
    fee: '0%'
  },
];

const quickAmounts = [5000, 10000, 25000, 50000, 100000, 250000];

export function VendorRecharge() {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<'orange_money' | 'mtn_money' | 'moov_money' | 'wave' | ''>('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'processing'>('select');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadBalance();
  }, [user]);

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
    if (!selectedProvider) {
      toast.error('Veuillez sélectionner un moyen de paiement');
      return;
    }

    if (!amount || parseInt(amount) < 1000) {
      toast.error('Le montant minimum est de 1,000 CFA');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 8) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!user) return;

    try {
      setProcessing(true);
      setStep('processing');

      // Calculer les crédits (1 crédit = 100 FCFA)
      const credits = Math.floor(parseInt(amount) / 100);
      const amountNum = parseInt(amount);

      // Créer le paiement Mobile Money
      const operator = selectedProvider.replace('_money', '') as 'orange' | 'mtn' | 'moov';
      
      const { transactionId, error } = await creditsService.createMobileMoneyPayment(
        user.id,
        amountNum,
        credits,
        phoneNumber,
        operator
      );

      if (error || !transactionId) {
        throw error || new Error('Erreur lors de la création du paiement');
      }

      // Simuler l'appel Mobile Money (en vrai, c'est fait par le webhook)
      // Pour la démo, on attend 3 secondes puis on confirme automatiquement
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Confirmer le paiement
      const { error: confirmError } = await creditsService.confirmPayment(transactionId);

      if (confirmError) {
        throw confirmError;
      }

      // Envoyer une notification
      await notificationsService.notifyPaymentConfirmed(user.id, amountNum, credits);

      // Succès !
      toast.success(`✅ Paiement confirmé ! ${credits} crédits ajoutés`);
      
      // Recharger le solde
      await loadBalance();
      
      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        navigate('/dashboard/vendeur');
      }, 2000);

    } catch (error: any) {
      console.error('Erreur paiement:', error);
      toast.error(error.message || 'Erreur lors du paiement');
      setStep('select');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('select');
    setAmount('');
    setPhoneNumber('');
    setSelectedProvider('');
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Recharger mon compte
          </h1>
          <p className="text-gray-600">
            Achetez des crédits pour booster vos annonces et augmenter leur visibilité
          </p>
        </div>

        {/* Current Balance */}
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-[#FACC15]/10 to-[#FBBF24]/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-xl flex items-center justify-center">
                <Wallet className="w-7 h-7 text-[#0F172A]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Solde actuel</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {currentBalance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">crédits disponibles</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Valeur équivalente</p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {(currentBalance * 100).toLocaleString()} CFA
              </p>
            </div>
          </div>
        </Card>

        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Payment Method */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">
                1. Choisissez votre moyen de paiement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mobileMoneyProviders.map((provider) => (
                  <motion.div
                    key={provider.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all duration-200 border-2 ${
                        selectedProvider === provider.id
                          ? 'border-[#FACC15] shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProvider(provider.id as any)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${provider.color} rounded-lg flex items-center justify-center text-2xl`}>
                            {provider.logo}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F172A]">{provider.name}</p>
                            <p className="text-sm text-gray-500">Frais: {provider.fee}</p>
                          </div>
                        </div>
                        {selectedProvider === provider.id && (
                          <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Amount Selection */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">
                2. Montant à recharger
              </h3>
              
              {/* Quick Amounts */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {quickAmounts.map((value) => (
                  <Button
                    key={value}
                    onClick={() => handleQuickAmount(value)}
                    variant={amount === value.toString() ? 'default' : 'outline'}
                    className={`h-14 ${
                      amount === value.toString()
                        ? 'bg-[#FACC15] hover:bg-[#FBBF24] text-[#0F172A] border-[#FACC15]'
                        : 'border-gray-300 hover:border-[#FACC15]'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold">{(value / 1000).toFixed(0)}k</div>
                      <div className="text-xs opacity-75">{(value / 100)} cr</div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ou entrez un montant personnalisé
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Montant en FCFA"
                    className="h-14 text-lg pr-16"
                    min="1000"
                    step="1000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    CFA
                  </span>
                </div>
                {amount && (
                  <p className="text-sm text-gray-600">
                    = <span className="font-bold text-[#0F172A]">{credits.toLocaleString()}</span> crédits
                    <span className="text-gray-500"> (1 crédit = 100 FCFA)</span>
                  </p>
                )}
              </div>
            </Card>

            {/* Phone Number */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">
                3. Numéro de téléphone
              </h3>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: 0707123456"
                  className="h-14 text-lg pl-12"
                  maxLength={10}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Le numéro associé à votre compte Mobile Money
              </p>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedProvider || !amount || !phoneNumber}
              className="w-full h-14 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Confirmation */}
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">
                Confirmez votre recharge
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Moyen de paiement</span>
                  <span className="font-bold text-[#0F172A]">
                    {mobileMoneyProviders.find(p => p.id === selectedProvider)?.name}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Numéro de téléphone</span>
                  <span className="font-bold text-[#0F172A]">{phoneNumber}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Montant</span>
                  <span className="font-bold text-[#0F172A]">
                    {parseInt(amount).toLocaleString()} CFA
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-[#FACC15]/10 -mx-6 px-6 rounded-lg">
                  <span className="text-gray-600">Crédits reçus</span>
                  <span className="text-2xl font-bold text-[#0F172A]">
                    {credits.toLocaleString()} crédits
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 h-14"
                  disabled={processing}
                >
                  Modifier
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="flex-1 h-14 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      Confirmer le paiement
                      <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 border-0 shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Loader2 className="w-10 h-10 text-[#0F172A] animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                Traitement en cours...
              </h3>
              <p className="text-gray-600 mb-4">
                Veuillez patienter pendant que nous traitons votre paiement
              </p>
              <p className="text-sm text-gray-500">
                Un code de confirmation va être envoyé sur votre téléphone
              </p>
            </Card>
          </motion.div>
        )}

        {/* Info */}
        <Card className="p-6 border-0 shadow-lg bg-green-50">
          <div className="flex gap-4">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-green-900 mb-2">
                Paiement sécurisé
              </h4>
              <p className="text-sm text-green-700">
                Vos transactions sont sécurisées et cryptées. Vos crédits sont ajoutés 
                instantanément après validation du paiement.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}