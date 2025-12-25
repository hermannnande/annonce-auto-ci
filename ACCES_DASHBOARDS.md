# 🚀 Comment accéder aux Dashboards - annonceauto.ci

## 🎯 3 Façons d'accéder aux Dashboards

### 1️⃣ **Via le Menu de Navigation (Header)**
Le moyen le plus simple !

- Cliquez sur **"Mon Espace"** dans le menu de navigation en haut
- Vous arrivez sur la page de sélection : `/dashboard`
- Choisissez votre dashboard :
  - 🟡 **Dashboard Vendeur** → `/dashboard/vendeur`
  - 🔵 **Dashboard Admin** → `/dashboard/admin`

---

### 2️⃣ **Accès Direct par URL**

Tapez directement dans votre navigateur :

#### 🟡 Dashboard Vendeur
```
http://localhost:5173/dashboard/vendeur
```

**Pages disponibles :**
- Vue d'ensemble : `/dashboard/vendeur`
- Recharge : `/dashboard/vendeur/recharge`
- Booster : `/dashboard/vendeur/booster`
- Statistiques : `/dashboard/vendeur/stats`

#### 🔵 Dashboard Admin
```
http://localhost:5173/dashboard/admin
```

**Pages disponibles :**
- Vue d'ensemble : `/dashboard/admin`
- Modération : `/dashboard/admin/moderation`
- Crédits : `/dashboard/admin/credits`
- Paiements : `/dashboard/admin/payments`

---

### 3️⃣ **Page de Sélection**

Accédez directement à la page de sélection :
```
http://localhost:5173/dashboard
```

Cette page affiche :
- ✅ Carte Dashboard Vendeur avec toutes les fonctionnalités
- ✅ Carte Dashboard Admin avec accès privilégié
- ✅ Design premium avec animations
- ✅ Description des features de chaque dashboard

---

## 📱 Navigation dans le Dashboard

### Sidebar (Menu latéral)

**Dashboard Vendeur :**
- 📊 Vue d'ensemble
- 🚗 Mes annonces
- ⚡ Booster
- 💳 Recharger
- 📈 Statistiques
- ⚙️ Paramètres
- 🚪 Déconnexion

**Dashboard Admin :**
- 📊 Vue d'ensemble
- ✅ Modération
- 👥 Utilisateurs
- 💰 Crédits
- 💳 Paiements
- 📊 Analytics
- ⚙️ Paramètres
- 🚪 Déconnexion

### Topbar (Barre supérieure)

- **Logo** : Retour à la page d'accueil
- **Menu burger** (mobile) : Ouvre/ferme la sidebar
- **Notifications** : Point rouge indiquant nouvelles notifications
- **Avatar utilisateur** : Affiche nom et rôle

---

## 🎨 Interface Dashboard

### Vendeur Dashboard (`/dashboard/vendeur`)

**Ce que vous verrez :**
1. ✅ **4 cartes statistiques** :
   - Annonces actives (12)
   - Vues totales (3,245)
   - Favoris (156)
   - Annonces boostées (3)

2. ✅ **Graphique des vues** (7 derniers jours)
   - AreaChart avec gradient jaune
   - Données animées

3. ✅ **Actions rapides** :
   - Publier nouvelle annonce (bouton jaune)
   - Booster annonces (bouton violet)
   - Recharger compte (bouton outline)

4. ✅ **Encart crédits** :
   - Solde actuel : 2,500 CFA
   - Lien vers recharge

5. ✅ **Annonces récentes** :
   - 3 dernières annonces
   - Badges de statut (Active/En attente/Refusée)
   - Stats (vues, favoris)

### Admin Dashboard (`/dashboard/admin`)

**Ce que vous verrez :**
1. ✅ **4 KPIs principaux** :
   - Utilisateurs actifs (2,547)
   - Annonces totales (1,355)
   - Revenus mois (1.05M CFA)
   - En attente (87)

2. ✅ **2 Graphiques** :
   - Revenus mensuels (BarChart)
   - Statut annonces (PieChart)

3. ✅ **Modération rapide** :
   - 3 annonces en attente
   - Boutons Approuver/Refuser/Détails
   - Lien "Tout voir"

4. ✅ **Transactions récentes** :
   - Tableau des 4 dernières
   - Statut et montants

---

## 💡 Fonctionnalités Testables

### Dans Dashboard Vendeur :

#### 💳 Recharge (`/dashboard/vendeur/recharge`)
1. Sélectionnez un opérateur Mobile Money
2. Choisissez un montant (ou entrez montant custom)
3. Entrez numéro de téléphone
4. Cliquez "Continuer"
5. Vérifiez récapitulatif
6. Confirmez le paiement
7. ✅ Voir message de succès avec nouveau solde

