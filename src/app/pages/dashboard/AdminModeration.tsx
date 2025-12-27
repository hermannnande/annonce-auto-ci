import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  Phone,
  Mail,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  TrendingUp,
  Package,
  FileCheck,
  FileX,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../../services/admin.service';
import { notificationsService } from '../../services/notifications.service';
import { useAuth } from '../../context/AuthContext';
import type { Listing } from '../../lib/supabase';

interface ListingWithUser extends Listing {
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

type SortField = 'date' | 'price' | 'title';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type PriceFilter = 'all' | 'low' | 'medium' | 'high' | 'suspicious';

export function AdminModeration() {
  const [listings, setListings] = useState<ListingWithUser[]>([]);
  const [selectedListing, setSelectedListing] = useState<ListingWithUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  const { user } = useAuth();

  // Charger les annonces au démarrage
  useEffect(() => {
    loadListings();
  }, [statusFilter]);

  const loadListings = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les annonces selon le filtre de statut
      const { listings: data, error } = statusFilter === 'pending'
        ? await adminService.getPendingListings()
        : await adminService.getAllListings();
      
      if (error) {
        console.error('Erreur chargement annonces:', error);
        toast.error('Erreur lors du chargement des annonces');
        return;
      }
      
      // Enrichir avec les infos utilisateur depuis le profil
      const enrichedListings = data.map((listing: any) => ({
        ...listing,
        user_name: listing.profile?.full_name || 'Utilisateur inconnu',
        user_email: listing.profile?.email || 'N/A',
        user_phone: listing.profile?.phone || 'N/A'
      }));
      
      setListings(enrichedListings);
      
      // Calculer les stats
      const allStats = {
        total: enrichedListings.length,
        pending: enrichedListings.filter((l: any) => l.status === 'pending').length,
        approved: enrichedListings.filter((l: any) => l.status === 'approved').length,
        rejected: enrichedListings.filter((l: any) => l.status === 'rejected').length
      };
      setStats(allStats);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
      toast.error('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (listing: ListingWithUser) => {
    if (!user) return;
    
    try {
      setProcessing(true);
      
      const { error } = await adminService.approveListing(listing.id, user.id);
      
      if (error) {
        toast.error('Erreur lors de l\'approbation');
        console.error('Erreur approbation:', error);
        return;
      }
      
      // Envoyer une notification au vendeur
      await notificationsService.notifyListingApproved(
        listing.user_id,
        listing.id,
        listing.title
      );
      
      toast.success('Annonce approuvée avec succès !');
      
      // Recharger les annonces
      await loadListings();
      setSelectedListing(null);
    } catch (error) {
      console.error('Erreur approbation:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!user || !selectedListing) return;
    
    if (!rejectReason.trim()) {
      toast.error('Veuillez indiquer la raison du rejet');
      return;
    }
    
    try {
      setProcessing(true);
      
      const { error } = await adminService.rejectListing(
        selectedListing.id,
        user.id,
        rejectReason
      );
      
      if (error) {
        toast.error('Erreur lors du rejet');
        console.error('Erreur rejet:', error);
        return;
      }
      
      // Envoyer une notification au vendeur
      await notificationsService.notifyListingRejected(
        selectedListing.user_id,
        selectedListing.id,
        selectedListing.title,
        rejectReason
      );
      
      toast.success('Annonce rejetée');
      
      // Recharger les annonces
      await loadListings();
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedListing(null);
    } catch (error) {
      console.error('Erreur rejet:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  // Filtrer les annonces selon la recherche et les filtres
  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      listing.status === statusFilter;
    
    const matchesPrice = 
      priceFilter === 'all' ||
      (priceFilter === 'low' && listing.price < 5000000) ||
      (priceFilter === 'medium' && listing.price >= 5000000 && listing.price < 15000000) ||
      (priceFilter === 'high' && listing.price >= 15000000) ||
      (priceFilter === 'suspicious' && (
        listing.price < 500000 || // Prix trop bas
        listing.price > 100000000 || // Prix trop élevé
        listing.price.toString().endsWith('000000000') // Prix suspect (ex: 4000000000000)
      ));
    
    return matchesSearch && matchesStatus && matchesPrice;
  });

  // Trier les annonces
  const sortedListings = [...filteredListings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = sortedListings.slice(startIndex, endIndex);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Modération des annonces
          </h1>
          <p className="text-gray-600">
            Gérez et validez les annonces publiées par les vendeurs
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total annonces</p>
                <p className="text-2xl font-bold text-[#0F172A]">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-[#0F172A]">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold text-[#0F172A]">{stats.approved}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <FileX className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejetées</p>
                <p className="text-2xl font-bold text-[#0F172A]">{stats.rejected}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="p-4 border-0 shadow-lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par titre, vendeur..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 h-10"
                />
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                Filtres {showFilters ? '▲' : '▼'}
              </Button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Statut
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value as StatusFilter);
                          setCurrentPage(1);
                        }}
                        className="w-full h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none"
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="approved">Approuvées</option>
                        <option value="rejected">Rejetées</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Prix
                      </label>
                      <select
                        value={priceFilter}
                        onChange={(e) => {
                          setPriceFilter(e.target.value as PriceFilter);
                          setCurrentPage(1);
                        }}
                        className="w-full h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none"
                      >
                        <option value="all">Tous les prix</option>
                        <option value="low">Bas (&lt; 5M CFA)</option>
                        <option value="medium">Moyen (5M - 15M CFA)</option>
                        <option value="high">Élevé (≥ 15M CFA)</option>
                        <option value="suspicious">🚨 Prix suspects</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Results count & sorting */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-[#0F172A]">{filteredListings.length}</span> annonce(s) trouvée(s)
            {filteredListings.length !== listings.length && (
              <span className="ml-2">sur {listings.length} total</span>
            )}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Trier par:</span>
            <Button
              onClick={() => toggleSort('date')}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              Date {sortField === 'date' && <ArrowUpDown className="w-3 h-3 ml-1" />}
            </Button>
            <Button
              onClick={() => toggleSort('price')}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              Prix {sortField === 'price' && <ArrowUpDown className="w-3 h-3 ml-1" />}
            </Button>
            <Button
              onClick={() => toggleSort('title')}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              Titre {sortField === 'title' && <ArrowUpDown className="w-3 h-3 ml-1" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Listings List */}
          <div className="space-y-4">
            {paginatedListings.map((listing) => (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card
                  className={`p-4 border-2 cursor-pointer transition-all duration-200 ${
                    selectedListing?.id === listing.id
                      ? 'border-[#FACC15] shadow-xl'
                      : 'border-gray-200 hover:border-gray-300 shadow-md'
                  }`}
                  onClick={() => setSelectedListing(listing)}
                >
                  <div className="flex gap-4">
                    <img
                      src={listing.images && listing.images.length > 0 ? listing.images[0] : 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'}
                      alt={listing.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-[#0F172A] mb-1">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Par {listing.user_name || 'Inconnu'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                          listing.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                          listing.status === 'approved' ? 'bg-green-50 text-green-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {listing.status === 'pending' && <Clock className="w-3 h-3" />}
                          {listing.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {listing.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-[#FACC15] mb-2">
                        {listing.price.toLocaleString()} CFA
                        {(listing.price < 500000 || listing.price > 100000000) && (
                          <AlertTriangle className="w-4 h-4 inline ml-2 text-red-500" title="Prix suspect" />
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {paginatedListings.length === 0 && (
              <Card className="p-8 text-center border-0 shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                  {searchQuery || statusFilter !== 'all' || priceFilter !== 'all'
                    ? 'Aucun résultat'
                    : 'Tout est à jour !'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== 'all' || priceFilter !== 'all'
                    ? 'Essayez de modifier vos filtres'
                    : 'Aucune annonce en attente de modération'}
                </p>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="p-4 border-0 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="h-9"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            className={`h-9 w-9 ${
                              currentPage === pageNum
                                ? 'bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24]'
                                : ''
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="h-9"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              {selectedListing ? (
                <motion.div
                  key={selectedListing.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-6 border-0 shadow-xl">
                    {/* Image */}
                    <img
                      src={selectedListing.images && selectedListing.images.length > 0 ? selectedListing.images[0] : 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'}
                      alt={selectedListing.title}
                      className="w-full h-64 object-cover rounded-xl mb-6"
                    />

                    {/* Title & Price */}
                    <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
                      {selectedListing.title}
                    </h2>
                    <p className="text-3xl font-bold text-[#FACC15] mb-6">
                      {selectedListing.price.toLocaleString()} CFA
                    </p>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Année</p>
                        <p className="font-semibold text-[#0F172A]">{selectedListing.year}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Kilométrage</p>
                        <p className="font-semibold text-[#0F172A]">{selectedListing.mileage} km</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Carburant</p>
                        <p className="font-semibold text-[#0F172A]">{selectedListing.fuel_type}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Transmission</p>
                        <p className="font-semibold text-[#0F172A]">{selectedListing.transmission}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h4 className="font-bold text-[#0F172A] mb-2">Description</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedListing.description || 'Aucune description'}
                      </p>
                    </div>

                    {/* Seller Info */}
                    <div className="border-t border-gray-200 pt-6 mb-6">
                      <h4 className="font-bold text-[#0F172A] mb-3">
                        Informations du vendeur
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedListing.user_name || 'Inconnu'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedListing.user_email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedListing.user_phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Soumis le {new Date(selectedListing.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleApprove(selectedListing)}
                        disabled={processing}
                        className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold disabled:opacity-50"
                      >
                        {processing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                        Approuver l'annonce
                      </Button>
                      <Button
                        onClick={() => setShowRejectModal(true)}
                        disabled={processing}
                        variant="outline"
                        className="w-full h-12 border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Refuser l'annonce
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-12 border-2"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Contacter le vendeur
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <Card className="p-8 text-center border-0 shadow-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                    Sélectionnez une annonce
                  </h3>
                  <p className="text-gray-600">
                    Cliquez sur une annonce pour voir les détails
                  </p>
                </Card>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Reject Modal */}
        <AnimatePresence>
          {showRejectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowRejectModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card className="p-6 border-0 shadow-2xl">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                      Refuser l'annonce
                    </h3>
                    <p className="text-gray-600">
                      Indiquez la raison du refus au vendeur
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Raison du refus
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Expliquez pourquoi cette annonce est refusée..."
                        className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FACC15] focus:outline-none resize-none"
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">
                        Le vendeur recevra une notification par email avec cette raison.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleReject}
                      disabled={!rejectReason.trim()}
                      className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold disabled:opacity-50"
                    >
                      Confirmer le refus
                    </Button>
                    <Button
                      onClick={() => setShowRejectModal(false)}
                      variant="outline"
                      className="w-full h-12"
                    >
                      Annuler
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}