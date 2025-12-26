# 🔒 Guide d'utilisation - Utilitaires de Sécurité

Ce fichier contient toutes les fonctions de sécurité et validation utilisées dans le projet.

## 📦 Import

```typescript
import {
  isAdmin,
  isVendor,
  isOwner,
  canModifyResource,
  sanitizeString,
  isValidEmail,
  isValidPhone,
  isValidPrice,
  isValidYear,
  isValidMileage,
  isValidImageUrl,
  isValidImageSize,
  isValidImageType,
  MAX_IMAGES,
  MAX_IMAGE_SIZE
} from '../utils/security';
```

---

## 🔐 PERMISSIONS

### `isAdmin(profile)`
Vérifie si un utilisateur est administrateur.

**Paramètres** :
- `profile: Profile | null` - Le profil de l'utilisateur

**Retourne** : `boolean`

**Exemple** :
```typescript
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/security';

function MyComponent() {
  const { profile } = useAuth();

  if (isAdmin(profile)) {
    return <AdminPanel />;
  }

  return <UserPanel />;
}
```

---

### `isVendor(profile)`
Vérifie si un utilisateur est vendeur.

**Exemple** :
```typescript
if (isVendor(profile)) {
  // Afficher le dashboard vendeur
}
```

---

### `isOwner(profile, resourceOwnerId)`
Vérifie si un utilisateur est le propriétaire d'une ressource.

**Paramètres** :
- `profile: Profile | null`
- `resourceOwnerId: string` - ID du propriétaire de la ressource

**Exemple** :
```typescript
const listing = await getListingById(id);

if (isOwner(profile, listing.user_id)) {
  // Afficher le bouton "Modifier"
  return <Button>Modifier</Button>;
}
```

---

### `canModifyResource(profile, resourceOwnerId)`
Vérifie si un utilisateur peut modifier une ressource (propriétaire OU admin).

**Exemple** :
```typescript
if (canModifyResource(profile, listing.user_id)) {
  // L'utilisateur est soit le propriétaire, soit admin
  return <EditButton />;
}
```

---

## ✅ VALIDATIONS

### `isValidEmail(email)`
Valide un email.

**Exemple** :
```typescript
const email = 'user@example.com';

if (!isValidEmail(email)) {
  toast.error('Email invalide');
  return;
}
```

---

### `isValidPhone(phone)`
Valide un numéro de téléphone ivoirien.

**Formats acceptés** :
- `+225 07 08 00 00 00`
- `07 08 00 00 00`
- `0708000000`

**Exemple** :
```typescript
const phone = '+225 07 08 00 00 00';

if (!isValidPhone(phone)) {
  toast.error('Numéro de téléphone invalide');
  return;
}
```

---

### `isValidPrice(price)`
Valide un prix (doit être positif et < 1 milliard).

**Exemple** :
```typescript
const price = 15000000; // 15 millions FCFA

if (!isValidPrice(price)) {
  toast.error('Prix invalide');
  return;
}
```

---

### `isValidYear(year)`
Valide une année de véhicule (entre 1900 et année actuelle + 1).

**Exemple** :
```typescript
const year = 2024;

if (!isValidYear(year)) {
  toast.error('Année invalide');
  return;
}
```

---

### `isValidMileage(mileage)`
Valide un kilométrage (entre 0 et 10 millions km).

**Exemple** :
```typescript
const mileage = 125000;

if (!isValidMileage(mileage)) {
  toast.error('Kilométrage invalide');
  return;
}
```

---

## 🖼️ VALIDATION D'IMAGES

### `isValidImageUrl(url)`
Vérifie si une URL est une image valide.

**Extensions acceptées** : `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

**Exemple** :
```typescript
const imageUrl = 'https://example.com/car.jpg';

if (!isValidImageUrl(imageUrl)) {
  toast.error('URL d\'image invalide');
  return;
}
```

---

### `isValidImageSize(size)`
Vérifie la taille d'un fichier image (max 5 MB).

**Exemple** :
```typescript
const file = event.target.files[0];

if (!isValidImageSize(file.size)) {
  toast.error(`Image trop grande. Max ${MAX_IMAGE_SIZE / 1024 / 1024} MB`);
  return;
}
```

---

### `isValidImageType(mimeType)`
Vérifie le type MIME d'une image.

**Types acceptés** : `image/jpeg`, `image/png`, `image/gif`, `image/webp`

**Exemple** :
```typescript
const file = event.target.files[0];

if (!isValidImageType(file.type)) {
  toast.error('Type d\'image non supporté. Utilisez JPG, PNG, GIF ou WEBP');
  return;
}
```

---

### Constantes d'images

```typescript
import { MAX_IMAGES, MAX_IMAGE_SIZE } from '../utils/security';

console.log(MAX_IMAGES);      // 10
console.log(MAX_IMAGE_SIZE);  // 5242880 (5 MB en bytes)
```

---

## 🛡️ SANITIZATION

### `sanitizeString(str)`
Échappe les caractères HTML dangereux pour éviter XSS.

**⚠️ IMPORTANT** : Utiliser UNIQUEMENT côté client. Ne remplace PAS la validation serveur.

**Caractères échappés** :
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#x27;`
- `/` → `&#x2F;`

