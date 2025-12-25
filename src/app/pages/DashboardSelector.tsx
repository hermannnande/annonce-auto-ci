import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  User,
  Shield,
  TrendingUp,
  Zap,
  BarChart3,
  FileCheck,
  ArrowRight,
  Car
} from 'lucide-react';

export function DashboardSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6] flex items-center justify-center py-12 px-4 relative overflow-hidden">
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

      <div className="max-w-5xl w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Car className="w-6 h-6 text-[#0F172A]" />
            </div>
            <span className="text-2xl font-bold text-[#0F172A]">annonceauto.ci</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 font-[var(--font-poppins)]">
            Choisissez votre espace
          </h1>
          <p className="text-lg text-gray-600">
            Accédez à votre tableau de bord pour gérer vos activités
          </p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vendor Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8 }}
          >
            <Card className="p-8 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <User className="w-10 h-10 text-[#0F172A]" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-[#0F172A] mb-3">
                  Espace Vendeur
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Gérez vos annonces, boostez votre visibilité et suivez vos performances
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    </div>
                    <span>Publier et gérer vos annonces</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3 h-3 text-purple-600" />
                    </div>
                    <span>Booster vos véhicules</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>Statistiques détaillées</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3 h-3 text-yellow-600" />
                    </div>
                    <span>Recharge Mobile Money</span>
                  </li>
                </ul>

                {/* CTA */}
                <Link to="/dashboard/vendeur">
                  <Button className="w-full h-14 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg group">
                    Accéder au dashboard vendeur
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Admin Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -8 }}
          >
            <Card className="p-8 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Shield className="w-10 h-10 text-[#FACC15]" />
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-3">
                  <Shield className="w-3 h-3" />
                  ACCÈS RESTREINT
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-[#0F172A] mb-3">
                  Espace Admin
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Modérez les annonces, gérez les utilisateurs et suivez la plateforme
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-3 h-3 text-green-600" />
                    </div>
                    <span>Modération des annonces</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-purple-600" />
                    </div>
                    <span>Gestion des vendeurs</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>Analytics et revenus</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3 h-3 text-yellow-600" />
                    </div>
                    <span>Gestion des crédits</span>
                  </li>
                </ul>

                {/* CTA */}
                <Link to="/dashboard/admin">
                  <Button className="w-full h-14 bg-gradient-to-r from-[#0F172A] to-[#1e293b] hover:from-[#1e293b] hover:to-[#0F172A] text-white shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg group">
                    Accéder au dashboard admin
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-2">
                  Mode Démo - Accès libre
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Les deux dashboards sont accessibles en mode démo pour explorer toutes les fonctionnalités. 
                  Dans un environnement de production, l'accès admin serait protégé par authentification.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0F172A] transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
