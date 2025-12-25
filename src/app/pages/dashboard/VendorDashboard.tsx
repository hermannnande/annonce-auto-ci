import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listingsService } from '../../services/listings.service';
import { statsService } from '../../services/stats.service';
import {
  Car,
  Eye,
  Heart,
  TrendingUp,
  Plus,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    soldListings: 0,
    boostedListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    averagePrice: 0
  });
  
  const [viewsData, setViewsData] = useState<Array<{ date: string; views: number }>>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Récupérer les stats détaillées depuis Supabase
      const detailedStats = await statsService.getVendorDetailedStats(user.id);
      
      setStats({
        totalListings: detailedStats.totalListings,
        activeListings: detailedStats.activeListings,
        pendingListings: detailedStats.pendingListings,
        soldListings: detailedStats.soldListings,
        boostedListings: detailedStats.boostedListings,
        totalViews: detailedStats.totalViews,
        totalFavorites: detailedStats.totalFavorites,
        averagePrice: detailedStats.averagePrice
      });

      // Données de vues par jour
      setViewsData(detailedStats.viewsData.map(v => ({ name: v.date, vues: v.views })));

      // Récupérer les annonces récentes
      const listings = await listingsService.getUserListings(user.id);
      setRecentListings(listings.slice(0, 5));
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '0 CFA';
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  if (loading) {
    return (
      <DashboardLayout userType="vendor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-[#FACC15]" />
          <p className="ml-3 text-lg text-gray-600">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
              Tableau de bord
            </h1>
            <p className="text-gray-600">
              Bienvenue sur votre espace vendeur
            </p>
          </div>
          <Link to="/dashboard/vendeur/annonces/nouvelle">
            <Button className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg hover:shadow-xl transition-all duration-300 font-bold">
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle annonce
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Annonces actives"
            value={stats.activeListings.toString()}
            change={stats.totalListings > 0 ? `${stats.totalListings} au total` : 'Aucune annonce'}
            changeType="increase"
            icon={Car}
          />
          <StatCard
            title="Vues totales"
            value={stats.totalViews.toLocaleString()}
            change={stats.activeListings > 0 ? `${Math.round(stats.totalViews / stats.activeListings)} par annonce` : '0 par annonce'}
            changeType="increase"
            icon={Eye}
            iconBg="from-blue-400 to-blue-600"
          />
          <StatCard
            title="Favoris"
            value={stats.totalFavorites.toString()}
            change={`${stats.activeListings} annonces actives`}
            changeType="increase"
            icon={Heart}
            iconBg="from-red-400 to-red-600"
          />
          <StatCard
            title="Annonces boostées"
            value={stats.boostedListings.toString()}
            icon={TrendingUp}
            iconBg="from-green-400 to-green-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views Chart */}
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Vues cette semaine
                </h3>
                <p className="text-sm text-gray-600">
                  Performance de vos annonces
                </p>
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm font-semibold">
                +24%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={viewsData}>
                <defs>
                  <linearGradient id="colorVues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                />
                <Area
                  type="monotone"
                  dataKey="vues"
                  stroke="#FACC15"
                  strokeWidth={3}
                  fill="url(#colorVues)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="text-lg font-bold text-[#0F172A] mb-6">
              Actions rapides
            </h3>
            <div className="space-y-3">
              <Link to="/dashboard/vendeur/annonces/nouvelle">
                <Button className="w-full justify-start h-14 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-semibold">
                  <Plus className="w-5 h-5 mr-3" />
                  Publier une nouvelle annonce
                </Button>
              </Link>
              <Link to="/dashboard/vendeur/booster">
                <Button className="w-full justify-start h-14 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold">
                  <Zap className="w-5 h-5 mr-3" />
                  Booster mes annonces
                </Button>
              </Link>
              <Link to="/dashboard/vendeur/recharge">
                <Button variant="outline" className="w-full justify-start h-14 border-2 border-[#FACC15] text-[#0F172A] hover:bg-[#FACC15]/10 font-semibold">
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Acheter des crédits boost
                </Button>
              </Link>
            </div>

            {/* Credit Info */}
            <div className="mt-6 p-4 bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-80">Crédits disponibles</span>
                <Zap className="w-4 h-4 text-[#FACC15]" />
              </div>
              <div className="text-2xl font-bold mb-1">2,500 CFA</div>
              <Link
                to="/dashboard/vendeur/recharge"
                className="text-xs text-[#FACC15] hover:text-[#FBBF24]"
              >
                Ajouter des crédits →
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Listings */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0F172A]">
              Mes annonces récentes
            </h3>
            <Link
              to="/dashboard/vendeur/annonces"
              className="text-sm text-[#FACC15] hover:text-[#FBBF24] font-semibold"
            >
              Voir tout →
            </Link>
          </div>

          <div className="space-y-4">
            {recentListings.map((listing) => (
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
                      <p className="text-lg font-bold text-[#FACC15]">
                        {listing.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {listing.status === 'active' ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : listing.status === 'pending' ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          En attente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                          <XCircle className="w-3 h-3" />
                          Refusée
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {listing.views} vues
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {listing.favorites} favoris
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}