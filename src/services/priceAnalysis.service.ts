/**
 * Service pour analyser les prix du marché et suggérer un prix optimal
 */

import { supabase, isSupabaseConfigured } from '../app/lib/supabase';

export interface PriceSuggestion {
  suggested_price: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  median_price: number;
  total_listings: number;
  confidence: 'high' | 'medium' | 'low';
  analysis: {
    position: 'below_market' | 'competitive' | 'above_market' | 'premium';
    position_percent: number; // % de différence avec le marché
    recommendations: string[];
  };
  comparable_listings: Array<{
    id: string;
    title: string;
    price: number;
    year: number;
    mileage: number;
  }>;
}

class PriceAnalysisService {
  /**
   * Analyse le marché et suggère un prix pour un véhicule
   */
  async analyzePriceForVehicle(
    brand: string,
    model: string,
    year: number,
    mileage: number,
    condition?: 'excellent' | 'good' | 'fair',
    currentPrice?: number
  ): Promise<PriceSuggestion | null> {
    if (!isSupabaseConfigured) {
      console.warn('[PriceAnalysis] Supabase non configuré');
      return null;
    }

    try {
      // 1. Récupérer les annonces similaires actives
      const { data: similarListings, error } = await supabase
        .from('listings')
        .select('id, title, price, year, mileage, brand, model, status')
        .eq('brand', brand)
        .eq('model', model)
        .eq('status', 'active')
        .gte('year', year - 3) // +/- 3 ans
        .lte('year', year + 3)
        .order('price', { ascending: true });

      if (error || !similarListings || similarListings.length === 0) {
        console.warn('[PriceAnalysis] Pas assez de données similaires');
        return null;
      }

      // 2. Calculer les statistiques
      const prices = similarListings.map(l => l.price).sort((a, b) => a - b);
      const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
      const medianPrice = this.calculateMedian(prices);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // 3. Ajuster selon le kilométrage
      const avgMileage = similarListings.reduce((sum, l) => sum + (l.mileage || 0), 0) / similarListings.length;
      const mileageAdjustment = this.calculateMileageAdjustment(mileage, avgMileage);

      // 4. Ajuster selon l'état (si fourni)
      const conditionAdjustment = condition ? this.getConditionAdjustment(condition) : 1;

      // 5. Calculer le prix suggéré
      let suggestedPrice = Math.round(medianPrice * mileageAdjustment * conditionAdjustment);

      // Limiter entre min et max raisonnables
      const reasonableMin = medianPrice * 0.7;
      const reasonableMax = medianPrice * 1.3;
      suggestedPrice = Math.max(reasonableMin, Math.min(reasonableMax, suggestedPrice));

      // 6. Analyser la position par rapport au marché (si prix actuel fourni)
      const analysis = this.analyzePosition(currentPrice || suggestedPrice, avgPrice, medianPrice);

      // 7. Déterminer la confiance
      const confidence = this.calculateConfidence(similarListings.length, year);

      // 8. Sélectionner les annonces comparables (max 5)
      const comparableListings = similarListings
        .filter(l => Math.abs(l.price - suggestedPrice) / suggestedPrice < 0.3) // +/- 30%
        .slice(0, 5)
        .map(l => ({
          id: l.id,
          title: l.title,
          price: l.price,
          year: l.year,
          mileage: l.mileage || 0,
        }));

      return {
        suggested_price: suggestedPrice,
        min_price: minPrice,
        max_price: maxPrice,
        avg_price: avgPrice,
        median_price: medianPrice,
        total_listings: similarListings.length,
        confidence,
        analysis,
        comparable_listings: comparableListings,
      };
    } catch (error) {
      console.error('[PriceAnalysis] Erreur:', error);
      return null;
    }
  }

