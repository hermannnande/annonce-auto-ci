import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { StatCard } from '../../components/dashboard/StatCard';
import { useAuth } from '../../context/AuthContext';
import { statsService } from '../../services/stats.service';
import { listingsService } from '../../services/listings.service';
import {
  Eye,
  Heart,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Share2,
  MousePointer,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function VendorStats() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalFavorites: 0,
    avgViewsPerDay: 0,
  });
  const [viewsOverTime, setViewsOverTime] = useState<any[]>([]);
  const [listingPerformance, setListingPerformance] = useState<any[]>([]);
  
  // Données mockées pour sources et villes (à implémenter plus tard)
  const sourceData = [
    { name: 'Recherche', value: 45, color: '#FACC15' },
    { name: 'Page d\'accueil', value: 30, color: '#0F172A' },
    { name: 'Direct', value: 10, color: '#10b981' },
    { name: 'Autre', value: 15, color: '#3b82f6' },
  ];

  const locationData = [
    { ville: 'Abidjan', visiteurs: 0 },
    { ville: 'Bouaké', visiteurs: 0 },
    { ville: 'Yamoussoukro', visiteurs: 0 },
    { ville: 'Daloa', visiteurs: 0 },
  ];

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Récupérer les stats détaillées
      const detailedStats = await statsService.getVendorDetailedStats(user.id);

      setStats({
        totalViews: detailedStats.totalViews,
        totalFavorites: detailedStats.totalFavorites,
        avgViewsPerDay: detailedStats.totalViews > 0 ? Math.round(detailedStats.totalViews / 7) : 0,
      });

      // Préparer les données de vues
      const viewsData = detailedStats.viewsData.map(v => ({
        date: v.date,
        vues: v.views,
        clics: Math.round(v.views * 0.38), // Estimation du taux de clic
      }));
      setViewsOverTime(viewsData);

      // Charger les annonces pour la performance
      const listings = await listingsService.getUserListings(user.id);
      const performanceData = listings
        .filter(l => l.status === 'active')
        .slice(0, 5)
        .map(l => ({
          id: l.id,
          name: l.title,
          vues: l.views || 0,
          favoris: 0, // TODO: compter les favoris
          clics: Math.round((l.views || 0) * 0.38),
        }));
      setListingPerformance(performanceData);

    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalClicks = viewsOverTime.reduce((sum, d) => sum + d.clics, 0);
  const clickRate = stats.totalViews > 0 ? Math.round((totalClicks / stats.totalViews) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout userType="vendor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-[#FACC15]" />
          <p className="ml-3 text-lg text-gray-600">Chargement des statistiques...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Statistiques détaillées
          </h1>
          <p className="text-gray-600">
            Analysez les performances de vos annonces
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Vues totales (7j)"
            value={stats.totalViews.toLocaleString()}
            change={`${stats.avgViewsPerDay}/jour`}
            changeType="neutral"
            icon={Eye}
            iconBg="from-blue-400 to-blue-600"
          />
          <StatCard
            title="Clics totaux"
            value={totalClicks.toString()}
            change={`${clickRate}% taux de clic`}
            changeType="increase"
            icon={MousePointer}
          />
          <StatCard
            title="Favoris"
            value={stats.totalFavorites.toString()}
            change="+8 cette semaine"
            changeType="increase"
            icon={Heart}
            iconBg="from-red-400 to-red-600"
          />
          <StatCard
            title="Partages"
            value="23"
            change="+5 cette semaine"
            changeType="increase"
            icon={Share2}
            iconBg="from-green-400 to-green-600"
          />
        </div>

        {/* Views & Clicks Chart */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Vues et clics (7 derniers jours)
              </h3>
              <p className="text-sm text-gray-600">
                Évolution quotidienne de l'engagement
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={viewsOverTime}>
              <defs>
                <linearGradient id="colorVues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="vues"
                stroke="#FACC15"
                strokeWidth={3}
                fill="url(#colorVues)"
                name="Vues"
              />
              <Area
                type="monotone"
                dataKey="clics"
                stroke="#0F172A"
                strokeWidth={3}
                fill="url(#colorClics)"
                name="Clics"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Sources */}
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="text-lg font-bold text-[#0F172A] mb-6">
              Sources de trafic
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value}%)`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Geographic Distribution */}
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="text-lg font-bold text-[#0F172A] mb-6">
              Visiteurs par ville
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis dataKey="ville" type="category" stroke="#6B7280" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="visiteurs" fill="#FACC15" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Listing Performance */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-bold text-[#0F172A] mb-6">
            Performance par annonce
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">
                    Annonce
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">
                    Vues
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">
                    Favoris
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">
                    Clics
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">
                    Taux d'engagement
                  </th>
                </tr>
              </thead>
              <tbody>
                {listingPerformance.map((listing, index) => {
                  const engagementRate = Math.round(((listing.favoris + listing.clics) / listing.vues) * 100);
                  return (
                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#0F172A]">
                          {listing.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-[#0F172A]">
                            {listing.vues}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-semibold text-[#0F172A]">
                            {listing.favoris}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <MousePointer className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold text-[#0F172A]">
                            {listing.clics}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex-1 max-w-24">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#FACC15] to-[#FBBF24]"
                                style={{ width: `${engagementRate}%` }}
                              />
                            </div>
                          </div>
                          <span className="font-bold text-[#FACC15] text-sm min-w-[3rem] text-right">
                            {engagementRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-green-900 mb-2">
                  Performance excellente !
                </h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  Vos annonces ont 45% plus de vues que la moyenne des vendeurs cette semaine. Continuez ainsi !
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-2">
                  Meilleur moment pour publier
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Vos annonces reçoivent le plus de vues entre 14h et 18h. Publiez à ces heures pour maximiser l'impact.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
