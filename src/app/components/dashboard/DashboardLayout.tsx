import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Car,
  TrendingUp,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Shield,
  Heart,
  MessageCircle,
  BarChart3,
  Users,
  FileCheck,
  DollarSign,
  Zap,
  Wallet,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'vendor' | 'admin';
}

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const vendorMenuItems = [
    { icon: LayoutDashboard, label: 'Vue d\'ensemble', path: '/dashboard/vendeur' },
    { icon: Car, label: 'Mes annonces', path: '/dashboard/vendeur/annonces' },
    { icon: Heart, label: 'Mes favoris', path: '/dashboard/vendeur/favoris' },
    { icon: MessageCircle, label: 'Messages', path: '/dashboard/vendeur/messages' },
    { icon: TrendingUp, label: 'Booster', path: '/dashboard/vendeur/booster' },
    { icon: CreditCard, label: 'Acheter des crédits', path: '/dashboard/vendeur/recharge' },
    { icon: BarChart3, label: 'Statistiques', path: '/dashboard/vendeur/stats' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/vendeur/settings' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Vue d\'ensemble', path: '/dashboard/admin' },
    { icon: FileCheck, label: 'Modération', path: '/dashboard/admin/moderation' },
    { icon: Car, label: 'Gestion Annonces', path: '/dashboard/admin/listings' },
    { icon: MessageCircle, label: 'Messages', path: '/dashboard/admin/messages' },
    { icon: Users, label: 'Utilisateurs', path: '/dashboard/admin/users' },
    { icon: Wallet, label: 'Crédits', path: '/dashboard/admin/credits' },
    { icon: DollarSign, label: 'Paiements', path: '/dashboard/admin/payments' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/admin/analytics' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/admin/settings' },
  ];

  const menuItems = userType === 'vendor' ? vendorMenuItems : adminMenuItems;

  const handleLogout = () => {
    // Logout logic here
    signOut();
    navigate('/connexion');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left: Logo + Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-[#0F172A]" />
              </div>
              <span className="font-bold text-[#0F172A] hidden sm:block">annonceauto.ci</span>
            </Link>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              {/* Avatar avec photo de profil si disponible */}
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Avatar'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#FACC15]"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-full flex items-center justify-center">
                  {userType === 'admin' ? (
                    <Shield className="w-4 h-4 text-[#0F172A]" />
                  ) : (
                    <User className="w-4 h-4 text-[#0F172A]" />
                  )}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {userType === 'admin' ? 'Super Admin' : profile?.full_name || profile?.email}
                </p>
                <p className="text-xs text-gray-500">
                  {userType === 'admin' ? 'Administrateur' : 'Vendeur Pro'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group mt-8"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-semibold">Déconnexion</span>
          </button>
        </nav>

        {/* Credits Display (for vendors) */}
        {userType === 'vendor' && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4" />
                <span className="text-sm opacity-80">Mes crédits</span>
              </div>
              <div className="text-2xl font-bold">{profile?.credits || 0} FCFA</div>
              <Link
                to="/dashboard/vendeur/recharge"
                className="text-xs text-[#FACC15] hover:text-[#FBBF24] mt-2 inline-block"
              >
                Recharger →
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}