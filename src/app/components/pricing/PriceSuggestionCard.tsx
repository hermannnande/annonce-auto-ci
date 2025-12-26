import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { priceAnalysisService, PriceSuggestion } from '../../services/priceAnalysis.service';

interface PriceSuggestionCardProps {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  condition?: 'excellent' | 'good' | 'fair';
  currentPrice?: number;
  onPriceSelect?: (price: number) => void;
}

export function PriceSuggestionCard({
  brand,
  model,
  year,
  mileage,
  condition,
  currentPrice,
  onPriceSelect,
}: PriceSuggestionCardProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (brand && model && year && mileage) {
      analyzePr ice();
    }
  }, [brand, model, year, mileage, condition]);

  const analyzePrice = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await priceAnalysisService.analyzePriceForVehicle(
        brand,
        model,
        year,
        mileage,
        condition,
        currentPrice
      );
      setSuggestion(result);
      if (!result) {
        setError('Pas assez de données pour analyser le prix');
      }
    } catch (err) {
      setError('Erreur lors de l\'analyse');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!brand || !model || !year || !mileage) {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-[#FACC15]/10 to-transparent border-[#FACC15]/30">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#FACC15]" />
          <p className="text-sm text-gray-600">Analyse des prix du marché...</p>
        </div>
      </Card>
    );
  }

  if (error || !suggestion) {
    return (
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error || 'Analyse non disponible'}</span>
        </div>
      </Card>
    );
  }

  const getPositionColor = () => {
    switch (suggestion.analysis.position) {
      case 'below_market': return 'text-blue-600';
      case 'competitive': return 'text-green-600';
      case 'above_market': return 'text-orange-600';
      case 'premium': return 'text-red-600';
    }
  };

  const getPositionIcon = () => {
    if (suggestion.analysis.position === 'below_market') {
      return <TrendingDown className="w-5 h-5" />;
    } else if (suggestion.analysis.position === 'above_market' || suggestion.analysis.position === 'premium') {
      return <TrendingUp className="w-5 h-5" />;
    }
    return <CheckCircle className="w-5 h-5" />;
  };

  const getConfidenceBadge = () => {
    const badges = {
      high: { text: 'Haute confiance', color: 'bg-green-100 text-green-700' },
      medium: { text: 'Confiance moyenne', color: 'bg-yellow-100 text-yellow-700' },
      low: { text: 'Confiance faible', color: 'bg-orange-100 text-orange-700' },
    };
    const badge = badges[suggestion.confidence];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <Card className="overflow-hidden border-2 border-[#FACC15]/30 shadow-lg">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-[#FACC15]/20 to-transparent">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FACC15] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A]">Analyse de prix intelligente</h3>
              <p className="text-sm text-gray-600">
                Basée sur {suggestion.total_listings} annonces similaires
              </p>
            </div>
          </div>
          {getConfidenceBadge()}
        </div>

        {/* Prix suggéré */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-[#FACC15]/20">
          <p className="text-sm text-gray-600 mb-1">Prix suggéré</p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-[#FACC15]">
              {suggestion.suggested_price.toLocaleString()}
              <span className="text-lg ml-1">FCFA</span>
            </p>
            {onPriceSelect && (
              <Button
                onClick={() => onPriceSelect(suggestion.suggested_price)}
                size="sm"
                className="bg-[#FACC15] hover:bg-[#FBBF24] text-[#0F172A]"
              >
                Utiliser ce prix
              </Button>
            )}
          </div>
        </div>

        {/* Analyse position si prix actuel fourni */}
        {currentPrice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 flex items-center gap-2 ${getPositionColor()}`}
          >
            {getPositionIcon()}
            <p className="font-semibold">
              {priceAnalysisService.getQuickAdvice(suggestion, currentPrice)}
            </p>
          </motion.div>
        )}
      </div>

      {/* Statistiques du marché */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Prix minimum</p>
          <p className="text-lg font-bold text-gray-700">
            {suggestion.min_price.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Prix médian</p>
          <p className="text-lg font-bold text-[#FACC15]">
            {suggestion.median_price.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Prix moyen</p>
          <p className="text-lg font-bold text-gray-700">
            {suggestion.avg_price.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Prix maximum</p>
          <p className="text-lg font-bold text-gray-700">
            {suggestion.max_price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Détails expandables */}
      <div className="border-t">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-sm text-gray-700">
            {expanded ? 'Masquer les détails' : 'Voir les détails de l\'analyse'}
          </span>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 pt-0 space-y-6">
                {/* Recommandations */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#FACC15]" />
                    Recommandations
                  </h4>
                  <ul className="space-y-2">
                    {suggestion.analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#FACC15] mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Annonces comparables */}
                {suggestion.comparable_listings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">
                      Annonces comparables ({suggestion.comparable_listings.length})
                    </h4>
                    <div className="space-y-2">
                      {suggestion.comparable_listings.map((listing) => (
                        <div
                          key={listing.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-700 truncate">{listing.title}</p>
                            <p className="text-xs text-gray-500">
                              {listing.year} • {listing.mileage.toLocaleString()} km
                            </p>
                          </div>
                          <p className="font-bold text-[#FACC15] ml-3">
                            {listing.price.toLocaleString()} F
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

