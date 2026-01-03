import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: 'vendor' | 'admin';
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#0F172A]">Vérification...</p>
        </motion.div>
      </div>
    );
  }

  // Rediriger vers la connexion si pas connecté (en sauvegardant l'URL d'origine)
  if (!user || !profile) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/connexion" state={{ from }} replace />;
  }

  // Vérifier le type d'utilisateur si requis
  if (requiredUserType && profile.user_type !== requiredUserType) {
    // Rediriger vers le bon dashboard
    const redirectPath = profile.user_type === 'vendor' 
      ? '/dashboard/vendeur' 
      : '/dashboard/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
