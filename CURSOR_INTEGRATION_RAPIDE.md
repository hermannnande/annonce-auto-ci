# ⚡ Intégration Supabase avec Cursor AI - Guide Rapide

Utilisez ces prompts dans Cursor pour intégrer Supabase en 30 minutes.

---

## 🎯 PRÉREQUIS

Avant de commencer, vous DEVEZ avoir :
- ✅ Créé un compte Supabase
- ✅ Créé un projet Supabase
- ✅ Exécuté le script `/SUPABASE_SETUP.sql`
- ✅ Créé le bucket `vehicle-images`
- ✅ Créé le fichier `.env.local` avec vos clés
- ✅ Installé @supabase/supabase-js : `pnpm add @supabase/supabase-js`

**Si ce n'est pas fait, lisez `/INSTALLATION_SUPABASE_COMPLETE.md` d'abord !**

---

## 📝 PROMPTS CURSOR (Dans l'ordre)

### PROMPT 1 : Intégrer AuthProvider dans App.tsx

```
@App.tsx

Intègre AuthProvider pour l'authentification :

1. Importe AuthProvider depuis ./context/AuthContext
2. Entoure TOUTES les routes avec <AuthProvider>

Structure :
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* routes existantes */}
      </Router>
    </AuthProvider>
  );
}

Garde toutes les routes existantes.
Ne change QUE la structure, pas le contenu.
```

---

### PROMPT 2 : Protéger les routes privées

```
@App.tsx

Protège les routes privées avec ProtectedRoute :

1. Importe ProtectedRoute depuis ./components/ProtectedRoute

2. Entoure ces routes :
   - /dashboard/vendeur/* → <ProtectedRoute requiredUserType="vendor">
   - /dashboard/admin/* → <ProtectedRoute requiredUserType="admin">
   - /publier → <ProtectedRoute> (sans requiredUserType)

Exemple :
<Route 
  path="/dashboard/vendeur" 
  element={
    <ProtectedRoute requiredUserType="vendor">
      <VendorDashboard />
    </ProtectedRoute>
  } 
/>

Fais pareil pour TOUTES les sous-routes des dashboards.
```

---

### PROMPT 3 : LoginPage avec vraie authentification

```
@LoginPage.tsx

Remplace la logique mockée par Supabase :

1. Imports nécessaires :
   - useAuth depuis ../context/AuthContext
   - useNavigate depuis react-router-dom
   - toast depuis sonner

2. Récupère signIn depuis useAuth()

3. État loading (boolean)

4. Dans handleSubmit :
   e.preventDefault();
   setLoading(true);
   const { error } = await signIn({ email, password });
   setLoading(false);
   
   if (error) {
     toast.error(error.message);
   } else {
     toast.success('Connexion réussie !');
     navigate('/dashboard-selector');
   }

5. Désactive le bouton Submit pendant loading
6. Affiche "Connexion..." au lieu de "Se connecter" pendant loading

GARDE tout le design, les animations, les styles.
Change SEULEMENT la logique du formulaire.
```

---

### PROMPT 4 : RegisterPage avec vraie inscription

```
@RegisterPage.tsx

Remplace par Supabase :

1. Imports : useAuth, useNavigate, toast

2. États : email, password, fullName, userType, phone, loading

3. Récupère signUp depuis useAuth()

4. handleSubmit :
   e.preventDefault();
   setLoading(true);
   const { error } = await signUp({ 
     email, 
     password, 
     fullName, 
     userType, 
     phone 
   });
   setLoading(false);
   
   if (error) {
     toast.error(error.message);
   } else {
     toast.success('Compte créé ! Bienvenue 🎉');
     navigate('/dashboard-selector');
   }

GARDE tout le design.
```

---

### PROMPT 5 : PublishPage avec vraies publications

