# 🔄 REDIRECTION INTELLIGENTE : Retour à la Page d'Origine

## 🎯 PROBLÈME RÉSOLU

Après inscription OAuth et complétion du profil, l'utilisateur doit être redirigé vers **la page où il était initialement** (ex: page d'une annonce) et non vers le dashboard.

---

## ✅ SOLUTION IMPLÉMENTÉE

### Flux Complet de Redirection

```
[Page Annonce /annonces/abc123]
         ↓
[Clic "Contacter le vendeur" → Pas connecté]
         ↓
[Redirection vers /connexion]
         ↓
[sessionStorage: auth_return_to = "/annonces/abc123"] ✅
         ↓
[Clic "Continuer avec Google"]
         ↓
[OAuth Google → Callback]
         ↓
[Profil créé avec numéro par défaut]
         ↓
[Détection: profil incomplet]
         ↓
[Redirection → /complete-profile]
         ↓
⚠️ sessionStorage: auth_return_to PRÉSERVÉ ✅
         ↓
[Utilisateur complète nom + téléphone]
         ↓
[Validation]
         ↓
[Lecture de sessionStorage.auth_return_to] ✅
         ↓
[Redirection → /annonces/abc123] 🎯
         ↓
[RETOUR À LA PAGE D'ORIGINE !]
```

---

## 🔧 MODIFICATIONS TECHNIQUES

### 1. AuthCallback.tsx (Déjà OK)

Le `sessionStorage` est **préservé** lors de la redirection vers `/complete-profile` :

```typescript
// Vérifier si le profil est complet
const hasValidPhone = userProfile.phone && !userProfile.phone.includes('00 00 00 00');

// Si profil incomplet, rediriger vers complétion
if (isFirstTimeOAuth || !hasValidPhone) {
  console.log('📝 Profil incomplet, redirection vers page de complétion');
  toast.info('Veuillez compléter votre profil');
  navigate('/complete-profile', { replace: true });
  return; // ⚠️ PAS DE NETTOYAGE du sessionStorage ici !
}

// Si profil complet, récupérer la page d'origine
const returnTo = sessionStorage.getItem('auth_return_to');
// ... puis nettoyer et rediriger
```

**Point clé :** Le `sessionStorage` n'est **pas nettoyé** si on redirige vers `/complete-profile`, donc l'info est préservée.

---

### 2. CompleteProfilePage.tsx (MODIFIÉ)

Après validation du profil, on récupère et utilise la page d'origine :

```typescript
// Rafraîchir le profil
await refreshProfile();

toast.success('Profil complété avec succès !');

// ✅ NOUVEAU : Vérifier s'il y a une page d'origine enregistrée
const returnTo = sessionStorage.getItem('auth_return_to');
console.log('📍 Page de retour après complétion:', returnTo);

// Nettoyer le sessionStorage
if (returnTo) {
  sessionStorage.removeItem('auth_return_to');
}

// 🔒 Valider l'URL de redirection pour éviter les open redirects
const safeReturnTo = sanitizeRedirectUrl(returnTo);

// Redirection vers la page d'origine ou dashboard
if (safeReturnTo) {
  console.log('🔙 Redirection vers page d\'origine:', safeReturnTo);
  navigate(safeReturnTo, { replace: true });
} else {
  console.log('🏠 Redirection vers dashboard');
  navigate('/dashboard/vendeur', { replace: true });
}
```

**Import ajouté :**
```typescript
import { sanitizeRedirectUrl } from '../lib/security';
```

---

## 📊 SCÉNARIOS COUVERTS

### Scénario A : Inscription depuis une page d'annonce

```
1. Utilisateur sur /annonces/abc123
2. Clic "Contacter le vendeur" → Pas connecté
3. Redirection /connexion avec sessionStorage
4. Inscription Google
5. Profil incomplet → /complete-profile
6. Complète profil
7. ✅ Retour à /annonces/abc123
```

### Scénario B : Inscription depuis page "Publier"

```
1. Utilisateur sur /publier
2. Clic "Connexion requise"
3. Redirection /connexion avec sessionStorage
4. Inscription Google
5. Profil incomplet → /complete-profile
6. Complète profil
7. ✅ Retour à /publier
```

### Scénario C : Inscription directe (sans page d'origine)

```
1. Utilisateur va directement sur /inscription
2. Clic "Continuer avec Google"
3. OAuth → Callback
4. Profil incomplet → /complete-profile
5. Complète profil
6. ✅ Redirection par défaut → /dashboard/vendeur
```

### Scénario D : Utilisateur avec profil déjà complet

```
1. Utilisateur sur /annonces/abc123
2. Clic "Contacter le vendeur" → Pas connecté
3. Redirection /connexion avec sessionStorage
4. Connexion Google (profil déjà complet)
5. ✅ Retour direct à /annonces/abc123 (pas de complétion)
```

---

## 🔒 SÉCURITÉ

### Validation de l'URL de Redirection

