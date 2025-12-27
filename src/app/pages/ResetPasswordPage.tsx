import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si on a un token de reset valide
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken) {
      setIsValidToken(true);
    } else {
      toast.error('Lien de réinitialisation invalide ou expiré');
      setTimeout(() => navigate('/mot-de-passe-oublie'), 3000);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authService.updatePassword(password);

      if (error) {
        toast.error(error.message || 'Erreur lors de la réinitialisation');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');

      // Rediriger vers la connexion après 2 secondes
      setTimeout(() => {
        navigate('/connexion');
      }, 2000);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 10) return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Fort', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6]">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Lien invalide</h1>
          <p className="text-gray-600 mb-4">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <p className="text-sm text-gray-500">
            Redirection vers "Mot de passe oublié"...
          </p>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 max-w-md w-full text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg mx-auto"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-[#0F172A] mb-3">
              Mot de passe réinitialisé !
            </h1>

            <p className="text-gray-600 mb-6">
              Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
              />
              <span>Redirection en cours...</span>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6]">
      {/* Animated Background */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-[#FACC15]/10 to-transparent rounded-full blur-3xl"
      />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 md:p-10 shadow-2xl border-0">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-2xl mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-[#0F172A]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2 font-[var(--font-poppins)]">
                Nouveau mot de passe
              </h1>
              <p className="text-gray-600">
                Choisissez un nouveau mot de passe sécurisé pour votre compte.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-12 pr-12 h-12 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <p className="text-xs text-gray-600">
                        Force du mot de passe : <span className="font-semibold">{passwordStrength.label}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-12 pr-12 h-12 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg hover:shadow-xl hover:shadow-[#FACC15]/50 transition-all duration-300 font-bold disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-[#0F172A] border-t-transparent rounded-full mr-2"
                      />
                      Réinitialisation en cours...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Réinitialiser le mot de passe
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Security Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Conseil de sécurité :</strong> Utilisez un mot de passe unique contenant des lettres, chiffres et caractères spéciaux.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

