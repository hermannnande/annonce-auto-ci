import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Search,
  Filter,
  MoreVertical,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  TrendingUp,
  Users,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { useAuth } from '../../context/AuthContext';
import type { Profile } from '../../lib/supabase';
import { toast } from 'sonner';

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'vendor' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'activate' | 'delete' | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { user: currentUser } = useAuth();

  // 🆕 Charger les utilisateurs au démarrage
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { users: fetchedUsers, error } = await adminService.getAllUsers();
      
      if (error) {
        console.error('Erreur chargement utilisateurs:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
        return;
      }
      
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery));
    const matchesType = typeFilter === 'all' || user.user_type === typeFilter;
    // On ne filtre pas par status car la table profiles n'a pas de champ status
    return matchesSearch && matchesType;
  });

  const stats = {
    total: users.length,
    vendors: users.filter(u => u.user_type === 'vendor').length,
    admins: users.filter(u => u.user_type === 'admin').length,
  };

  const getTypeBadge = (type: UserProfile['user_type']) => {
    switch (type) {
      case 'vendor':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Vendeur</span>;
      case 'admin':
        return <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-medium">Admin</span>;
    }
  };

  const getStatusBadge = (status: UserProfile['status']) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Actif
          </div>
        );
      case 'suspended':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <Ban className="w-3 h-3" />
            Suspendu
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            En attente
          </div>
        );
    }
  };

  const handleAction = (user: UserProfile, action: 'suspend' | 'activate' | 'delete') => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      setProcessing(true);
      
      let result;
      switch (actionType) {
        case 'suspend':
          result = await adminService.suspendUser(selectedUser.id, 'Suspension administrative');
          toast.success(`✅ ${selectedUser.full_name} a été suspendu`);
          break;
        case 'activate':
          result = await adminService.activateUser(selectedUser.id);
          toast.success(`✅ ${selectedUser.full_name} a été activé`);
          break;
        case 'delete':
          result = await adminService.deleteUser(selectedUser.id);
          toast.success(`✅ ${selectedUser.full_name} a été supprimé`);
          break;
      }

      if (result?.error) {
        throw result.error;
      }

      // Recharger les utilisateurs
      await loadUsers();
      
    } catch (error: any) {
      console.error('Erreur action utilisateur:', error);
      toast.error(error.message || 'Erreur lors de l\'action');
    } finally {
      setProcessing(false);
      setShowActionModal(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const viewDetails = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDetailModal(true);
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
          <h1 className="text-3xl font-bold text-[#0F172A]">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-2">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total utilisateurs</p>
                <p className="text-2xl font-bold text-[#0F172A]">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Suspendus</p>
                <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
              />
            </div>

            {/* Type and Status Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                >
                  <option value="all">Tous les types</option>
                  <option value="vendor">Vendeur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="suspended">Suspendu</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Annonces
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Crédits
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-full flex items-center justify-center text-white font-bold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {user.phone}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {user.city}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(user.user_type)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{user.listings_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#FACC15]">
                        {user.credits.toLocaleString()} CFA
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewDetails(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleAction(user, 'suspend')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Suspendre"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(user, 'activate')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(user, 'delete')}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun utilisateur trouvé</p>
            </div>
          )}
        </Card>

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedUser && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowDetailModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto"
              >
                <Card className="p-6 border-0 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-[#0F172A]">Détails de l'utilisateur</h3>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {selectedUser.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#0F172A]">{selectedUser.full_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeBadge(selectedUser.user_type)}
                          {getStatusBadge(selectedUser.status)}
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                        <p className="font-semibold text-gray-900">{selectedUser.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ville</p>
                        <p className="font-semibold text-gray-900">{selectedUser.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Inscrit le</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Annonces</p>
                        <p className="font-semibold text-gray-900">{selectedUser.listings_count}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Crédits</p>
                        <p className="font-semibold text-[#FACC15]">
                          {selectedUser.credits.toLocaleString()} CFA
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      {selectedUser.status === 'active' ? (
                        <Button
                          onClick={() => {
                            setShowDetailModal(false);
                            handleAction(selectedUser, 'suspend');
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Suspendre
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setShowDetailModal(false);
                            handleAction(selectedUser, 'activate');
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Activer
                        </Button>
                      )}
                      <Button
                        onClick={() => setShowDetailModal(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Fermer
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Action Confirmation Modal */}
        <AnimatePresence>
          {showActionModal && selectedUser && actionType && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowActionModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
              >
                <Card className="p-6 border-0 shadow-2xl">
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      actionType === 'delete' ? 'bg-red-100' :
                      actionType === 'suspend' ? 'bg-orange-100' :
                      'bg-green-100'
                    }`}>
                      {actionType === 'delete' && <Trash2 className="w-8 h-8 text-red-600" />}
                      {actionType === 'suspend' && <Ban className="w-8 h-8 text-orange-600" />}
                      {actionType === 'activate' && <CheckCircle className="w-8 h-8 text-green-600" />}
                    </div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                      {actionType === 'delete' && 'Supprimer l\'utilisateur ?'}
                      {actionType === 'suspend' && 'Suspendre l\'utilisateur ?'}
                      {actionType === 'activate' && 'Activer l\'utilisateur ?'}
                    </h3>
                    <p className="text-gray-600">
                      {actionType === 'delete' && `Êtes-vous sûr de vouloir supprimer ${selectedUser.full_name} ? Cette action est irréversible.`}
                      {actionType === 'suspend' && `Êtes-vous sûr de vouloir suspendre ${selectedUser.full_name} ? Ils ne pourront plus accéder à leur compte.`}
                      {actionType === 'activate' && `Êtes-vous sûr de vouloir activer ${selectedUser.full_name} ?`}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowActionModal(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={confirmAction}
                      className={`flex-1 text-white ${
                        actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                        actionType === 'suspend' ? 'bg-orange-600 hover:bg-orange-700' :
                        'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Confirmer'
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}