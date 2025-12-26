/**
 * Hook pour initialiser le tracking analytics
 * 
 * Ce hook doit être appelé une fois dans le composant App principal
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../../services/analytics.service';

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Track page view à chaque changement de route
    analyticsService.trackPageView();
  }, [location.pathname, location.search]);

  return {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackListingView: analyticsService.trackListingView.bind(analyticsService),
    trackSearch: analyticsService.trackSearch.bind(analyticsService),
    trackClick: analyticsService.trackClick.bind(analyticsService),
    trackConversion: analyticsService.trackConversion.bind(analyticsService),
    trackFavorite: analyticsService.trackFavorite.bind(analyticsService),
    trackMessage: analyticsService.trackMessage.bind(analyticsService),
    trackBoost: analyticsService.trackBoost.bind(analyticsService),
  };
}




