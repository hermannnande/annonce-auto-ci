# 🚀 Installation Complète Supabase - AnnonceAuto.ci

Guide pas-à-pas pour rendre le site 100% fonctionnel.

---

## ✅ CE QUI A ÉTÉ CRÉÉ

Tous les fichiers nécessaires sont maintenant dans le projet :

### Services Backend
- ✅ `/src/app/lib/supabase.ts` - Client Supabase
- ✅ `/src/app/services/auth.service.ts` - Authentification
- ✅ `/src/app/services/listings.service.ts` - Gestion annonces
- ✅ `/src/app/services/credits.service.ts` - Gestion crédits
- ✅ `/src/app/services/storage.service.ts` - Upload images

### Context & Hooks
- ✅ `/src/app/context/AuthContext.tsx` - Contexte d'authentification
- ✅ `/src/app/components/ProtectedRoute.tsx` - Protection des routes

### Configuration
- ✅ `/SUPABASE_SETUP.sql` - Script création base de données
- ✅ `/.env.local.example` - Template variables d'environnement

---

## 📋 ÉTAPES D'INSTALLATION

### ÉTAPE 1 : Créer le projet Supabase (10 min)

#### 1.1 S'inscrire sur Supabase

👉 **https://supabase.com/**

1. Cliquer "Start your project"
2. S'inscrire avec GitHub (recommandé) ou email
3. Vérifier votre email

#### 1.2 Créer un nouveau projet

1. Sur le dashboard, cliquer "New Project"
2. Choisir une organisation (ou en créer une)
3. Configurer le projet :
   - **Name** : `annonceauto-ci`
   - **Database Password** : Créer un mot de passe fort (NOTEZ-LE !)
   - **Region** : Choisir `West Europe (Ireland)` ou la plus proche
   - **Pricing Plan** : Free (suffisant pour commencer)
4. Cliquer "Create new project"
5. **Attendre 2-3 minutes** (création de la base de données)

#### 1.3 Récupérer les clés API

Une fois le projet créé :

1. Dans le menu gauche, cliquer sur ⚙️ **Settings**
2. Cliquer sur **API**
3. Vous verrez :
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon public key** (commence par `eyJ...`)

**📝 NOTEZ CES 2 VALEURS QUELQUE PART !**

---

### ÉTAPE 2 : Créer la base de données (5 min)

#### 2.1 Ouvrir le SQL Editor

1. Dans le menu gauche de Supabase, cliquer sur 🗂️ **SQL Editor**
2. Cliquer "New query"

#### 2.2 Exécuter le script SQL

1. Ouvrir le fichier `/SUPABASE_SETUP.sql` dans Cursor
2. **Copier TOUT le contenu**
3. Coller dans le SQL Editor de Supabase
4. Cliquer "Run" ou `Ctrl/Cmd + Enter`
5. Attendre l'exécution (~10 secondes)
6. Vérifier qu'il y a écrit "Success" en vert

#### 2.3 Vérifier la création

1. Dans le menu gauche, cliquer sur 🗃️ **Table Editor**
2. Vous devriez voir les tables :
   - `profiles`
   - `listings`
   - `credit_transactions`
   - `boosts`
   - `favorites`
   - `messages`

**✅ La base de données est créée !**

---

### ÉTAPE 3 : Créer le bucket Storage (2 min)

#### 3.1 Créer le bucket

1. Dans le menu gauche de Supabase, cliquer sur 📁 **Storage**
2. Cliquer "Create a new bucket"
3. Configurer :
   - **Name** : `vehicle-images`
   - **Public bucket** : ✅ Cocher (images publiques)
4. Cliquer "Create bucket"

#### 3.2 Vérifier

Vous devriez voir le bucket `vehicle-images` dans la liste.

**✅ Le stockage est prêt !**

---

### ÉTAPE 4 : Désactiver la confirmation email (DEV SEULEMENT)

**Pour le développement, désactivons la confirmation par email :**

