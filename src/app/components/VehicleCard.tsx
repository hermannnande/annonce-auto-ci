import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Gauge, MapPin, Fuel, Settings, Eye, Heart, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import type { Vehicle } from '../data/vehicles';
import type { Listing } from '../lib/supabase';
import { favoritesService } from '../services/favorites.service';

interface VehicleCardProps {
  vehicle: Vehicle | Listing;
  /**
   * ⚡ Perf: évite N requêtes Supabase (une par carte) quand la page a déjà chargé
   * les favoris en batch.
   */
  skipFavoriteCheck?: boolean;
  initialIsFavorite?: boolean;
}

export function VehicleCard({ vehicle, skipFavoriteCheck, initialIsFavorite }: VehicleCardProps) {
  const [isFavorite, setIsFavorite] = useState(!!initialIsFavorite);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (skipFavoriteCheck) return;
    checkIfFavorite();
  }, [vehicle.id, user, skipFavoriteCheck]);

  // Si le parent met à jour l'état initial (batch favoris), on se synchronise.
  useEffect(() => {
    if (skipFavoriteCheck) {
      setIsFavorite(!!initialIsFavorite);
    }
  }, [initialIsFavorite, skipFavoriteCheck]);

  const checkIfFavorite = async () => {
    if (!user) {
      setIsFavorite(false);
      return;
    }
    
    try {
      const isFav = await favoritesService.isFavorite(user.id, vehicle.id);
      setIsFavorite(isFav);
    } catch (error) {
      // Erreur silencieuse - pas grave si on ne peut pas vérifier
      setIsFavorite(false);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }

    setIsAnimating(true);
    setLoading(true);

    try {
      const { isFavorite: newIsFavorite, error } = await favoritesService.toggleFavorite(user.id, vehicle.id);
      
      if (error) {
        toast.error('Erreur lors de la mise à jour des favoris');
        console.error('Erreur favori:', error);
        return;
      }

      setIsFavorite(newIsFavorite);
      
      if (newIsFavorite) {
        toast.success('❤️ Ajouté aux favoris !');
      } else {
        toast.success('Retiré des favoris');
      }
    } catch (error) {
      console.error('Erreur toggle favori:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  // Helper pour vérifier si c'est un Listing ou un Vehicle
  const isListing = (v: Vehicle | Listing): v is Listing => {
    return 'is_boosted' in v;
  };

  // Helper pour vérifier si le boost est actif
  const isActiveBoosted = () => {
    if (!isListing(vehicle)) return false;
    if (!vehicle.is_boosted) return false;
    const anyVehicle = vehicle as any;
    const boostUntil = (anyVehicle.boost_until ?? anyVehicle.boost_expires_at ?? null) as string | null;
    if (!boostUntil) return false;
    return new Date(boostUntil) > new Date();
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Urgent':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50';
      case 'Top annonce':
        return 'bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] shadow-lg shadow-[#FACC15]/50';
      case 'Bonne affaire':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50';
      default:
        return '';
    }
  };

  const getConditionColor = (condition: string) => {
    return condition === 'Neuf' || condition === 'neuf'
      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
      : 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg shadow-gray-700/50';
  };

  // Normaliser les données pour gérer Vehicle et Listing
  const normalizedVehicle = {
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    mileage: vehicle.mileage,
    transmission: isListing(vehicle) 
      ? (vehicle.transmission === 'automatique' ? 'Automatique' : 'Manuelle')
      : vehicle.transmission,
    fuel: isListing(vehicle)
      ? (vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.slice(1))
      : vehicle.fuel,
    location: vehicle.location,
    condition: isListing(vehicle)
      ? (vehicle.condition === 'neuf' ? 'Neuf' : 'Occasion')
      : vehicle.condition,
    images: vehicle.images,
    badge: !isListing(vehicle) ? vehicle.badge : undefined,
    views: isListing(vehicle) ? vehicle.views : Math.floor(Math.random() * 500) + 100,
    isBoosted: isActiveBoosted()
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="overflow-hidden group h-full flex flex-col border-0 shadow-xl hover:shadow-2xl hover:shadow-[#FACC15]/20 transition-all duration-500 relative">
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/0 via-[#FACC15]/0 to-[#FACC15]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
        
        <Link to={`/annonces/${vehicle.id}`} className="flex flex-col h-full">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            {/* Image */}
            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6 }}
              src={vehicle.images[0]}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />

            {/* Gradient Overlay on Image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Badges - Compact sur mobile */}
            <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col gap-1 md:gap-2 z-20">
              <Badge className={`${getConditionColor(normalizedVehicle.condition)} backdrop-blur-sm font-medium px-2 py-0.5 md:px-3 md:py-1 text-xs`}>
                {normalizedVehicle.condition}
              </Badge>
              {normalizedVehicle.badge && (
                <Badge className={`${getBadgeColor(normalizedVehicle.badge)} backdrop-blur-sm font-medium px-2 py-0.5 md:px-3 md:py-1 animate-pulse text-xs`}>
                  {normalizedVehicle.badge}
                </Badge>
              )}
              {/* Badge BOOSTÉ */}
              {normalizedVehicle.isBoosted && (
                <Badge className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] backdrop-blur-sm font-bold px-2 py-0.5 md:px-3 md:py-1 flex items-center gap-1 shadow-lg shadow-[#FACC15]/50 animate-pulse text-xs">
                  <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                  <span className="hidden md:inline">BOOSTÉ</span>
                </Badge>
              )}
            </div>

            {/* Favorite Button - Always visible */}
            <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{ scale: isAnimating ? [1, 1.3, 1] : 1 }}
                onClick={handleFavoriteClick}
                className={`w-9 h-9 md:w-11 md:h-11 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-600 hover:bg-red-50'
                }`}
              >
                <Heart
                  className={`w-4 h-4 md:w-5 md:h-5 transition-all ${
                    isFavorite ? 'fill-current' : ''
                  }`}
                />
              </motion.button>
            </div>

          </div>

          {/* Content - Plus compact sur mobile */}
          <div className="p-3 md:p-6 flex-1 flex flex-col relative z-10">
            {/* Title - Taille responsive */}
            <h3 className="text-sm md:text-xl mb-2 md:mb-3 font-[var(--font-poppins)] font-bold text-[#0F172A] group-hover:text-[#FACC15] transition-colors line-clamp-1">
              {vehicle.brand} {vehicle.model}
            </h3>

            {/* Price - Taille responsive */}
            <div className="mb-3 md:mb-6">
              <p className="text-base md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#FACC15] to-[#FBBF24] bg-clip-text text-transparent font-[var(--font-poppins)]">
                {formatPrice(vehicle.price)}
              </p>
            </div>

            {/* Details Grid - Simplifié sur mobile */}
            <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm text-gray-600 mb-3 md:mb-6 flex-1">
              <div className="flex items-center gap-1 md:gap-2 group/item">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-[#F3F4F6] rounded-lg flex items-center justify-center group-hover/item:bg-[#FACC15]/10 transition-colors">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 text-[#FACC15]" />
                </div>
                <span className="font-medium">{vehicle.year}</span>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2 group/item">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-[#F3F4F6] rounded-lg flex items-center justify-center group-hover/item:bg-[#FACC15]/10 transition-colors">
                  <Gauge className="w-3 h-3 md:w-4 md:h-4 text-[#FACC15]" />
                </div>
                <span className="font-medium truncate">{vehicle.mileage.toLocaleString('fr-FR')} km</span>
              </div>
              
              {/* Transmission et Carburant - Desktop seulement */}
              <div className="hidden md:flex items-center gap-2 group/item">
                <div className="w-8 h-8 bg-[#F3F4F6] rounded-lg flex items-center justify-center group-hover/item:bg-[#FACC15]/10 transition-colors">
                  <Settings className="w-4 h-4 text-[#FACC15]" />
                </div>
                <span className="font-medium truncate">{normalizedVehicle.transmission}</span>
              </div>
              
              <div className="hidden md:flex items-center gap-2 group/item">
                <div className="w-8 h-8 bg-[#F3F4F6] rounded-lg flex items-center justify-center group-hover/item:bg-[#FACC15]/10 transition-colors">
                  <Fuel className="w-4 h-4 text-[#FACC15]" />
                </div>
                <span className="font-medium truncate">{normalizedVehicle.fuel}</span>
              </div>
            </div>

            {/* Location - Desktop seulement */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-[#FACC15] flex-shrink-0" />
              <span className="truncate">{vehicle.location}</span>
            </div>

            {/* CTA Button - Plus compact sur mobile */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#0F172A] to-[#1e293b] text-white py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-base font-medium hover:from-[#FACC15] hover:to-[#FBBF24] hover:text-[#0F172A] transition-all duration-300 shadow-lg hover:shadow-xl group/btn"
            >
              <span className="flex items-center justify-center gap-1 md:gap-2">
                <span className="hidden md:inline">Voir l'annonce</span>
                <span className="md:hidden">Voir</span>
                <Eye className="w-3 h-3 md:w-4 md:h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </div>
        </Link>

        {/* Bottom Accent Line */}
        <div className="h-0.5 md:h-1 bg-gradient-to-r from-transparent via-[#FACC15] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </Card>
    </motion.div>
  );
}