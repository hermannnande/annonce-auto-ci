import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { statsService } from '../../services/stats.service';
import {
  Users,
  Car,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Zap,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    rejectedListings: 0,
    totalRevenue: 0,
    totalViews: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [listingsStatusData, setListingsStatusData] = useState<any[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger les stats globales
      const globalStats = await statsService.getGlobalStats();
      setStats({
        totalUsers: globalStats.totalUsers,
        totalListings: globalStats.totalListings,
        activeListings: globalStats.activeListings,
        pendingListings: globalStats.pendingListings,
        rejectedListings: globalStats.rejectedListings,
        totalRevenue: globalStats.totalRevenue,
        totalViews: globalStats.totalViews,
      });

      // Charger les données de revenus
      const revenue = await statsService.getRevenueData(6);
      setRevenueData(revenue.map(r => ({
        name: r.date,
        revenus: r.revenue,
        boost: r.boosts
      })));

      // Préparer les données de statut des annonces
      setListingsStatusData([
        { name: 'Actives', value: globalStats.activeListings, color: '#22c55e' },
        { name: 'En attente', value: globalStats.pendingListings, color: '#eab308' },
        { name: 'Refusées', value: globalStats.rejectedListings, color: '#ef4444' },
      ]);

      // Charger les annonces en attente
      const pending = await statsService.getPendingListings(3);
      setPendingListings(pending);

      // Charger les transactions récentes
      const transactions = await statsService.getRecentTransactions(5);
      setRecentTransactions(transactions);

    } catch (error) {
      console.error('Erreur chargement dashboard admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-[#FACC15]" />
          <p className="ml-3 text-lg text-gray-600">Chargement des statistiques...</p>
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
            Tableau de bord Administrateur
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de la plateforme annonceauto.ci
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Utilisateurs actifs"
            value={stats.totalUsers.toString()}
            change={`${stats.totalListings} annonces`}
            changeType="neutral"
            icon={Users}
            iconBg="from-blue-400 to-blue-600"
          />
          <StatCard
            title="Annonces totales"
            value={stats.totalListings.toString()}
            change={`${stats.activeListings} actives`}
            changeType="increase"
            icon={Car}
          />
          <StatCard
            title="Revenus totaux"
            value={formatPrice(stats.totalRevenue)}
            change={`${stats.totalViews} vues totales`}
            changeType="increase"
            icon={DollarSign}
            iconBg="from-green-400 to-green-600"
          />
          <StatCard
            title="En attente"
            value={stats.pendingListings.toString()}
            change="Modération requise"
            changeType="neutral"
            icon={Clock}
            iconBg="from-yellow-400 to-yellow-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Revenus mensuels
                </h3>
                <p className="text-sm text-gray-600">
                  6 derniers mois
                </p>
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm font-semibold">
                Total: {formatPrice(stats.totalRevenue)}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => formatPrice(value)}
                />
                <Bar dataKey="revenus" fill="#FACC15" radius={[8, 8, 0, 0]} />
                <Bar dataKey="boost" fill="#0F172A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FACC15] rounded-full"></div>
                <span className="text-sm text-gray-600">Revenus totaux</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#0F172A] rounded-full"></div>
                <span className="text-sm text-gray-600">Boost</span>
              </div>
            </div>
          </Card>

          {/* Listings Status Pie */}
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="text-lg font-bold text-[#0F172A] mb-6">
              Statut des annonces
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={listingsStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {listingsStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {listingsStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pending Moderation */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Annonces en attente de modération
              </h3>
              <p className="text-sm text-gray-600">
                {pendingListings.length} annonces nécessitent votre attention
              </p>
            </div>
            <Link to="/dashboard/admin/moderation">
              <Button className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold">
                <AlertCircle className="w-4 h-4 mr-2" />
                Tout voir
              </Button>
            </Link>
          </div>

          {pendingListings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p>Aucune annonce en attente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={listing.images && listing.images.length > 0 ? listing.images[0] : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'}
                    alt={listing.title}
                    className="w-full sm:w-32 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-[#0F172A] mb-1">
                          {listing.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Par {listing.profiles?.full_name || listing.profiles?.email} • {getTimeAgo(listing.created_at)}
                        </p>
                        <p className="text-lg font-bold text-[#FACC15] mt-1">
                          {formatPrice(listing.price)}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        En attente
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/dashboard/admin/moderation`}>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0F172A]">
              Transactions récentes
            </h3>
            <Link
              to="/dashboard/admin/credits"
              className="text-sm text-[#FACC15] hover:text-[#FBBF24] font-semibold"
            >
              Voir tout →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Aucune transaction récente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Utilisateur
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Type
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                      Montant
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#0F172A]">
                          {transaction.profiles?.full_name || transaction.profiles?.email}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'purchase' ? (
                            <DollarSign className="w-4 h-4 text-green-500" />
                          ) : (
                            <Zap className="w-4 h-4 text-purple-500" />
                          )}
                          <span className="text-sm text-gray-600 capitalize">{transaction.type === 'purchase' ? 'Recharge' : 'Boost'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} CFA
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {getTimeAgo(transaction.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
