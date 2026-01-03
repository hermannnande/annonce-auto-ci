import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Phone, User, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { sanitizeRedirectUrl } from '../lib/security';
import { toast } from 'sonner';

export function CompleteProfilePage() {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si pas connecté, rediriger vers connexion
    if (!user) {
      const from = `${location.pathname}${location.search}${location.hash}`;
      navigate('/connexion', { state: { from } });
      return;
    }

    // Si profil déjà complet, rediriger vers la page d'origine si elle existe
    if (profile && profile.phone && !profile.phone.includes('00 00 00 00')) {
      const returnTo = sessionStorage.getItem('auth_return_to');
      const safeReturnTo = sanitizeRedirectUrl(returnTo);

      if (returnTo) {
        sessionStorage.removeItem('auth_return_to');
      }

      if (safeReturnTo) {
        navigate(safeReturnTo, { replace: true });
        return;
      }

      const dashboardPath = profile.user_type === 'admin' ? '/dashboard/admin' : '/dashboard/vendeur';
      navigate(dashboardPath, { replace: true });
      return;
    }

    // Préremplir avec les données existantes
    if (profile) {
      setFullName(profile.full_name || '');
      // Extraire les chiffres si téléphone existant valide
      if (profile.phone && !profile.phone.includes('00 00 00 00')) {
        const digits = profile.phone.replace(/\D/g, '').slice(3); // Enlever le 225
        setPhone(digits);
      }
    }
  }, [user, profile, navigate]);

  const validatePhone = (phoneDigits: string): boolean => {
    // Doit contenir exactement 10 chiffres
    const cleanDigits = phoneDigits.replace(/\D/g, '');
    return cleanDigits.length === 10;
  };

  const formatPhone = (value: string): string => {
    // Nettoyer - garder uniquement les chiffres
    let cleaned = value.replace(/\D/g, '');
    
    // Limiter à 10 chiffres
    cleaned = cleaned.slice(0, 10);
    
    // Formatter : XX XX XX XX XX
    if (cleaned.length >= 2) {
      const groups = cleaned.match(/(\d{2})(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})/);
      if (groups) {
        let formatted = groups[1];
        if (groups[2]) formatted += ' ' + groups[2];
        if (groups[3]) formatted += ' ' + groups[3];
        if (groups[4]) formatted += ' ' + groups[4];
        if (groups[5]) formatted += ' ' + groups[5];
        return formatted;
      }
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Capturer la page d'origine AVANT les await (pour éviter qu'un re-render ne la perde)
    const returnTo = sessionStorage.getItem('auth_return_to');
    const safeReturnTo = sanitizeRedirectUrl(returnTo);
    
    if (!fullName.trim()) {
      toast.error('Veuillez entrer votre nom complet');
      return;
    }

    if (!phone.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('Veuillez entrer un numéro de téléphone valide (10 chiffres)');
      return;
    }

    setIsLoading(true);

    try {
      // Construire le numéro complet avec le préfixe +225
      const fullPhone = `+225 ${phone.trim()}`;
      
      // Mettre à jour le profil
      const { error } = await authService.updateProfile(user!.id, {
        full_name: fullName.trim(),
        phone: fullPhone,
      });

      if (error) {
        throw error;
      }

      // Rafraîchir le profil
      await refreshProfile();

      toast.success('Profil complété avec succès !');
      
      console.log('📍 Page de retour après complétion:', returnTo);

      // Nettoyer le sessionStorage (une seule fois, après succès)
      if (returnTo) {
        sessionStorage.removeItem('auth_return_to');
      }

      // Redirection vers la page d'origine ou dashboard
      if (safeReturnTo) {
        console.log('🔙 Redirection vers page d\'origine:', safeReturnTo);
        navigate(safeReturnTo, { replace: true });
      } else {
        console.log('🏠 Redirection vers dashboard');
        const dashboardPath = profile?.user_type === 'admin' ? '/dashboard/admin' : '/dashboard/vendeur';
        navigate(dashboardPath, { replace: true });
      }
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6]">
      {/* Animated Background */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-[#FACC15]/10 to-transparent rounded-full blur-3xl"
      />

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 md:p-10 shadow-2xl border-0">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-2xl mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-[#0F172A]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2">
                Complétez votre profil
              </h1>
              <p className="text-gray-600">
                Quelques informations pour finaliser votre inscription
              </p>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Important :</strong> Votre numéro de téléphone sera affiché sur vos annonces pour que les acheteurs puissent vous contacter.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom complet */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-12 h-12 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <div className="flex items-center h-12 border-2 border-gray-200 hover:border-[#FACC15] focus-within:border-[#FACC15] transition-colors rounded-lg">
                    <span className="pl-12 pr-2 text-gray-700 font-semibold select-none">+225</span>
                    <Input
                      type="tel"
                      placeholder="07 12 34 56 78"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                      maxLength={14}
                      className="flex-1 border-0 h-full focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Entrez votre numéro sans le préfixe (10 chiffres)
                </p>
              </div>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg hover:shadow-xl transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Valider mon profil
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Info sécurité */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 text-center">
                🔒 Vos informations sont sécurisées et ne seront utilisées que pour les transactions sur la plateforme.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

