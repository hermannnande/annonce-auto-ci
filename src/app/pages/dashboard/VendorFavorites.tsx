import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { favoritesService } from '../../services/favorites.service';
import { VehicleCard } from '../../components/VehicleCard';
import { Heart, Loader2, Trash2, Eye, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';

interface FavoriteListing {
  id: string;
  listing_id: string;
  user_id: string;
  created_at: string;
  listing: {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuel: string;
    transmission: string;
    location: string;
    condition: string;
    images: string[];
    status: string;
    views: number;
    created_at: string;
  };
}

export function VendorFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { favorites: data, error } = await favoritesService.getUserFavorites(user.id);
      
      if (error) {
        console.error('Erreur chargement favoris:', error);
        toast.error('Erreur lors du chargement des favoris');
        return;
      }

      setFavorites(data as FavoriteListing[]);
    } catch (error) {
      console.error('Exception chargement favoris:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId: string) => {
    if (!user) return;

    setRemovingId(listingId);
    
    try {
      const { error } = await favoritesService.removeFavorite(user.id, listingId);
      
      if (error) {
        throw error;
      }

      // Retirer de la liste locale
      setFavorites(prev => prev.filter(fav => fav.listing_id !== listingId));
      toast.success('Retiré des favoris');
    } catch (error: any) {
      console.error('Erreur suppression favori:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="vendor">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#FACC15] mx-auto mb-4" />
            <p className="text-gray-600">Chargement de vos favoris...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
                Mes Favoris
              </h1>
              <p className="text-gray-600">
                {favorites.length} annonce{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Liste des favoris */}
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                Aucun favori
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Vous n'avez pas encore ajouté d'annonces à vos favoris. 
                Parcourez les annonces et cliquez sur ❤️ pour les sauvegarder ici.
              </p>
              <Button
                onClick={() => window.location.href = '/annonces'}
                className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] hover:from-[#FBBF24] hover:to-[#F59E0B] font-bold"
              >
                Parcourir les annonces
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                {/* Bouton supprimer */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveFavorite(favorite.listing_id)}
                  disabled={removingId === favorite.listing_id}
                  className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Retirer des favoris"
                >
                  {removingId === favorite.listing_id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </motion.button>

                {/* Badge "Ajouté le" */}
                <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FACC15]" />
                  {new Date(favorite.created_at).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </div>

                {/* Card du véhicule */}
                <VehicleCard vehicle={favorite.listing} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-white">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FACC15] mb-1">
                    {favorites.length}
                  </div>
                  <div className="text-sm text-gray-600">Favoris</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-1">
                    {favorites.reduce((sum, fav) => sum + (fav.listing?.views || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Vues totales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-1">
                    {new Intl.NumberFormat('fr-FR', {
                      notation: 'compact',
                      compactDisplay: 'short'
                    }).format(
                      favorites.reduce((sum, fav) => sum + (fav.listing?.price || 0), 0)
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Valeur totale (FCFA)</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}



