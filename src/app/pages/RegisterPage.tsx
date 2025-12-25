import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';

// Facebook Icon Component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Google Icon Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+225 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();

  // Récupérer l'URL de retour depuis le state de navigation
  const from = (location.state as any)?.from || null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (!acceptTerms) {
      toast.error('Veuillez accepter les conditions d\'utilisation');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp({
        email,
        password,
        fullName,
        phone,
        userType: 'vendor' // Par défaut, les nouveaux utilisateurs sont des vendeurs
      });
      
      if (error) {
        toast.error(error.message || 'Une erreur s\'est produite lors de l\'inscription');
        return;
      }
      
      toast.success('Inscription réussie ! Bienvenue sur annonceauto.ci 🎉');
      
      // Si l'utilisateur vient d'une page spécifique (ex: annonce), y retourner
      if (from) {
        console.log('🔙 Redirection vers:', from);
        navigate(from, { replace: true });
      } else {
        // Sinon, redirection vers le dashboard vendeur par défaut
        navigate('/dashboard/vendeur', { replace: true });
      }
    } catch (error) {
      console.error('Erreur inscription:', error);
      toast.error('Une erreur s\'est produite lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      setError('');
      
      // Enregistrer la page d'origine dans sessionStorage
      if (from) {
        console.log('📍 Enregistrement page de retour:', from);
        sessionStorage.setItem('auth_return_to', from);
      }
      
      const { error } = await authService.signInWithProvider(provider);
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      
      // La redirection sera automatique après la connexion OAuth
    } catch (err: any) {
      console.error('Erreur inscription sociale:', err);
      setError('Erreur lors de l\'inscription');
      setIsLoading(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 10) return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Fort', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6]">
      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-[#FACC15]/10 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-[#0F172A]/10 to-transparent rounded-full blur-3xl"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0F172A] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour à l'accueil</span>
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 md:p-10 shadow-2xl border-0 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#FACC15]/5 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-2xl mb-4 shadow-lg">
                  <UserPlus className="w-8 h-8 text-[#0F172A]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2 font-[var(--font-poppins)]">
                  Créer un compte
                </h1>
                <p className="text-gray-600">
                  Rejoignez annonceauto.ci en quelques secondes
                </p>
              </div>

              {/* Social Register Button - Google only */}
              <div className="mb-6">
                <Button
                  type="button"
                  onClick={() => handleSocialRegister('google')}
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 hover:border-[#4285F4] hover:bg-[#4285F4]/5 transition-all duration-300 group"
                >
                  <GoogleIcon className="w-5 h-5 mr-3" />
                  <span className="font-semibold text-gray-700 group-hover:text-[#4285F4]">
                    Continuer avec Google
                  </span>
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Ou avec votre email</span>
                </div>
              </div>

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Jean Kouassi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-12 h-12 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="votre.email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-12 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="07 00 00 00 00"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Toujours garder +225 au début
                        if (!value.startsWith('+225 ')) {
                          setPhone('+225 ');
                        } else {
                          setPhone(value);
                        }
                      }}
                      required
                      className="pl-12 h-12 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-12 pr-12 h-12 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        <div className={`h-1.5 flex-1 rounded-full ${passwordStrength.strength >= 1 ? passwordStrength.color : 'bg-gray-200'}`} />
                        <div className={`h-1.5 flex-1 rounded-full ${passwordStrength.strength >= 2 ? passwordStrength.color : 'bg-gray-200'}`} />
                        <div className={`h-1.5 flex-1 rounded-full ${passwordStrength.strength >= 3 ? passwordStrength.color : 'bg-gray-200'}`} />
                      </div>
                      <p className={`text-xs ${passwordStrength.strength === 1 ? 'text-red-500' : passwordStrength.strength === 2 ? 'text-yellow-500' : 'text-green-500'}`}>
                        Sécurité : {passwordStrength.label}
                      </p>
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
                      className="pl-12 pr-12 h-12 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {/* Password Match Indicator */}
                  {confirmPassword.length > 0 && (
                    <div className="flex items-center gap-2">
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-green-500">Les mots de passe correspondent</p>
                        </>
                      ) : (
                        <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#FACC15] focus:ring-[#FACC15] cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#0F172A] transition-colors">
                      J'accepte les{' '}
                      <Link to="/conditions" className="text-[#FACC15] hover:text-[#FBBF24] font-semibold">
                        conditions d'utilisation
                      </Link>
                      {' '}et la{' '}
                      <Link to="/confidentialite" className="text-[#FACC15] hover:text-[#FBBF24] font-semibold">
                        politique de confidentialité
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg hover:shadow-xl hover:shadow-[#FACC15]/50 transition-all duration-300 font-bold group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Créer mon compte
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Vous avez déjà un compte ?{' '}
                  <Link 
                    to="/connexion" 
                    state={{ from }} 
                    className="text-[#0F172A] hover:text-[#FACC15] font-bold transition-colors"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span>Connexion sécurisée SSL</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}