import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Search,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Smartphone,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

// Types
interface Transaction {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  type: string;
  amount: number;
  montant_fcfa: number;
  payment_status: string;
  payment_method: string;
  payment_reference: string;
  description: string;
  balance_after: number;
  created_at: string;
}

interface DailyRevenue {
  date: string;
  revenus: number;
  transactions: number;
}

interface Stats {
  totalRevenue: number;
  totalTransactions: number;
  pendingAmount: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  successRate: number;
  revenueChange: number | null;
}

const ITEMS_PER_PAGE = 15;

export function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalTransactions: 0,
    pendingAmount: 0,
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0,
    successRate: 0,
    revenueChange: null,
  });
  const [revenueData, setRevenueData] = useState<DailyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  // Recharger quand le filtre ou la page change
  useEffect(() => {
    loadTransactions();
  }, [filterStatus, currentPage, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadRevenueChart(),
        loadTransactions(),
      ]);
    } catch (error) {
      console.error('Erreur chargement données paiements:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Charger TOUTES les transactions pour les stats globales
      const { data: allTx, error } = await supabase
        .from('credits_transactions')
        .select('amount, type, payment_status, payment_method, created_at');

      if (error) throw error;
      if (!allTx) return;

      // Filtrer les transactions de type "purchase" (paiements réels)
      const purchases = allTx.filter(t => t.type === 'purchase');

      const completed = purchases.filter(t => t.payment_status === 'completed');
      const pending = purchases.filter(t => t.payment_status === 'pending');
      const failed = purchases.filter(t => t.payment_status === 'failed');

      const totalRevenue = completed.reduce((sum, t) => sum + (t.amount || 0) * 100, 0); // crédits * 100 = FCFA
      const pendingAmount = pending.reduce((sum, t) => sum + (t.amount || 0) * 100, 0);
      const successRate = purchases.length > 0
        ? Math.round((completed.length / purchases.length) * 100)
        : 0;

      // Calculer le changement sur 7 jours
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const thisWeekRevenue = completed
        .filter(t => new Date(t.created_at) >= sevenDaysAgo)
        .reduce((sum, t) => sum + (t.amount || 0) * 100, 0);

      const lastWeekRevenue = completed
        .filter(t => {
          const d = new Date(t.created_at);
          return d >= fourteenDaysAgo && d < sevenDaysAgo;
        })
        .reduce((sum, t) => sum + (t.amount || 0) * 100, 0);

      const revenueChange = lastWeekRevenue > 0
        ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
        : thisWeekRevenue > 0 ? 100 : null;

      setStats({
        totalRevenue,
        totalTransactions: purchases.length,
        pendingAmount,
        pendingCount: pending.length,
        completedCount: completed.length,
        failedCount: failed.length,
        successRate,
        revenueChange,
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const loadRevenueChart = async () => {
    try {
      // Charger les transactions complétées des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: chartTx, error } = await supabase
        .from('credits_transactions')
        .select('amount, created_at')
        .eq('type', 'purchase')
        .eq('payment_status', 'completed')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Grouper par jour (derniers 14 jours)
      const dailyMap = new Map<string, { revenus: number; transactions: number }>();
      const today = new Date();

      // Initialiser les 14 derniers jours
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        dailyMap.set(key, { revenus: 0, transactions: 0 });
      }

      // Remplir avec les données réelles
      (chartTx || []).forEach(tx => {
        const d = new Date(tx.created_at);
        const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        if (dailyMap.has(key)) {
          const entry = dailyMap.get(key)!;
          entry.revenus += (tx.amount || 0) * 100; // crédits * 100 = FCFA
          entry.transactions += 1;
        }
      });

      const chartData: DailyRevenue[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        revenus: data.revenus,
        transactions: data.transactions,
      }));

      setRevenueData(chartData);
    } catch (error) {
      console.error('Erreur chargement graphique revenus:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      // Construire la requête de base
      let query = supabase
        .from('credits_transactions')
        .select('*, profiles!inner(full_name, email)', { count: 'exact' })
        .eq('type', 'purchase')
        .order('created_at', { ascending: false });

      // Filtre par statut
      if (filterStatus !== 'all') {
        query = query.eq('payment_status', filterStatus);
      }

      // Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Mapper les données
      const mapped: Transaction[] = (data || []).map((tx: any) => ({
        id: tx.id,
        user_id: tx.user_id,
        user_name: tx.profiles?.full_name || 'Utilisateur',
        user_email: tx.profiles?.email || '',
        type: tx.type,
        amount: tx.amount || 0,
        montant_fcfa: (tx.amount || 0) * 100,
        payment_status: tx.payment_status || 'pending',
        payment_method: tx.payment_method || 'inconnu',
        payment_reference: tx.payment_reference || '',
        description: tx.description || '',
        balance_after: tx.balance_after || 0,
        created_at: tx.created_at,
      }));

      // Filtrer par recherche côté client (nom, email, référence)
      const filtered = searchQuery
        ? mapped.filter(t =>
            t.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.payment_reference.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : mapped;

      setTransactions(filtered);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMethod = (method: string) => {
    const map: Record<string, string> = {
      payfonte: 'Payfonte (Mobile Money)',
      orange_money: 'Orange Money',
      mtn_money: 'MTN Mobile Money',
      moov_money: 'Moov Money',
      wave: 'Wave',
    };
    return map[method] || method || 'Mobile Money';
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      purchase: 'Recharge crédits',
      boost: 'Boost annonce',
      gift: 'Cadeau admin',
      admin_adjustment: 'Ajustement admin',
      refund: 'Remboursement',
    };
    return map[type] || type;
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleExport = () => {
    // Export CSV des transactions
    if (transactions.length === 0) {
      toast.error('Aucune transaction à exporter');
      return;
    }

    const headers = ['ID', 'Utilisateur', 'Email', 'Type', 'Crédits', 'Montant FCFA', 'Statut', 'Méthode', 'Référence', 'Date'];
    const rows = transactions.map(t => [
      t.id,
      t.user_name,
      t.user_email,
      getTypeLabel(t.type),
      t.amount,
      t.montant_fcfa,
      t.payment_status,
      formatMethod(t.payment_method),
      t.payment_reference,
      formatDate(t.created_at),
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements_annonceauto_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#FACC15] mx-auto" />
            <p className="text-gray-600">Chargement des paiements...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
              Gestion des paiements
            </h1>
            <p className="text-gray-600">
              Suivez toutes les transactions et revenus en temps réel
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => { setLoading(true); loadData(); }}
              className="font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button
              onClick={handleExport}
              className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
            >
              <Download className="w-5 h-5 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card className="p-5 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {stats.totalRevenue.toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-500">F</span>
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {stats.totalTransactions}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.completedCount} réussie{stats.completedCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {stats.pendingAmount.toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-500">F</span>
                </p>
                <p className="text-xs text-gray-500">
                  {stats.pendingCount} transaction{stats.pendingCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                stats.successRate >= 50 
                  ? 'bg-gradient-to-br from-purple-400 to-purple-600' 
                  : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}>
                {stats.successRate >= 50 
                  ? <CheckCircle className="w-6 h-6 text-white" /> 
                  : <AlertTriangle className="w-6 h-6 text-white" />
                }
              </div>
              <div>
                <p className="text-sm text-gray-600">Taux de succès</p>
                <p className={`text-2xl font-bold ${stats.successRate >= 50 ? 'text-[#0F172A]' : 'text-red-600'}`}>
                  {stats.successRate}%
                </p>
                {stats.failedCount > 0 && (
                  <p className="text-xs text-red-500">
                    {stats.failedCount} échouée{stats.failedCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Alerte taux de succès faible */}
        {stats.successRate < 50 && stats.totalTransactions > 0 && (
          <Card className="p-4 border-2 border-orange-300 bg-orange-50 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-800">Taux de succès faible ({stats.successRate}%)</p>
                <p className="text-sm text-orange-700 mt-1">
                  {stats.pendingCount} transaction{stats.pendingCount > 1 ? 's' : ''} en attente sur {stats.totalTransactions}.
                  Vérifiez que le webhook Payfonte est correctement configuré et que les paiements sont finalisés.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Revenue Chart */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Revenus des 14 derniers jours
              </h3>
              <p className="text-sm text-gray-600">
                Évolution quotidienne (paiements complétés)
              </p>
            </div>
            {stats.revenueChange !== null && (
              <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                stats.revenueChange >= 0 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-red-50 text-red-600'
              }`}>
                {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% vs sem. préc.
              </div>
            )}
          </div>
          {revenueData.some(d => d.revenus > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Revenus']}
                />
                <Line
                  type="monotone"
                  dataKey="revenus"
                  stroke="#FACC15"
                  strokeWidth={3}
                  dot={{ fill: '#FACC15', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
              <Wallet className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">Aucun revenu sur cette période</p>
            </div>
          )}
        </Card>

        {/* Filters */}
        <Card className="p-4 border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom, email ou référence..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
                className={filterStatus === 'all' ? 'bg-[#0F172A] text-white' : ''}
                size="sm"
              >
                Tout ({stats.totalTransactions})
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => { setFilterStatus('completed'); setCurrentPage(1); }}
                className={filterStatus === 'completed' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Réussi ({stats.completedCount})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => { setFilterStatus('pending'); setCurrentPage(1); }}
                className={filterStatus === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''}
                size="sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                En attente ({stats.pendingCount})
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                onClick={() => { setFilterStatus('failed'); setCurrentPage(1); }}
                className={filterStatus === 'failed' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Échoué ({stats.failedCount})
              </Button>
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-bold text-gray-700">
                    Référence
                  </th>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-bold text-gray-700">
                    Utilisateur
                  </th>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-bold text-gray-700 hidden md:table-cell">
                    Méthode
                  </th>
                  <th className="text-right py-4 px-4 md:px-6 text-sm font-bold text-gray-700">
                    Montant
                  </th>
                  <th className="text-center py-4 px-4 md:px-6 text-sm font-bold text-gray-700">
                    Statut
                  </th>
                  <th className="text-left py-4 px-4 md:px-6 text-sm font-bold text-gray-700 hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 md:px-6">
                      <div>
                        <p className="font-mono text-xs font-semibold text-[#0F172A] truncate max-w-[140px] md:max-w-none">
                          {transaction.payment_reference || transaction.id.slice(0, 8)}
                        </p>
                        <p className="font-mono text-xs text-gray-400 truncate max-w-[140px]">
                          {transaction.id.slice(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6">
                      <div>
                        <p className="font-semibold text-[#0F172A] text-sm">
                          {transaction.user_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[160px]">
                          {transaction.user_email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatMethod(transaction.payment_method)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6 text-right">
                      <div>
                        <p className="font-bold text-[#0F172A] text-base md:text-lg">
                          {transaction.montant_fcfa.toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-500">F</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.amount} crédits
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6 text-center">
                      {transaction.payment_status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold whitespace-nowrap">
                          <CheckCircle className="w-3 h-3" />
                          Complété
                        </span>
                      )}
                      {transaction.payment_status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-semibold whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          En attente
                        </span>
                      )}
                      {transaction.payment_status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold whitespace-nowrap">
                          <XCircle className="w-3 h-3" />
                          Échoué
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 md:px-6 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(transaction.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium">Aucune transaction trouvée</p>
              <p className="text-sm text-gray-400 mt-1">
                {filterStatus !== 'all' 
                  ? 'Essayez un autre filtre' 
                  : 'Les transactions de paiement apparaîtront ici'
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} ({totalCount} transaction{totalCount > 1 ? 's' : ''})
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium px-2">{currentPage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
