import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, Send, CheckCircle, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authService.resetPassword(trimmedEmail);

      if (error) {
        console.error('Erreur reset password:', error);
        toast.error(error.message || 'Impossible d’envoyer l’email de réinitialisation');
        return;
      }

      setIsSubmitted(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (err: any) {
      console.error('Erreur reset password (catch):', err);
      toast.error(err?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setIsSubmitted(false);
    setEmail('');
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
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
        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link 
            to="/connexion" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0F172A] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour à la connexion</span>
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
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div
                    key="form"
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -20 }}
                    variants={fadeInUp}
                  >
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-2xl mb-4 shadow-lg">
                        <Shield className="w-8 h-8 text-[#0F172A]" />
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2 font-[var(--font-poppins)]">
                        Mot de passe oublié ?
                      </h1>
                      <p className="text-gray-600 leading-relaxed">
                        Pas de problème ! Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            disabled={isLoading}
                            className="pl-12 h-12 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Utilisez l'email associé à votre compte annonceauto.ci
                        </p>
                      </div>

                      {/* Submit Button */}
                      <motion.div whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg hover:shadow-xl hover:shadow-[#FACC15]/50 transition-all duration-300 font-bold group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-[#0F172A] border-t-transparent rounded-full mr-2"
                              />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                              Envoyer le lien de réinitialisation
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>

                    {/* Help Text */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-blue-900 mb-1">
                            Vous ne recevez pas l'email ?
                          </h3>
                          <p className="text-xs text-blue-700 leading-relaxed">
                            Vérifiez votre dossier spam ou courrier indésirable. L'email peut prendre quelques minutes à arriver.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial="hidden"
                    animate="visible"
                    variants={scaleIn}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Success State */}
                    <div className="text-center py-4">
                      {/* Success Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg"
                      >
                        <CheckCircle className="w-10 h-10 text-white" />
                      </motion.div>

                      <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-3 font-[var(--font-poppins)]">
                        Email envoyé !
                      </h1>
                      
                      <p className="text-gray-600 mb-2 leading-relaxed">
                        Nous avons envoyé un lien de réinitialisation à :
                      </p>
                      
                      <p className="text-lg font-semibold text-[#0F172A] mb-6 break-all">
                        {email}
                      </p>

                      {/* Instructions Card */}
                      <div className="bg-gradient-to-br from-[#FACC15]/10 to-[#FBBF24]/5 border border-[#FACC15]/20 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-[#FACC15] rounded-full flex items-center justify-center text-xs text-[#0F172A]">
                            1
                          </span>
                          Prochaines étapes :
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-700">
                          <li className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-[#FACC15] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 bg-[#0F172A] rounded-full"></div>
                            </div>
                            <span>Consultez votre boîte de réception (et vos spams)</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-[#FACC15] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 bg-[#0F172A] rounded-full"></div>
                            </div>
                            <span>Cliquez sur le lien de réinitialisation dans l'email</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-[#FACC15] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 bg-[#0F172A] rounded-full"></div>
                            </div>
                            <span>Créez un nouveau mot de passe sécurisé</span>
                          </li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button
                          asChild
                          className="w-full h-12 bg-gradient-to-r from-[#0F172A] to-[#1e293b] hover:from-[#1e293b] hover:to-[#0F172A] text-white shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
                        >
                          <Link to="/connexion">
                            Retour à la connexion
                          </Link>
                        </Button>

                        <Button
                          onClick={handleResend}
                          variant="outline"
                          className="w-full h-12 border-2 border-[#FACC15] text-[#0F172A] hover:bg-[#FACC15]/10 transition-all duration-300 font-semibold"
                        >
                          Renvoyer l'email
                        </Button>
                      </div>

                      {/* Timer Info */}
                      <p className="text-xs text-gray-500 mt-6">
                        Le lien expirera dans 24 heures pour des raisons de sécurité
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Connexion sécurisée SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Données protégées</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
