import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

/**
 * Component qui redirige automatiquement vers le bon dashboard selon le user_type
 */
export function DashboardRedirect() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      // Rediriger selon le user_type
      const dashboardPath = profile.user_type === 'admin'
        ? '/dashboard/admin'
        : '/dashboard/vendeur';
      
      console.log('🔄 Redirection automatique vers:', dashboardPath);
      navigate(dashboardPath, { replace: true });
    }
  }, [profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader2 className="w-16 h-16 animate-spin text-[#FACC15] mx-auto mb-4" />
        <p className="text-[#0F172A] font-semibold text-lg">Redirection vers votre dashboard...</p>
        <p className="text-gray-500 text-sm mt-2">Veuillez patienter</p>
      </motion.div>
    </div>
  );
}




