# 🚀 Guide du Système de Boost - annonceauto.ci

## Vue d'ensemble

Le système de boost permet aux vendeurs de mettre en avant leurs annonces pour augmenter leur visibilité et accélérer les ventes. Les annonces boostées apparaissent en tête des résultats de recherche et sont clairement identifiées avec un badge "BOOSTÉ".

## Architecture

### Services

#### 1. **listings.service.ts**
- `boostListing()` - Applique un boost à une annonce
- `getAllListings()` - Récupère toutes les annonces (tri : boostées en premier)
- Les annonces boostées actives sont automatiquement affichées en tête

#### 2. **credits.service.ts**
- `spendCredits()` - Débite les crédits pour un boost
- `refundCredits()` - Rembourse en cas d'erreur
- `getUserCredits()` - Récupère le solde de crédits

#### 3. **boost.service.ts** (nouveau)
- `checkExpiredBoosts()` - Vérifie et désactive les boosts expirés
- `getUserBoostStats()` - Statistiques de boost pour un utilisateur
- `getAllActiveBoosts()` - Tous les boosts actifs (admin)
- `getGlobalBoostStats()` - Statistiques globales (admin)
- `canBoostListing()` - Vérifie si une annonce peut être boostée
- `extendBoost()` - Renouvelle ou étend un boost existant

### Base de données

