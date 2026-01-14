import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { motion } from 'motion/react';
import {
  Car,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Zap,
  Calendar,
  DollarSign,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { adminService } from '../../services/admin.service';
import { listingsService } from '../../services/listings.service';
import { cn } from '../../components/ui/utils';
import { useAuth } from '../../context/AuthContext';

interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  status: 'active' | 'pending' | 'sold' | 'rejected' | 'archived';
  is_boosted: boolean;
  boost_until: string | null;
  views: number;
  views_tracking?: Array<{ count: number }>;
  images: string[];
  created_at: string;
  user_id: string;
  profile?: {
    email: string;
    phone: string | null;
  };
}

export function AdminAllListings() {
  const { user } = useAuth();
  const [allListings, setAllListings] = useState<Listing[]>([]); // ⚡ Cache: données brutes
  const [listings, setListings] = useState<Listing[]>([]);
  const [displayedListings, setDisplayedListings] = useState<Listing[]>([]); // ⚡ Annonces affichées
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Pagination progressive
  const [currentPage, setCurrentPage] = useState(1);
  const [totalListings, setTotalListings] = useState(0);
  const listingsPerPage = 20;
  const [batchSize] = useState(20); // ⚡ Charger 20 à la fois
  const [currentBatch, setCurrentBatch] = useState(1);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'sold' | 'rejected' | 'archived'>('all');
  const [boostedFilter, setBoostedFilter] = useState<'all' | 'boosted' | 'normal'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'views' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    sold: 0,
    rejected: 0,
    boosted: 0
  });

  // ⚡ Charger progressivement par batches
  const loadAllListings = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Charger d'abord 20 annonces pour affichage rapide
      const { listings: firstBatch, error: firstError } = await adminService.getAllListings(batchSize);
      
      if (firstError) {
        console.error('Erreur chargement annonces:', firstError);
        setLoadError((firstError as any)?.message || 'Impossible de charger les annonces');
        setLoading(false);
        return;
      }

      setAllListings(firstBatch || []);
      setLoading(false);

      // Charger le reste en arrière-plan
      setTimeout(async () => {
        const { listings: allData } = await adminService.getAllListings(500);
        setAllListings(allData || firstBatch || []);
      }, 100);
    } catch (error) {
      console.error('Exception chargement annonces:', error);
      setLoading(false);
    }
  };

  // ⚡ Filtrer/trier en local (rapide)
  useEffect(() => {
    let filtered = [...allListings];

    // Filtre recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(listing =>
        (listing.title || '').toLowerCase().includes(search) ||
        (listing.brand || '').toLowerCase().includes(search) ||
        (listing.model || '').toLowerCase().includes(search) ||
        (listing.location || '').toLowerCase().includes(search)
      );
    }

    // Filtre statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(listing => listing.status === statusFilter);
    }

    // Filtre boost
    if (boostedFilter === 'boosted') {
      filtered = filtered.filter(listing => 
        listing.is_boosted && 
        listing.boost_until && 
        new Date(listing.boost_until) > new Date()
      );
    } else if (boostedFilter === 'normal') {
      filtered = filtered.filter(listing => 
        !listing.is_boosted || 
        !listing.boost_until || 
        new Date(listing.boost_until) <= new Date()
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'views':
          const aViews = Math.max(a.views || 0, a.views_tracking?.[0]?.count || 0);
          const bViews = Math.max(b.views || 0, b.views_tracking?.[0]?.count || 0);
          comparison = aViews - bViews;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Calcul stats
    setStats({
      total: filtered.length,
      pending: filtered.filter(l => l.status === 'pending').length,
      active: filtered.filter(l => l.status === 'active').length,
      sold: filtered.filter(l => l.status === 'sold').length,
      rejected: filtered.filter(l => l.status === 'rejected').length,
      boosted: filtered.filter(l => 
        l.is_boosted && 
        l.boost_until && 
        new Date(l.boost_until) > new Date()
      ).length
    });

    setTotalListings(filtered.length);

    // Pagination
    const startIndex = (currentPage - 1) * listingsPerPage;
    const endIndex = startIndex + listingsPerPage;
    const pageListings = filtered.slice(startIndex, endIndex);
    setListings(pageListings);
    
    // ⚡ Chargement progressif : afficher d'abord 2 annonces, puis le reste
    setDisplayedListings(pageListings.slice(0, 2));
    setTimeout(() => setDisplayedListings(pageListings.slice(0, 5)), 50);
    setTimeout(() => setDisplayedListings(pageListings.slice(0, 10)), 100);
    setTimeout(() => setDisplayedListings(pageListings), 150);
  }, [allListings, currentPage, searchTerm, statusFilter, boostedFilter, sortBy, sortOrder]);

  // ⚡ Charger au mount seulement
  useEffect(() => {
    loadAllListings();
  }, []);

  // Désactiver une annonce (changer statut à rejected)
  const handleDisable = async (listingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cette annonce ? (elle sera retirée du public)')) return;

    setActionLoading(listingId);
    try {
      // ⚠️ Compatibilité DB: `archived` n'est pas toujours présent dans la contrainte CHECK,
      // donc on utilise `rejected` pour retirer l'annonce du public.
      const { error } = await listingsService.updateStatus(listingId, 'rejected');
      
      if (error) {
        console.error('Erreur désactivation annonce:', error);
        toast.error((error as any)?.message || 'Erreur lors de la désactivation');
        return;
      }

      toast.success('Annonce désactivée avec succès');
      loadAllListings();
    } catch (error) {
      console.error('Exception désactivation:', error);
      toast.error((error as any)?.message || 'Erreur lors de la désactivation');
    } finally {
      setActionLoading(null);
    }
  };

  // Activer une annonce (changer statut à approved)
  const handleEnable = async (listingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir activer cette annonce ?')) return;

    setActionLoading(listingId);
    try {
      const { error } = await listingsService.updateStatus(listingId, 'active');
      
      if (error) {
        console.error('Erreur activation annonce:', error);
        toast.error((error as any)?.message || 'Erreur lors de l\'activation');
        return;
      }

      toast.success('Annonce activée avec succès');
      loadAllListings();
    } catch (error) {
      console.error('Exception activation:', error);
      toast.error((error as any)?.message || 'Erreur lors de l\'activation');
    } finally {
      setActionLoading(null);
    }
  };

  // Supprimer une annonce
  const handleDelete = async (listingId: string) => {
    if (!confirm('⚠️ ATTENTION : Êtes-vous sûr de vouloir SUPPRIMER cette annonce ? Cette action est irréversible !')) return;
    
    // Double confirmation
    const confirmText = prompt('Tapez "SUPPRIMER" en majuscules pour confirmer la suppression :');
    if (confirmText !== 'SUPPRIMER') {
      toast('Suppression annulée');
      return;
    }

    setActionLoading(listingId);
    try {
      const { error } = await adminService.deleteListing(listingId, user?.id || 'admin');
      
      if (error) {
        console.error('Erreur suppression annonce:', error);
        toast.error((error as any)?.message || 'Erreur lors de la suppression');
        return;
      }

      toast.success('Annonce supprimée avec succès');
      loadAllListings();
    } catch (error) {
      console.error('Exception suppression:', error);
      toast.error((error as any)?.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  // Voir l'annonce sur le site
  const handleViewListing = (listingId: string) => {
    window.open(`/annonces/${listingId}`, '_blank');
  };

  const totalPages = Math.ceil(totalListings / listingsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            En ligne
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
            <AlertCircle className="w-3 h-3" />
            En attente
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Rejetée
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
            <CheckCircle className="w-3 h-3" />
            Vendue
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
            <EyeOff className="w-3 h-3" />
            Archivée
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] flex items-center gap-3">
                <Car className="w-8 h-8 text-[#FACC15]" />
                Gestion des Annonces
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez toutes les annonces du site (désactivation, suppression)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 opacity-80" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">En attente</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <AlertCircle className="w-8 h-8 opacity-80" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">En ligne</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 opacity-80" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Rejetées</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 opacity-80" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Boostées</p>
                  <p className="text-2xl font-bold">{stats.boosted}</p>
                </div>
                <Zap className="w-8 h-8 opacity-80" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-[#FACC15]" />
              <h3 className="font-semibold text-[#0F172A]">Filtres</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher (titre, marque, modèle, ville...)"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Statut */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="active">En ligne</option>
                  <option value="sold">Vendues</option>
                  <option value="rejected">Rejetées</option>
                  <option value="archived">Archivées</option>
                </select>
              </div>

              {/* Boost */}
              <div>
                <select
                  value={boostedFilter}
                  onChange={(e) => {
                    setBoostedFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                >
                  <option value="all">Tous types</option>
                  <option value="boosted">Boostées</option>
                  <option value="normal">Normales</option>
                </select>
              </div>
            </div>

            {/* Tri */}
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm text-gray-600">Trier par :</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'date', label: 'Date' },
                  { value: 'price', label: 'Prix' },
                  { value: 'views', label: 'Vues' },
                  { value: 'title', label: 'Titre' }
                ].map((sort) => (
                  <button
                    key={sort.value}
                    onClick={() => {
                      if (sortBy === sort.value) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(sort.value as any);
                        setSortOrder('desc');
                      }
                    }}
                    className={cn(
                      "px-3 py-1 text-sm rounded-full transition-colors",
                      sortBy === sort.value
                        ? "bg-[#FACC15] text-[#0F172A] font-medium"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {sort.label} {sortBy === sort.value && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Liste des annonces */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0F172A]">
                Annonces ({totalListings})
              </h3>
              <span className="text-sm text-gray-500">
                Page {currentPage} sur {totalPages || 1}
              </span>
            </div>

            {loadError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {loadError}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
              </div>
            ) : displayedListings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune annonce trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={listing.images?.[0] || '/placeholder-car.jpg'}
                          alt={listing.title}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-[#0F172A] truncate">
                                {listing.title}
                              </h4>
                              {listing.is_boosted && listing.boost_until && new Date(listing.boost_until) > new Date() && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                                  <Zap className="w-3 h-3" />
                                  Boostée
                                </span>
                              )}
                              {getStatusBadge(listing.status)}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Car className="w-4 h-4" />
                                <span>{listing.brand} {listing.model}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{listing.year}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-[#0F172A]">
                                  {listing.price.toLocaleString()} FCFA
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {(() => {
                                  const uniques = listing.views_tracking?.[0]?.count ?? 0;
                                  const total = listing.views ?? 0;
                                  const displayTotal = Math.max(total, uniques);
                                  return (
                                    <span>
                                      {displayTotal.toLocaleString('fr-FR')} vues
                                      {uniques > 0 && (
                                        <span className="text-gray-400"> • {uniques.toLocaleString('fr-FR')} uniques</span>
                                      )}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {listing.location}
                              </div>
                              {listing.profile?.email && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {listing.profile.email}
                                </div>
                              )}
                              <div>
                                Publiée le {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewListing(listing.id)}
                              className="whitespace-nowrap"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Voir
                            </Button>

                            {listing.status === 'active' || listing.status === 'pending' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDisable(listing.id)}
                                disabled={actionLoading === listing.id}
                                className="whitespace-nowrap text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              >
                                {actionLoading === listing.id ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <EyeOff className="w-4 h-4 mr-1" />
                                )}
                                Désactiver
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEnable(listing.id)}
                                disabled={actionLoading === listing.id}
                                className="whitespace-nowrap text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                {actionLoading === listing.id ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Eye className="w-4 h-4 mr-1" />
                                )}
                                Activer
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(listing.id)}
                              disabled={actionLoading === listing.id}
                              className="whitespace-nowrap text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {actionLoading === listing.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 mr-1" />
                              )}
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium px-3">
                    {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

