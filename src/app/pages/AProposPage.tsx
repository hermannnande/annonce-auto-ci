import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Target, Users, Shield, Zap, Heart, Award } from 'lucide-react';
import { Card } from '../components/ui/card';

export function AProposPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white py-20">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-[#FACC15] hover:underline mb-6">
            <ChevronLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-3 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-full px-6 py-2 mb-6">
              <Heart className="w-5 h-5 text-[#FACC15]" />
              <span className="text-sm font-medium text-[#FACC15]">Notre histoire</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[var(--font-poppins)]">
              À propos d'annonceauto.ci
            </h1>
            <p className="text-xl text-gray-300">
              La plateforme n°1 d'annonces automobiles en Côte d'Ivoire
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Mission */}
          <Card className="p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-[#0F172A]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Notre Mission</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Révolutionner le marché de l'automobile en Côte d'Ivoire en offrant une plateforme moderne, 
                  sécurisée et accessible à tous. Nous croyons que l'achat et la vente de véhicules doivent être 
                  simples, transparents et basés sur la confiance.
                </p>
              </div>
            </div>
          </Card>

          {/* Histoire */}
          <Card className="p-8 md:p-12 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white">
            <h2 className="text-3xl font-bold mb-6">Notre Histoire</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Lancée en 2025, <strong className="text-[#FACC15]">annonceauto.ci</strong> est née d'un constat simple : 
                les Ivoiriens méritent une plateforme moderne et fiable pour acheter et vendre leurs véhicules.
              </p>
              <p>
                Forts de notre expérience dans le digital et notre passion pour l'automobile, nous avons créé 
                une solution qui répond aux besoins réels du marché ivoirien. Aujourd'hui, nous sommes fiers 
                de compter plus de 500 vendeurs actifs et 1000+ annonces de qualité.
              </p>
              <p>
                Notre ambition ? Devenir LA référence incontournable de l'automobile en Côte d'Ivoire et 
                accompagner chaque Ivoirien dans son projet d'achat ou de vente de véhicule.
              </p>
            </div>
          </Card>

          {/* Valeurs */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Shield,
                title: 'Confiance & Sécurité',
                description: 'Nous vérifions chaque annonce et protégeons vos données pour garantir des transactions sécurisées.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: Zap,
                title: 'Simplicité & Rapidité',
                description: 'Interface intuitive, processus simplifié. Publiez votre annonce en quelques clics seulement.',
                color: 'from-[#FACC15] to-[#FBBF24]'
              },
              {
                icon: Users,
                title: 'Communauté',
                description: 'Rejoignez une communauté active de passionnés d\'automobile et de professionnels du secteur.',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: Award,
                title: 'Excellence',
                description: 'Nous nous efforçons d\'offrir le meilleur service possible et d\'améliorer constamment l\'expérience.',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((value, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-shadow">
                <div className={`w-12 h-12 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4`}>
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <Card className="p-8 md:p-12 bg-gradient-to-r from-[#FACC15] to-[#FBBF24]">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-8 text-center">annonceauto.ci en chiffres</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '1000+', label: 'Annonces' },
                { value: '500+', label: 'Vendeurs' },
                { value: '50+', label: 'Ventes/mois' },
                { value: '4.8/5', label: 'Satisfaction' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-[#0F172A] mb-2 font-[var(--font-poppins)]">{stat.value}</div>
                  <div className="text-sm text-[#0F172A]/70 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Équipe */}
          <Card className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-6">Notre Équipe</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Nous sommes une équipe passionnée de professionnels du digital et de l'automobile, 
              déterminés à transformer le marché automobile ivoirien. Notre expertise combine 
              développement web, marketing digital, et connaissance approfondie du secteur automobile.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Chaque jour, nous travaillons pour améliorer notre plateforme, écouter vos retours 
              et vous offrir la meilleure expérience possible.
            </p>
          </Card>

          {/* Contact CTA */}
          <Card className="p-8 md:p-12 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Rejoignez l'aventure !</h2>
            <p className="text-gray-300 mb-8 text-lg">
              Vous avez une question ? Une suggestion ? Une opportunité de partenariat ?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/publier"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] rounded-xl font-bold hover:shadow-xl hover:shadow-[#FACC15]/50 transition-all"
              >
                Publier une annonce
              </Link>
              <a
                href="mailto:annonceautoci@gmail.com"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border-2 border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                Nous contacter
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-gray-400 mb-3">Contactez-nous :</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <a href="tel:+2250778030075" className="text-[#FACC15] hover:underline">
                  📞 +225 07 78 03 00 75
                </a>
                <a href="mailto:annonceautoci@gmail.com" className="text-[#FACC15] hover:underline">
                  📧 annonceautoci@gmail.com
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}



