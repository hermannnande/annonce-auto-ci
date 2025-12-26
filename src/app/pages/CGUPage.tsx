import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, FileText, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/card';

export function CGUPage() {
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
              <FileText className="w-5 h-5 text-[#FACC15]" />
              <span className="text-sm font-medium text-[#FACC15]">Informations légales</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[var(--font-poppins)]">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-xl text-gray-300">
              Dernière mise à jour : 25 décembre 2025
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                1. Objet
              </h2>
              <p className="text-gray-700 mb-6">
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme annonceauto.ci, 
                une plateforme en ligne dédiée à l'achat et la vente de véhicules automobiles en Côte d'Ivoire.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                2. Acceptation des CGU
              </h2>
              <p className="text-gray-700 mb-6">
                En accédant et en utilisant annonceauto.ci, vous acceptez sans réserve les présentes CGU. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                3. Inscription et compte utilisateur
              </h2>
              <p className="text-gray-700 mb-4">Pour utiliser certaines fonctionnalités de la plateforme, vous devez créer un compte. Vous vous engagez à :</p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Fournir des informations exactes et à jour</li>
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Ne pas partager votre compte avec des tiers</li>
                <li>Nous informer immédiatement de toute utilisation non autorisée</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                4. Publication d'annonces
              </h2>
              <p className="text-gray-700 mb-4">En publiant une annonce sur annonceauto.ci, vous garantissez que :</p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Vous êtes le propriétaire légitime du véhicule ou avez l'autorisation de le vendre</li>
                <li>Les informations fournies sont exactes et complètes</li>
                <li>Les photos représentent fidèlement le véhicule</li>
                <li>Le véhicule est en conformité avec la législation ivoirienne</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                5. Contenu interdit
              </h2>
              <p className="text-gray-700 mb-4">Il est strictement interdit de publier :</p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Des annonces frauduleuses ou trompeuses</li>
                <li>Des véhicules volés ou de provenance douteuse</li>
                <li>Du contenu illégal, offensant ou diffamatoire</li>
                <li>Des informations personnelles de tiers sans autorisation</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                6. Responsabilité
              </h2>
              <p className="text-gray-700 mb-6">
                annonceauto.ci agit en tant qu'intermédiaire entre acheteurs et vendeurs. Nous ne sommes pas responsables 
                de la qualité, de la sécurité ou de la légalité des véhicules proposés, ni de la capacité des vendeurs à vendre 
                ou des acheteurs à acheter. Les transactions se font directement entre les parties.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                7. Services payants
              </h2>
              <p className="text-gray-700 mb-6">
                Certains services sont payants (boost d'annonces, achat de crédits). Les paiements sont effectués via des 
                prestataires sécurisés. Aucun remboursement n'est possible sauf disposition légale contraire.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                8. Propriété intellectuelle
              </h2>
              <p className="text-gray-700 mb-6">
                Tous les éléments de la plateforme (design, logos, textes, code) sont protégés par le droit de la propriété 
                intellectuelle. Toute reproduction ou utilisation sans autorisation est interdite.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                9. Modification des CGU
              </h2>
              <p className="text-gray-700 mb-6">
                Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur 
                dès leur publication sur la plateforme. Il est de votre responsabilité de consulter régulièrement les CGU.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                10. Droit applicable et juridiction
              </h2>
              <p className="text-gray-700 mb-6">
                Les présentes CGU sont régies par le droit ivoirien. Tout litige relatif à leur interprétation ou exécution 
                relève de la compétence exclusive des tribunaux d'Abidjan, Côte d'Ivoire.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                11. Contact
              </h2>
              <p className="text-gray-700 mb-2">
                Pour toute question concernant ces CGU, vous pouvez nous contacter :
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li>📧 Email : <a href="mailto:annonceautoci@gmail.com" className="text-[#FACC15] hover:underline">annonceautoci@gmail.com</a></li>
                <li>📞 Téléphone : <a href="tel:+2250778030075" className="text-[#FACC15] hover:underline">+225 07 78 03 00 75</a></li>
                <li>📍 Adresse : Abidjan, Cocody, Côte d'Ivoire</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}



