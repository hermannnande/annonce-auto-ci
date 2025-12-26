# ❤️ Page Favoris - Dashboard Vendeur

## 📋 Où vont les favoris ?

Les favoris sont stockés dans **Supabase** dans la table `favorites` :

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  listing_id UUID REFERENCES listings(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### URL d'accès :
```
/dashboard/vendeur/favoris
```

## ✨ Fonctionnalités de la page

### 1. **Affichage des favoris**
- ✅ Grille responsive (1 col mobile, 2 cols tablet, 3 cols desktop)
- ✅ Card du véhicule (réutilisation de `VehicleCard`)
- ✅ Badge "Ajouté le [date]" sur chaque favori
- ✅ Bouton supprimer (apparaît au hover)
- ✅ Animation stagger (apparition séquentielle)

### 2. **Suppression de favoris**
- ✅ Bouton rouge avec icône Trash2
- ✅ Loader pendant la suppression
- ✅ Toast de confirmation
- ✅ Mise à jour instantanée de la liste

### 3. **État vide**
- ✅ Message "Aucun favori"
- ✅ Icône Heart stylisée
- ✅ Bouton "Parcourir les annonces"
- ✅ Design avec border dashed

### 4. **Statistiques**
- ✅ Nombre total de favoris
- ✅ Vues totales cumulées
- ✅ Valeur totale (somme des prix)
- ✅ Affichage en grille 3 colonnes

## 🎨 Design

### Header
```tsx
<div className="flex items-center gap-3">
  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl">
    <Heart className="w-6 h-6 text-white fill-white" />
  </div>
  <h1>Mes Favoris</h1>
</div>
```

### Card Favori
```tsx
<div className="relative group">
  {/* Bouton supprimer (visible au hover) */}
  <button className="absolute top-4 right-4 z-10 bg-red-500 opacity-0 group-hover:opacity-100">
    <Trash2 />
  </button>
  
  {/* Badge date d'ajout */}
  <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm">
    <Calendar /> {date}
  </div>
  
  {/* Card véhicule */}
  <VehicleCard vehicle={listing} />
</div>
```

### Stats Card
```tsx
<Card className="p-6 bg-gradient-to-br from-gray-50 to-white">
  <div className="grid grid-cols-3 gap-4">
    <div>
      <div className="text-3xl font-bold text-[#FACC15]">{count}</div>
      <div className="text-sm text-gray-600">Favoris</div>
    </div>
    {/* ... */}
  </div>
</Card>
```

## 🔗 Intégration

### 1. Route ajoutée dans App.tsx
```tsx
import { VendorFavorites } from './pages/dashboard/VendorFavorites';

// ...

<Route path="/dashboard/vendeur/favoris" element={<VendorFavorites />} />
```

### 2. Menu dashboard (DashboardLayout.tsx)
```tsx
const vendorMenuItems = [
  { icon: LayoutDashboard, label: 'Vue d\'ensemble', path: '/dashboard/vendeur' },
  { icon: Car, label: 'Mes annonces', path: '/dashboard/vendeur/annonces' },
  { icon: Heart, label: 'Mes favoris', path: '/dashboard/vendeur/favoris' }, // ✅ NOUVEAU
  { icon: MessageCircle, label: 'Messages', path: '/dashboard/vendeur/messages' },
  // ...
];
```

### 3. Service utilisé
```typescript
import { favoritesService } from '../../services/favorites.service';

// Charger les favoris
const { favorites, error } = await favoritesService.getUserFavorites(userId);

// Supprimer un favori
const { error } = await favoritesService.removeFavorite(userId, listingId);
```

## 📊 Flux de données

```
┌─────────────────────────────────────┐
│ Page VehicleDetail                  │
│ Clic sur ❤️                         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ favoritesService.addFavorite()      │
│ → INSERT INTO favorites             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Supabase Table: favorites           │
│ { user_id, listing_id, created_at } │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Page VendorFavorites                │
│ favoritesService.getUserFavorites() │
│ → SELECT * FROM favorites           │
│   WHERE user_id = ?                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Affichage en grille                 │
│ + Bouton supprimer                  │
│ + Stats                             │
└─────────────────────────────────────┘
```

## 🎯 Parcours utilisateur

### Ajouter aux favoris
```
1. Naviguer sur une annonce
2. Cliquer sur ❤️ (en haut à droite de l'image)
3. Toast "Ajouté aux favoris ❤️"
4. Bouton devient rouge et rempli
```

### Voir ses favoris
```
1. Aller dans le dashboard
2. Cliquer sur "Mes favoris" dans le menu (avec icône ❤️)
3. Voir tous ses favoris en grille
4. Voir les stats en bas
```

### Supprimer un favori
```
1. Sur la page Favoris
2. Hover sur une card
3. Bouton rouge "Trash2" apparaît
4. Cliquer dessus
5. Loader pendant suppression
6. Toast "Retiré des favoris"
7. Card disparaît de la liste
```

## 📱 Responsive

### Mobile (< 768px)
```css
grid-cols-1          /* 1 card par ligne */
p-4                  /* Padding réduit */
text-2xl             /* Titres plus petits */
```

### Tablet (768px - 1024px)
```css
md:grid-cols-2       /* 2 cards par ligne */
md:p-6               /* Padding moyen */
```

### Desktop (≥ 1024px)
```css
lg:grid-cols-3       /* 3 cards par ligne */
lg:p-6               /* Padding normal */
```

## 🧪 Tests recommandés

### Test 1 : Affichage
1. Ajouter 3 favoris depuis des annonces
2. Aller sur `/dashboard/vendeur/favoris`
3. ✅ Voir les 3 favoris en grille
4. ✅ Voir les badges de date
5. ✅ Voir les stats en bas

### Test 2 : Suppression
1. Hover sur une card
2. ✅ Bouton rouge apparaît
3. Cliquer dessus
4. ✅ Loader s'affiche
5. ✅ Toast "Retiré des favoris"
6. ✅ Card disparaît
7. ✅ Stats mises à jour

### Test 3 : État vide
1. Supprimer tous les favoris
2. ✅ Message "Aucun favori" s'affiche
3. ✅ Bouton "Parcourir les annonces"
4. Cliquer dessus
5. ✅ Redirect vers `/annonces`

### Test 4 : Navigation
1. Menu dashboard
2. ✅ Voir "Mes favoris" avec icône ❤️
3. Cliquer dessus
4. ✅ Page favoris s'affiche
5. ✅ Item du menu est actif (surligné)

## 🚀 Extensions possibles

### 1. Filtres et tri
```tsx
// Trier par date, prix, marque
const [sortBy, setSortBy] = useState<'date' | 'price' | 'brand'>('date');

// Filtrer par statut
const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all');
```

### 2. Actions groupées
```tsx
// Sélection multiple
const [selected, setSelected] = useState<string[]>([]);

// Supprimer plusieurs à la fois
const handleDeleteSelected = async () => {
  await Promise.all(
    selected.map(id => favoritesService.removeFavorite(userId, id))
  );
};
```

### 3. Notifications de changement de prix
```tsx
// Alerter si un favori change de prix
useEffect(() => {
  const checkPriceChanges = async () => {
    // Comparer prix actuels vs prix sauvegardés
    // Afficher notification si baisse de prix
  };
}, []);
```

### 4. Export des favoris
```tsx
const exportFavorites = () => {
  const data = favorites.map(f => ({
    marque: f.listing.brand,
    modele: f.listing.model,
    prix: f.listing.price,
    url: `/annonces/${f.listing.id}`
  }));
  
  // Download CSV ou PDF
  downloadCSV(data, 'mes-favoris.csv');
};
```

## 📚 Fichiers créés/modifiés

✅ **Nouveau** : `VendorFavorites.tsx`  
✅ **Modifié** : `App.tsx` (ajout route)  
✅ **Modifié** : `DashboardLayout.tsx` (ajout menu item)  

---

**Date** : 24 décembre 2025  
**Statut** : ✅ Créé et intégré  
**URL** : `/dashboard/vendeur/favoris`




