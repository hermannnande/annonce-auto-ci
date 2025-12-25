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

export function AdminModeration() {
  const [listings, setListings] = useState<ListingWithUser[]>([]);
  const [selectedListing, setSelectedListing] = useState<ListingWithUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'rejected'>('pending');
  const { user } = useAuth();

  // Charger les annonces en attente au démarrage
  useEffect(() => {
    loadPendingListings();
  }, [statusFilter]);

  const loadPendingListings = async () => {
    try {
      setLoading(true);
      
      const { listings: data, error } = await adminService.getPendingListings();
      
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
      await loadPendingListings();
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
      await loadPendingListings();
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

  const filteredListings = listings.filter(listing => 
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {listings.length} annonce{listings.length > 1 ? 's' : ''} en attente de validation
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="p-4 border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par titre, vendeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Listings List */}
          <div className="space-y-4">
            {filteredListings.map((listing) => (
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
                        <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-[#FACC15] mb-2">
                        {listing.price.toLocaleString()} CFA
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filteredListings.length === 0 && (
              <Card className="p-8 text-center border-0 shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                  Tout est à jour !
                </h3>
                <p className="text-gray-600">
                  Aucune annonce en attente de modération
                </p>
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