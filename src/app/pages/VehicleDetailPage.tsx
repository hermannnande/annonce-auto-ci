import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Gauge,
  MapPin,
  Fuel,
  Settings,
  Phone,
  Mail,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Eye,
  Loader2,
  Heart,
  Share2,
  Star,
  Shield,
  Clock
} from 'lucide-react';
import { listingsService } from '../services/listings.service';
import { messagesService } from '../services/messages.service';
import { favoritesService } from '../services/favorites.service';
import { analyticsService } from '../../services/analytics.service';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { VehicleCard } from '../components/VehicleCard';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { SafetyWarningModal } from '../components/SafetyWarningModal';
import { ShareModal } from '../components/ShareModal';
import { ContactSellerButton } from '../components/ContactSellerButton';
import { toast } from 'sonner';

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [vehicle, setVehicle] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [similarVehicles, setSimilarVehicles] = useState<any[]>([]);
  
  // États pour le modal de sécurité
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'message' | 'whatsapp' | 'call';
    callback: () => void;
  } | null>(null);

  // États pour favoris et partage
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // Vérifier si l'annonce est dans les favoris
  const checkIfFavorite = async () => {
    if (!user || !id) return;
    
    try {
      const { favorites } = await favoritesService.getUserFavorites(user.id);
      setIsFavorite(favorites.some(fav => fav.listing_id === id));
    } catch (error) {
      console.error('Erreur vérification favori:', error);
    }
  };

  useEffect(() => {
    if (id) {
      loadVehicle();
      if (user) {
        checkIfFavorite();
      }
    }
  }, [id, user]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      console.log('🔍 Chargement annonce ID:', id);

      // Charger l'annonce depuis Supabase
      const listing = await listingsService.getListingById(id!);
      console.log('📦 Annonce récupérée:', listing);

      if (!listing) {
        console.error('❌ Annonce non trouvée dans Supabase');
        setVehicle(null);
        setLoading(false);
        return;
      }

      // Vérifier que l'annonce est active
      if (listing.status !== 'active') {
        console.warn('⚠️ Annonce non active:', listing.status);
        console.log('📋 Détails annonce:', { id: listing.id, title: listing.title, status: listing.status });
        setVehicle(null);
        setLoading(false);
        return;
      }

      console.log('✅ Annonce active chargée:', listing.title);
      setVehicle(listing);

      // Charger les infos du vendeur depuis la table profiles
      if (listing.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, phone, user_type, avatar_url')
          .eq('id', listing.user_id)
          .single();

        if (!profileError && profile) {
          setSeller({
            name: profile.full_name || 'Vendeur',
            type: profile.user_type === 'admin' ? 'Professionnel' : 'Particulier',
            phone: profile.phone || '+225 00 00 00 00 00',
            verified: true,
            avatar_url: profile.avatar_url
          });
          console.log('👤 Vendeur chargé:', profile.full_name);
        } else {
          // Vendeur par défaut si pas trouvé
          setSeller({
            name: 'Vendeur',
            type: 'Particulier',
            phone: '+225 00 00 00 00 00',
            verified: false
          });
        }
      }

      // Incrémenter les vues
      await incrementViews(id!);

      // 📊 Tracker la vue dans analytics
      try {
        await analyticsService.trackListingView(id!, listing.title);
        console.log('📊 Vue trackée dans analytics');
      } catch (error) {
        console.error('⚠️ Erreur tracking analytics:', error);
        // Ne pas bloquer si analytics ne fonctionne pas
      }

      // Charger les véhicules similaires (même marque)
      const similar = await listingsService.getSimilarListings(listing.brand, id!, 3);
      setSimilarVehicles(similar);
      console.log('🚗 Véhicules similaires:', similar.length);

    } catch (error) {
      console.error('💥 Erreur chargement véhicule:', error);
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (listingId: string) => {
    try {
      await listingsService.incrementViews(listingId);
    } catch (error) {
      console.error('Erreur incrémentation vues:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FACC15] mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-4">Véhicule non trouvé</h1>
          <p className="text-gray-600 mb-6">Cette annonce n'existe pas ou n'est plus disponible.</p>
          <Link to="/annonces">
            <Button className="bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24]">
              Retour aux annonces
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === vehicle.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? vehicle.images.length - 1 : prev - 1
    );
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Urgent':
        return 'bg-red-500 text-white';
      case 'Top annonce':
        return 'bg-[#FACC15] text-[#0F172A]';
      case 'Bonne affaire':
        return 'bg-green-500 text-white';
      default:
        return '';
    }
  };

  const getConditionColor = (condition: string) => {
    return condition === 'Neuf' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white';
  };

  // Fonction pour générer le lien WhatsApp avec message pré-rempli
  const getWhatsAppLink = () => {
    if (!vehicle || !seller) return '';
    
    const currentUrl = window.location.href;
    const message = `Bonjour,\n\nJe suis intéressé(e) par votre annonce :\n🚗 ${vehicle.brand} ${vehicle.model} (${vehicle.year})\n💰 ${formatPrice(vehicle.price)}\n\nVoici le lien de l'annonce :\n${currentUrl}\n\nPouvez-vous me donner plus d'informations ?\n\nMerci !`;
    
    // Encodage du message pour l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Numéro de téléphone du vendeur (format international sans +)
    const phoneNumber = seller?.phone?.replace(/\D/g, '') || '2250708000000';
    
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  // Fonction pour démarrer une conversation
  const handleSendMessage = async () => {
    // Si pas connecté, rediriger vers la page de connexion
    if (!user) {
      toast.error('Vous devez être connecté pour envoyer un message');
      // Sauvegarder la page d'origine en sessionStorage (robuste même après refresh sur /connexion)
      sessionStorage.setItem('auth_return_to', `/annonces/${id}`);
      navigate('/connexion', { state: { from: `/annonces/${id}` } });
      return;
    }

    // Si c'est son propre véhicule
    if (user.id === vehicle.user_id) {
      toast.error('Vous ne pouvez pas vous envoyer un message à vous-même');
      return;
    }

    try {
      toast.loading('Création de la conversation...', { id: 'create-conversation' });

      // Créer ou récupérer la conversation
      const { conversation, error } = await messagesService.getOrCreateConversation(
        vehicle.id,      // listing_id
        user.id,         // buyer_id
        vehicle.user_id  // seller_id
      );

      if (error || !conversation) {
        throw new Error('Erreur lors de la création de la conversation');
      }

      toast.success('Conversation créée !', { id: 'create-conversation' });

      // Rediriger vers la page de messages
      navigate('/dashboard/vendeur/messages');
    } catch (error: any) {
      console.error('Erreur création conversation:', error);
      toast.error(error.message || 'Erreur lors de la création de la conversation', {
        id: 'create-conversation'
      });
    }
  };

  // Fonction pour ouvrir le modal de sécurité avant une action
  const handleActionWithWarning = (
    actionType: 'message' | 'whatsapp' | 'call',
    callback: () => void
  ) => {
    setPendingAction({ type: actionType, callback });
    setShowSafetyModal(true);
  };

  // Fonction pour continuer l'action après acceptation du warning
  const handleContinueAction = () => {
    setShowSafetyModal(false);
    if (pendingAction) {
      pendingAction.callback();
      setPendingAction(null);
    }
  };

  // Fonction pour fermer le modal
  const handleCloseSafetyModal = () => {
    setShowSafetyModal(false);
    setPendingAction(null);
  };

  // Ajouter/Retirer des favoris
  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter aux favoris');
      // Sauvegarder la page d'origine en sessionStorage (robuste même après refresh sur /connexion)
      sessionStorage.setItem('auth_return_to', `/annonces/${id}`);
      navigate('/connexion', { state: { from: `/annonces/${id}` } });
      return;
    }

    setLoadingFavorite(true);
    
    try {
      if (isFavorite) {
        // Retirer des favoris
        await favoritesService.removeFavorite(user.id, id!);
        setIsFavorite(false);
        toast.success('Retiré des favoris');
      } else {
        // Ajouter aux favoris
        const { error } = await favoritesService.addFavorite(user.id, id!);
        if (error) {
          throw error;
        }
        setIsFavorite(true);
        toast.success('Ajouté aux favoris ❤️');
      }
    } catch (error: any) {
      console.error('Erreur favoris:', error);
      toast.error(error.message || 'Erreur lors de la modification des favoris');
    } finally {
      setLoadingFavorite(false);
    }
  };

  // Ouvrir le modal de partage
  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-[#FACC15]/5 via-[#FBBF24]/3 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-[#0F172A]/3 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Breadcrumb amélioré */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-2 text-sm"
        >
          <Link to="/" className="text-gray-500 hover:text-[#FACC15] transition-colors flex items-center gap-1">
            <motion.span whileHover={{ scale: 1.05 }}>Accueil</motion.span>
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/annonces" className="text-gray-500 hover:text-[#FACC15] transition-colors">
            <motion.span whileHover={{ scale: 1.05 }}>Annonces</motion.span>
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#0F172A] font-semibold">
            {vehicle.brand} {vehicle.model}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-6 overflow-hidden border-0 shadow-2xl">
                <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={vehicle.images[currentImageIndex]}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    />
                  </AnimatePresence>

                  {/* Gradient Overlays pour profondeur */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Navigation Arrows Premium */}
                  {vehicle.images.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1, x: -4 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-2xl group"
                      >
                        <ChevronLeft className="w-6 h-6 text-[#0F172A] group-hover:text-[#FACC15] transition-colors" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, x: 4 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-2xl group"
                      >
                        <ChevronRight className="w-6 h-6 text-[#0F172A] group-hover:text-[#FACC15] transition-colors" />
                      </motion.button>
                    </>
                  )}

                  {/* Badges Premium avec animations */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge className={`${getConditionColor(vehicle.condition)} shadow-lg backdrop-blur-sm`}>
                        {vehicle.condition}
                      </Badge>
                    </motion.div>
                    {vehicle.badge && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Badge className={`${getBadgeColor(vehicle.badge)} shadow-lg backdrop-blur-sm`}>
                          {vehicle.badge}
                        </Badge>
                      </motion.div>
                    )}
                  </div>

                  {/* Actions rapides (top right) */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-4 right-4 flex gap-2"
                  >
                    {/* Bouton Favoris */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleToggleFavorite}
                      disabled={loadingFavorite}
                      className={`backdrop-blur-sm p-2.5 rounded-full shadow-lg group transition-all ${
                        isFavorite 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-white/95 hover:bg-[#FACC15]'
                      }`}
                      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Heart 
                        className={`w-5 h-5 transition-colors ${
                          isFavorite 
                            ? 'text-white fill-white' 
                            : 'text-gray-700 group-hover:text-[#0F172A]'
                        }`} 
                      />
                    </motion.button>

                    {/* Bouton Partage */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-[#FACC15] group transition-all"
                      aria-label="Partager l'annonce"
                    >
                      <Share2 className="w-5 h-5 text-gray-700 group-hover:text-[#0F172A] transition-colors" />
                    </motion.button>
                  </motion.div>

                  {/* Image Counter Premium */}
                  {vehicle.images.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-white/10"
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      {currentImageIndex + 1} / {vehicle.images.length}
                    </motion.div>
                  )}
                </div>

                {/* Thumbnail Navigation Premium */}
                {vehicle.images.length > 1 && (
                  <div className="flex gap-3 p-5 overflow-x-auto bg-gradient-to-r from-gray-50 via-white to-gray-50 scrollbar-hide">
                    {vehicle.images.map((img, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                          index === currentImageIndex
                            ? 'border-[#FACC15] shadow-xl ring-2 ring-[#FACC15]/30'
                            : 'border-gray-200 hover:border-[#FACC15]/50 shadow-md'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Vehicle Title and Price - Premium Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-4 sm:p-6 md:p-8 lg:p-12 mb-6 border-0 shadow-2xl bg-gradient-to-br from-white via-white to-gray-50/50 relative overflow-hidden">
                {/* Decorative Background Elements - Enhanced */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FACC15]/10 via-[#FBBF24]/5 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#0F172A]/5 to-transparent rounded-full blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-transparent via-[#FACC15]/3 to-transparent opacity-30" />
                
                <div className="relative z-10">
                  {/* Title avec animation - COMPACT MOBILE */}
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 font-[var(--font-poppins)] text-[#0F172A] leading-tight"
                  >
                    {vehicle.brand} <span className="text-[#FACC15]">{vehicle.model}</span>
                  </motion.h1>
                  
                  {/* Subtitle avec badges - COMPACT MOBILE */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FACC15]" />
                      <span className="text-xs sm:text-sm font-semibold text-[#0F172A]">{vehicle.year}</span>
                    </div>
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FACC15]" />
                      <span className="text-xs sm:text-sm font-semibold text-[#0F172A]">{vehicle.location}</span>
                    </div>
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-green-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-xs sm:text-sm font-semibold text-green-700">Vérifié</span>
                    </div>
                  </motion.div>

                  {/* Price Section - COMPACT MOBILE */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6 sm:mb-8 md:mb-10 pb-6 sm:pb-8 md:pb-10 border-b-2 border-gray-100"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wide">Prix de vente</p>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                    </div>
                    <div className="flex items-end gap-2 sm:gap-3 md:gap-4">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                        className="relative"
                      >
                        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-[#FACC15] via-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent font-[var(--font-poppins)] drop-shadow-sm">
                          {formatPrice(vehicle.price).replace(' FCFA', '')}
                        </span>
                        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-400 ml-2 sm:ml-3">FCFA</span>
                      </motion.div>
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2"
                    >
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Publié {new Date(vehicle.created_at || Date.now()).toLocaleDateString('fr-FR')}
                    </motion.p>
                  </motion.div>

                  {/* Characteristics Grid - COMPACT MOBILE */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    {[
                      { icon: Calendar, label: 'Année', value: vehicle.year, color: 'from-[#FACC15]/10 to-[#FBBF24]/5', iconColor: 'text-[#FACC15]' },
                      { icon: Gauge, label: 'Kilométrage', value: `${vehicle.mileage.toLocaleString('fr-FR')} km`, color: 'from-blue-500/10 to-cyan-500/5', iconColor: 'text-blue-500' },
                      { icon: Settings, label: 'Transmission', value: vehicle.transmission, color: 'from-purple-500/10 to-pink-500/5', iconColor: 'text-purple-500' },
                      { icon: Fuel, label: 'Carburant', value: vehicle.fuel, color: 'from-green-500/10 to-emerald-500/5', iconColor: 'text-green-500' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="group cursor-pointer"
                      >
                        <div className={`flex items-start gap-2 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} border border-gray-100 hover:border-[#FACC15]/30 hover:shadow-xl transition-all duration-300`}>
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.2 }}
                            transition={{ duration: 0.5 }}
                            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                          >
                            <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${item.iconColor}`} />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 mb-0.5 sm:mb-1 md:mb-1.5 uppercase tracking-wider">{item.label}</p>
                            <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-[#0F172A] truncate">{item.value}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Description - COMPACT MOBILE */}
            {vehicle.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="p-4 sm:p-6 md:p-8 mb-6 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50/30">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#FACC15]/20 to-[#FBBF24]/10 flex items-center justify-center">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#FACC15]" />
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0F172A]">Description</h2>
                  </div>
                  <div className="sm:pl-11 md:pl-13">
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Technical Details - COMPACT MOBILE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="p-4 sm:p-6 md:p-8 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0F172A]">Détails techniques</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-0">
                  {[
                    { label: 'Marque', value: vehicle.brand },
                    { label: 'Modèle', value: vehicle.model },
                    { label: 'Année', value: vehicle.year },
                    { label: 'Kilométrage', value: `${vehicle.mileage.toLocaleString('fr-FR')} km` },
                    { label: 'Transmission', value: vehicle.transmission },
                    { label: 'Carburant', value: vehicle.fuel },
                    ...(vehicle.doors ? [{ label: 'Portes', value: vehicle.doors }] : []),
                    ...(vehicle.color ? [{ label: 'Couleur', value: vehicle.color }] : []),
                    { label: 'État', value: vehicle.condition },
                    { label: 'Localisation', value: vehicle.location }
                  ].map((detail, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex justify-between items-center py-2.5 sm:py-3 md:py-4 border-b border-gray-100 last:border-0 group hover:bg-gray-50/50 px-2 sm:px-3 md:px-4 rounded-lg transition-all"
                    >
                      <span className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">{detail.label}</span>
                      <span className="text-sm sm:text-base md:text-lg font-bold text-[#0F172A] group-hover:text-[#FACC15] transition-colors">{detail.value}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Seller Info and Actions - Premium Design */}
          <div className="lg:col-span-1">
            {/* Sticky Sidebar */}
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Contact Card - Ultra Premium */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-6 border-0 shadow-2xl bg-gradient-to-br from-white via-white to-gray-50 overflow-hidden relative">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FACC15]/10 to-transparent rounded-full blur-2xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <User className="w-5 h-5 text-[#FACC15]" />
                      <h3 className="text-xl font-bold text-[#0F172A]">Contacter le vendeur</h3>
                    </div>

                    {seller ? (
                      <>
                        {/* Seller Profile */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-2xl"
                        >
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-2xl flex items-center justify-center text-white overflow-hidden shadow-xl">
                              {seller.avatar_url ? (
                                <img src={seller.avatar_url} alt={seller.name} className="w-full h-full object-cover" />
                              ) : seller.type === 'Professionnel' ? (
                                <User className="w-8 h-8 text-[#0F172A]" />
                              ) : (
                                <span className="text-2xl font-bold text-[#0F172A]">{seller.name.charAt(0)}</span>
                              )}
                            </div>
                            {seller.verified && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1"
                              >
                                <CheckCircle className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#0F172A] text-lg">{seller.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              {seller.type}
                              {seller.verified && <span className="text-green-600 text-xs font-semibold">• Vérifié</span>}
                            </p>
                          </div>
                        </motion.div>

                        {/* Contact Buttons */}
                        <div className="space-y-3">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              onClick={() => handleActionWithWarning('call', () => {
                                window.location.href = `tel:${seller.phone}`;
                              })}
                              className="w-full bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] hover:from-[#FBBF24] hover:to-[#F59E0B] gap-2 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                              <Phone className="w-5 h-5" />
                              {seller.phone}
                            </Button>
                          </motion.div>
                          
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              onClick={() => handleActionWithWarning('whatsapp', () => {
                                window.open(getWhatsAppLink(), '_blank');
                              })}
                              className="w-full gap-2 h-12 bg-gradient-to-r from-[#25D366] to-[#20BA5A] text-white hover:from-[#20BA5A] hover:to-[#1DA851] font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                              <WhatsAppIcon className="w-5 h-5" />
                              <span>WhatsApp</span>
                            </Button>
                          </motion.div>
                          
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              onClick={() => handleActionWithWarning('message', handleSendMessage)}
                              variant="outline" 
                              className="w-full gap-2 h-12 border-2 hover:border-[#FACC15] hover:bg-[#FACC15]/5"
                            >
                              <Mail className="w-5 h-5" />
                              Envoyer un message
                            </Button>
                          </motion.div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-[#FACC15] mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Chargement...</p>
                      </div>
                    )}

                    {/* Location */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                        <div className="w-10 h-10 bg-[#FACC15]/10 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#FACC15]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Localisation</p>
                          <p className="text-sm font-bold text-[#0F172A]">{vehicle.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Safety Tips - Enhanced */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-green-50/50 to-white">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A]">
                      Conseils de sécurité
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Rencontrez le vendeur en personne',
                      'Vérifiez les documents du véhicule',
                      'Faites un essai avant l\'achat',
                      'Ne payez jamais sans avoir vu le véhicule'
                    ].map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex gap-3 text-sm text-gray-700 group hover:text-green-700 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Similar Vehicles - Premium Design */}
        {similarVehicles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20"
          >
            <div className="text-center mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-[#0F172A] mb-3"
              >
                Véhicules <span className="text-[#FACC15]">similaires</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-gray-600"
              >
                Découvrez d'autres {vehicle.brand} qui pourraient vous intéresser
              </motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarVehicles.map((similarVehicle, index) => (
                <motion.div
                  key={similarVehicle.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <VehicleCard vehicle={similarVehicle} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal de sécurité */}
      <SafetyWarningModal
        isOpen={showSafetyModal}
        onClose={handleCloseSafetyModal}
        onContinue={handleContinueAction}
        actionType={pendingAction?.type || 'message'}
      />

      {/* Modal de partage */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={window.location.href}
        title={`${vehicle?.brand} ${vehicle?.model} - ${vehicle?.year}`}
        description={vehicle?.description}
      />

      {/* Bouton contact vendeur mobile */}
      {vehicle && seller && (
        <ContactSellerButton
          onCall={() => handleActionWithWarning('call', () => {
            window.location.href = `tel:${seller.phone}`;
          })}
          onWhatsApp={() => handleActionWithWarning('whatsapp', () => {
            window.open(getWhatsAppLink(), '_blank');
          })}
          onMessage={() => handleActionWithWarning('message', handleSendMessage)}
          sellerPhone={seller.phone}
        />
      )}
    </div>
  );
}