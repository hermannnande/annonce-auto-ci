import { motion } from 'motion/react';
import { Shield, Star, TrendingUp, Award } from 'lucide-react';
import { Badge as BadgeType, BADGE_INFO, VendorStats, reputationService } from '../../services/reputation.service';

interface VendorReputationCardProps {
  vendorId: string;
  stats: VendorStats;
  badges: BadgeType[];
  compact?: boolean;
}

export function VendorReputationCard({ vendorId, stats, badges, compact = false }: VendorReputationCardProps) {
  const reputationScore = reputationService.calculateReputationScore(stats);
  const { level, color } = reputationService.getReputationLevel(reputationScore);

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {/* Score */}
        <div className={`flex items-center gap-1 ${color}`}>
          <Star className="w-4 h-4 fill-current" />
          <span className="font-bold">{stats.avg_rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({stats.total_reviews})</span>
        </div>

        {/* Badges compacts */}
        {badges.slice(0, 3).map((badge) => {
          const info = BADGE_INFO[badge.badge_type];
          return (
            <span
              key={badge.id}
              className={`px-2 py-1 rounded-full text-xs font-medium border ${info.color}`}
              title={info.description}
            >
              {info.icon} {info.label}
            </span>
          );
        })}
        {badges.length > 3 && (
          <span className="text-xs text-gray-500">+{badges.length - 3}</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg mb-1">Réputation du vendeur</h3>
          <p className="text-sm text-gray-600">Membre depuis {new Date(stats.member_since).getFullYear()}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${color} bg-gray-50`}>
          {level}
        </div>
      </div>

      {/* Score de réputation */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Score global</span>
          <span className={`text-2xl font-bold ${color}`}>{reputationScore}/100</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${reputationScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              reputationScore >= 75 ? 'bg-green-500' :
              reputationScore >= 50 ? 'bg-yellow-500' :
              'bg-orange-500'
            }`}
          />
        </div>
      </div>

      {/* Statistiques clés */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-2xl font-bold">{stats.avg_rating.toFixed(1)}</span>
          </div>
          <p className="text-xs text-gray-600">{stats.total_reviews} avis</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats.sold_listings}
          </div>
          <p className="text-xs text-gray-600">Ventes réussies</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.response_rate}%
          </div>
          <p className="text-xs text-gray-600">Taux de réponse</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {stats.avg_response_time_hours.toFixed(0)}h
          </div>
          <p className="text-xs text-gray-600">Temps de réponse</p>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FACC15]" />
            Badges obtenus ({badges.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => {
              const info = BADGE_INFO[badge.badge_type];
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-2 rounded-lg border-2 ${info.color} cursor-help`}
                  title={info.description}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.icon}</span>
                    <span className="text-sm font-medium">{info.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Indicateurs de confiance */}
      <div className="pt-4 border-t space-y-2">
        <p className="text-xs font-medium text-gray-600 mb-2">Points forts</p>
        {stats.avg_rating >= 4.5 && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Excellentes évaluations des clients</span>
          </div>
        )}
        {stats.response_rate >= 90 && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Très réactif aux messages</span>
          </div>
        )}
        {stats.sold_listings >= 10 && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Award className="w-4 h-4 text-yellow-600" />
            <span>Vendeur expérimenté</span>
          </div>
        )}
      </div>
    </div>
  );
}

