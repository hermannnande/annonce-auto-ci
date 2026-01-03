import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { sanitizeRedirectUrl } from '../lib/security';

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

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer l'URL de retour depuis le state de navigation
  const from = (location.state as any)?.from || null;

  // Enregistrer la page d'origine dès l'arrivée sur /connexion (utile si refresh)
  useEffect(() => {
    const safeFrom = sanitizeRedirectUrl(from);
    if (!safeFrom) return;

    const existing = sessionStorage.getItem('auth_return_to');
    if (!existing) {
      sessionStorage.setItem('auth_return_to', safeFrom);
    }
  }, [from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('📧 Tentative de connexion:', email);
      
      const { error: signInError } = await signIn({ email, password });
      
      if (signInError) {
        setError(signInError.message || 'Erreur de connexion');
        setIsLoading(false);
        return;
      }

      console.log('✅ Connexion réussie, récupération du profil...');
      
      // Récupérer l'utilisateur actuel depuis Supabase
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        setError('Impossible de récupérer l\'utilisateur');
        setIsLoading(false);
        return;
      }
      
      console.log('👤 User ID:', currentUser.id);
      
      // Récupérer le profil DIRECTEMENT depuis authService
      const userProfile = await authService.getProfile(currentUser.id);
      
      console.log('📋 Profil récupéré (données masquées en production)');
      
      if (!userProfile) {
        setError('Impossible de récupérer le profil');
        setIsLoading(false);
        return;
      }
      
      // Redirection selon le type d'utilisateur
      const userType = userProfile.user_type;
      console.log('🎯 Type utilisateur:', userType);
      
      // 🔒 Valider l'URL de redirection
      const safeFrom = sanitizeRedirectUrl(from);
      const storedReturnTo = sessionStorage.getItem('auth_return_to');
      const safeStoredReturnTo = sanitizeRedirectUrl(storedReturnTo);
      const finalReturnTo = safeFrom || safeStoredReturnTo;

      // Nettoyer le sessionStorage si on l'utilise (évite des redirections "fantômes")
      if (finalReturnTo && storedReturnTo) {
        sessionStorage.removeItem('auth_return_to');
      }
      
      // Si l'utilisateur vient d'une page spécifique (ex: annonce), y retourner
      if (finalReturnTo) {
        console.log('🔙 Redirection sécurisée vers:', finalReturnTo);
        navigate(finalReturnTo, { replace: true });
      } else {
        // Sinon, redirection vers le dashboard approprié
        if (userType === 'admin') {
          console.log('🔑 Redirection vers ADMIN dashboard');
          navigate('/dashboard/admin', { replace: true });
        } else {
          console.log('👤 Redirection vers VENDEUR dashboard');
          navigate('/dashboard/vendeur', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('❌ Erreur connexion:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      setError('');
      
      // 🔒 Valider et enregistrer la page d'origine dans sessionStorage
      const safeFrom = sanitizeRedirectUrl(from);
      if (safeFrom) {
        console.log('📍 Enregistrement page de retour sécurisée:', safeFrom);
        sessionStorage.setItem('auth_return_to', safeFrom);
      }
      
      const { error } = await authService.signInWithProvider(provider);
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      
      // La redirection sera automatique après la connexion OAuth
    } catch (err: any) {
      console.error('Erreur connexion sociale:', err);
      setError('Erreur lors de la connexion');
      setIsLoading(false);
    }
  };

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
                  <LogIn className="w-8 h-8 text-[#0F172A]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2 font-[var(--font-poppins)]">
                  Connexion
                </h1>
                <p className="text-gray-600">
                  Bienvenue ! Connectez-vous à votre compte
                </p>
              </div>

              {/* Social Login Button - Google only */}
              <div className="mb-6">
                <Button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
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

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}
                
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
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#FACC15] focus:ring-[#FACC15] cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#0F172A] transition-colors">
                      Se souvenir de moi
                    </span>
                  </label>
                  <Link 
                    to="/mot-de-passe-oublie" 
                    className="text-sm text-[#FACC15] hover:text-[#FBBF24] font-semibold transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
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
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        Se connecter
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link 
                    to="/inscription" 
                    state={{ from }} 
                    className="text-[#0F172A] hover:text-[#FACC15] font-bold transition-colors inline-flex items-center gap-1 group"
                  >
                    Créer un compte
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
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
