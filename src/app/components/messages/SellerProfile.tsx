import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, MapPin, Star, Package, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { listingsService } from '../../services/listings.service';
import { VehicleCard } from '../VehicleCard';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SellerProfileProps {
  seller: {
    id: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    city?: string;
    created_at?: string;
  };
  onClose: () => void;
}

export function SellerProfile({ seller, onClose }: SellerProfileProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0 });

  useEffect(() => {
    loadSellerListings();
  }, [seller.id]);

  const loadSellerListings = async () => {
    setLoading(true);
    try {
      // Charger toutes les annonces du vendeur
      const allListings = await listingsService.getUserListings(seller.id);
      setListings(allListings);
      
      // Calculer les stats
      const active = allListings.filter(l => l.status === 'active').length;
      setStats({ total: allListings.length, active });
    } catch (error) {
      console.error('Erreur chargement annonces vendeur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 bg-white z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] p-4 flex items-center justify-between shadow-lg z-10">
          <h2 className="text-xl font-bold text-[#0F172A]">Profil du vendeur</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-[#0F172A] hover:bg-[#0F172A]/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Informations du vendeur */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[#0F172A]">
                    {seller.full_name?.charAt(0) || '?'}
                  </span>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#0F172A] mb-2">{seller.full_name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {seller.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#FACC15]" />
                      <a href={`tel:${seller.phone}`} className="hover:text-[#FACC15]">
                        {seller.phone}
                      </a>
                    </div>
                  )}
                  
                  {seller.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FACC15]" />
                      <span>{seller.city}</span>
                    </div>
                  )}

                  {seller.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#FACC15]" />
                      <span>
                        Membre depuis {formatDistanceToNow(new Date(seller.created_at), { locale: fr })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FACC15]">{stats.total}</div>
                <div className="text-sm text-gray-600">Annonces totales</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-gray-600">Annonces actives</div>
              </div>
            </div>
          </Card>

          {/* Annonces du vendeur */}
          <div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-[#FACC15]" />
              Annonces du vendeur ({stats.active} actives)
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-4">Chargement des annonces...</p>
              </div>
            ) : listings.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Ce vendeur n'a pas encore d'annonces</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {listings
                  .filter(listing => listing.status === 'active')
                  .map((listing) => (
                    <VehicleCard key={listing.id} vehicle={listing} />
                  ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}