1. Dans Supabase, aller dans **Authentication** > **Settings**
2. Chercher "Email Confirmations"
3. **Décocher** "Enable email confirmations"
4. Cliquer "Save"

⚠️ **En production, réactivez cette option !**

---

### ÉTAPE 5 : Configurer le projet (5 min)

#### 5.1 Installer Supabase JS

Ouvrir Cursor, puis le terminal (`` Ctrl + ` ``) :

```bash
pnpm add @supabase/supabase-js
```

#### 5.2 Créer le fichier .env.local

1. Dans Cursor, créer un fichier `.env.local` à la racine
2. Copier le contenu de `.env.local.example`
3. Remplacer par vos vraies valeurs :

```env
VITE_SUPABASE_URL=https://votreprojet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre_vraie_key
```

**⚠️ Utilisez vos vraies valeurs de l'étape 1.3 !**

#### 5.3 Vérifier que .env.local est ignoré

Dans `.gitignore`, vérifier qu'il y a :

```
.env.local
.env
```

**✅ Configuration terminée !**

---

### ÉTAPE 6 : Intégrer dans App.tsx (5 min)

#### 6.1 Entourer avec AuthProvider

Ouvrir `/src/app/App.tsx` dans Cursor et demander :

```
Importe AuthProvider depuis ./context/AuthContext
et entoure toutes les routes avec <AuthProvider>

Exemple :
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* routes existantes */}
      </Router>
    </AuthProvider>
  );
}
```

#### 6.2 Protéger les routes privées

Demander à Cursor :

```
Importe ProtectedRoute depuis ./components/ProtectedRoute

Entoure les routes suivantes avec ProtectedRoute:

1. /dashboard/vendeur/* → <ProtectedRoute requiredUserType="vendor">
2. /dashboard/admin/* → <ProtectedRoute requiredUserType="admin">
3. /publier → <ProtectedRoute> (n'importe quel type connecté)

Exemple :
<Route 
  path="/dashboard/vendeur" 
  element={
    <ProtectedRoute requiredUserType="vendor">
      <VendorDashboard />
    </ProtectedRoute>
  } 
/>
```

**✅ Les routes sont protégées !**

---

### ÉTAPE 7 : Tester l'authentification (10 min)

#### 7.1 Modifier LoginPage

Dans Cursor, demander :

```
@LoginPage.tsx

Remplace la logique mockée par useAuth :

1. Import useAuth depuis ../context/AuthContext
2. Import useNavigate depuis react-router-dom
3. Importe toast depuis sonner

Dans handleSubmit :
- Utiliser await signIn({ email, password })
- Si error: toast.error(error.message)
- Si succès: 
  - toast.success('Connexion réussie !')
  - navigate vers /dashboard-selector

Ajoute un état loading pendant la connexion.
Désactive le bouton pendant loading.

GARDE tout le design actuel.
```

#### 7.2 Modifier RegisterPage

```
@RegisterPage.tsx

Remplace la logique mockée par useAuth :

1. Import useAuth
2. Import useNavigate et toast

Dans handleSubmit :
- Utiliser await signUp({ email, password, fullName, userType, phone })
- Si error: toast.error
- Si succès: 
  - toast.success
  - navigate vers /dashboard-selector

État loading.
Design inchangé.
```

#### 7.3 Tester

1. Lancer le serveur : `pnpm run dev`
2. Aller sur http://localhost:5173/inscription
3. Créer un compte :
   - Email : `test@example.com`
   - Password : `Test123!`
   - Nom : `Test Vendeur`
   - Type : Vendeur
4. Cliquer "S'inscrire"
5. Vous devriez être redirigé vers le dashboard selector

#### 7.4 Vérifier dans Supabase

1. Dans Supabase, aller dans **Authentication** > **Users**
2. Vous devriez voir votre utilisateur
3. Aller dans **Table Editor** > **profiles**
4. Vous devriez voir votre profil

**✅ L'authentification fonctionne !**

---

### ÉTAPE 8 : Activer les vraies annonces (15 min)

#### 8.1 Modifier PublishPage

Dans Cursor :

```
@PublishPage.tsx

Intègre Supabase pour publier vraiment :

1. Import useAuth, useNavigate, toast
2. Import listingsService depuis ../services/listings.service
3. Import storageService depuis ../services/storage.service

Dans handleSubmit :
1. Vérifier que user est connecté
2. Upload images avec storageService.uploadVehicleImages(selectedImages)
3. Créer annonce avec listingsService.createListing(user.id, {
     ...formData,
     images: uploadedUrls
   })
4. Si succès: toast + redirect vers /dashboard/vendeur/annonces
5. Si erreur: toast.error

Loading states.
Design inchangé.
```

#### 8.2 Modifier ListingsPage

```
@ListingsPage.tsx

Affiche les vraies annonces :

1. Import useState, useEffect
2. Import listingsService
3. Import type Listing depuis ../lib/supabase

État listings, loading, filters

useEffect(() => {
  async function loadListings() {
    setLoading(true);
    const data = await listingsService.getAllListings(filters);
    setListings(data);
    setLoading(false);
  }
  loadListings();
}, [filters]);

Afficher listings.map(...) au lieu de vehicleData.map(...)

Loading state pendant le chargement.
```

#### 8.3 Modifier VendorListings

```
@VendorListings.tsx

Affiche les annonces du vendeur :

1. Import useAuth, useState, useEffect
2. Import listingsService

useEffect pour charger getUserListings(profile.id)

Boutons modifier/supprimer fonctionnels :
- handleEdit: navigate vers /modifier/:id
- handleDelete: await listingsService.deleteListing(id) puis recharger

Loading et messages si aucune annonce.
```

#### 8.4 Tester

1. Se connecter comme vendeur
2. Aller sur `/publier`
3. Remplir le formulaire
4. Ajouter 2-3 images
5. Publier
6. Vérifier dans Supabase Table Editor > listings
7. L'annonce apparaît dans "Mes annonces"
8. L'annonce apparaît sur `/annonces`

**✅ Les annonces fonctionnent !**

---

### ÉTAPE 9 : Dashboard avec vraies données (10 min)

#### 9.1 Modifier VendorDashboard

```
@VendorDashboard.tsx

Affiche les vraies stats :

1. Import useAuth, useState, useEffect
2. Import listingsService

État : stats { total, active, sold, totalViews }

useEffect(() => {
  async function loadStats() {
    const data = await listingsService.getUserStats(profile.id);
    setStats(data);
  }
  loadStats();
}, [profile]);

Afficher les vraies valeurs dans les KPI cards.
Charger les vraies annonces pour les graphiques.
```

#### 9.2 Tester

1. Aller sur `/dashboard/vendeur`
2. Les KPIs affichent les vrais nombres
3. Les graphiques montrent les vraies données

**✅ Le dashboard fonctionne !**

---

### ÉTAPE 10 : Système de crédits (10 min)

#### 9.1 Modifier VendorRecharge

```
@VendorRecharge.tsx

Intègre vraie recharge :

1. Import useAuth
2. Import creditsService depuis ../services/credits.service

handleSubmit :
- await creditsService.purchaseCredits(profile.id, {
    amount: selectedAmount,
    paymentMethod: selectedProvider,
    phoneNumber: phone
  })
- toast.success
- setTimeout(() => navigate('/merci'), 2000)

Afficher le vrai solde de crédits depuis profile.credits
```

#### 9.2 Modifier VendorBooster

```
@VendorBooster.tsx

Intègre vrai boost :

1. Import useAuth, listingsService, creditsService
2. Charger les annonces du vendeur
3. Afficher vrai solde crédits

handleBoost :
- Vérifier crédits suffisants
- await listingsService.boostListing(listingId, userId, days, cost)
- await creditsService.spendCredits(userId, cost, 'Boost annonce')
- toast.success
- Recharger les données
```

#### 9.3 Tester

1. Aller sur `/dashboard/vendeur/recharge`
2. Acheter 50 crédits
3. Vérifier dans Supabase que les crédits sont ajoutés
4. Booster une annonce
5. Vérifier que les crédits sont déduits

**✅ Les crédits fonctionnent !**

---

### ÉTAPE 11 : Dashboard Admin (optionnel, 15 min)

#### 11.1 Créer un utilisateur admin

Dans Supabase SQL Editor :

```sql
-- Remplacer par votre email admin
UPDATE profiles 
SET user_type = 'admin', full_name = 'Admin' 
WHERE email = 'admin@example.com';
```

#### 11.2 Modifier AdminDashboard

```
@AdminDashboard.tsx

Affiche stats globales :

1. Charger TOUTES les annonces (admin peut tout voir)
2. Charger tous les utilisateurs
3. Compter transactions
4. Afficher les vraies stats
```

#### 11.3 Modifier AdminModeration

```
@AdminModeration.tsx

Modération fonctionnelle :

1. Charger toutes les annonces (incluant pending)
2. Boutons Approuver/Rejeter fonctionnels :
   - await listingsService.updateStatus(id, 'active' ou 'rejected')
```

#### 11.4 Tester

1. Se connecter comme admin
2. Voir toutes les annonces
3. Approuver/rejeter des annonces

**✅ L'admin fonctionne !**

---

## 🎉 RÉSULTAT FINAL

Après ces étapes, vous avez :

- ✅ **Authentification réelle** (inscription/connexion qui fonctionnent)
- ✅ **Vraies annonces** (publiées et stockées en BDD)
- ✅ **Vraies images** (uploadées sur Supabase Storage)
- ✅ **Vrai système de crédits** (achat et dépense)
- ✅ **Vrai dashboard** (avec vraies statistiques)
- ✅ **Modération admin** (approuver/rejeter)
- ✅ **Protection des routes** (redirection si non connecté)

**Le site est 100% OPÉRATIONNEL ! 🚀**

---

## 🐛 Dépannage

### Erreur : "Invalid API key"

**Solution :** Vérifier que `.env.local` contient les bonnes clés Supabase

### Erreur : "relation does not exist"

**Solution :** Le script SQL n'a pas été exécuté. Retourner à l'étape 2.

### Erreur : "Row Level Security"

**Solution :** Vérifier que les policies RLS sont créées (dans le script SQL)

### Images ne s'uploadent pas

**Solution :** 
1. Vérifier que le bucket `vehicle-images` existe
2. Vérifier qu'il est public (Settings du bucket)

### Confirmation email bloque inscription

**Solution :** Désactiver la confirmation email (étape 4)

---

## 📝 Prochaines étapes

### Pour production
1. Réactiver confirmation email
2. Configurer domaine custom
3. Activer 2FA pour admin
4. Intégrer vraie API Mobile Money
5. Ajouter monitoring (Sentry)

### Fonctionnalités additionnelles
1. Messagerie entre users
2. Notifications push
3. Favoris
4. Recherche avancée
5. Export PDF annonces

---

## ✅ Checklist finale

- [ ] Compte Supabase créé
- [ ] Projet Supabase créé
- [ ] Script SQL exécuté
- [ ] Bucket Storage créé
- [ ] Package @supabase/supabase-js installé
- [ ] Fichier .env.local créé avec vraies clés
- [ ] AuthProvider intégré dans App.tsx
- [ ] Routes protégées avec ProtectedRoute
- [ ] LoginPage utilise useAuth
- [ ] RegisterPage utilise useAuth
- [ ] PublishPage upload images et crée annonces
- [ ] ListingsPage affiche vraies annonces
- [ ] VendorDashboard affiche vraies stats
- [ ] VendorRecharge achète vrais crédits
- [ ] VendorBooster dépense crédits
- [ ] Tout testé et fonctionne

---

**Félicitations ! Votre site est maintenant 100% fonctionnel ! 🎉**

**Besoin d'aide ? Consultez la documentation Supabase : https://supabase.com/docs**