  /**
   * Calcule la médiane d'un tableau trié
   */
  private calculateMedian(sortedPrices: number[]): number {
    const mid = Math.floor(sortedPrices.length / 2);
    if (sortedPrices.length % 2 === 0) {
      return Math.round((sortedPrices[mid - 1] + sortedPrices[mid]) / 2);
    }
    return sortedPrices[mid];
  }

  /**
   * Ajuste le prix selon le kilométrage
   */
  private calculateMileageAdjustment(mileage: number, avgMileage: number): number {
    if (avgMileage === 0) return 1;

    const diff = (avgMileage - mileage) / avgMileage;
    // +/- 10% max d'ajustement pour le kilométrage
    const adjustment = 1 + (diff * 0.1);
    return Math.max(0.9, Math.min(1.1, adjustment));
  }

  /**
   * Facteur d'ajustement selon l'état du véhicule
   */
  private getConditionAdjustment(condition: 'excellent' | 'good' | 'fair'): number {
    const adjustments = {
      excellent: 1.1,  // +10%
      good: 1.0,       // Prix de base
      fair: 0.9,       // -10%
    };
    return adjustments[condition];
  }

  /**
   * Analyse la position du prix par rapport au marché
   */
  private analyzePosition(
    price: number,
    avgPrice: number,
    medianPrice: number
  ): PriceSuggestion['analysis'] {
    const diffPercent = Math.round(((price - medianPrice) / medianPrice) * 100);
    let position: PriceSuggestion['analysis']['position'];
    const recommendations: string[] = [];

    if (diffPercent <= -20) {
      position = 'below_market';
      recommendations.push('Votre prix est nettement en dessous du marché');
      recommendations.push('Vous pourriez augmenter le prix sans nuire aux ventes');
      recommendations.push('Vérifiez que vous n\'avez rien oublié dans la description');
    } else if (diffPercent <= -10) {
      position = 'competitive';
      recommendations.push('Prix très compétitif, idéal pour vendre rapidement');
      recommendations.push('Votre annonce devrait attirer beaucoup d\'acheteurs');
    } else if (diffPercent <= 10) {
      position = 'competitive';
      recommendations.push('Prix dans la moyenne du marché');
      recommendations.push('Bon équilibre entre rentabilité et attractivité');
    } else if (diffPercent <= 20) {
      position = 'above_market';
      recommendations.push('Prix légèrement au-dessus du marché');
      recommendations.push('Assurez-vous de bien mettre en valeur les atouts du véhicule');
      recommendations.push('Attendez-vous à plus de négociations');
    } else {
      position = 'premium';
      recommendations.push('Prix premium, nettement au-dessus du marché');
      recommendations.push('Justifiez ce prix : état exceptionnel, options rares, etc.');
      recommendations.push('Soyez prêt à attendre plus longtemps pour vendre');
    }

    return {
      position,
      position_percent: diffPercent,
      recommendations,
    };
  }

  /**
   * Calcule le niveau de confiance de l'analyse
   */
  private calculateConfidence(totalListings: number, year: number): 'high' | 'medium' | 'low' {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    // Confiance selon le nombre d'annonces similaires et l'âge
    if (totalListings >= 10 && age <= 5) return 'high';
    if (totalListings >= 5 && age <= 10) return 'medium';
    return 'low';
  }

  /**
   * Obtenir un texte de conseil rapide
   */
  getQuickAdvice(suggestion: PriceSuggestion, currentPrice: number): string {
    const { analysis } = suggestion;
    const diff = currentPrice - suggestion.suggested_price;

    if (analysis.position === 'below_market') {
      return `💰 Vous pourriez augmenter de ${Math.abs(diff).toLocaleString()} FCFA`;
    } else if (analysis.position === 'above_market' || analysis.position === 'premium') {
      return `⚠️ Prix ${Math.abs(diff).toLocaleString()} FCFA au-dessus du marché`;
    } else {
      return `✅ Prix compétitif ! Bon équilibre`;
    }
  }
}

export const priceAnalysisService = new PriceAnalysisService();

