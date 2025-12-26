import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { analyticsService } from '../../../services/analytics.service';
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  BarChart3,
  Zap,
  Users,
  Target,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#FACC15', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface ListingStats {
  listing_id: string;
  user_id: string;
  title: string;
  total_views: number;
  views_today: number;
  views_yesterday: number;
  views_this_week: number;
  unique_visitors: number;
  total_favorites: number;
  total_conversations: number;
  conversion_rate: number;
  last_view_at: string;
  avg_views_per_day: number;
}

export function ListingStatsPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ListingStats | null>(null);
  const [evolution, setEvolution] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [weekdayStats, setWeekdayStats] = useState<any[]>([]);

  useEffect(() => {
    if (listingId) {
      loadStats();
    }
  }, [listingId]);

  const loadStats = async () => {
    if (!listingId) return;

    setLoading(true);
    try {
      const result = await analyticsService.getAllListingStats(listingId);
      
      setStats(result.stats);
      setEvolution(result.evolution || []);
      setPeakHours(result.peakHours || []);
      setWeekdayStats(result.weekdayStats || []);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 animate-spin text-[#FACC15]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Aucune statistique disponible</p>
          <Button onClick={() => navigate('/dashboard/vendeur/annonces')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux annonces
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculer la tendance (aujourd'hui vs hier)
  const viewsTrend = stats.views_today - stats.views_yesterday;
  const viewsTrendPercent = stats.views_yesterday > 0 
    ? ((viewsTrend / stats.views_yesterday) * 100).toFixed(1) 
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/vendeur/annonces')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux annonces
            </Button>
            <h1 className="text-3xl font-bold">{stats.title}</h1>
            <p className="text-gray-600 mt-2">Statistiques détaillées de votre annonce</p>
          </div>
          <Button onClick={loadStats} variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vues totales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Vues totales</p>
                  <p className="text-3xl font-bold mt-2">{stats.total_views.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {viewsTrend >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${viewsTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {viewsTrendPercent}% vs hier
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Visiteurs uniques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Visiteurs uniques</p>
                  <p className="text-3xl font-bold mt-2">{stats.unique_visitors.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.avg_views_per_day.toFixed(1)} vues/jour
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Favoris */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Favoris</p>
                  <p className="text-3xl font-bold mt-2">{stats.total_favorites}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.total_views > 0 
                      ? ((stats.total_favorites / stats.total_views) * 100).toFixed(1)
                      : 0}% des visiteurs
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Messages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Messages reçus</p>
                  <p className="text-3xl font-bold mt-2">{stats.total_conversations}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {stats.conversion_rate.toFixed(1)}% taux de conversion
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Graphique d'évolution des vues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FACC15]" />
              Évolution des vues (30 derniers jours)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#FACC15" 
                  strokeWidth={3}
                  dot={{ fill: '#FACC15', r: 4 }}
                  name="Vues"
                />
                <Line 
                  type="monotone" 
                  dataKey="unique_visitors" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                  name="Visiteurs uniques"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heures de pic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FACC15]" />
                Heures de pic de trafic
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" tickFormatter={(value) => `${value}h`} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) => `${value}h00`}
                  />
                  <Bar dataKey="views" fill="#FACC15" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-4 text-center">
                💡 <strong>Conseil:</strong> Boostez votre annonce pendant ces heures pour plus de visibilité
              </p>
            </Card>
          </motion.div>

          {/* Jours de la semaine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FACC15]" />
                Performance par jour
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weekdayStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day_name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="views" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Conseils d'optimisation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6 bg-gradient-to-br from-[#FACC15]/10 to-transparent border-[#FACC15]/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FACC15]" />
              Conseils pour améliorer vos performances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.conversion_rate < 2 && (
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                  <Target className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Taux de conversion faible</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Améliorez vos photos et votre description pour convertir plus de visiteurs en messages
                    </p>
                  </div>
                </div>
              )}
              {stats.views_today < stats.avg_views_per_day * 0.5 && (
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Visibilité en baisse</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Boostez votre annonce pour retrouver de la visibilité
                    </p>
                  </div>
                </div>
              )}
              {stats.total_favorites > stats.total_conversations * 3 && (
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                  <Heart className="w-5 h-5 text-pink-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Beaucoup de favoris, peu de messages</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Ajoutez un appel à l'action clair dans votre description
                    </p>
                  </div>
                </div>
              )}
              {stats.conversion_rate >= 5 && (
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                  <Zap className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Excellent taux de conversion !</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Votre annonce convertit très bien, continuez comme ça !
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

