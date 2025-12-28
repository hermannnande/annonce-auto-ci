import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Loader2, Home, Receipt } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { payfonteService } from '../services/payfonte.service';
import { useAuth } from '../context/AuthContext';

export function PayfonteCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading');
  const [message, setMessage] = useState('Vérification du paiement en cours...');
  const [paymentData, setPaymentData] = useState<any>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const [lastReference, setLastReference] = useState<string>('');

  useEffect(() => {
    verifyPayment();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const verifyPayment = async () => {
    try {
      // Récupérer les paramètres de l'URL
      const urlStatus = searchParams.get('status');
      const reference = searchParams.get('reference');
      const type = searchParams.get('type'); // credits, boost, etc.

      console.log('📥 Callback Payfonte:', { status: urlStatus, reference, type });
      setLastReference(reference || '');

      if (!reference) {
        setStatus('failed');
        setMessage('Référence de transaction manquante');
        return;
      }

      // Vérifier le statut de la transaction dans la base de données
      // (le webhook Payfonte a déjà mis à jour le statut si le paiement est réussi)
      const { data: transaction, error: dbError } = await supabase
        .from('credits_transactions')
        .select('*')
        .eq('payment_reference', reference)
        .single();

      if (dbError) {
        console.error('❌ Erreur récupération transaction:', dbError);
        // Si Payfonte dit success mais transaction absente, on déclenche le fallback serveur
        if ((urlStatus || '').toLowerCase() === 'success') {
          setStatus('loading');
          setMessage('Paiement confirmé sur Payfonte. Synchronisation en cours...');

          retriesRef.current += 1;
          if (retriesRef.current <= 3) {
            await payfonteService.verifyPayment(reference);
            if (timerRef.current) window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
              verifyPayment();
            }, 2500);
            return;
          }
        }

        setStatus('failed');
        setMessage('Transaction introuvable sur le site. Contactez le support avec la référence Payfonte.');
        return;
      }

      console.log('✅ Transaction trouvée:', transaction);

      // Déterminer le statut selon la DB
      if (transaction.payment_status === 'completed') {
        setStatus('success');
        setMessage('Paiement effectué avec succès ! Vos crédits ont été ajoutés.');
        setPaymentData({
          reference: transaction.payment_reference,
          amount: transaction.amount,
          currency: 'XOF',
          paidAt: transaction.created_at,
          status: 'success'
        });

        // Rafraîchir le profil pour mettre à jour le solde dans le contexte
        if (user) {
          await refreshProfile();
          console.log('✅ Profil rafraîchi avec le nouveau solde');
        }

      } else if (transaction.payment_status === 'failed') {
        setStatus('failed');
        setMessage('Le paiement a échoué');
      } else if (transaction.payment_status === 'pending') {
        // Si Payfonte indique success dans l'URL, on déclenche un fallback serveur pour finaliser
        if ((urlStatus || '').toLowerCase() === 'success') {
          setStatus('loading');
          setMessage('Paiement réussi sur Payfonte. Finalisation en cours (mise à jour de vos crédits)...');

          // Un seul appel verifyPayment côté serveur suffit en général
          const verifyRes = await payfonteService.verifyPayment(reference);
          if (!verifyRes.success) {
            console.warn('⚠️ verifyPayment fallback a échoué:', verifyRes.error?.message);
          }
        } else if ((urlStatus || '').toLowerCase() === 'failed') {
          setStatus('failed');
          setMessage('Le paiement a échoué');
          return;
        } else if ((urlStatus || '').toLowerCase() === 'cancelled') {
          setStatus('cancelled');
          setMessage('Le paiement a été annulé');
          return;
        } else {
          setStatus('loading');
          setMessage('Paiement en attente de confirmation... Le webhook Payfonte va bientôt mettre à jour votre solde.');
        }

        // Retry limité (évite la boucle infinie)
        retriesRef.current += 1;
        if (retriesRef.current <= 8) {
          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            verifyPayment();
          }, 2500);
        } else {
          // Si Payfonte indique success, on n'affiche pas "échec" : on propose un retry manuel
          if ((urlStatus || '').toLowerCase() === 'success') {
            setStatus('loading');
            setMessage('Paiement confirmé sur Payfonte. La synchronisation prend plus de temps que prévu. Clique sur "Réessayer" pour revérifier.');
          } else {
            setStatus('failed');
            setMessage('La confirmation prend trop de temps. Clique sur "Réessayer" (ou attends 30s puis réessaie).');
          }
        }
      } else {
        setStatus('failed');
        setMessage('Statut de paiement inconnu');
      }

    } catch (error: any) {
      console.error('❌ Erreur vérification paiement:', error);
      setStatus('failed');
      setMessage('Erreur lors de la vérification');
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-20 h-20 text-green-500" />;
      case 'failed':
        return <XCircle className="w-20 h-20 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-20 h-20 text-orange-500" />;
      default:
        return <Loader2 className="w-20 h-20 text-[#FACC15] animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Paiement réussi !';
      case 'failed':
        return 'Paiement échoué';
      case 'cancelled':
        return 'Paiement annulé';
      default:
        return 'Vérification en cours...';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'from-green-50 to-green-100';
      case 'failed':
        return 'from-red-50 to-red-100';
      case 'cancelled':
        return 'from-orange-50 to-orange-100';
      default:
        return 'from-gray-50 to-gray-100';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${getBackgroundColor()} p-4`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center shadow-2xl">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            {getIcon()}
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[#0F172A] mb-4">
            {getTitle()}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Payment Details */}
          {paymentData && status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 rounded-lg p-4 mb-6 text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-5 h-5 text-[#FACC15]" />
                <h3 className="font-semibold text-[#0F172A]">Détails de la transaction</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence:</span>
                  <span className="font-mono text-[#0F172A]">{paymentData.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant:</span>
                  <span className="font-bold text-green-600">
                    {paymentData.amount} crédits
                  </span>
                </div>
                {paymentData.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-[#0F172A]">
                      {new Date(paymentData.paidAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {status === 'success' && (
              <Button
                onClick={() => navigate('/dashboard/vendeur')}
                className="w-full bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] hover:from-[#FBBF24] hover:to-[#F59E0B] h-12 font-bold shadow-lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Retour au dashboard
              </Button>
            )}

            {(status === 'failed' || status === 'cancelled') && (
              <>
                <Button
                  onClick={() => navigate('/dashboard/vendeur/recharge')}
                  className="w-full bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] hover:from-[#FBBF24] hover:to-[#F59E0B] h-12 font-bold shadow-lg"
                >
                  Réessayer
                </Button>
                <Button
                  onClick={() => navigate('/dashboard/vendeur')}
                  variant="outline"
                  className="w-full h-12"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Retour au dashboard
                </Button>
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}




