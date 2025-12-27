import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Wallet,
  Plus,
  Minus,
  Gift,
  TrendingUp,
  User,
  DollarSign,
  CheckCircle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { creditsService } from '../../services/credits.service';

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  credits: number;
  created_at: string;
  user_type: string;
};

type ActionType = 'add' | 'remove' | 'gift' | null;

type SortField = 'name' | 'credits' | 'date';
type SortOrder = 'asc' | 'desc';
type CreditFilter = 'all' | 'low' | 'medium' | 'high';

type RecentTransaction = {
  id: string;
  user_name: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
};

export function AdminCredits() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Filtering
  const [creditFilter, setCreditFilter] = useState<CreditFilter>('all');
  
  // Transactions récentes
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreditsInCirculation: 0,
    totalCreditsPurchased: 0,
    totalCreditsSpent: 0,
    totalRevenue: 0,
    pendingTransactions: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger tous les utilisateurs (vendeurs) depuis Supabase
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'vendor')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Erreur chargement profiles:', profilesError);
        throw profilesError;
      }

      // Mapper les données
      const usersData: UserProfile[] = profiles.map(p => ({
        id: p.id,
        full_name: p.full_name || 'Utilisateur',
        email: p.email || 'Email non disponible',
        credits: p.credits || 0,
        created_at: p.created_at,
        user_type: p.user_type
      }));

      setUsers(usersData);

      // Calculer les statistiques réelles
      const totalCredits = usersData.reduce((sum, u) => sum + u.credits, 0);

      // Charger les transactions de crédits pour calculs précis (schéma réel)
      const { data: transactions, error: transError } = await supabase
        .from('credits_transactions')
        .select('amount, type, payment_status, description, created_at, user_id, profiles!inner(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!transError && transactions) {
        const completed = transactions.filter((t: any) => t.payment_status === 'completed');

        const purchases = completed
          .filter((t: any) => t.type === 'purchase' && t.amount > 0)
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        const spent = completed
          .filter((t: any) => t.type === 'boost' && t.amount < 0)
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

        setStats({
          totalUsers: usersData.length,
          totalCreditsInCirculation: totalCredits,
          totalCreditsPurchased: purchases,
          totalCreditsSpent: spent,
          totalRevenue: purchases * 100, // 100 CFA par crédit
          pendingTransactions: transactions.filter((t: any) => t.payment_status === 'pending').length
        });

        // Transactions récentes (les 10 dernières)
        const recent: RecentTransaction[] = transactions.map((t: any) => ({
          id: t.id || crypto.randomUUID(),
          user_name: t.profiles?.full_name || 'Utilisateur',
          amount: t.amount || 0,
          type: t.type || 'unknown',
          description: t.description || 'Aucune description',
          created_at: t.created_at || new Date().toISOString()
        }));
        setRecentTransactions(recent);
      } else {
        // Stats basiques si pas de transactions (ou erreur de lecture)
        setStats({
          totalUsers: usersData.length,
          totalCreditsInCirculation: totalCredits,
          totalCreditsPurchased: 0,
          totalCreditsSpent: 0,
          totalRevenue: 0,
          pendingTransactions: 0
        });
        setRecentTransactions([]);
      }

    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs selon la recherche et les filtres
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      creditFilter === 'all' ||
      (creditFilter === 'low' && user.credits < 50) ||
      (creditFilter === 'medium' && user.credits >= 50 && user.credits < 200) ||
      (creditFilter === 'high' && user.credits >= 200);
    
    return matchesSearch && matchesFilter;
  });

  // Trier les utilisateurs
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.full_name.localeCompare(b.full_name);
        break;
      case 'credits':
        comparison = a.credits - b.credits;
        break;
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !amount || !reason) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const creditsAmount = parseInt(amount);
    if (isNaN(creditsAmount) || creditsAmount <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    // Pour le retrait, on utilise un montant négatif
    const finalAmount = actionType === 'remove' ? -creditsAmount : creditsAmount;

    try {
      setProcessing(true);

      // Mettre à jour les crédits dans Supabase
      const newCredits = selectedUser.credits + finalAmount;

      if (newCredits < 0) {
        toast.error('Le solde ne peut pas être négatif');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', selectedUser.id);

      if (updateError) {
        console.error('Erreur mise à jour crédits:', updateError);
        throw updateError;
      }

      // Enregistrer la transaction dans credits_transactions (schéma réel)
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      const transactionType = actionType === 'gift' ? 'gift' : 'admin_adjustment';

      const { error: transError } = await supabase
        .from('credits_transactions')
        .insert({
          user_id: selectedUser.id,
          amount: finalAmount,
          type: transactionType,
          description: reason,
          payment_status: 'completed',
          balance_after: newCredits,
          admin_id: adminUser?.id || null,
        });

      if (transError) {
        console.error('Erreur enregistrement transaction:', transError);
        // On continue même si l'enregistrement de la transaction échoue
      }

      toast.success(
        `✅ ${actionType === 'add' ? 'Ajout' : actionType === 'remove' ? 'Retrait' : 'Don'} de ${creditsAmount} crédits réussi pour ${selectedUser.full_name}`,
        { duration: 5000 }
      );

      // Recharger les données
      await loadData();

      // Réinitialiser le formulaire
      setSelectedUser(null);
      setActionType(null);
      setAmount('');
      setReason('');

    } catch (error: any) {
      console.error('Erreur ajustement crédits:', error);
      toast.error(error.message || 'Erreur lors de l\'ajustement des crédits');
    } finally {
      setProcessing(false);
    }
  };

  const openActionDialog = (user: UserProfile, action: ActionType) => {
    setSelectedUser(user);
    setActionType(action);
    setAmount('');
    setReason('');
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setActionType(null);
    setAmount('');
    setReason('');
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
            Gestion des crédits
          </h1>
          <p className="text-gray-600">
            Gérez les crédits des vendeurs et effectuez des ajustements
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendeurs actifs</p>
                <p className="text-2xl font-bold text-[#0F172A]">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Crédits en circulation</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {stats.totalCreditsInCirculation.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {(stats.totalRevenue / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Crédits achetés</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {stats.totalCreditsPurchased.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transactions récentes */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#FACC15]" />
              <h3 className="text-lg font-bold text-[#0F172A]">
                Transactions récentes
              </h3>
            </div>
            <Button
              onClick={() => setShowTransactions(!showTransactions)}
              variant="ghost"
              size="sm"
            >
              {showTransactions ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
          
          <AnimatePresence>
            {showTransactions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucune transaction récente</p>
                ) : (
                  <div className="space-y-2">
                    {recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-[#0F172A]">{tx.user_name}</p>
                          <p className="text-sm text-gray-600">{tx.description}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount >= 0 ? '+' : ''}{tx.amount} crédits
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Filtres et recherche */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-0 shadow-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-12 h-12"
              />
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={creditFilter}
                onChange={(e) => {
                  setCreditFilter(e.target.value as CreditFilter);
                  setCurrentPage(1); // Reset to first page on filter
                }}
                className="flex-1 h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none"
              >
                <option value="all">Tous les vendeurs</option>
                <option value="low">Faibles crédits (&lt; 50)</option>
                <option value="medium">Crédits moyens (50-200)</option>
                <option value="high">Crédits élevés (≥ 200)</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Résultats count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-[#0F172A]">{filteredUsers.length}</span> vendeur(s) trouvé(s)
            {filteredUsers.length !== users.length && (
              <span className="ml-2">sur {users.length} total</span>
            )}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Trier par:</span>
            <Button
              onClick={() => toggleSort('name')}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              Nom {sortField === 'name' && <ArrowUpDown className="w-3 h-3 ml-1" />}
            </Button>
            <Button
              onClick={() => toggleSort('credits')}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              Crédits {sortField === 'credits' && <ArrowUpDown className="w-3 h-3 ml-1" />}
            </Button>
            <Button
              onClick={() => toggleSort('date')}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              Date {sortField === 'date' && <ArrowUpDown className="w-3 h-3 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Vendeur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Crédits
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Membre depuis
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Aucun vendeur trouvé
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-full flex items-center justify-center">
                            <span className="text-[#0F172A] font-bold text-sm">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-[#0F172A]">{user.full_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                          {user.credits.toLocaleString()} crédits
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('fr-FR', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => openActionDialog(user, 'add')}
                            className="h-9 bg-green-500 hover:bg-green-600 text-white"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter
                          </Button>
                          <Button
                            onClick={() => openActionDialog(user, 'remove')}
                            className="h-9 bg-red-500 hover:bg-red-600 text-white"
                            size="sm"
                          >
                            <Minus className="w-4 h-4 mr-1" />
                            Retirer
                          </Button>
                          <Button
                            onClick={() => openActionDialog(user, 'gift')}
                            className="h-9 bg-[#FACC15] hover:bg-[#FBBF24] text-[#0F172A]"
                            size="sm"
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Offrir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages} ({sortedUsers.length} résultats)
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
            </div>
          )}
        </Card>

        {/* Action Dialog */}
        <AnimatePresence>
          {selectedUser && actionType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md"
              >
                <Card className="p-6 border-0 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#0F172A]">
                      {actionType === 'add' && 'Ajouter des crédits'}
                      {actionType === 'remove' && 'Retirer des crédits'}
                      {actionType === 'gift' && 'Offrir des crédits'}
                    </h3>
                    <Button
                      onClick={closeDialog}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Vendeur</p>
                      <p className="font-bold text-[#0F172A]">{selectedUser.full_name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">Solde actuel: </span>
                        <span className="font-bold text-green-600">
                          {selectedUser.credits.toLocaleString()} crédits
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Montant (crédits)
                      </label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Ex: 100"
                        className="h-12"
                        min="1"
                      />
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Raison
                      </label>
                      <Input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Bonus de bienvenue, Correction erreur..."
                        className="h-12"
                      />
                    </div>

                    {/* Preview */}
                    {amount && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Nouveau solde: <span className="font-bold">
                            {(selectedUser.credits + 
                              (actionType === 'remove' ? -parseInt(amount) : parseInt(amount))
                            ).toLocaleString()} crédits
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={closeDialog}
                        variant="outline"
                        className="flex-1 h-12"
                        disabled={processing}
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleAction}
                        disabled={!amount || !reason || processing}
                        className={`flex-1 h-12 font-bold ${
                          actionType === 'add'
                            ? 'bg-green-500 hover:bg-green-600'
                            : actionType === 'remove'
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-[#FACC15] hover:bg-[#FBBF24] text-[#0F172A]'
                        }`}
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}