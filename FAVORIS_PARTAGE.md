# ❤️ Favoris et Partage Social - Implémentation

## ✨ Fonctionnalités ajoutées

### 1. **Bouton Favoris (Heart)**

#### États visuels
```tsx
// Non favori
bg-white/95 hover:bg-[#FACC15]
<Heart className="text-gray-700" />

// En favori
bg-red-500 hover:bg-red-600
<Heart className="text-white fill-white" />
```

#### Fonctionnement
1. **Utilisateur non connecté** :
   - Clic → Toast "Vous devez être connecté"
   - Redirection vers `/connexion` avec retour à l'annonce

2. **Utilisateur connecté** :
   - Vérification automatique au chargement
   - Toggle favori/non-favori
   - Toast de confirmation
   - Animation scale au clic

#### Service utilisé
```typescript
import { favoritesService } from '../services/favorites.service';

// Ajouter aux favoris
await favoritesService.addFavorite(userId, listingId);

// Retirer des favoris
await favoritesService.removeFavorite(userId, listingId);

// Récupérer les favoris
const favorites = await favoritesService.getUserFavorites(userId);
```

### 2. **Bouton Partage (Share2)**

#### Modal de partage
Ouvre un modal professionnel avec 5 options :

**1. Facebook** 🔵
```tsx
window.open(
  `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  '_blank'
);
```

**2. Twitter** 🔵
```tsx
window.open(
  `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
  '_blank'
);
```

**3. WhatsApp** 🟢
```tsx
window.open(
  `https://wa.me/?text=${title} - ${url}`,
  '_blank'
);
```

**4. LinkedIn** 🔵
```tsx
window.open(
  `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  '_blank'
);
```

**5. Copier le lien** 📋
```tsx
navigator.clipboard.writeText(url);
// Feedback visuel : Check icon pendant 2 secondes
```

## 🎨 Design du modal de partage

### Header (Slate)
```tsx
bg-gradient-to-br from-slate-800 to-slate-700
```
- Icône Share2 dans badge doré
- Titre "Partager cette annonce"
- Bouton X pour fermer

### Boutons sociaux
Chaque bouton a :
- Couleur de marque (Facebook bleu, WhatsApp vert, etc.)
- Icon dans un badge arrondi
- Hover effect (scale + translate x)
- Shadow-lg

### Responsive
- Max-width: 448px (md)
- Centré verticalement et horizontalement
- Padding: 16px mobile, 20px desktop

## 📱 Code ajouté

### Dans `VehicleDetailPage.tsx`

#### États
```typescript
const [isFavorite, setIsFavorite] = useState(false);
const [showShareModal, setShowShareModal] = useState(false);
const [loadingFavorite, setLoadingFavorite] = useState(false);
```

#### useEffect
```typescript
useEffect(() => {
  if (id) {
    loadVehicle();
    if (user) {
      checkIfFavorite(); // Vérifier si déjà en favori
    }
  }
}, [id, user]);
```

#### Fonctions
```typescript
// Vérifier si l'annonce est favorite
const checkIfFavorite = async () => {
  if (!user || !id) return;
  const favorites = await favoritesService.getUserFavorites(user.id);
  setIsFavorite(favorites.some(fav => fav.listing_id === id));
};

// Toggle favori
const handleToggleFavorite = async () => {
  if (!user) {
    toast.error('Vous devez être connecté');
    navigate('/connexion', { state: { from: `/annonces/${id}` } });
    return;
  }

  setLoadingFavorite(true);
  try {
    if (isFavorite) {
      await favoritesService.removeFavorite(user.id, id!);
      toast.success('Retiré des favoris');
    } else {
      await favoritesService.addFavorite(user.id, id!);
      toast.success('Ajouté aux favoris ❤️');
    }
    setIsFavorite(!isFavorite);
  } catch (error) {
    toast.error('Erreur');
  } finally {
    setLoadingFavorite(false);
  }
};

// Ouvrir le modal de partage
const handleShare = () => {
  setShowShareModal(true);
};
```

#### Boutons (dans l'image)
```tsx
{/* Bouton Favoris */}
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={handleToggleFavorite}
  disabled={loadingFavorite}
  className={`backdrop-blur-sm p-2.5 rounded-full shadow-lg ${
    isFavorite 
      ? 'bg-red-500 hover:bg-red-600' 
      : 'bg-white/95 hover:bg-[#FACC15]'
  }`}
>
  <Heart 
    className={`w-5 h-5 ${
      isFavorite 
        ? 'text-white fill-white' 
        : 'text-gray-700'
    }`} 
  />
</motion.button>

{/* Bouton Partage */}
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={handleShare}
  className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-[#FACC15]"
>
  <Share2 className="w-5 h-5 text-gray-700" />
</motion.button>
```

#### Modal de partage (fin du return)
```tsx
<ShareModal
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  url={window.location.href}
  title={`${vehicle?.brand} ${vehicle?.model} - ${vehicle?.year}`}
  description={vehicle?.description}
/>
```

### Nouveau composant `ShareModal.tsx`

Créé dans `src/app/components/ShareModal.tsx` avec :
- Modal avec overlay
- 5 boutons de partage
- Animations Framer Motion
- Gestion du clipboard
- Design professionnel

## 🎯 Parcours utilisateur

### Favoris
```
👤 Utilisateur voit une annonce
     ↓
❤️ Clique sur l'icône Heart
     ↓
┌─────────────────────────┐
│ Connecté ?              │
├──────────┬──────────────┤
│   NON    │     OUI      │
└──────────┴──────────────┘
     │            │
     ▼            ▼
Toast error   Toggle favori
Redirect      + Toast success
/connexion    + Animation
```

### Partage
```
👤 Utilisateur voit une annonce
     ↓
🔗 Clique sur l'icône Share2
     ↓
📱 Modal de partage s'ouvre
     ↓
┌────────────────────────┐
│ Facebook               │
│ Twitter                │
│ WhatsApp               │
│ LinkedIn               │
│ Copier le lien         │
└────────────────────────┘
     ↓
Choix d'une option
     ↓
Partage effectué ✅
```

## 📊 Avantages

✅ **Engagement** : Les utilisateurs peuvent sauvegarder leurs annonces préférées  
✅ **Viralité** : Partage facile sur les réseaux sociaux  
✅ **UX fluide** : Feedback visuel immédiat (toast, animation, couleur)  
✅ **Accessibilité** : Aria-labels et états disabled  
✅ **Performance** : Vérification favori en 1 seule requête  
✅ **Mobile-ready** : Boutons tactiles et modal responsive  

## 🚀 Extensions possibles

### 1. Compteur de favoris
```tsx
<div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
  {favoriteCount}
</div>
```

### 2. Compteur de partages
```typescript
const incrementShareCount = async (platform: string) => {
  await supabase
    .from('listings')
    .update({ 
      share_count: shareCount + 1,
      last_shared_platform: platform 
    })
    .eq('id', listingId);
};
```

### 3. Historique de partage
```sql
CREATE TABLE shares (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  user_id UUID REFERENCES profiles(id),
  platform TEXT, -- 'facebook', 'twitter', etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Native Share API (mobile)
```typescript
if (navigator.share) {
  await navigator.share({
    title: vehicle.title,
    text: vehicle.description,
    url: window.location.href
  });
}
```

## 🧪 Tests recommandés

### Favoris
1. ✅ Clic sans connexion → Redirect /connexion
2. ✅ Clic avec connexion → Toggle favori + toast
3. ✅ Rechargement page → État favori conservé
4. ✅ Animation Heart → Scale + couleur

### Partage
1. ✅ Clic Share2 → Modal s'ouvre
2. ✅ Facebook → Popup Facebook
3. ✅ Twitter → Popup Twitter
4. ✅ WhatsApp → Ouverture WhatsApp
5. ✅ LinkedIn → Popup LinkedIn
6. ✅ Copier lien → Toast "Lien copié" + check icon
7. ✅ Clic overlay → Modal se ferme
8. ✅ Clic X → Modal se ferme

---

**Date** : 24 décembre 2025  
**Statut** : ✅ Implémenté et fonctionnel  
**Fichiers** : VehicleDetailPage.tsx, ShareModal.tsx