```
@PublishPage.tsx

Intègre Supabase pour publier vraiment :

1. Imports :
   - useAuth depuis ../context/AuthContext
   - listingsService depuis ../services/listings.service
   - storageService depuis ../services/storage.service
   - useNavigate, toast

2. Récupère { user, profile } depuis useAuth()

3. États : formData, selectedImages (File[]), loading, uploadProgress

4. handleSubmit :
   a. Vérifier que user existe
   
   b. Upload images :
      setLoading(true);
      const { urls, error: uploadError } = await storageService.uploadVehicleImages(selectedImages);
      if (uploadError) {
        toast.error('Erreur upload images');
        return;
      }
   
   c. Créer annonce :
      const { listing, error } = await listingsService.createListing(user.id, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        brand: formData.brand,
        model: formData.model,
        fuel_type: formData.fuelType,
        transmission: formData.transmission,
        condition: formData.condition,
        location: formData.location,
        images: urls
      });
      
      setLoading(false);
      
      if (error) {
        toast.error('Erreur création annonce');
      } else {
        toast.success('Annonce publiée avec succès ! 🎉');
        navigate('/dashboard/vendeur/annonces');
      }

5. Désactiver le formulaire pendant loading

GARDE tout le design du formulaire.
```

---

### PROMPT 6 : ListingsPage avec vraies annonces

```
@ListingsPage.tsx

Affiche les annonces de Supabase :

1. Imports :
   - useState, useEffect depuis react
   - listingsService depuis ../services/listings.service
   - type Listing depuis ../lib/supabase

2. États :
   - listings: Listing[] = []
   - loading: boolean = true
   - filters: {...}

3. useEffect pour charger :
   useEffect(() => {
     async function loadListings() {
       setLoading(true);
       const data = await listingsService.getAllListings(filters);
       setListings(data);
       setLoading(false);
     }
     loadListings();
   }, [filters]);

4. Remplace vehicleData.map(...) par listings.map(...)

5. Affiche un loader pendant loading

6. Si listings.length === 0 : afficher "Aucune annonce trouvée"

GARDE tout le design, les filtres, le SearchBar.
Change juste la source de données.
```

---

### PROMPT 7 : VendorListings (Mes annonces)

```
@VendorListings.tsx

Affiche les annonces du vendeur connecté :

1. Imports : useAuth, useState, useEffect, useNavigate, toast
2. Import listingsService, type Listing

3. États : listings, loading

4. useEffect :
   async function loadMyListings() {
     if (!profile) return;
     setLoading(true);
     const data = await listingsService.getUserListings(profile.id);
     setListings(data);
     setLoading(false);
   }

5. handleDelete fonctionnel :
   const confirmDelete = window.confirm('Supprimer cette annonce ?');
   if (!confirmDelete) return;
   
   const { error } = await listingsService.deleteListing(listingId);
   if (error) {
     toast.error('Erreur suppression');
   } else {
     toast.success('Annonce supprimée');
     loadMyListings(); // recharger
   }

6. handleEdit : navigate(\`/modifier/\${listingId}\`)

7. Bouton "Booster" : navigate(\`/dashboard/vendeur/booster?listing=\${listingId}\`)

GARDE le design des cartes.
```

---

### PROMPT 8 : VendorDashboard avec vraies stats

```
@VendorDashboard.tsx

Affiche les vraies statistiques :

1. Imports : useAuth, useState, useEffect
2. Import listingsService

3. États : 
   - stats: { total: 0, active: 0, sold: 0, totalViews: 0 }
   - loading: boolean

4. useEffect :
   async function loadStats() {
     if (!profile) return;
     setLoading(true);
     const data = await listingsService.getUserStats(profile.id);
     setStats(data);
     setLoading(false);
   }

5. Dans les KPI cards, affiche stats.total, stats.active, stats.totalViews

6. Pour le solde de crédits : profile.credits

GARDE tous les graphiques et le design.
Remplace juste les valeurs mockées par les vraies stats.
```

---

### PROMPT 9 : VendorRecharge avec vrais crédits

