import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Phone, User, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';

export function CompleteProfilePage() {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si pas connecté, rediriger vers connexion
    if (!user) {
      navigate('/connexion');
      return;
    }

    // Si profil déjà complet (numéro valide), rediriger vers dashboard
    if (profile && profile.phone && !profile.phone.includes('00 00 00 00')) {
      navigate('/dashboard/vendeur');
      return;
    }

    // Préremplir avec les données existantes
    if (profile) {
      setFullName(profile.full_name || '');
      // Ne pas préremplir le téléphone s'il est par défaut
      if (profile.phone && !profile.phone.includes('00 00 00 00')) {
        setPhone(profile.phone);
      }
    }
  }, [user, profile, navigate]);

  const validatePhone = (phoneNumber: string): boolean => {
    // Format ivoirien : +225 XX XX XX XX XX ou 07/05/01 XX XX XX XX
    const ivorianPhoneRegex = /^(\+225|0)[0-9]{10}$/;
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    return ivorianPhoneRegex.test(cleanPhone);
  };

  const formatPhone = (value: string): string => {
    // Nettoyer
    let cleaned = value.replace(/\D/g, '');
    
    // Si commence par 225, ajouter +
    if (cleaned.startsWith('225')) {
      cleaned = '+' + cleaned;
    }
    
    // Formatter : +225 XX XX XX XX XX ou 0X XX XX XX XX
    if (cleaned.startsWith('+225')) {
      const groups = cleaned.match(/(\+225)(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?/);
      if (groups) {
        return `${groups[1]} ${groups[2]} ${groups[3]} ${groups[4]} ${groups[5]}${groups[6] ? ' ' + groups[6] : ''}`.trim();
      }
    } else if (cleaned.startsWith('0')) {
      const groups = cleaned.match(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?/);
      if (groups) {
        return `${groups[1]} ${groups[2]} ${groups[3]} ${groups[4]}${groups[5] ? ' ' + groups[5] : ''}`.trim();
      }
    }
    
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error('Veuillez entrer votre nom complet');
      return;
    }

    if (!phone.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('Numéro de téléphone invalide. Format attendu : +225 XX XX XX XX XX');
      return;
    }

    setIsLoading(true);

    try {
      // Mettre à jour le profil
      const { error } = await authService.updateProfile(user!.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
      });

      if (error) {
        throw error;
      }

      // Rafraîchir le profil
      await refreshProfile();

      toast.success('Profil complété avec succès !');
      
      // Rediriger vers le dashboard
      navigate('/dashboard/vendeur');
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
                  <Input
                    type="tel"
                    placeholder="+225 07 12 34 56 78"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    className="pl-12 h-12 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Format : +225 XX XX XX XX XX ou 0X XX XX XX XX
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