#### Table `listings`
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- title: TEXT
- price: NUMERIC
- is_boosted: BOOLEAN (indique si l'annonce est boostée)
- boost_until: TIMESTAMP (date d'expiration du boost)
- status: TEXT ('active', 'pending', 'sold', 'rejected', 'archived')
- created_at: TIMESTAMP
```

#### Table `boosts`
```sql
- id: UUID (PK)
- listing_id: UUID (FK -> listings)
- user_id: UUID (FK -> profiles)
- duration_days: INTEGER (durée en jours)
- credits_used: INTEGER (crédits dépensés)
- started_at: TIMESTAMP (auto)
- ends_at: TIMESTAMP (date de fin)
- is_active: BOOLEAN (boost actif ou non)
- created_at: TIMESTAMP
```

#### Table `credit_transactions`
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- amount: INTEGER (positif pour achat, négatif pour dépense)
- type: TEXT ('purchase', 'spent', 'refund', 'bonus', 'adjustment_add', 'adjustment_remove')
- description: TEXT
- payment_status: TEXT ('pending', 'completed', 'failed', 'cancelled')
- credits_before: INTEGER
- credits_after: INTEGER
- created_at: TIMESTAMP
```

## Plans de boost disponibles

### 1. Boost Basique
- **Prix**: 50 crédits
- **Durée**: 3 jours
- **Avantages**:
  - +50% de visibilité
  - Mise en avant sur la page d'accueil
  - Badge "Sponsorisé"
  - Support standard
  - ~150 vues estimées

### 2. Boost Pro ⭐ (Populaire)
- **Prix**: 120 crédits
- **Durée**: 7 jours
- **Avantages**:
  - +100% de visibilité
  - Position premium
  - Badge "TOP"
  - Support prioritaire
  - Statistiques avancées
  - ~500 vues estimées

### 3. Boost Premium 👑
- **Prix**: 250 crédits
- **Durée**: 14 jours
- **Avantages**:
  - +200% de visibilité
  - Position VIP
  - Badge "PREMIUM"
  - Support VIP 24/7
  - Analytics détaillés
  - Mise en avant réseaux sociaux
  - ~1500 vues estimées

## Workflow du boost

### Côté vendeur (VendorBooster.tsx)

1. **Sélection du plan** - L'utilisateur choisit parmi 3 plans de boost
2. **Sélection de l'annonce** - Choix de l'annonce à booster (annonces déjà boostées = désactivées)
3. **Vérification du solde** - Le système vérifie que l'utilisateur a assez de crédits
4. **Application du boost**:
   ```typescript
   // 1. Débiter les crédits
   await creditsService.spendCredits(userId, planCredits, description);
   
   // 2. Appliquer le boost
   await listingsService.boostListing(listingId, userId, durationDays, creditsUsed);
   ```
5. **Gestion des erreurs** - En cas d'erreur, les crédits sont automatiquement remboursés
6. **Confirmation** - Toast de succès + recharge des données

### Côté technique

#### Application d'un boost
```typescript
async boostListing(
  listingId: string,
  userId: string,
  durationDays: number,
  creditsUsed: number
): Promise<{ error: Error | null }> {
  // 1. Calculer la date de fin
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + durationDays);

  // 2. Créer l'entrée dans la table boosts
  await supabase.from('boosts').insert({
    listing_id: listingId,
    user_id: userId,
    duration_days: durationDays,
    credits_used: creditsUsed,
    ends_at: endsAt.toISOString(),
    is_active: true
  });

  // 3. Mettre à jour l'annonce
  await supabase.from('listings').update({
    is_boosted: true,
    boost_until: endsAt.toISOString()
  }).eq('id', listingId);
}
```

#### Vérification automatique des boosts expirés

Le hook `useBoostChecker()` est appelé dans `App.tsx` au démarrage de l'application :

```typescript
export function useBoostChecker() {
  useEffect(() => {
    // Vérifier au montage
    boostService.checkExpiredBoosts();

    // Vérifier toutes les 5 minutes
    const interval = setInterval(() => {
      boostService.checkExpiredBoosts();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
```

La fonction `checkExpiredBoosts()`:
1. Désactive les boosts expirés dans la table `boosts`
2. Met à jour `is_boosted = false` pour les annonces concernées

## Affichage des annonces boostées

### Tri automatique
Dans `listingsService.getAllListings()`, les annonces sont triées :
1. **Annonces boostées actives** en premier (vérifie `is_boosted` ET que `boost_until > now`)
2. **Annonces normales** ensuite, par date de création (plus récentes en premier)

```typescript
const listings = data.sort((a, b) => {
  const aIsActiveBoosted = a.is_boosted && (!a.boost_until || new Date(a.boost_until) > new Date());
  const bIsActiveBoosted = b.is_boosted && (!b.boost_until || new Date(b.boost_until) > new Date());
  
  if (aIsActiveBoosted && !bIsActiveBoosted) return -1;
  if (!aIsActiveBoosted && bIsActiveBoosted) return 1;
  
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
});
```

### Badge visuel

Le composant `VehicleCard` affiche un badge "BOOSTÉ" avec icône éclair :

```tsx
{normalizedVehicle.isBoosted && (
  <Badge className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] backdrop-blur-sm font-bold px-3 py-1 flex items-center gap-1 shadow-lg shadow-[#FACC15]/50 animate-pulse">
    <Zap className="w-3 h-3 fill-current" />
    BOOSTÉ
  </Badge>
)}
```

## API Endpoints (Supabase Functions)

Les fonctions suivantes utilisent directement le client Supabase côté client :

### Utilisateur
- `listingsService.boostListing()` - Booster une annonce
- `creditsService.spendCredits()` - Dépenser des crédits
- `boostService.getUserBoostStats()` - Stats de boost de l'utilisateur

### Admin
- `boostService.getAllActiveBoosts()` - Tous les boosts actifs
- `boostService.getGlobalBoostStats()` - Statistiques globales

## Sécurité et validation

### Row Level Security (RLS)

#### Table `boosts`
```sql
-- Lecture : Utilisateur peut voir ses propres boosts
CREATE POLICY "Users can view own boosts"
ON boosts FOR SELECT
USING (auth.uid() = user_id);

-- Insertion : Utilisateur peut créer des boosts pour ses annonces
CREATE POLICY "Users can create boosts for own listings"
ON boosts FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM listings
    WHERE listings.id = listing_id
    AND listings.user_id = auth.uid()
  )
);

-- Admin : Peut tout voir
CREATE POLICY "Admins can view all boosts"
ON boosts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);
```

### Validations côté client

1. **Crédits suffisants** - Vérification avant boost
2. **Annonce éligible** - Pas déjà boostée, statut 'active'
3. **Propriété** - L'utilisateur doit être le propriétaire de l'annonce

## Tests

### Scénarios de test

1. **Boost basique**
   - Vendeur avec 100 crédits
   - Boost d'une annonce avec plan Basique (50 crédits)
   - ✅ Crédits déduites, annonce boostée, affichée en tête

2. **Crédits insuffisants**
   - Vendeur avec 30 crédits
   - Tentative de boost Pro (120 crédits)
   - ✅ Erreur affichée, redirection vers recharge

3. **Boost expiré**
   - Annonce boostée il y a 4 jours (plan 3 jours)
   - ✅ Après vérification auto, `is_boosted = false`

4. **Erreur lors du boost**
   - Erreur lors de l'insertion dans `boosts`
   - ✅ Crédits automatiquement remboursés

5. **Renouvellement de boost**
   - Annonce déjà boostée avec boost expiré
   - ✅ Peut être boostée à nouveau

## Monitoring et Analytics

### Métriques à suivre

1. **Par utilisateur**:
   - Nombre total de boosts
   - Nombre de boosts actifs
   - Total crédits dépensés en boosts
   - Total jours de boost

2. **Global (Admin)**:
   - Total de boosts créés
   - Boosts actifs en ce moment
   - Total crédits dépensés (tous utilisateurs)
   - Revenu généré (1 crédit = 100 FCFA)

### Fonctions de stats

```typescript
// Stats utilisateur
const stats = await boostService.getUserBoostStats(userId);
// { totalBoosts: 5, activeBoosts: 2, totalCreditsSpent: 420, totalDays: 28 }

// Stats globales (admin)
const globalStats = await boostService.getGlobalBoostStats();
// { totalBoosts: 150, activeBoosts: 45, totalCreditsSpent: 15000, totalRevenue: 1500000 }
```

## Optimisations futures

### 1. Notification de fin de boost
```typescript
// Envoyer un email 1 jour avant expiration
// "Votre boost expire bientôt, renouvelez-le pour continuer à bénéficier de la visibilité"
```

### 2. Auto-renouvellement
```typescript
// Option pour renouveler automatiquement le boost
// Si l'utilisateur a assez de crédits
```

### 3. Boost multiple
```typescript
// Booster plusieurs annonces en même temps
// Avec réduction pour achat en gros
```

### 4. Analytics détaillés
```typescript
// Graphique de vues avant/après boost
// Taux de conversion
// ROI du boost
```

## FAQ

**Q: Que se passe-t-il si j'ai déjà boosté une annonce et que je veux la booster à nouveau ?**
R: Vous devez attendre que le boost actuel expire. Le système empêche le double boost.

**Q: Puis-je annuler un boost en cours ?**
R: Non, une fois le boost appliqué, il n'est pas remboursable. Le boost se poursuivra jusqu'à sa date d'expiration.

**Q: Les crédits sont-ils remboursés si mon annonce est supprimée ?**
R: Non, les crédits ne sont pas remboursés en cas de suppression volontaire de l'annonce.

**Q: Combien de temps faut-il pour qu'un boost soit actif ?**
R: Le boost est instantané ! Dès que la transaction est confirmée, votre annonce apparaît en tête.

**Q: Puis-je booster une annonce "En attente de modération" ?**
R: Non, seules les annonces avec le statut "active" peuvent être boostées.

## Support

Pour toute question ou problème concernant le système de boost :
- 📧 Email : support@annonceauto.ci
- 📱 WhatsApp : +225 XX XX XX XX XX
- 💬 Chat en ligne (dashboard vendeur)

---

**Date de création** : Décembre 2024  
**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0
