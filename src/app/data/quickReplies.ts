/**
 * Templates de réponses rapides pour vendeurs
 * Messages prédéfinis pour répondre rapidement aux acheteurs
 */

export interface QuickReply {
  id: string;
  text: string;
  emoji: string;
  category: 'disponibilite' | 'prix' | 'visite' | 'documents' | 'general';
}

export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  // Disponibilité
  {
    id: 'dispo-oui',
    text: 'Bonjour ! Oui, le véhicule est toujours disponible. 😊',
    emoji: '✅',
    category: 'disponibilite',
  },
  {
    id: 'dispo-non',
    text: 'Bonjour ! Désolé, ce véhicule a déjà été vendu. Mais j\'ai d\'autres modèles disponibles si ça vous intéresse.',
    emoji: '❌',
    category: 'disponibilite',
  },
  {
    id: 'dispo-reserve',
    text: 'Le véhicule est actuellement réservé, mais je vous tiens informé si la vente ne se conclut pas.',
    emoji: '⏳',
    category: 'disponibilite',
  },

  // Prix
  {
    id: 'prix-ferme',
    text: 'Le prix affiché est le prix final. Il n\'est malheureusement pas négociable.',
    emoji: '💰',
    category: 'prix',
  },
  {
    id: 'prix-nego',
    text: 'Oui, le prix est légèrement négociable. Contactez-moi directement pour en discuter !',
    emoji: '🤝',
    category: 'prix',
  },
  {
    id: 'prix-appel',
    text: 'Pour discuter du prix, je préfère qu\'on se parle directement par téléphone. Appelez-moi quand vous voulez !',
    emoji: '📞',
    category: 'prix',
  },

  // Visite
  {
    id: 'visite-rdv',
    text: 'Vous pouvez venir voir le véhicule quand vous voulez ! Je suis disponible pour un rendez-vous. Dites-moi quand ça vous arrange.',
    emoji: '📍',
    category: 'visite',
  },
  {
    id: 'visite-lieu',
    text: 'Le véhicule est visible à Abidjan. Je vous enverrai l\'adresse exacte par téléphone pour organiser la visite.',
    emoji: '🗺️',
    category: 'visite',
  },
  {
    id: 'visite-essai',
    text: 'Bien sûr ! Vous pouvez faire un essai routier. Apportez juste votre permis de conduire.',
    emoji: '🚗',
    category: 'visite',
  },

  // Documents
  {
    id: 'doc-complet',
    text: 'Oui, tous les documents sont en règle : carte grise, contrôle technique à jour, historique d\'entretien disponible.',
    emoji: '📄',
    category: 'documents',
  },
  {
    id: 'doc-visite',
    text: 'Je vous montrerai tous les documents lors de votre visite. Tout est en ordre !',
    emoji: '✔️',
    category: 'documents',
  },

  // Général
  {
    id: 'gen-infos',
    text: 'Pour plus d\'informations, n\'hésitez pas à m\'appeler directement. Je répondrai à toutes vos questions !',
    emoji: '📱',
    category: 'general',
  },
  {
    id: 'gen-merci',
    text: 'Merci pour votre intérêt ! N\'hésitez pas si vous avez d\'autres questions.',
    emoji: '🙏',
    category: 'general',
  },
  {
    id: 'gen-rapide',
    text: 'Je vous réponds dès que possible ! 👍',
    emoji: '⚡',
    category: 'general',
  },
];

export const CATEGORY_LABELS: Record<QuickReply['category'], string> = {
  disponibilite: 'Disponibilité',
  prix: 'Prix & Négociation',
  visite: 'Visite & Essai',
  documents: 'Documents',
  general: 'Général',
};

export const CATEGORY_COLORS: Record<QuickReply['category'], string> = {
  disponibilite: 'bg-green-100 text-green-700 border-green-300',
  prix: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  visite: 'bg-blue-100 text-blue-700 border-blue-300',
  documents: 'bg-purple-100 text-purple-700 border-purple-300',
  general: 'bg-gray-100 text-gray-700 border-gray-300',
};

