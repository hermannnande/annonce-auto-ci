import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  LogOut,
  LayoutDashboard,
  CreditCard,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/connexion">
          <button className="px-4 py-2 text-white hover:text-[#FACC15] font-medium transition-colors">
            Connexion
          </button>
        </Link>
        <Link to="/inscription">
          <button className="px-6 py-2 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] rounded-full font-bold shadow-lg hover:shadow-xl transition-all">
            S'inscrire
          </button>
        </Link>
      </div>
    );
  }

  const isAdmin = profile?.user_type === 'admin';
  const dashboardLink = isAdmin 
    ? '/dashboard/admin' 
    : '/dashboard/vendeur';

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      href: dashboardLink,
      show: true,
    },
    {
      icon: User,
      label: 'Mon profil',
      href: isAdmin ? '/dashboard/admin/settings' : '/dashboard/vendeur/settings',
      show: true,
    },
    {
      icon: CreditCard,
      label: 'Mes crédits',
      href: '/dashboard/vendeur/recharge',
      show: !isAdmin,
    },
    {
      icon: Zap,
      label: 'Booster une annonce',
      href: '/dashboard/vendeur/booster',
      show: !isAdmin,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#0F172A] to-[#1e293b] hover:from-[#1e293b] hover:to-[#334155] text-white shadow-lg transition-all"
      >
        {/* Avatar avec photo de profil si disponible */}
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || 'Avatar'}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-[#FACC15]"
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#FACC15] to-[#FBBF24] flex items-center justify-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F172A]" />
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-bold leading-tight">
            {user.full_name || user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-300 capitalize">
            {isAdmin ? 'Administrateur' : 'Vendeur'}
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="p-4 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white">
              <div className="flex items-center gap-3 mb-2">
                {/* Avatar avec photo de profil si disponible */}
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Avatar'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FACC15]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FACC15] to-[#FBBF24] flex items-center justify-center">
                    <User className="w-6 h-6 text-[#0F172A]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">
                    {user.full_name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              {!isAdmin && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                  <span className="text-xs text-gray-300">Crédits</span>
                  <span className="font-bold text-[#FACC15]">
                    {user.credits || 0} 
                  </span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                if (!item.show) return null;
                
                return (
                  <Link
                    key={index}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    <item.icon className="w-5 h-5 text-gray-400 group-hover:text-[#FACC15] transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#0F172A]">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                Déconnexion
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
