import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Shield, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/card';

export function ConfidentialitePage() {
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
              <Shield className="w-5 h-5 text-[#FACC15]" />
              <span className="text-sm font-medium text-[#FACC15]">Protection des données</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[var(--font-poppins)]">
              Politique de Confidentialité
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
                1. Introduction
              </h2>
              <p className="text-gray-700 mb-6">
                annonceauto.ci s'engage à protéger la confidentialité et la sécurité de vos données personnelles. 
                Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                2. Données collectées
              </h2>
              <p className="text-gray-700 mb-4">Nous collectons les données suivantes :</p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li><strong>Informations d'identification :</strong> nom, prénom, email, numéro de téléphone</li>
                <li><strong>Informations de compte :</strong> mot de passe crypté, préférences</li>
                <li><strong>Données d'annonces :</strong> photos, descriptions, prix des véhicules</li>
                <li><strong>Données de navigation :</strong> adresse IP, cookies, pages visitées</li>
                <li><strong>Données de transaction :</strong> historique d'achats de crédits, boosts</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                3. Utilisation des données
              </h2>
              <p className="text-gray-700 mb-4">Vos données sont utilisées pour :</p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Publier et gérer vos annonces</li>
                <li>Faciliter les transactions entre acheteurs et vendeurs</li>
                <li>Améliorer nos services et l'expérience utilisateur</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Prévenir la fraude et assurer la sécurité de la plateforme</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                4. Partage des données
              </h2>
              <p className="text-gray-700 mb-6">
                Nous ne vendons jamais vos données personnelles. Vos informations peuvent être partagées uniquement dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Avec d'autres utilisateurs (nom, téléphone) dans le cadre d'une transaction</li>
                <li>Avec nos prestataires de services (hébergement, paiement) sous contrat de confidentialité</li>
                <li>Si requis par la loi ou une autorité judiciaire</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                5. Sécurité des données
              </h2>
              <p className="text-gray-700 mb-6">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Cryptage SSL/TLS pour toutes les communications</li>
                <li>Mots de passe cryptés avec algorithmes modernes</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Surveillance et audits de sécurité réguliers</li>
                <li>Sauvegardes automatiques et sécurisées</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                6. Cookies
              </h2>
              <p className="text-gray-700 mb-6">
                Notre site utilise des cookies pour améliorer votre expérience. Les cookies nous permettent de :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Mémoriser vos préférences et paramètres</li>
                <li>Analyser l'utilisation du site</li>
                <li>Personnaliser le contenu affiché</li>
                <li>Assurer la sécurité de votre session</li>
              </ul>
              <p className="text-gray-700 mb-6">
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                7. Vos droits
              </h2>
              <p className="text-gray-700 mb-4">Conformément à la législation en vigueur, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
                <li><strong>Droit de suppression :</strong> demander l'effacement de vos données</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              </ul>
              <p className="text-gray-700 mb-6">
                Pour exercer ces droits, contactez-nous à <a href="mailto:annonceautoci@gmail.com" className="text-[#FACC15] hover:underline">annonceautoci@gmail.com</a>
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                8. Conservation des données
              </h2>
              <p className="text-gray-700 mb-6">
                Nous conservons vos données personnelles aussi longtemps que votre compte est actif ou que nécessaire pour 
                fournir nos services. Vous pouvez demander la suppression de votre compte à tout moment.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                9. Modifications de la politique
              </h2>
              <p className="text-gray-700 mb-6">
                Nous pouvons mettre à jour cette politique de confidentialité périodiquement. Nous vous informerons de tout 
                changement important par email ou via une notification sur la plateforme.
              </p>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FACC15]" />
                10. Contact
              </h2>
              <p className="text-gray-700 mb-2">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
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

