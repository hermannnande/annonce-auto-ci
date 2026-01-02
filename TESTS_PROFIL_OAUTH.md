# 🧪 GUIDE DE TEST : Vérification Profil OAuth

## 🎯 OBJECTIF
Tester la nouvelle fonctionnalité de complétion de profil obligatoire après inscription OAuth.

---

## ✅ TEST 1 : Inscription OAuth → Complétion Profil

### Étapes
1. **Aller sur** `http://localhost:5174/inscription`
2. **Cliquer sur** "Continuer avec Google"
3. **Se connecter** avec compte Google
4. **Vérifier** : Redirection automatique vers `/complete-profile`
5. **Observer** :
   - ✅ Nom prérempli depuis Google
   - ✅ Champ téléphone vide
   - ✅ Message "Votre numéro sera affiché sur vos annonces"
6. **Essayer numéro invalide** : `123` → ❌ Erreur
7. **Entrer numéro valide** : `+225 07 12 34 56 78`
8. **Observer formatage automatique** pendant la saisie
9. **Cliquer** "Valider mon profil"
10. **Vérifier** : Redirection vers `/dashboard/vendeur`
11. **Vérifier** : Toast "Profil complété avec succès !"

### Résultat attendu
✅ Profil complété  
✅ Numéro enregistré dans la base de données  
✅ Utilisateur peut maintenant publier des annonces

---

## ✅ TEST 2 : Tentative de Publication sans Profil Complet

### Préparation
1. **Se connecter** via OAuth
2. **Dans la console navigateur**, exécuter :
   ```javascript
   // Simuler un profil incomplet en modifiant le localStorage
   // OU utiliser les DevTools Supabase pour modifier directement
   ```
3. **Alternative** : Modifier manuellement dans Supabase Dashboard
   - Aller sur `profiles` table
   - Trouver votre profil
   - Mettre `phone` à `+225 00 00 00 00 00`

### Étapes
1. **Aller sur** `/publier`
2. **Remplir tout le formulaire** d'annonce
3. **Cliquer** "Publier l'annonce"
4. **Observer** :
   - ✅ Toast d'erreur : "Veuillez renseigner votre numéro de téléphone"
   - ✅ Description : "Vous devez compléter votre profil avant de publier"
   - ✅ Bouton "Compléter mon profil" cliquable
5. **Cliquer** sur le bouton dans le toast
6. **Vérifier** : Redirection vers `/complete-profile`

### Résultat attendu
❌ Publication bloquée  
✅ Message d'erreur clair  
✅ Action proposée (compléter profil)

---

## ✅ TEST 3 : Publication avec Profil Complet

### Étapes
1. **S'assurer** que le profil est complet (Test 1 fait)
2. **Aller sur** `/publier`
3. **Remplir** le formulaire d'annonce
4. **Cliquer** "Publier l'annonce"
5. **Observer** :
   - ✅ Aucune erreur de profil
   - ✅ Validation normale du formulaire
   - ✅ Annonce créée avec succès

### Résultat attendu
✅ Publication autorisée  
✅ Annonce créée avec le bon numéro de téléphone

---

## ✅ TEST 4 : Accès Direct à `/complete-profile` avec Profil Complet

### Étapes
1. **Se connecter** avec un profil complet
2. **Aller sur** `/complete-profile` (URL manuelle)
3. **Observer** :
   - ✅ Redirection automatique vers `/dashboard/vendeur`
   - ✅ Message : "Profil déjà complet" (optionnel)

### Résultat attendu
✅ Redirection automatique  
✅ Pas d'accès à la page si profil déjà complet

---

## ✅ TEST 5 : Connexion Utilisateur Existant (Profil Complet)

### Étapes
1. **Se déconnecter**
2. **Se reconnecter** via OAuth (compte déjà existant avec profil complet)
3. **Observer** :
   - ✅ Redirection directe vers `/dashboard/vendeur`
   - ✅ PAS de passage par `/complete-profile`

### Résultat attendu
✅ Connexion normale  
✅ Pas de demande de complétion si déjà fait

---

## ✅ TEST 6 : Validation du Téléphone

