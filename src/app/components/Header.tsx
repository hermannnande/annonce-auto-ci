import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Car, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { UserMenu } from './UserMenu';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Acheter une voiture', path: '/annonces' },
    { label: 'Déposer une annonce', path: '/publier' },
  ];

  // Ajouter "Mon Espace" seulement si l'utilisateur est connecté
  if (user) {
    navItems.push({ label: 'Mon Espace', path: '/dashboard' });
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0F172A]/95 backdrop-blur-xl shadow-2xl shadow-black/20'
          : 'bg-[#0F172A]'
      }`}
    >
      {/* Top Banner - Premium Badge */}
      <div className="bg-gradient-to-r from-[#FACC15] via-[#FBBF24] to-[#FACC15] text-[#0F172A] text-center py-2 text-sm font-medium">
        <motion.div
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>🎉 Publication 100% GRATUITE !</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo with Animation */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#FACC15] rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
              <Car className="w-10 h-10 text-[#FACC15] relative z-10" />
            </motion.div>
            <div>
              <span className="text-2xl font-[var(--font-poppins)] font-bold bg-gradient-to-r from-white to-[#FACC15] bg-clip-text text-transparent">
                annonceauto.ci
              </span>
              <div className="text-xs text-[#FACC15] font-medium">Votre auto en un clic</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative text-white hover:text-[#FACC15] transition-colors font-medium group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* User Menu or Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user && <NotificationsDropdown />}
            <UserMenu />
          </div>

          {/* Mobile: User Menu + Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {user && <NotificationsDropdown />}
            {user && <UserMenu />}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-[#FACC15] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-6 border-t border-white/10">
                <nav className="flex flex-col gap-4">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className="block py-3 px-4 text-white hover:text-[#FACC15] hover:bg-white/5 rounded-lg transition-all font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Afficher Connexion/Inscription seulement si NON connecté */}
                  {!user && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navItems.length * 0.1 }}
                    >
                      <Link
                        to="/connexion"
                        className="block py-3 px-4 text-white hover:text-[#FACC15] hover:bg-white/5 rounded-lg transition-all font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Connexion / Inscription
                      </Link>
                    </motion.div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.1 }}
                  >
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] hover:from-[#FBBF24] hover:to-[#FACC15] font-bold shadow-lg gap-2"
                    >
                      <Link to="/publier" onClick={() => setMobileMenuOpen(false)}>
                        <Sparkles className="w-4 h-4" />
                        Publier mon véhicule
                      </Link>
                    </Button>
                  </motion.div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}