```typescript
// 🔒 Valider l'URL de redirection pour éviter les open redirects
const safeReturnTo = sanitizeRedirectUrl(returnTo);
```

**Fonction `sanitizeRedirectUrl` (déjà existante) :**
- ✅ Vérifie que l'URL est relative (commence par `/`)
- ✅ Rejette les URLs externes
- ✅ Rejette les URLs suspectes
- ✅ Retourne `null` si invalide

**Exemple :**
```typescript
sanitizeRedirectUrl('/annonces/abc123')      → '/annonces/abc123' ✅
sanitizeRedirectUrl('https://evil.com')      → null ❌
sanitizeRedirectUrl('//evil.com')            → null ❌
sanitizeRedirectUrl('/dashboard/vendeur')    → '/dashboard/vendeur' ✅
```

---

## 🧪 TESTS

### Test 1 : Redirection depuis Page Annonce

**Étapes :**
1. Aller sur `http://localhost:5173/annonces/[ID_ANNONCE]`
2. Se déconnecter (si connecté)
3. Cliquer "Contacter le vendeur"
4. Vérifier redirection vers `/connexion`
5. Cliquer "Continuer avec Google"
6. Compléter le profil (nom + téléphone)
7. Cliquer "Valider mon profil"
8. ✅ **Vérifier retour à la page de l'annonce**

**Console logs attendus :**
```
📍 Page de retour après complétion: /annonces/abc123
🔙 Redirection vers page d'origine: /annonces/abc123
```

---

### Test 2 : Redirection depuis Page Publier

**Étapes :**
1. Aller sur `http://localhost:5173/publier`
2. Se déconnecter (si connecté)
3. Le système redirige automatiquement vers `/connexion`
4. Cliquer "Continuer avec Google"
5. Compléter le profil
6. ✅ **Vérifier retour à `/publier`**

---

### Test 3 : Inscription Directe (Pas de Page d'Origine)

**Étapes :**
1. Aller directement sur `http://localhost:5173/inscription`
2. Cliquer "Continuer avec Google"
3. Compléter le profil
4. ✅ **Vérifier redirection vers `/dashboard/vendeur`**

**Console logs attendus :**
```
📍 Page de retour après complétion: null
🏠 Redirection vers dashboard
```

---

### Test 4 : Vérification sessionStorage

**Dans la console navigateur (F12) :**

1. **Avant OAuth depuis page annonce :**
   ```javascript
   sessionStorage.getItem('auth_return_to')
   // Devrait retourner: "/annonces/abc123"
   ```

2. **Après redirection vers /complete-profile :**
   ```javascript
   sessionStorage.getItem('auth_return_to')
   // Devrait TOUJOURS retourner: "/annonces/abc123" ✅
   ```

3. **Après complétion du profil :**
   ```javascript
   sessionStorage.getItem('auth_return_to')
   // Devrait retourner: null (nettoyé) ✅
   ```

---

## 📁 FICHIERS MODIFIÉS

```
src/app/pages/
├── CompleteProfilePage.tsx    ✅ Import sanitizeRedirectUrl
│                              ✅ Lecture auth_return_to
│                              ✅ Redirection conditionnelle
│
└── AuthCallback.tsx           ✅ (Déjà OK - préserve sessionStorage)
```

---

## 🎯 FLUX RÉSUMÉ

### LoginPage / RegisterPage
```typescript
// Enregistre la page d'origine
const safeFrom = sanitizeRedirectUrl(from);
if (safeFrom) {
  sessionStorage.setItem('auth_return_to', safeFrom);
}
```

### AuthCallback
```typescript
// Redirige vers /complete-profile si profil incomplet
// ⚠️ NE NETTOIE PAS le sessionStorage !
if (!hasValidPhone) {
  navigate('/complete-profile', { replace: true });
  return;
}

// Si profil complet, utilise et nettoie
const returnTo = sessionStorage.getItem('auth_return_to');
if (returnTo) {
  sessionStorage.removeItem('auth_return_to');
}
navigate(safeReturnTo || '/dashboard/vendeur');
```

### CompleteProfilePage (NOUVEAU)
```typescript
// Après validation du profil
const returnTo = sessionStorage.getItem('auth_return_to');
if (returnTo) {
  sessionStorage.removeItem('auth_return_to');
}

// Redirection vers page d'origine ou dashboard
navigate(safeReturnTo || '/dashboard/vendeur');
```

---

## 🎉 RÉSULTAT

✅ **Utilisateur redirigé vers la page d'origine** après complétion du profil  
✅ **sessionStorage préservé** pendant tout le flux OAuth  
✅ **Sécurité renforcée** avec `sanitizeRedirectUrl()`  
✅ **Expérience utilisateur fluide** : retour là où il était  

---

## 🚀 DÉPLOIEMENT

```bash
git add src/app/pages/CompleteProfilePage.tsx
git commit -m "feat: redirection vers page d'origine après complétion profil"
git push origin main
```

---

**Date :** 3 janvier 2026  
**Commit :** À venir  
**Impact :** UX considérablement améliorée pour les utilisateurs OAuth