**Exemple** :
```typescript
const userInput = '<script>alert("XSS")</script>';
const safe = sanitizeString(userInput);

console.log(safe);
// Output: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

---

## 🔧 UTILITAIRES

### `truncateString(str, maxLength)`
Limite la longueur d'une chaîne et ajoute "...".

**Exemple** :
```typescript
const longText = 'Ceci est un texte très long qui dépasse la limite';
const short = truncateString(longText, 20);

console.log(short); // "Ceci est un texte..."
```

---

### `generateSecureId()`
Génère un ID unique sécurisé.

**Exemple** :
```typescript
const id = generateSecureId();
console.log(id); // "1703414640000-x7k9m2n4p"
```

---

### `escapeRegex(str)`
Échappe les caractères spéciaux pour une recherche regex.

**Exemple** :
```typescript
const searchTerm = 'toyota+2024';
const escaped = escapeRegex(searchTerm);

// Utilisation dans une regex
const regex = new RegExp(escaped, 'i');
```

---

### `debounce(func, wait)`
Rate limiting simple (debounce).

**Paramètres** :
- `func: Function` - La fonction à débouncer
- `wait: number` - Délai en millisecondes

**Exemple** :
```typescript
import { debounce } from '../utils/security';

const handleSearch = debounce((query: string) => {
  // Effectuer la recherche
  searchListings(query);
}, 500); // Attendre 500ms après la dernière frappe

// Dans un input
<input onChange={(e) => handleSearch(e.target.value)} />
```

---

## 📝 EXEMPLE COMPLET

### Formulaire de publication d'annonce sécurisé

```typescript
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  isVendor,
  isValidPrice,
  isValidYear,
  isValidMileage,
  isValidImageSize,
  isValidImageType,
  MAX_IMAGES,
  sanitizeString
} from '../utils/security';
import { toast } from 'sonner';

function PublishForm() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    year: 2024,
    mileage: 0,
    images: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Vérifier les permissions
    if (!user || !isVendor(profile)) {
      toast.error('Vous devez être connecté en tant que vendeur');
      return;
    }

    // 2. Valider le prix
    if (!isValidPrice(formData.price)) {
      toast.error('Prix invalide (doit être > 0 et < 1 milliard)');
      return;
    }

    // 3. Valider l'année
    if (!isValidYear(formData.year)) {
      toast.error('Année invalide');
      return;
    }

    // 4. Valider le kilométrage
    if (!isValidMileage(formData.mileage)) {
      toast.error('Kilométrage invalide');
      return;
    }

    // 5. Valider les images
    if (formData.images.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images autorisées`);
      return;
    }

    // 6. Sanitizer les inputs texte
    const sanitizedTitle = sanitizeString(formData.title);

    // 7. Soumettre le formulaire
    try {
      await listingsService.createListing(user.id, {
        ...formData,
        title: sanitizedTitle
      });

      toast.success('Annonce créée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Valider chaque image
    for (const file of files) {
      if (!isValidImageType(file.type)) {
        toast.error(`${file.name}: Type non supporté`);
        return;
      }

      if (!isValidImageSize(file.size)) {
        toast.error(`${file.name}: Taille > 5 MB`);
        return;
      }
    }

    // Upload images...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire ici */}
    </form>
  );
}
```

---

## 🚨 BONNES PRATIQUES

### ✅ À FAIRE

1. **Toujours valider côté serveur ET côté client**
   ```typescript
   // Côté client (UX)
   if (!isValidPrice(price)) {
     toast.error('Prix invalide');
     return;
   }

   // Côté serveur (Supabase RLS + service)
   // RLS empêche les requêtes non autorisées
   ```

2. **Vérifier les permissions avant chaque action sensible**
   ```typescript
   if (!canModifyResource(profile, listing.user_id)) {
     toast.error('Non autorisé');
     return;
   }
   ```

3. **Sanitizer les inputs utilisateur**
   ```typescript
   const clean = sanitizeString(userInput);
   ```

4. **Utiliser debounce pour les recherches**
   ```typescript
   const search = debounce(handleSearch, 500);
   ```

---

### ❌ À ÉVITER

1. **Ne JAMAIS faire confiance au client uniquement**
   ```typescript
   // ❌ DANGEREUX
   if (user.email === 'admin@example.com') {
     showAdminPanel();
   }

   // ✅ CORRECT
   if (isAdmin(profile)) {
     showAdminPanel();
   }
   ```

2. **Ne JAMAIS bypass les validations**
   ```typescript
   // ❌ DANGEREUX
   await supabase.from('listings').delete().eq('id', id);

   // ✅ CORRECT
   if (!canModifyResource(profile, listing.user_id)) {
     return;
   }
   await listingsService.deleteListing(id, user.id);
   ```

3. **Ne JAMAIS stocker de secrets côté client**
   ```typescript
   // ❌ DANGEREUX
   const API_KEY = 'sk_live_123456789';

   // ✅ CORRECT
   const API_KEY = import.meta.env.VITE_API_KEY;
   ```

---

## 📚 RESSOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Security](https://react.dev/learn/escape-hatches)

---

**Dernière mise à jour** : 24 décembre 2024




