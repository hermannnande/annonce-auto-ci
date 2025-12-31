import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  DollarSign,
  Eye,
  MessageCircle,
  Heart,
  Zap,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  X,
  CalendarDays,
  Loader2,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { analyticsService } from '../../services/analytics.service';
import { toast } from 'sonner';

export function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | '1year'>('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États pour les stats réelles
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [realtimeStats, setRealtimeStats] = useState<any>(null);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [conversionStats, setConversionStats] = useState<any[]>([]);
  const [deviceStats, setDeviceStats] = useState<any[]>([]);
  const [geoStats, setGeoStats] = useState<any>({ countries: [], cities: [] });
  const [engagementStats, setEngagementStats] = useState<any>({ favorite: 0, message: 0, boost: 0 });
  const [topListings, setTopListings] = useState<any[]>([]);
  const [hourlyTraffic, setHourlyTraffic] = useState<any[]>([]);
  const [previousDailyStats, setPreviousDailyStats] = useState<any[]>([]);
  const [topPagesRange, setTopPagesRange] = useState<{ startIso: string; endIso: string } | null>(null);

  // Charger les statistiques au démarrage
  useEffect(() => {
    loadAllStats();
    
    // Refresh toutes les 30 secondes pour les stats temps réel
    const interval = setInterval(() => {
      loadRealtimeData();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const getEffectiveRange = () => {
    const defaultDays = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : (() => {
      const d = new Date(end);
      d.setDate(d.getDate() - defaultDays);
      return d;
    })();
    const startIso = start.toISOString().split('T')[0];
    const endIso = end.toISOString().split('T')[0];
    return { startIso, endIso };
  };

  const loadAllStats = async () => {
    setLoading(true);
    try {
      const range = getEffectiveRange();
      setTopPagesRange(range);
      await Promise.all([
        loadRealtimeData(),
        loadTopPages(range.startIso, range.endIso),
        loadDailyStats(),
        loadConversionStats(range.startIso, range.endIso),
        loadDeviceStats(range.startIso, range.endIso),
        loadGeoStats(range.startIso, range.endIso),
        loadEngagementStats(range.startIso, range.endIso),
        loadTopListings(),
        loadHourlyTraffic(range.startIso, range.endIso),
      ]);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeData = async () => {
    try {
      const [users, stats] = await Promise.all([
        analyticsService.getOnlineUsers(),
        analyticsService.getRealtimeStats(),
      ]);
      
      setOnlineUsers(users);
      setRealtimeStats(stats || { events_last_hour: 0, events_last_minute: 0, active_sessions: 0 });
    } catch (error) {
      console.error('Erreur chargement données temps réel:', error);
      setOnlineUsers(0);
      setRealtimeStats({ events_last_hour: 0, events_last_minute: 0, active_sessions: 0 });
    }
  };

  const loadTopPages = async (startIso: string, endIso: string) => {
    try {
      const pages = await analyticsService.getTopPages(startIso, endIso, 10);
      setTopPages(pages || []);
    } catch (error) {
      console.error('Erreur chargement top pages:', error);
      setTopPages([]);
    }
  };

  const loadDailyStats = async () => {
    try {
      const defaultDays = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;

      // Période affichée
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : (() => {
        const d = new Date(end);
        d.setDate(d.getDate() - defaultDays);
        return d;
      })();

      const startIso = start.toISOString().split('T')[0];
      const endIso = end.toISOString().split('T')[0];

      // Longueur (jours inclusifs)
      const msDay = 24 * 60 * 60 * 1000;
      const len = Math.max(1, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / msDay) + 1);

      // Période précédente = même longueur juste avant start
      const prevEnd = new Date(startIso);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - (len - 1));

      const prevStartIso = prevStart.toISOString().split('T')[0];
      const prevEndIso = prevEnd.toISOString().split('T')[0];

      const [stats, prevStats] = await Promise.all([
        analyticsService.getDailyStats(startIso, endIso),
        analyticsService.getDailyStats(prevStartIso, prevEndIso),
      ]);

      setDailyStats(stats || []);
      setPreviousDailyStats(prevStats || []);
    } catch (error) {
      console.error('Erreur chargement stats quotidiennes:', error);
      setDailyStats([]);
      setPreviousDailyStats([]);
    }
  };

  const loadConversionStats = async (_startIso: string, _endIso: string) => {
    try {
      // TODO: cette section n'est pas utilisée dans la UI actuelle
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
      const stats = await analyticsService.getConversionStats(days);
      setConversionStats(stats || []);
    } catch (error) {
      console.error('Erreur chargement stats conversions:', error);
      setConversionStats([]);
    }
  };

  const loadDeviceStats = async (startIso: string, endIso: string) => {
    try {
      const stats = await analyticsService.getDeviceStatsRange(startIso, endIso);
      setDeviceStats(stats || []);
    } catch (error) {
      console.error('Erreur chargement stats devices:', error);
      setDeviceStats([]);
    }
  };

  const loadGeoStats = async (startIso: string, endIso: string) => {
    try {
      const stats = await analyticsService.getGeographicStatsRange(startIso, endIso);
      setGeoStats(stats || { countries: [], cities: [] });
    } catch (error) {
      console.error('Erreur chargement stats géographiques:', error);
      setGeoStats({ countries: [], cities: [] });
    }
  };

  const loadEngagementStats = async (startIso: string, endIso: string) => {
    try {
      const stats = await analyticsService.getEngagementStatsRange(startIso, endIso);
      setEngagementStats(stats || { favorite: 0, message: 0, boost: 0 });
    } catch (error) {
      console.error('Erreur chargement stats engagement:', error);
      setEngagementStats({ favorite: 0, message: 0, boost: 0 });
    }
  };

  const loadTopListings = async () => {
    try {
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
      const stats = await analyticsService.getTopListings(days, 10);
      setTopListings(stats || []);
    } catch (error) {
      console.error('Erreur chargement top listings:', error);
      setTopListings([]);
    }
  };

  const loadHourlyTraffic = async (startIso: string, endIso: string) => {
    try {
      const stats = await analyticsService.getHourlyTrafficRange(startIso, endIso);
      setHourlyTraffic(stats || []);
    } catch (error) {
      console.error('Erreur chargement trafic horaire:', error);
      setHourlyTraffic([]);
    }
  };

  // Function to apply date filter
  const applyDateFilter = () => {
    if (startDate && endDate) {
      console.log('Filtering from', startDate, 'to', endDate);
      toast.success(`Filtre appliqué: ${new Date(startDate).toLocaleDateString('fr-FR')} - ${new Date(endDate).toLocaleDateString('fr-FR')}`);
      
      // Recharger les stats avec les nouvelles dates
      loadAllStats();
    }
  };

  // Function to reset date filter
  const resetDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setShowDateFilter(false);
    loadAllStats();
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

  const sumField = (rows: any[], key: string) => rows.reduce((acc, r) => acc + (Number(r?.[key]) || 0), 0);

  const totals = useMemo(() => ({
    pageViews: sumField(dailyStats, 'total_page_views'),
    uniqueVisitors: sumField(dailyStats, 'unique_visitors'),
    newUsers: sumField(dailyStats, 'new_users'),
    revenue: sumField(dailyStats, 'revenue'),
    prevPageViews: sumField(previousDailyStats, 'total_page_views'),
    prevUniqueVisitors: sumField(previousDailyStats, 'unique_visitors'),
    prevNewUsers: sumField(previousDailyStats, 'new_users'),
    prevRevenue: sumField(previousDailyStats, 'revenue'),
  }), [dailyStats, previousDailyStats]);

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) {
      if (current === 0) return { change: '0%', trend: 'neutral' as const };
      return { change: '—', trend: 'neutral' as const }; // évite un % trompeur quand la période précédente est vide
    }
    const pct = ((current - previous) / previous) * 100;
    const trend = pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral';
    const sign = pct > 0 ? '+' : '';
    return { change: `${sign}${pct.toFixed(1)}%`, trend };
  };

  const displayStats = [
    {
      label: 'Vues totales',
      value: totals.pageViews.toLocaleString(),
      ...calcChange(totals.pageViews, totals.prevPageViews),
      icon: Eye,
      color: 'blue',
    },
    {
      label: 'Visiteurs uniques',
      value: totals.uniqueVisitors.toLocaleString(),
      ...calcChange(totals.uniqueVisitors, totals.prevUniqueVisitors),
      icon: Users,
      color: 'green',
    },
    {
      label: 'Nouveaux utilisateurs',
      value: totals.newUsers.toLocaleString(),
      ...calcChange(totals.newUsers, totals.prevNewUsers),
      icon: Car,
      color: 'purple',
    },
    {
      label: 'Revenus (FCFA)',
      value: totals.revenue.toLocaleString(),
      ...calcChange(totals.revenue, totals.prevRevenue),
      icon: DollarSign,
      color: 'yellow',
    },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Vue d'ensemble des performances de la plateforme
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200">
              {[
                { value: '7days', label: '7 jours' },
                { value: '30days', label: '30 jours' },
                { value: '90days', label: '90 jours' },
                { value: '1year', label: '1 an' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    timeRange === range.value
                      ? 'bg-gradient-to-r from-[#0F172A] to-[#1e293b] text-white shadow-md'
                      : 'text-gray-600 hover:text-[#0F172A]'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {/* Filter Toggle Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  showDateFilter
                    ? 'bg-gradient-to-r from-[#0F172A] to-[#1e293b] text-white shadow-lg'
                    : 'bg-white text-[#0F172A] border-2 border-gray-200 hover:border-[#0F172A]'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Filtrer par période personnalisée
                {(startDate || endDate) && (
                  <span className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse" />
                )}
              </button>
            </div>

            {/* Date Filter Panel */}
            {showDateFilter && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-4 p-6 rounded-2xl bg-white border border-gray-200 shadow-2xl relative overflow-hidden"
              >
                {/* Glass morphism background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-yellow-50/50 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1e293b] flex items-center justify-center">
                        <Filter className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0F172A]">Période personnalisée</h3>
                        <p className="text-sm text-gray-600">Sélectionnez une plage de dates</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDateFilter(false)}
                      className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Start Date */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Date de début
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          max={endDate || undefined}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/10 outline-none transition-all text-gray-900 font-medium"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Date de fin
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || undefined}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/10 outline-none transition-all text-gray-900 font-medium"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Quick date range buttons */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Raccourcis rapides</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Aujourd\'hui', days: 0 },
                        { label: '7 derniers jours', days: 7 },
                        { label: '30 derniers jours', days: 30 },
                        { label: 'Ce mois-ci', days: 'month' },
                        { label: 'Mois dernier', days: 'lastMonth' },
                      ].map((shortcut) => (
                        <button
                          key={shortcut.label}
                          onClick={() => {
                            const today = new Date();
                            const end = today.toISOString().split('T')[0];
                            let start = '';
                            
                            if (typeof shortcut.days === 'number') {
                              const startDate = new Date();
                              startDate.setDate(today.getDate() - shortcut.days);
                              start = startDate.toISOString().split('T')[0];
                            } else if (shortcut.days === 'month') {
                              start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                            } else if (shortcut.days === 'lastMonth') {
                              start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
                              const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                              setEndDate(lastDayLastMonth.toISOString().split('T')[0]);
                              setStartDate(start);
                              return;
                            }
                            
                            setStartDate(start);
                            setEndDate(end);
                          }}
                          className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gradient-to-r hover:from-[#0F172A] hover:to-[#1e293b] hover:text-white transition-all font-medium text-gray-700"
                        >
                          {shortcut.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={resetDateFilter}
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                    <Button
                      onClick={applyDateFilter}
                      disabled={!startDate || !endDate}
                      className="flex-1 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#FACC15] text-[#0F172A] font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Appliquer le filtre
                    </Button>
                  </div>

                  {/* Active Filter Indicator */}
                  {startDate && endDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-semibold text-green-800">
                          Filtre actif: {new Date(startDate).toLocaleDateString('fr-FR')} - {new Date(endDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Real-time Stats - Utilisateurs en ligne */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            {/* Utilisateurs en ligne */}
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 text-green-600">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-green-600">EN DIRECT</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0F172A] mb-1">{onlineUsers}</p>
              <p className="text-sm text-gray-600">Utilisateurs en ligne</p>
            </Card>

            {/* Événements dernière heure */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0F172A] mb-1">
                {realtimeStats?.events_last_hour || 0}
              </p>
              <p className="text-sm text-gray-600">Événements (1h)</p>
            </Card>

            {/* Sessions actives */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0F172A] mb-1">
                {realtimeStats?.active_sessions || 0}
              </p>
              <p className="text-sm text-gray-600">Sessions actives</p>
            </Card>

            {/* Événements dernière minute */}
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-100 text-yellow-600">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0F172A] mb-1">
                {realtimeStats?.events_last_minute || 0}
              </p>
              <p className="text-sm text-gray-600">Événements (1min)</p>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayStats.map((stat: any, index: number) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              purple: 'bg-purple-100 text-purple-600',
              yellow: 'bg-yellow-100 text-yellow-600',
            };
            
            return (
              <Card key={index} className="p-6 border-0 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      stat.trend === 'up'
                        ? 'text-green-600'
                        : stat.trend === 'down'
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                    {stat.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                    {stat.trend === 'neutral' && <Activity className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#0F172A] mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Trafic par heure (période sélectionnée) */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#0F172A]">Trafic par heure</h3>
              <p className="text-sm text-gray-600 mt-1">
                {topPagesRange ? `${topPagesRange.startIso} → ${topPagesRange.endIso}` : 'Période sélectionnée'}
              </p>
            </div>
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="hour" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#FACC15" name="Pages vues" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pages les plus visitées (période sélectionnée) */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#0F172A]">Pages les plus visitées</h3>
              <p className="text-sm text-gray-600 mt-1">Top 10 des pages</p>
            </div>
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-3">
            {topPages.length > 0 ? (
              topPages.map((page: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{page.page_title || page.page_url}</p>
                    <p className="text-xs text-gray-500 truncate">{page.page_url}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0F172A]">{page.views}</p>
                      <p className="text-xs text-gray-500">vues</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#FACC15]">{page.unique_visitors}</p>
                      <p className="text-xs text-gray-500">visiteurs</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </Card>

        {/* Statistiques quotidiennes (graphique) */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#0F172A]">Pages vues quotidiennes</h3>
              <p className="text-sm text-gray-600 mt-1">Évolution du trafic</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total_page_views"
                  stroke="#0F172A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPageViews)"
                  name="Pages vues"
                />
                <Area
                  type="monotone"
                  dataKey="unique_visitors"
                  stroke="#FACC15"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                  name="Visiteurs uniques"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistiques par device */}
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">Répartition par device</h3>
                <p className="text-sm text-gray-600 mt-1">Types d'appareils utilisés</p>
              </div>
              <Smartphone className="w-8 h-8 text-gray-400" />
            </div>
            <div className="h-64">
              {deviceStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={deviceStats.map((d: any) => ({
                        name: d.device === 'desktop' ? 'Ordinateur' : d.device === 'mobile' ? 'Mobile' : d.device === 'tablet' ? 'Tablette' : 'Autre',
                        value: d.count,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceStats.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.device === 'desktop' ? '#0F172A' : entry.device === 'mobile' ? '#FACC15' : entry.device === 'tablet' ? '#3B82F6' : '#8B5CF6'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Top pays */}
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">Répartition géographique</h3>
                <p className="text-sm text-gray-600 mt-1">Top 5 pays</p>
              </div>
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-4">
              {geoStats.countries.length > 0 ? (
                geoStats.countries.slice(0, 5).map((country: any, index: number) => {
                  const total = geoStats.countries.reduce((acc: number, c: any) => acc + c.count, 0);
                  const percentage = ((country.count / total) * 100).toFixed(1);
                  
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{country.country || 'Inconnu'}</span>
                          <span className="text-sm text-gray-600">{country.count} visites</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-sm font-semibold text-[#FACC15]">
                        {percentage}%
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100 text-red-600">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{engagementStats.favorite.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Favoris</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{engagementStats.message.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Messages</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{engagementStats.boost.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Boosts actifs</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Cities */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#0F172A]">Villes les plus actives</h3>
              <p className="text-sm text-gray-600 mt-1">Répartition géographique des visites</p>
            </div>
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-4">
            {geoStats.cities.length > 0 ? (
              geoStats.cities.map((city: any, index: number) => {
                const total = geoStats.cities.reduce((acc: number, c: any) => acc + c.count, 0);
                const percentage = ((city.count / total) * 100).toFixed(1);
                
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{city.city || 'Inconnu'}</span>
                        <span className="text-sm text-gray-600">{city.count} visites</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-sm font-semibold text-[#FACC15]">
                      {percentage}%
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </Card>

        {/* Export Button */}
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">Exporter les données</h3>
              <p className="text-sm text-gray-600 mt-1">
                Télécharger un rapport complet en PDF ou Excel
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] hover:from-[#1e293b] hover:to-[#0F172A] text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}