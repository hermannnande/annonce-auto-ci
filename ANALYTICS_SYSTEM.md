# 📊 Système d'Analytics Complet - AnnonceAuto.ci

## 🎯 Vue d'ensemble

Système de tracking et d'analytics complet pour suivre le trafic, les conversions et l'engagement des utilisateurs en temps réel.

---

## ✅ Fonctionnalités

### 🔴 Temps Réel
- **Utilisateurs en ligne** : Nombre d'utilisateurs actuellement actifs (rafraîchi toutes les 30s)
- **Sessions actives** : Nombre de sessions en cours
- **Événements par minute/heure** : Activité en temps réel

### 📈 Trafic
- **Pages vues quotidiennes** : Graphique d'évolution
- **Visiteurs uniques** : Par jour/semaine/mois/année
- **Top pages** : Pages les plus visitées (aujourd'hui)
- **Trafic par heure** : Dernières 24 heures

### 🌍 Géographie
- **Répartition par pays** : Top 5 des pays
- **Répartition par ville** : Top 10 des villes
- **Carte thermique** (future version)

### 📱 Devices
- **Desktop / Mobile / Tablet**
- **Navigateurs utilisés**
- **Systèmes d'exploitation**

### 🎯 Conversions
- **Achats de crédits**
- **Boosts d'annonces**
- **Publications d'annonces**
- **Taux de conversion**

### 💬 Engagement
- **Favoris**
- **Messages**
- **Recherches**
- **Clics**

---

## 🗃️ Architecture de la Base de Données

### Tables principales

#### 1. `analytics_events`
Tous les événements trackés (page views, clicks, conversions, etc.)

```sql
- id (UUID)
- event_type (page_view, listing_view, search, click, conversion, favorite, message, boost)
- page_url, page_title
- user_id, session_id
- device_type, browser, os
- country, city
- listing_id, search_query
- conversion_type, conversion_value
- metadata (JSONB)
- created_at
```

#### 2. `analytics_sessions`
Sessions utilisateur agrégées

```sql
- session_id (unique)
- user_id
- started_at, ended_at
- duration_seconds
- page_views
- device_type, browser, os
- country, city
- referrer, landing_page, exit_page
- converted, conversion_value
```

#### 3. `analytics_daily_stats`
Statistiques quotidiennes précalculées (performance)

```sql
- date (unique)
- total_page_views
- unique_visitors
- new_users, returning_users
- total_sessions
- avg_session_duration_seconds
- bounce_rate
- listings_published, listings_viewed
- total_conversions, conversion_rate
- revenue
- total_searches, total_favorites, total_messages
```

#### 4. `analytics_top_pages`
Pages les plus visitées (par jour)

```sql
- page_url, page_title
- date
- views, unique_visitors
- avg_time_on_page_seconds
- bounce_rate, exit_rate
```

#### 5. `analytics_online_users`
Utilisateurs en ligne (temps réel)

```sql
- user_id, session_id
- last_seen
- current_page
- device_type
```

---

## 🎨 Frontend - Service Analytics

### Fichier: `src/services/analytics.service.ts`

Le service analytics gère automatiquement :
- **Détection du device, browser, OS**
- **Gestion de session** (unique par utilisateur)
- **Heartbeat** (toutes les 30s pour tracker les utilisateurs en ligne)
- **Auto-tracking des pages vues**

### Méthodes disponibles

```typescript
// Track automatique (via hook)
useAnalytics(); // Dans App.tsx

// Track manuel
import { analyticsService } from '@/services/analytics.service';

// Pages vues
analyticsService.trackPageView();

// Vue d'annonce
analyticsService.trackListingView('listing-id', 'Titre annonce');

// Recherche
analyticsService.trackSearch('toyota', 45);

// Clic
analyticsService.trackClick('Bouton Contacter', 'button');

// Conversion
analyticsService.trackConversion('credit_purchase', 10000, { package: 'premium' });

// Favori
analyticsService.trackFavorite('listing-id');

// Message
analyticsService.trackMessage('listing-id');

// Boost
analyticsService.trackBoost('listing-id', '7days', 3000);
```

---

## 🔌 Intégration dans le Code

### 1. Dans `App.tsx` (déjà fait ✅)
```typescript
import { useAnalytics } from './hooks/useAnalytics';

function AppContent() {
  useAnalytics(); // Track automatique des pages vues
  // ...
}
```

### 2. Dans une page d'annonce
```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

export function VehicleDetailPage() {
  const { trackListingView } = useAnalytics();
  
  useEffect(() => {
    if (listing) {
      trackListingView(listing.id, listing.title);
    }
  }, [listing]);
  
  // ...
}
```

### 3. Dans une page de recherche
```typescript
const { trackSearch } = useAnalytics();

const handleSearch = (query: string) => {
  // Rechercher...
  const results = searchListings(query);
  
  // Track la recherche
  trackSearch(query, results.length);
};
```

### 4. Dans un bouton de conversion
```typescript
const { trackConversion } = useAnalytics();

const handlePurchase = async () => {
  // Acheter des crédits...
  
  // Track la conversion
  trackConversion('credit_purchase', amount, {
    package: selectedPackage,
    payment_method: 'payfonte'
  });
};
```

---

## 📊 Dashboard Admin

### Page: `src/app/pages/dashboard/AdminAnalytics.tsx`

Le dashboard admin affiche :

#### 🔴 Temps Réel (rafraîchi toutes les 30s)
- Utilisateurs en ligne
- Événements dernière heure
- Sessions actives
- Événements dernière minute

#### 📊 Graphiques
- **Pages vues quotidiennes** (Area Chart)
- **Trafic par heure** (Bar Chart - 24h)
- **Répartition par device** (Pie Chart)
- **Répartition géographique** (Bar horizontales)

#### 📋 Listes
- **Top 10 pages visitées aujourd'hui**
- **Top 5 pays**
- **Top 10 villes**

#### 🎯 Stats d'engagement
- Favoris
- Messages
- Boosts actifs

#### ⏱️ Filtres temporels
- 7 jours
- 30 jours
- 90 jours
- 1 an
- Période personnalisée (date picker)

---

## 🚀 Déploiement

### 1. Migrer la base de données

```bash
# Appliquer les migrations Supabase
cd "C:\Users\nande\Downloads\Site Annonces Véhicules (3)"
supabase db push
```

Ou exécuter manuellement :
- `supabase/migrations/create_analytics_tables.sql`
- `supabase/migrations/create_increment_function.sql`

### 2. Installer les dépendances

```bash
pnpm install
# ua-parser-js est déjà installé ✅
```

### 3. Tester

```bash
pnpm dev
```

Naviguer vers : `http://localhost:5174/dashboard/admin/analytics`

---

## 🔒 Sécurité & Permissions

### Row Level Security (RLS)

Les tables analytics sont protégées par RLS :
- **Admins uniquement** : Peuvent lire toutes les données
- **Service role** : Peut tout faire (pour le backend)

### Politiques créées :
```sql
-- Admins peuvent voir toutes les analytics
CREATE POLICY "Admins can view all analytics" ON analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

## 📈 Performance

### Index créés :
- `idx_analytics_events_created_at` (DESC)
- `idx_analytics_events_event_type`
- `idx_analytics_events_user_id`
- `idx_analytics_events_session_id`
- `idx_analytics_events_listing_id`
- `idx_analytics_events_page_url`

### Vues matérialisées :
- `analytics_realtime_stats` : Stats temps réel (5 dernières minutes)
- `analytics_today_top_pages` : Top pages aujourd'hui

### Fonction de nettoyage :
```sql
SELECT cleanup_offline_users(); -- Supprimer les utilisateurs inactifs > 5 min
```

Exécuter cette fonction via un cron job (toutes les 5 minutes) :
```sql
-- Dans Supabase Dashboard > Database > Cron
SELECT cron.schedule(
  'cleanup-offline-users',
  '*/5 * * * *',
  'SELECT cleanup_offline_users();'
);
```

---

## 🎨 Customisation

### Ajouter un nouvel événement

1. **Ajouter le type d'événement**
```typescript
// Dans analytics.service.ts
export interface AnalyticsEvent {
  event_type: 'page_view' | 'listing_view' | 'search' | 'click' | 'conversion' | 'favorite' | 'message' | 'boost' | 'custom_event';
  // ...
}
```

2. **Créer une méthode de tracking**
```typescript
async trackCustomEvent(eventData: any) {
  await this.trackEvent({
    event_type: 'custom_event',
    metadata: eventData,
  });
}
```

3. **Utiliser dans le code**
```typescript
const { trackCustomEvent } = useAnalytics();
trackCustomEvent({ action: 'download_pdf', filename: 'brochure.pdf' });
```

---

## 🐛 Debug

### Vérifier les événements trackés

```sql
-- Derniers 10 événements
SELECT * FROM analytics_events 
ORDER BY created_at DESC 
LIMIT 10;

-- Utilisateurs en ligne
SELECT * FROM analytics_online_users 
WHERE last_seen > NOW() - INTERVAL '5 minutes';

-- Sessions actives
SELECT COUNT(*) FROM analytics_sessions 
WHERE started_at > NOW() - INTERVAL '1 hour';
```

### Logs frontend

Le service analytics affiche automatiquement les erreurs dans la console :
```
Error tracking event: ...
Error sending heartbeat: ...
```

---

## 📦 Dépendances

- `ua-parser-js` : Détection device/browser/OS ✅
- `recharts` : Graphiques (déjà installé) ✅
- `framer-motion` : Animations (déjà installé) ✅
- `lucide-react` : Icônes (déjà installé) ✅

---

## 🎉 Résultat Final

✅ **Tracking automatique** de toutes les pages
✅ **Utilisateurs en ligne** en temps réel
✅ **Dashboard admin** complet avec graphiques
✅ **Statistiques détaillées** (trafic, conversions, engagement)
✅ **Répartition géographique et par device**
✅ **Filtres temporels** (7j / 30j / 90j / 1an / personnalisé)
✅ **Performance optimisée** (index, vues matérialisées)
✅ **Sécurisé** (RLS, permissions)

---

## 📞 Support

Pour toute question ou amélioration, consultez :
- `src/services/analytics.service.ts` : Service principal
- `src/app/pages/dashboard/AdminAnalytics.tsx` : Dashboard admin
- `supabase/migrations/create_analytics_tables.sql` : Structure BDD

**Bon tracking ! 🚀📊**



