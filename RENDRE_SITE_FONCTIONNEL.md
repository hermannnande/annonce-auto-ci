# 🚀 Rendre AnnonceAuto.ci VRAIMENT Fonctionnel

Guide complet pour transformer le site d'un template en application opérationnelle.

---

## 🎯 Objectif

Passer de :
- ❌ Données mockées (fausses)
- ❌ Connexion simulée
- ❌ Publications qui ne sauvegardent pas

À :
- ✅ Base de données réelle
- ✅ Authentification fonctionnelle
- ✅ Publications sauvegardées
- ✅ Site 100% opérationnel

---

## 🚀 Solution : Supabase (Backend instantané)

**Supabase vous donne :**
- ✅ Base de données PostgreSQL (gratuit jusqu'à 500 Mo)
- ✅ Authentification (connexion/inscription)
- ✅ API REST automatique
- ✅ Stockage fichiers (images véhicules)
- ✅ Temps réel (mises à jour live)

**Prix :** GRATUIT jusqu'à un certain usage, puis très abordable

---

## 📋 Plan d'action (2-3 heures)

### Phase 1 : Configuration Supabase (30 min)
1. Créer compte Supabase
2. Créer projet
3. Créer les tables (utilisateurs, annonces, crédits, etc.)
4. Configurer authentification

### Phase 2 : Intégration Code (1h30)
1. Installer SDK Supabase
2. Configurer le client
3. Créer les services (auth, listings, credits)
4. Remplacer données mockées

### Phase 3 : Tests (30 min)
1. Tester inscription/connexion
2. Tester publication d'annonce
3. Tester dashboard
4. Corriger les bugs

### Phase 4 : Mobile Money (optionnel)
Intégrer API de paiement réel

---

## 🔧 ÉTAPE 1 : Créer compte Supabase

### 1.1 S'inscrire

👉 **https://supabase.com/**

1. Cliquer "Start your project"
2. S'inscrire avec GitHub ou email
3. Vérifier email

### 1.2 Créer un projet

1. Cliquer "New Project"
2. Choisir un nom : `annonceauto-ci`
3. Créer un mot de passe base de données (NOTER QUELQUE PART)
4. Choisir région : `West Europe (Ireland)` ou plus proche de la Côte d'Ivoire
5. Cliquer "Create new project"
6. **Attendre 2-3 minutes** (création du projet)

### 1.3 Récupérer les clés

Une fois le projet créé :

1. Aller dans **Settings** (icône engrenage)
2. Cliquer **API**
3. Copier :
   - `Project URL` (ex: https://abcdefgh.supabase.co)
   - `anon public` key (commence par eyJ...)

**NOTER CES 2 VALEURS QUELQUE PART !**

---

## 🗄️ ÉTAPE 2 : Créer la base de données

### 2.1 Schéma de base de données

Dans Supabase, aller dans **SQL Editor** et exécuter ce script :

```sql
-- Table des profils utilisateurs (étendue de auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('vendor', 'admin')),
  credits INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des annonces de véhicules
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  fuel_type TEXT CHECK (fuel_type IN ('essence', 'diesel', 'electrique', 'hybride')),
  transmission TEXT CHECK (transmission IN ('manuelle', 'automatique')),
  condition TEXT CHECK (condition IN ('neuf', 'occasion')),
  location TEXT NOT NULL,
  images TEXT[], -- Array d'URLs d'images
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rejected')),
  views INTEGER DEFAULT 0,
  is_boosted BOOLEAN DEFAULT FALSE,
  boost_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des transactions de crédits
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT CHECK (type IN ('purchase', 'spent', 'refund')),
  description TEXT,
  payment_method TEXT, -- 'orange_money', 'mtn_money', 'moov_money', 'wave'
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des boosts d'annonces
CREATE TABLE boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  duration_days INTEGER NOT NULL,
  credits_used INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des favoris
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Indexes pour performance
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Profiles sont visibles par tous" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users peuvent mettre à jour leur propre profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies pour listings
CREATE POLICY "Listings actives visibles par tous" ON listings
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users peuvent créer leurs propres listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users peuvent modifier leurs propres listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users peuvent supprimer leurs propres listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Policies pour credit_transactions
CREATE POLICY "Users peuvent voir leurs propres transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users peuvent créer des transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies pour favorites
CREATE POLICY "Users peuvent voir leurs propres favoris" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users peuvent ajouter aux favoris" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users peuvent supprimer de leurs favoris" ON favorites
  FOR DELETE USING (auth.uid() = user_id);
```

**Cliquer "RUN" pour exécuter le script.**

### 2.2 Vérifier la création

1. Aller dans **Table Editor**
2. Vous devriez voir : `profiles`, `listings`, `credit_transactions`, `boosts`, `favorites`

---

## 📦 ÉTAPE 3 : Installer Supabase dans le projet

### 3.1 Ouvrir Cursor AI

```bash
cd annonceauto-ci
cursor .
```

### 3.2 Installer le package

**Terminal dans Cursor :** `` Ctrl + ` ``

```bash
pnpm add @supabase/supabase-js
```

### 3.3 Créer fichier .env

Créer `/src/.env.local` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

**Remplacer avec vos vraies valeurs de l'étape 1.3 !**

### 3.4 Ajouter .env.local au .gitignore

Vérifier que `.gitignore` contient :

```
.env.local
.env
```

---

## 🔌 ÉTAPE 4 : Créer les services Supabase

### 4.1 Client Supabase

Demander à Cursor (Chat `Cmd/Ctrl + L`) :

```
Crée /src/app/services/supabase.ts

Client Supabase avec :
- Import de createClient depuis @supabase/supabase-js
- Utiliser import.meta.env.VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
- Exporter le client
- Gérer les cas où les variables d'environnement ne sont pas définies

Code TypeScript strict.
```

### 4.2 Service d'authentification

```
Crée /src/app/services/auth.ts

Service d'authentification avec Supabase :

Fonctions :
- signUp(email, password, fullName, userType) - Inscription
- signIn(email, password) - Connexion
- signOut() - Déconnexion
- getCurrentUser() - Utilisateur actuel
- updateProfile(data) - Mise à jour profil

Utilise le client Supabase.
Crée aussi le profil dans la table profiles après signUp.
Gestion d'erreurs complète.
Types TypeScript.
```

### 4.3 Service annonces

```
Crée /src/app/services/listings.ts

Service de gestion des annonces avec Supabase :

Fonctions :
- getAllListings(filters?) - Toutes les annonces actives
- getListingById(id) - Une annonce
- getUserListings(userId) - Annonces d'un utilisateur
- createListing(data) - Créer annonce
- updateListing(id, data) - Modifier annonce
- deleteListing(id) - Supprimer annonce
- incrementViews(id) - Incrémenter vues
- boostListing(id, days) - Booster annonce

Types TypeScript basés sur le schéma de la table listings.
Gestion d'erreurs.
```

### 4.4 Service crédits

```
Crée /src/app/services/credits.ts

Service de gestion des crédits avec Supabase :

Fonctions :
- getUserCredits(userId) - Crédits d'un utilisateur
- purchaseCredits(userId, amount, paymentMethod) - Acheter crédits
- spendCredits(userId, amount, description) - Dépenser crédits
- getCreditTransactions(userId) - Historique transactions

Gestion d'erreurs et transactions atomiques.
```

---

## 🎣 ÉTAPE 5 : Créer les hooks React

### 5.1 Hook useAuth

```
Crée /src/app/hooks/useAuth.ts

Hook React useAuth avec Supabase :

État :
- user (utilisateur connecté ou null)
- profile (profil de l'utilisateur)
- loading (chargement)
- error (erreur)

Fonctions :
- signUp(email, password, fullName, userType)
- signIn(email, password)
- signOut()
- updateProfile(data)

Utilise useEffect pour écouter les changements d'auth.
Récupère le profil automatiquement après connexion.

Export du contexte AuthContext et du provider AuthProvider.
```

### 5.2 Hook useListings

```
Crée /src/app/hooks/useListings.ts

Hook React useListings pour gérer les annonces :

Fonctions :
- listings (liste)
- loading
- error
- fetchListings(filters)
- createListing(data)
- updateListing(id, data)
- deleteListing(id)

Utilise le service listings.ts
Gestion du loading et des erreurs.
```

---

## 🔄 ÉTAPE 6 : Intégrer dans les pages

### 6.1 Page de connexion

```
@LoginPage.tsx

Remplace la logique mockée par useAuth :

1. Import useAuth
2. Utiliser signIn du hook
3. Gérer les erreurs (toast.error)
4. Gérer le loading
5. Rediriger après connexion réussie vers /dashboard-selector

Garde le design existant, change seulement la logique.
```

### 6.2 Page d'inscription

```
@RegisterPage.tsx

Remplace la logique mockée par useAuth :

1. Import useAuth
2. Utiliser signUp du hook
3. Champs : email, password, fullName, userType (vendor/admin)
4. Gérer erreurs et loading
5. Rediriger après inscription vers /dashboard-selector

Garde le design existant.
```

### 6.3 Page de publication

```
@PublishPage.tsx

Remplace la logique mockée par useListings :

1. Import useAuth et useListings
2. Vérifier que l'utilisateur est connecté
3. Utiliser createListing du hook
4. Uploader les images vers Supabase Storage
5. Toast de succès
6. Rediriger vers dashboard

Garde le design et formulaire existants.
```

### 6.4 Dashboard vendeur

```
@VendorDashboard.tsx

Utilise les vraies données :

1. Import useAuth et useListings
2. Récupérer les annonces de l'utilisateur connecté
3. Calculer les vrais KPIs (total annonces, vues, etc.)
4. Afficher les vraies données dans les graphiques
5. Loading states

Garde tout le design et les composants visuels.
```

### 6.5 Mes annonces (vendeur)

```
@VendorListings.tsx

Affiche les vraies annonces :

1. Import useAuth et useListings
2. Récupérer getUserListings(currentUser.id)
3. Afficher les annonces réelles
4. Boutons modifier/supprimer fonctionnels
5. Bouton boost fonctionnel (avec credits)

Design inchangé.
```

---

## 🛡️ ÉTAPE 7 : Protéger les routes

### 7.1 Composant ProtectedRoute

```
Crée /src/app/components/ProtectedRoute.tsx

Composant qui protège les routes privées :

Props :
- children (React.ReactNode)
- requiredUserType? ('vendor' | 'admin')

Logique :
- Utilise useAuth
- Si pas connecté → rediriger vers /connexion
- Si userType requis et ne correspond pas → rediriger
- Sinon afficher children

Loading state pendant vérification.
```

### 7.2 Mettre à jour les routes

```
@App.tsx

Entoure les routes protégées avec ProtectedRoute :

- /dashboard/vendeur/* → requiredUserType="vendor"
- /dashboard/admin/* → requiredUserType="admin"
- /publier → connecté requis

Exemple :
<Route path="/dashboard/vendeur" element={
  <ProtectedRoute requiredUserType="vendor">
    <VendorDashboard />
  </ProtectedRoute>
} />
```

---

## 🖼️ ÉTAPE 8 : Upload d'images (Supabase Storage)

### 8.1 Créer le bucket dans Supabase

1. Dans Supabase, aller dans **Storage**
2. Créer un bucket : `vehicle-images`
3. Rendre public : Settings → Make public

### 8.2 Service d'upload

```
Crée /src/app/services/storage.ts

Service d'upload d'images :

Fonctions :
- uploadVehicleImages(files: File[]) → Promise<string[]>
  - Upload les fichiers vers vehicle-images
  - Retourne les URLs publiques
  - Noms de fichiers uniques (UUID + nom original)
  
- deleteVehicleImage(url: string) → Promise<void>
  - Supprime une image

Gestion d'erreurs et validation (taille, type).
```

### 8.3 Intégrer dans PublishPage

```
@PublishPage.tsx

Lors de la soumission du formulaire :

1. Uploader les images avec uploadVehicleImages(selectedFiles)
2. Récupérer les URLs
3. Créer l'annonce avec ces URLs dans le champ images
4. Loading pendant l'upload

Afficher preview des images avant upload.
```

---

## 🧪 ÉTAPE 9 : Tester

### 9.1 Tester l'inscription

1. Aller sur `/inscription`
2. Remplir le formulaire
3. Vérifier que l'utilisateur est créé dans Supabase (Table `auth.users` et `profiles`)
4. Vérifier redirection vers dashboard

### 9.2 Tester la connexion

1. Aller sur `/connexion`
2. Se connecter avec les identifiants
3. Vérifier redirection
4. Vérifier que le profil est chargé

### 9.3 Tester publication

1. Se connecter comme vendeur
2. Aller sur `/publier`
3. Remplir formulaire
4. Ajouter images
5. Publier
6. Vérifier que l'annonce apparaît dans la table `listings`
7. Vérifier qu'elle apparaît dans "Mes annonces"

### 9.4 Tester dashboard

1. Vérifier que les KPIs affichent les vraies valeurs
2. Vérifier que les graphiques montrent les vraies données
3. Tester les filtres

---

## 🐛 Problèmes courants

### Erreur : "Invalid API key"

**Solution :** Vérifier que `.env.local` contient les bonnes clés Supabase

### Erreur : "Row Level Security"

**Solution :** Vérifier que les policies RLS sont bien créées (étape 2.1)

### Images ne s'uploadent pas

**Solution :** 
1. Vérifier que le bucket `vehicle-images` existe
2. Vérifier qu'il est public

### Connexion ne fonctionne pas

**Solution :**
1. Vérifier la console navigateur pour les erreurs
2. Vérifier que l'email est confirmé (désactiver confirmation email dans Supabase pour dev)

---

## 📚 ÉTAPE 10 : Prompts Cursor complets

### Prompt 1 : Configuration initiale

```
Je vais intégrer Supabase pour rendre mon site AnnonceAuto.ci fonctionnel.

J'ai déjà :
- Créé un projet Supabase
- Créé les tables (profiles, listings, credit_transactions, etc.)
- Installé @supabase/supabase-js

Maintenant, crée pour moi :

1. /src/app/services/supabase.ts - Client Supabase
   Variables d'env : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

2. /src/app/services/auth.ts - Service authentification
   Fonctions : signUp, signIn, signOut, getCurrentUser, updateProfile

3. /src/app/services/listings.ts - Service annonces
   Fonctions : getAllListings, createListing, updateListing, deleteListing, etc.

4. /src/app/hooks/useAuth.ts - Hook React auth
   Avec AuthContext et AuthProvider

TypeScript strict. Gestion d'erreurs complète.
Respecte les conventions du projet (@.cursorrules).
```

### Prompt 2 : Intégrer auth dans les pages

```
Maintenant que j'ai les services Supabase, intègre l'authentification réelle :

1. @LoginPage.tsx - Utiliser useAuth().signIn au lieu de la logique mockée
   Gérer loading, erreurs, redirection

2. @RegisterPage.tsx - Utiliser useAuth().signUp
   Même logique

3. @App.tsx - Créer AuthProvider qui entoure toutes les routes
   Import depuis /src/app/hooks/useAuth.ts

4. Créer /src/app/components/ProtectedRoute.tsx
   Protéger les routes privées

Garde TOUS les designs existants.
Change SEULEMENT la logique.
```

### Prompt 3 : Annonces réelles

```
Intègre les annonces réelles avec Supabase :

1. @PublishPage.tsx
   - Utiliser useListings().createListing
   - Upload images vers Supabase Storage (bucket: vehicle-images)
   - Créer /src/app/services/storage.ts pour l'upload

2. @ListingsPage.tsx
   - Utiliser useListings().fetchListings
   - Afficher les vraies annonces depuis Supabase

3. @VendorListings.tsx
   - Utiliser useListings().getUserListings(currentUser.id)
   - Boutons modifier/supprimer fonctionnels

Garde les designs. Change la logique.
```

---

## ✅ Checklist complète

### Configuration Supabase
- [ ] Compte Supabase créé
- [ ] Projet créé
- [ ] Tables créées (script SQL exécuté)
- [ ] Clés API récupérées
- [ ] Bucket Storage créé

### Installation code
- [ ] @supabase/supabase-js installé
- [ ] Fichier .env.local créé
- [ ] Client Supabase créé
- [ ] Services créés (auth, listings, credits, storage)
- [ ] Hooks créés (useAuth, useListings)

### Intégration pages
- [ ] LoginPage utilise useAuth
- [ ] RegisterPage utilise useAuth
- [ ] PublishPage utilise useListings
- [ ] VendorDashboard affiche vraies données
- [ ] VendorListings affiche vraies annonces
- [ ] Routes protégées avec ProtectedRoute

### Tests
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Publication annonce fonctionne
- [ ] Upload images fonctionne
- [ ] Dashboard affiche vraies données

---

## 🎉 Résultat final

Après ces étapes, vous aurez :
- ✅ Authentification réelle (inscription/connexion)
- ✅ Publications d'annonces sauvegardées en BDD
- ✅ Upload d'images fonctionnel
- ✅ Dashboard avec vraies données
- ✅ Site 100% opérationnel

**Temps estimé avec Cursor AI : 2-3 heures**

---

**Prêt à commencer ? Suivez les étapes dans l'ordre ! 🚀**
