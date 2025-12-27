// Le projet a historiquement eu 2 implémentations d'analytics :
// - `src/app/services/analytics.service.ts` (ancienne / démo)
// - `src/services/analytics.service.ts` (implémentation canonique actuelle)
//
// Le dashboard admin (`src/app/pages/dashboard/AdminAnalytics.tsx`) importe
// `../../services/analytics.service` → donc ce fichier.
//
// Pour éviter les erreurs en production du type :
// "analyticsService.getOnlineUsers is not a function"
// on ré-exporte l'implémentation canonique.
export * from '../../services/analytics.service';


