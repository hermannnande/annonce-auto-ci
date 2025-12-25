import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';
import { sanitizeRedirectUrl, cleanUrlAfterOAuth } from '../lib/security';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log('🔄 Traitement du callback OAuth...');
      
      // Attendre un peu pour que Supabase traite la session
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Récupérer l'utilisateur après OAuth
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        console.error('❌ Pas d\'utilisateur après OAuth');
        toast.error('Erreur lors de la connexion');
        navigate('/connexion');
        return;
      }

      console.log('✅ Connexion OAuth réussie:', currentUser.email);

      // Récupérer ou créer le profil
      let userProfile = await authService.getProfile(currentUser.id);

      // Si pas de profil (première connexion OAuth), le créer
      if (!userProfile) {
        console.log('📝 Création du profil pour nouvel utilisateur OAuth');
        
        const { error: profileError } = await authService.updateProfile(currentUser.id, {
          full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Utilisateur',
          email: currentUser.email!,
          phone: currentUser.user_metadata?.phone || '+225 00 00 00 00 00',
          user_type: 'vendor',
          credits: 100,
        });

        if (profileError) {
          console.error('❌ Erreur création profil:', profileError);
        }

        // Attendre un peu puis récupérer le profil créé
        await new Promise(resolve => setTimeout(resolve, 500));
        userProfile = await authService.getProfile(currentUser.id);
      }

      if (!userProfile) {
        console.error('❌ Impossible de créer/récupérer le profil');
        toast.error('Erreur lors de la création du profil');
        navigate('/connexion');
        return;
      }

      console.log('✅ Profil récupéré:', userProfile);

      // 🔒 Nettoyer l'URL pour enlever les tokens sensibles
      cleanUrlAfterOAuth();

      // Vérifier s'il y a une page d'origine enregistrée
      const returnTo = sessionStorage.getItem('auth_return_to');
      console.log('📍 Page de retour:', returnTo);

      // Nettoyer le sessionStorage
      if (returnTo) {
        sessionStorage.removeItem('auth_return_to');
      }

      // 🔒 Valider l'URL de redirection pour éviter les open redirects
      const safeReturnTo = sanitizeRedirectUrl(returnTo);

      // Message de bienvenue
      toast.success(`Bienvenue ${userProfile.full_name} !`);
      
      // Redirection
      if (safeReturnTo) {
        // Si une page de retour sûre existe, y rediriger
        console.log('🔙 Redirection sécurisée vers:', safeReturnTo);
        navigate(safeReturnTo, { replace: true });
      } else if (userProfile.user_type === 'admin') {
        // Sinon, redirection selon le type d'utilisateur
        navigate('/dashboard/admin', { replace: true });
      } else {
        navigate('/dashboard/vendeur', { replace: true });
      }

    } catch (error) {
      console.error('❌ Erreur callback OAuth:', error);
      toast.error('Erreur lors de la connexion');
      navigate('/connexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A]">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-[#FACC15] mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-3">
          Connexion en cours...
        </h2>
        <p className="text-gray-400">
          Veuillez patienter pendant que nous finalisons votre connexion.
        </p>
      </div>
    </div>
  );
}