### Formats valides
- `+225 07 12 34 56 78` ✅
- `+225 05 12 34 56 78` ✅
- `+225 01 12 34 56 78` ✅
- `07 12 34 56 78` ✅
- `05 12 34 56 78` ✅

### Formats invalides
- `123` ❌
- `+225 00 00 00 00 00` ❌ (numéro par défaut)
- `+33 6 12 34 56 78` ❌ (France)
- `abcdefghij` ❌
- (vide) ❌

### Étapes
1. **Sur** `/complete-profile`
2. **Tester chaque format** ci-dessus
3. **Vérifier** :
   - ✅ Formatage automatique (espaces ajoutés)
   - ✅ Validation au submit
   - ✅ Messages d'erreur appropriés

---

## 🔍 POINTS DE VÉRIFICATION DANS LA BASE DE DONNÉES

### Après Test 1 (Complétion de profil)

**Table : `profiles`**
```sql
SELECT id, full_name, phone, email, user_type, credits
FROM profiles
WHERE email = 'votre.email@gmail.com';
```

**Résultat attendu :**
- `full_name` : Nom complet depuis Google
- `phone` : `+225 07 12 34 56 78` (votre numéro)
- `user_type` : `vendor`
- `credits` : `100` (crédits initiaux)

### Avant complétion (numéro par défaut)
```
phone: +225 00 00 00 00 00
```

### Après complétion
```
phone: +225 07 12 34 56 78
```

---

## 🐛 DÉPANNAGE

### Problème 1 : Pas de redirection vers `/complete-profile`
**Causes possibles :**
- Le profil a déjà un numéro valide
- Bug dans `AuthCallback.tsx`

**Solution :**
1. Vérifier dans Supabase Dashboard : `profiles` → votre profil → `phone`
2. Si numéro valide, c'est normal
3. Sinon, vérifier console navigateur pour logs

### Problème 2 : Validation téléphone ne fonctionne pas
**Causes possibles :**
- Regex incorrecte
- Formatage interfère

**Solution :**
1. Ouvrir console navigateur
2. Entrer numéro et observer logs
3. Vérifier regex dans `CompleteProfilePage.tsx` ligne ~47

### Problème 3 : Publication autorisée malgré profil incomplet
**Causes possibles :**
- `isProfileComplete()` retourne `true` à tort
- Profil mal vérifié

**Solution :**
1. Vérifier `profile-utils.ts`
2. Vérifier que `profile` est bien passé dans `PublishPage.tsx`
3. Ajouter `console.log(profile)` avant validation

---

## 📊 CHECKLIST COMPLÈTE

### Avant de valider
- [ ] Test 1 : Inscription OAuth → Complétion
- [ ] Test 2 : Blocage publication si incomplet
- [ ] Test 3 : Publication OK si complet
- [ ] Test 4 : Redirection si accès direct avec profil complet
- [ ] Test 5 : Connexion existante pas affectée
- [ ] Test 6 : Validation téléphone (formats valides/invalides)
- [ ] Vérification BDD : Numéro enregistré correctement
- [ ] Vérification BDD : Pas de numéro par défaut après complétion
- [ ] UI/UX : Design cohérent
- [ ] UI/UX : Animations fluides
- [ ] Toast : Messages clairs et boutons fonctionnels

### Tout fonctionne ? 🎉
✅ Prêt pour commit & déploiement !

```bash
git add .
git commit -m "feat: vérification profil complet après OAuth + blocage publication"
git push origin main
```

---

## 🎬 VIDÉO DE DÉMONSTRATION (Optionnel)

1. **Enregistrer** : Inscription OAuth complète
2. **Montrer** : Redirection vers complétion
3. **Montrer** : Validation téléphone (erreur + succès)
4. **Montrer** : Tentative publication sans profil
5. **Montrer** : Publication réussie après complétion

**Outil recommandé :** OBS Studio ou ShareX (gratuits)

---

## 📞 SUPPORT

En cas de problème :
1. Vérifier console navigateur (F12)
2. Vérifier logs Supabase Dashboard
3. Vérifier `terminals/4.txt` (logs Vite)
4. Relire `CORRECTION_PROFIL_OAUTH.md`

