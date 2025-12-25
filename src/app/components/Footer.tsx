import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A] text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#FACC15] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FACC15] rounded-full blur-3xl" />
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <Link to="/" className="flex items-center gap-3 group mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FACC15] rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                  <Car className="w-10 h-10 text-[#FACC15] relative z-10" />
                </div>
                <div>
                  <span className="text-2xl font-[var(--font-poppins)] font-bold bg-gradient-to-r from-white to-[#FACC15] bg-clip-text text-transparent">
                    annonceauto.ci
                  </span>
                  <div className="text-xs text-[#FACC15]">Votre auto en un clic</div>
                </div>
              </Link>
              <p className="text-gray-400 mb-6 leading-relaxed">
                La plateforme n°1 d'annonces automobiles en Côte d'Ivoire. Achetez et vendez en toute confiance.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="text-2xl font-bold text-[#FACC15] font-[var(--font-poppins)]">1000+</div>
                  <div className="text-xs text-gray-400">Annonces</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="text-2xl font-bold text-[#FACC15] font-[var(--font-poppins)]">500+</div>
                  <div className="text-xs text-gray-400">Vendeurs</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-6 font-[var(--font-poppins)] flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#FACC15] to-transparent rounded-full" />
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Acheter une voiture', path: '/annonces' },
                { label: 'Vendre un véhicule', path: '/publier' },
                { label: 'Comment ça marche', path: '/#comment-ca-marche' },
                { label: 'Prix et tarifs', path: '/tarifs' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#FACC15] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-[#FACC15] group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal & Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-6 font-[var(--font-poppins)] flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#FACC15] to-transparent rounded-full" />
              Informations
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'À propos', path: '/a-propos' },
                { label: 'Conditions générales', path: '/cgu' },
                { label: 'Confidentialité', path: '/confidentialite' },
                { label: 'Blog & Actualités', path: '/blog' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#FACC15] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-[#FACC15] group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-6 font-[var(--font-poppins)] flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#FACC15] to-transparent rounded-full" />
              Contact
            </h3>
            <ul className="space-y-4 mb-6">
              <li>
                <a href="tel:+2250700000000" className="text-gray-400 hover:text-[#FACC15] transition-colors flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-[#FACC15]/20 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+225 07 00 00 00 00</span>
                </a>
              </li>
              <li>
                <a href="mailto:contact@annonceauto.ci" className="text-gray-400 hover:text-[#FACC15] transition-colors flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-[#FACC15]/20 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>contact@annonceauto.ci</span>
                </a>
              </li>
              <li>
                <div className="text-gray-400 flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>Abidjan, Cocody<br />Côte d'Ivoire</span>
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div>
              <p className="text-sm text-gray-400 mb-3 font-medium">Suivez-nous :</p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: '#', color: 'from-blue-600 to-blue-400' },
                  { icon: Twitter, href: '#', color: 'from-sky-600 to-sky-400' },
                  { icon: Instagram, href: '#', color: 'from-pink-600 to-purple-400' },
                  { icon: Linkedin, href: '#', color: 'from-blue-700 to-blue-500' }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-12 h-12 bg-gradient-to-br ${social.color} rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-white/20 transition-all duration-300`}
                  >
                    <social.icon className="w-5 h-5 text-white" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-12 mb-12"
        >
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-full px-6 py-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#FACC15]" />
              <span className="text-sm font-medium">Newsletter</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 font-[var(--font-poppins)]">
              Restez informé des meilleures offres
            </h3>
            <p className="text-gray-400 mb-6">
              Recevez nos dernières annonces et offres exclusives directement dans votre boîte mail
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FACC15] transition-colors backdrop-blur-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] rounded-xl font-bold hover:shadow-xl hover:shadow-[#FACC15]/50 transition-all duration-300"
              >
                S'abonner
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm text-gray-400 flex items-center gap-2"
            >
              © 2025 annonceauto.ci - Tous droits réservés
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                Fait avec <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> en Côte d'Ivoire
              </span>
            </motion.p>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Paiements sécurisés</span>
              <div className="flex gap-2">
                {['💳', '🏦', '📱'].map((icon, index) => (
                  <div key={index} className="w-10 h-7 bg-white/10 rounded border border-white/20 flex items-center justify-center text-sm">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