```
@VendorRecharge.tsx

Intègre l'achat de crédits :

1. Imports : useAuth, useState, useNavigate, toast
2. Import creditsService depuis ../services/credits.service

3. Affiche le solde actuel : profile.credits

4. handleSubmit :
   setLoading(true);
   
   const { transaction, error } = await creditsService.purchaseCredits(profile.id, {
     amount: selectedAmount,
     paymentMethod: selectedProvider,
     phoneNumber: phone
   });
   
   setLoading(false);
   
   if (error) {
     toast.error('Erreur paiement');
   } else {
     toast.success(\`Paiement de \${selectedAmount} crédits en cours...\`);
     
     // Simuler attente paiement (dans un vrai système, webhook)
     setTimeout(() => {
       toast.success('Paiement confirmé ! 🎉');
       navigate('/merci');
     }, 3000);
   }

GARDE tout le design et l'UI du formulaire.
```

---

### PROMPT 10 : VendorBooster avec boost fonctionnel

```
@VendorBooster.tsx

Intègre le boost d'annonces :

1. Imports : useAuth, useState, useEffect, toast
2. Import listingsService, creditsService

3. États : listings, selectedListing, loading

4. useEffect : charger les annonces du vendeur

5. Afficher le solde : profile.credits

6. Prix boost :
   - 7 jours : 20 crédits
   - 14 jours : 35 crédits
   - 30 jours : 60 crédits

7. handleBoost :
   // Vérifier crédits
   if (profile.credits < creditsCost) {
     toast.error('Crédits insuffisants');
     return;
   }
   
   setLoading(true);
   
   // Booster
   const { error: boostError } = await listingsService.boostListing(
     selectedListing.id, 
     profile.id, 
     selectedDuration,
     creditsCost
   );
   
   if (boostError) {
     toast.error('Erreur boost');
     setLoading(false);
     return;
   }
   
   // Dépenser crédits
   const { error: spendError } = await creditsService.spendCredits(
     profile.id,
     creditsCost,
     \`Boost annonce \${selectedListing.title} pour \${selectedDuration} jours\`
   );
   
   setLoading(false);
   
   if (spendError) {
     toast.error('Erreur déduction crédits');
   } else {
     toast.success('Annonce boostée ! 🚀');
     // Recharger données
     refreshProfile();
     loadListings();
   }

GARDE le design.
```

---

## ✅ Checklist d'intégration

Après avoir utilisé tous les prompts :

- [ ] App.tsx a AuthProvider
- [ ] Routes protégées avec ProtectedRoute
- [ ] LoginPage connecte vraiment
- [ ] RegisterPage inscrit vraiment
- [ ] PublishPage publie vraiment
- [ ] ListingsPage affiche vraies annonces
- [ ] VendorListings affiche mes annonces
- [ ] VendorDashboard affiche vraies stats
- [ ] VendorRecharge achète crédits
- [ ] VendorBooster boost annonces

---

## 🧪 Tests à faire

### Test 1 : Inscription
1. `/inscription`
2. Créer un compte
3. Vérifier redirection dashboard
4. Vérifier dans Supabase Table `profiles`

### Test 2 : Connexion
1. `/connexion`
2. Se connecter
3. Vérifier redirection

### Test 3 : Publication
1. `/publier`
2. Remplir formulaire + images
3. Publier
4. Vérifier dans Supabase Table `listings`
5. Vérifier dans "Mes annonces"

### Test 4 : Dashboard
1. `/dashboard/vendeur`
2. Vérifier que les KPIs affichent les vrais chiffres

### Test 5 : Crédits
1. `/dashboard/vendeur/recharge`
2. Acheter 50 crédits
3. Attendre 3 secondes
4. Vérifier que le solde a augmenté

### Test 6 : Boost
1. `/dashboard/vendeur/booster`
2. Sélectionner une annonce
3. Choisir 7 jours (20 crédits)
4. Booster
5. Vérifier que les crédits sont déduits

---

## 🎉 SUCCÈS !

Si tous les tests passent, votre site est **100% OPÉRATIONNEL** !

**Félicitations ! 🚀**

---

**Besoin d'aide ? Consultez `/INSTALLATION_SUPABASE_COMPLETE.md`**