#### ⚡ Booster (`/dashboard/vendeur/booster`)
1. Choisissez un plan (Basique/Pro/Premium)
2. Sélectionnez une annonce à booster
3. Vérifiez le récapitulatif
4. Cliquez "Booster maintenant"
5. ✅ Confirmation

#### 📊 Stats (`/dashboard/vendeur/stats`)
- Visualisez 4 graphiques différents
- Consultez performance par annonce
- Lisez insights intelligents

### Dans Dashboard Admin :

#### ✅ Modération (`/dashboard/admin/moderation`)
1. Cliquez sur une annonce dans la liste
2. Consultez tous les détails à droite
3. Testez les boutons :
   - ✅ **Approuver** : Annonce validée
   - ❌ **Refuser** : Modal s'ouvre
   - 💬 **Contacter** : Action de contact

#### 💰 Crédits (`/dashboard/admin/credits`)
1. Recherchez un vendeur
2. Cliquez sur les boutons d'action :
   - ➕ **Ajouter** crédits (vert)
   - ➖ **Retirer** crédits (rouge)
   - 🎁 **Offrir** crédits (violet)
3. Remplissez le formulaire dans modal
4. Voir preview du nouveau solde
5. Confirmez

#### 💳 Paiements (`/dashboard/admin/payments`)
1. Utilisez la recherche
2. Filtrez par statut (Réussi/En attente/Échoué)
3. Consultez le graphique des revenus
4. Exportez le rapport (bouton jaune)

---

## 🎯 Mode Démo

**Important** : Les deux dashboards sont en **mode DÉMO**.

- ✅ Toutes les données sont simulées (mock data)
- ✅ Accès libre sans authentification
- ✅ Toutes les interactions sont fonctionnelles
- ✅ Aucune donnée n'est sauvegardée

**En production** :
- 🔒 Authentification requise
- 🔒 Dashboard Admin avec rôle "admin" uniquement
- 💾 Données sauvegardées en base de données
- 🔌 APIs Mobile Money connectées
- 📧 Envoi d'emails réels

---

## 🎨 Design & Animations

### Animations Motion :
- ✅ FadeIn au chargement des pages
- ✅ Scale au hover des cartes
- ✅ Slide des modals
- ✅ Spinner de chargement
- ✅ Transitions fluides

### Couleurs :
- 🟡 Jaune (#FACC15) : Actions principales
- 🔵 Bleu foncé (#0F172A) : Titres et textes
- ⚪ Gris clair (#F3F4F6) : Backgrounds
- 🟢 Vert : Succès
- 🔴 Rouge : Erreurs/Rejets
- 🟣 Violet : Premium

### Responsive :
- ✅ Mobile-first design
- ✅ Sidebar en overlay sur mobile
- ✅ Tableaux scrollables
- ✅ Grids adaptatifs

---

## 📋 Checklist d'Exploration

### Dashboard Vendeur :
- [ ] Accéder via `/dashboard/vendeur`
- [ ] Consulter les 4 stats principales
- [ ] Voir le graphique des vues
- [ ] Tester recharge Mobile Money
- [ ] Choisir un plan de boost
- [ ] Consulter les statistiques détaillées
- [ ] Naviguer avec la sidebar

### Dashboard Admin :
- [ ] Accéder via `/dashboard/admin`
- [ ] Consulter les KPIs globaux
- [ ] Voir les 2 graphiques
- [ ] Modérer une annonce
- [ ] Ajouter/Retirer des crédits
- [ ] Filtrer les paiements
- [ ] Explorer toutes les pages

---

## 🔧 Dépannage

### Le dashboard ne s'affiche pas ?
- Vérifiez l'URL (doit commencer par `/dashboard`)
- Rafraîchissez la page (F5)
- Vérifiez la console pour erreurs

### La sidebar ne s'ouvre pas sur mobile ?
- Cliquez sur l'icône hamburger (☰) en haut à gauche
- Ou basculez en mode desktop

### Les graphiques ne s'affichent pas ?
- Recharts est déjà installé
- Les données sont mockées
- Vérifiez que JavaScript est activé

---

## 🚀 Prochaines Étapes

Une fois que vous avez exploré les dashboards :

1. ✅ Testez toutes les pages
2. ✅ Essayez les interactions (modals, filtres, recherches)
3. ✅ Vérifiez le responsive mobile
4. ✅ Consultez les animations
5. ✅ Préparez les intégrations backend

---

**Besoin d'aide ?** Consultez le fichier `/DASHBOARDS_GUIDE.md` pour une documentation complète ! 📚

---

**Date** : 18 Décembre 2024  
**Version** : 1.0.0  
**Projet** : annonceauto.ci - Marketplace automobile ivoirien 🇨🇮
