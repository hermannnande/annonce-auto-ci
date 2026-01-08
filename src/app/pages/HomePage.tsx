import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  CheckCircle,
  UserCheck,
  FileText,
  Phone,
  TrendingUp,
  Shield,
  Clock,
  Star,
  Sparkles,
  Award,
  Zap,
  Heart,
  Users,
  ArrowRight
} from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { VehicleCard } from '../components/VehicleCard';
import { listingsService } from '../services/listings.service';
import type { Listing } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function HomePage() {
  const [featuredVehicles, setFeaturedVehicles] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      try {
        // ⚡ Perf: ne charge que ce dont la Home a besoin
        const listings = await listingsService.getAllListings(undefined, 24);
        setFeaturedVehicles(listings.slice(0, 6));
      } catch (error) {
        console.error('Erreur chargement annonces:', error);
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section - Ultra Premium */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1684965747763-9b8fc4f721f3?w=1200')] bg-cover bg-center opacity-20 mix-blend-overlay" />
          
          {/* Animated Geometric Shapes */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-[#FACC15]/20 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-[#FACC15]/20 to-transparent rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center text-white mb-12 max-w-5xl mx-auto"
          >
            {/* Premium Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-[#FACC15]" />
              <span className="text-sm font-medium">Plateforme N°1 en Côte d'Ivoire</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl mb-6 bg-gradient-to-r from-white via-white to-[#FACC15] bg-clip-text text-transparent font-[var(--font-poppins)] font-bold leading-tight"
            >
              Trouvez le véhicule<br />de vos rêves
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 font-light"
            >
              Des milliers d'annonces vérifiées. Achetez et vendez en toute confiance.
            </motion.p>

            {/* Trust Indicators */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#FACC15]" />
                <span className="text-sm">Vendeurs vérifiés</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FACC15]" />
                <span className="text-sm">Paiements sécurisés</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FACC15]" />
                <span className="text-sm">Service premium</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Search Bar with Glass Effect */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SearchBar />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm">Découvrir</span>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white/60 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Premium Cards */}
      <section className="py-20 -mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              { icon: TrendingUp, value: '+1 000', label: 'Annonces actives', color: 'from-purple-500 to-pink-500' },
              { icon: Users, value: '500+', label: 'Vendeurs vérifiés', color: 'from-blue-500 to-cyan-500' },
              { icon: Shield, value: '100%', label: 'Annonces auto', color: 'from-green-500 to-emerald-500' },
              { icon: Zap, value: '24/7', label: 'Support client', color: 'from-orange-500 to-yellow-500' }
            ].map((stat, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="p-6 text-center relative">
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2 font-[var(--font-poppins)]">
                      {stat.value}
                    </div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>

                  {/* Hover Effect Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Vehicles - Premium Grid */}
      <section className="py-20 bg-gradient-to-b from-transparent to-[#F3F4F6]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-full px-6 py-2 mb-4">
              <Star className="w-4 h-4 text-[#FACC15]" />
              <span className="text-sm font-medium text-[#0F172A]">Sélection Premium</span>
            </div>
            <h2 className="text-4xl md:text-6xl text-[#0F172A] mb-4 font-[var(--font-poppins)] font-bold">
              Véhicules en vedette
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Découvrez notre sélection exclusive de véhicules vérifiés et certifiés
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          >
            {featuredVehicles.map((vehicle, index) => (
              <motion.div key={vehicle.id} variants={scaleIn}>
                <VehicleCard vehicle={vehicle} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] hover:from-[#1e293b] hover:to-[#0F172A] text-white shadow-2xl hover:shadow-[#FACC15]/50 transition-all duration-300 group"
            >
              <Link to="/annonces" className="gap-2">
                Voir toutes les annonces
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Advertiser Banner - Premium CTA */}
      <section className="py-20 relative overflow-hidden">
        {/* Background with Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A]">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#FACC15] rounded-full px-6 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#0F172A]" />
              <span className="text-sm font-bold text-[#0F172A]">Vendeurs Professionnels</span>
            </div>
            <h2 className="text-4xl md:text-6xl text-white mb-6 font-[var(--font-poppins)] font-bold">
              Développez votre activité
            </h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto mb-12">
              Rejoignez des centaines de vendeurs qui font confiance à annonceauto.ci pour vendre leurs véhicules rapidement
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {[
              {
                icon: UserCheck,
                title: 'Créez votre compte',
                description: 'Inscription rapide et gratuite en quelques secondes',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: FileText,
                title: 'Publiez vos annonces',
                description: 'Ajoutez photos et détails de vos véhicules facilement',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Phone,
                title: 'Recevez des appels',
                description: 'Les acheteurs intéressés vous contactent directement',
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((step, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card className="p-8 text-center group hover:shadow-2xl hover:shadow-[#FACC15]/20 transition-all duration-500 border-white/10 bg-white/5 backdrop-blur-lg relative overflow-hidden">
                  {/* Gradient Orb */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${step.gradient} rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
                  
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl text-white mb-4 font-[var(--font-poppins)] font-bold">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24] shadow-2xl hover:shadow-[#FACC15]/50 transition-all duration-300 hover:scale-105 group"
            >
              <Link to="/publier" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Créer mon compte vendeur
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Modern Timeline */}
      <section className="py-20 bg-[#F3F4F6]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl text-[#0F172A] mb-4 font-[var(--font-poppins)] font-bold">
              Comment ça marche ?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Trouvez votre véhicule en 3 étapes simples
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { step: '01', title: 'Recherchez', description: 'Utilisez nos filtres pour trouver le véhicule qui correspond à vos critères', icon: '🔍' },
              { step: '02', title: 'Comparez', description: 'Consultez les détails, photos et prix de chaque véhicule', icon: '⚖️' },
              { step: '03', title: 'Contactez', description: 'Prenez contact avec le vendeur pour organiser une visite', icon: '📞' }
            ].map((item, index) => (
              <motion.div key={index} variants={scaleIn}>
                <div className="relative">
                  {/* Connecting Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#FACC15] to-transparent -z-10" />
                  )}
                  
                  <Card className="p-8 text-center group hover:shadow-2xl hover:shadow-[#FACC15]/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/0 to-[#FACC15]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative">
                      {/* Step Number */}
                      <div className="text-8xl font-bold text-[#FACC15]/20 absolute -top-4 -left-4 font-[var(--font-poppins)] select-none">
                        {item.step}
                      </div>
                      
                      {/* Icon */}
                      <div className="w-24 h-24 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10 text-5xl">
                        {item.icon}
                      </div>
                      
                      <h3 className="text-2xl text-[#0F172A] mb-4 font-[var(--font-poppins)] font-bold relative z-10">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed relative z-10">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials - Premium Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-full px-6 py-2 mb-4">
              <Heart className="w-4 h-4 text-[#FACC15]" />
              <span className="text-sm font-medium text-[#0F172A]">Témoignages</span>
            </div>
            <h2 className="text-4xl md:text-6xl text-[#0F172A] mb-4 font-[var(--font-poppins)] font-bold">
              Ils nous font confiance
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Découvrez les expériences de nos utilisateurs satisfaits
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                name: 'Kouassi Jean',
                role: 'Vendeur particulier',
                text: "J'ai vendu ma voiture en moins d'une semaine grâce à annonceauto.ci. Interface simple et efficace !",
                avatar: 'KJ',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                name: 'Aya Mensah',
                role: 'Acheteuse',
                text: 'Plateforme professionnelle et sérieuse. J\'ai trouvé le SUV parfait pour ma famille.',
                avatar: 'AM',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                name: 'Auto Premium CI',
                role: 'Professionnel',
                text: 'Notre concession utilise annonceauto.ci depuis 6 mois. Excellent retour sur investissement.',
                avatar: 'AP',
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((testimonial, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card className="p-8 group hover:shadow-2xl hover:shadow-[#FACC15]/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden h-full">
                  {/* Quote Mark */}
                  <div className="absolute top-4 right-4 text-[#FACC15]/10 text-8xl font-serif select-none">
                    "
                  </div>
                  
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#FACC15] text-[#FACC15]" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-8 leading-relaxed relative z-10 italic">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A] font-[var(--font-poppins)]">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
