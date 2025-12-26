import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BoostModal } from '../../components/modals/BoostModal';
import { useAuth } from '../../context/AuthContext';
import { listingsService } from '../../services/listings.service';
import type { Listing as SupabaseListing } from '../../lib/supabase';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface Listing extends SupabaseListing {
  favorites?: number;
  messages?: number;
}

export function VendorListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected' | 'sold'>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // État pour le modal de boost
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [listingToBoost, setListingToBoost] = useState<Listing | null>(null);

  // Charger les annonces de l'utilisateur connecté
  useEffect(() => {
    if (user) {
      loadUserListings();
    }
  }, [user]);

  const loadUserListings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userListings = await listingsService.getUserListings(user.id);
      setListings(userListings as Listing[]);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
      toast.error('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = (listing: Listing) => {
    setListingToDelete(listing);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!listingToDelete || !user) return;

    try {
      const { error } = await listingsService.deleteListing(listingToDelete.id, user.id);
      
      if (error) {
        toast.error(error.message || 'Erreur lors de la suppression');
        return;
      }
      
      await loadUserListings();
      toast.success('Annonce supprimée avec succès');
      setDeleteModalOpen(false);
      setListingToDelete(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleStatusChange = (listingId: string, newStatus: 'active' | 'sold') => {
    try {
      const allListingsStr = localStorage.getItem('annonceauto_demo_listings');
      const allListings = allListingsStr ? JSON.parse(allListingsStr) : [];
      
      const updatedListings = allListings.map((l: any) => 
        l.id === listingId ? { ...l, status: newStatus } : l
      );
      
      localStorage.setItem('annonceauto_demo_listings', JSON.stringify(updatedListings));
      loadUserListings();
      
      toast.success(newStatus === 'sold' ? 'Annonce marquée comme vendue' : 'Annonce réactivée');
    } catch (error) {
      console.error('Erreur changement statut:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  // Fonction pour ouvrir le modal de boost
  const handleOpenBoostModal = (listing: Listing) => {
    setListingToBoost(listing);
    setBoostModalOpen(true);
  };

  // Fonction appelée après un boost réussi
  const handleBoostSuccess = () => {
    loadUserListings(); // Recharger les annonces
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Listing['status']) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Active
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            En attente
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Refusée
          </div>
        );
      case 'sold':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Vendue
          </div>
        );
    }
  };

  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Mes annonces</h1>
            <p className="text-gray-600 mt-2">
              Gérez toutes vos annonces en un seul endroit
            </p>
          </div>
          <Link to="/dashboard/vendeur/publier">
            <Button className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle annonce
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total annonces</p>
                <p className="text-2xl font-bold text-[#0F172A]">{listings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Actives</p>
                <p className="text-2xl font-bold text-green-600">
                  {listings.filter(l => l.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {listings.filter(l => l.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Boostées</p>
                <p className="text-2xl font-bold text-purple-600">
                  {listings.filter(l => l.boosted).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une annonce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
              {(['all', 'active', 'pending', 'rejected', 'sold'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    statusFilter === status
                      ? 'bg-white text-[#0F172A] shadow-md'
                      : 'text-gray-600 hover:text-[#0F172A]'
                  }`}
                >
                  {status === 'all' && 'Toutes'}
                  {status === 'active' && 'Actives'}
                  {status === 'pending' && 'En attente'}
                  {status === 'rejected' && 'Refusées'}
                  {status === 'sold' && 'Vendues'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Listings Grid */}
        {loading ? (
          <Card className="p-12 border-0 shadow-lg text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                Chargement...
              </h3>
              <p className="text-gray-600 mb-6">
                Veuillez patienter pendant que nous chargeons vos annonces
              </p>
            </div>
          </Card>
        ) : filteredListings.length === 0 ? (
          <Card className="p-12 border-0 shadow-lg text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                Aucune annonce trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos filtres ou créez une nouvelle annonce
              </p>
              <Link to="/dashboard/vendeur/annonces/nouvelle">
                <Button className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold">
                  <Plus className="w-5 h-5 mr-2" />
                  Créer une annonce
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden border border-gray-200 hover:border-[#FACC15] transition-all duration-300 group bg-white">
                  {/* Image compacte */}
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    <img
                      src={listing.images && listing.images.length > 0 ? listing.images[0] : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Badges compacts en haut */}
                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                      {/* Badge Boosté */}
                      {(listing.boosted || listing.is_boosted) && (
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1 shadow-lg">
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Boosté</span>
                        </div>
                      )}
                      
                      {/* Badge statut */}
                      <div className="ml-auto">
                        {getStatusBadge(listing.status)}
                      </div>
                    </div>

                    {/* Overlay avec stats au survol */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-3 text-white text-xs">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{listing.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(listing.created_at || '2024-12-01').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenu compact */}
                  <div className="p-3">
                    {/* Titre et prix */}
                    <div className="mb-3">
                      <h3 className="text-sm font-bold text-[#0F172A] mb-1 line-clamp-1 group-hover:text-[#FACC15] transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-xl font-bold text-[#FACC15]">
                        {listing.price.toLocaleString()} <span className="text-sm">CFA</span>
                      </p>
                    </div>

                    {/* Actions compactes */}
                    <div className="flex items-center gap-2">
                      {/* Bouton Statistiques */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/dashboard/vendeur/annonces/${listing.id}/stats`)}
                        className="flex-1 h-8 text-xs border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-600"
                        title="Voir les statistiques"
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Stats
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/dashboard/vendeur/annonces/modifier/${listing.id}`)}
                        className="flex-1 h-8 text-xs border-gray-300 hover:border-[#FACC15] hover:bg-[#FACC15]/10"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Modifier
                      </Button>
                      
                      {!listing.is_boosted && listing.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenBoostModal(listing)}
                          className="flex-1 h-8 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          <Zap className="w-3 h-3 mr-1 fill-current" />
                          Booster
                        </Button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteListing(listing)}
                        className="h-8 w-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteModalOpen && listingToDelete && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setDeleteModalOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
              >
                <Card className="p-6 border-0 shadow-2xl">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                      Supprimer l'annonce ?
                    </h3>
                    <p className="text-gray-600">
                      Êtes-vous sûr de vouloir supprimer "{listingToDelete.title}" ? Cette action est irréversible.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteModalOpen(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={confirmDelete}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Supprimer
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Boost Modal */}
        {listingToBoost && (
          <BoostModal
            isOpen={boostModalOpen}
            onClose={() => {
              setBoostModalOpen(false);
              setListingToBoost(null);
            }}
            listing={listingToBoost}
            onBoostSuccess={handleBoostSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}