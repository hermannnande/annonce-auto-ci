# 📊 Guide des Dashboards - annonceauto.ci

## 🎯 Vue d'ensemble

Deux dashboards ultra-professionnels ont été créés pour annonceauto.ci :
- **Dashboard Vendeur** : Gestion des annonces, boost, recharges, statistiques
- **Dashboard Super Admin** : Modération, gestion des crédits, paiements, analytics

---

## 🔐 Pages d'Authentification

### 1. **Page de Connexion** (`/connexion`)
- Connexion email/mot de passe
- Boutons Google et Facebook OAuth
- "Se souvenir de moi"
- Lien "Mot de passe oublié"
- Afficher/Masquer mot de passe

### 2. **Page d'Inscription** (`/inscription`)
- Formulaire complet (Nom, Email, Téléphone, Mot de passe)
- Boutons Google et Facebook OAuth
- Indicateur de force du mot de passe (Faible/Moyen/Fort)
- Vérification de correspondance des mots de passe
- Checkbox CGU

### 3. **Page Mot de Passe Oublié** (`/mot-de-passe-oublie`)
- Formulaire email unique
- États : Formulaire → Confirmation → Succès
- Loading state avec spinner
- Instructions détaillées

---

## 👨‍💼 Dashboard Vendeur

### Routes disponibles :
- `/dashboard/vendeur` - Vue d'ensemble
- `/dashboard/vendeur/annonces` - Mes annonces (menu)
- `/dashboard/vendeur/booster` - Booster mes annonces
- `/dashboard/vendeur/recharge` - Recharger mon compte
- `/dashboard/vendeur/stats` - Statistiques détaillées
- `/dashboard/vendeur/parametres` - Paramètres (menu)

---

### 📈 1. Vue d'ensemble (`/dashboard/vendeur`)

**Statistiques principales :**
- Annonces actives (12)
- Vues totales (3,245)
- Favoris (156)
- Annonces boostées (3)

**Graphiques :**
- Vues cette semaine (AreaChart)
- Gradient jaune animé

**Actions rapides :**
- ✅ Publier une nouvelle annonce
- ⚡ Booster mes annonces
- 💳 Recharger mon compte

**Annonces récentes :**
- Liste des 3 dernières annonces
- Badges de statut (Active/En attente/Refusée)
- Vues et favoris

**Solde crédits :**
- Affiché dans sidebar (2,500 CFA)
- Lien rapide vers recharge

---

### 💳 2. Recharge de Compte (`/dashboard/vendeur/recharge`)

**Opérateurs Mobile Money disponibles :**
1. **Orange Money** (Frais 1%)
2. **MTN Mobile Money** (Frais 1%)
3. **Moov Money** (Frais 1%)
4. **Wave** (Frais 0%)

**Montants rapides :**
- 1,000 CFA
- 2,500 CFA
- 5,000 CFA
- 10,000 CFA
- 25,000 CFA
- 50,000 CFA
- Montant personnalisé

**Flow de paiement :**
1. **Étape 1** : Sélection opérateur + montant + numéro
2. **Étape 2** : Confirmation avec récapitulatif (montant + frais)
3. **Étape 3** : Succès avec nouveau solde

**Sécurité :**
- Badge SSL
- Transaction instantanée
- Confirmation en 2 étapes

---

### ⚡ 3. Booster Annonces (`/dashboard/vendeur/booster`)

**3 Plans de Boost :**

| Plan | Prix | Durée | Boost | Features |
|------|------|-------|-------|----------|
| **Basique** | 500 CFA | 3 jours | +150 vues | +50% visibilité, Badge "Sponsorisé" |
| **Pro** (Populaire) | 1,200 CFA | 7 jours | +500 vues | +100% visibilité, Badge "TOP", Support prioritaire |
| **Premium** | 2,500 CFA | 14 jours | +1500 vues | +200% visibilité, Badge "PREMIUM", Analytics, Support VIP 24/7 |

**Statistiques :**
- Annonces boostées actives
- Vues supplémentaires (+245%)
- Taux de conversion (+180%)

**Process :**
1. Choisir un plan
2. Sélectionner l'annonce à booster
3. Voir récapitulatif
4. Confirmer avec crédits

**Annonces déjà boostées :**
- Badge vert "Boosté"
- Temps restant affiché
- Non sélectionnable

---

### 📊 4. Statistiques Détaillées (`/dashboard/vendeur/stats`)

**KPIs principaux :**
- Vues totales (7 jours)
- Clics totaux
- Favoris
- Partages

**Graphiques avancés :**
1. **Vues et Clics** (AreaChart double)
   - Évolution sur 7 jours
   - Gradient jaune (vues) et dark (clics)

2. **Sources de Trafic** (PieChart)
   - Recherche (45%)
   - Page d'accueil (30%)
   - Réseaux sociaux (15%)
   - Direct (10%)

3. **Visiteurs par Ville** (BarChart horizontal)
   - Abidjan, Bouaké, Yamoussoukro, Daloa, San-Pédro

**Tableau Performance par Annonce :**
- Vues avec icône Eye
- Favoris avec icône Heart
- Clics avec icône MousePointer
- Taux d'engagement avec barre de progression

**Insights intelligents :**
- ✅ "Performance excellente ! +45% vs moyenne"
- ⏰ "Meilleur moment : 14h-18h"

---

## 👑 Dashboard Super Admin

### Routes disponibles :
- `/dashboard/admin` - Vue d'ensemble
- `/dashboard/admin/moderation` - Modération des annonces
- `/dashboard/admin/utilisateurs` - Gestion utilisateurs (menu)
- `/dashboard/admin/credits` - Gestion des crédits
- `/dashboard/admin/payments` - Paiements et transactions
- `/dashboard/admin/analytics` - Analytics (menu)
- `/dashboard/admin/parametres` - Paramètres (menu)

---

### 📊 1. Vue d'ensemble (`/dashboard/admin`)

**Statistiques globales :**
- Utilisateurs actifs (2,547)
- Annonces totales (1,355)
- Revenus ce mois (1.05M CFA)
- En attente modération (87)

**Graphiques :**
1. **Revenus mensuels** (BarChart)
   - 6 derniers mois
   - Revenus totaux (jaune) + Boost (dark)

2. **Statut des annonces** (PieChart)
   - Actives (1,245) - Vert
   - En attente (87) - Jaune
   - Refusées (23) - Rouge

**Annonces en attente :**
- Liste des 3 annonces récentes
- Actions rapides : Approuver / Refuser / Voir détails
- Lien "Tout voir" vers modération

**Transactions récentes :**
- Tableau des 4 dernières transactions
- Utilisateur, Type, Montant, Statut
- Lien vers page Paiements

---

### ✅ 2. Modération (`/dashboard/admin/moderation`)

**Interface 2 colonnes :**
- **Gauche** : Liste des annonces
- **Droite** : Détails de l'annonce sélectionnée

**Liste annonces :**
- Image, Titre, Vendeur, Prix
- Badge "En attente" avec temps
- Flags d'attention (Prix élevé, Photos manquantes)

**Panneau de détails :**
- Image principale
- Titre et Prix
- Specs (Année, Kilométrage, Carburant, Transmission)
- Description complète
- **Infos vendeur** :
  - Nom avec icône User
  - Email avec icône Mail
  - Téléphone avec icône Phone
  - Date de soumission avec icône Calendar

**Actions :**
- ✅ **Approuver** (Bouton vert)
- ❌ **Refuser** (Modal avec raison)
- 💬 **Contacter vendeur**

**Modal Refus :**
- Champ textarea pour raison
- Warning : "Le vendeur recevra un email"
- Confirmation requise

**Recherche et filtres :**
- Barre de recherche (titre, vendeur)
- Bouton Filtres

---

### 💰 3. Gestion Crédits (`/dashboard/admin/credits`)

**Statistiques :**
- Vendeurs actifs (4)
- Crédits totaux (16,500 CFA)
- Dépenses totales (93.5K CFA)
- Moyenne par vendeur (4,125 CFA)

**Tableau vendeurs :**
Colonnes :
- Vendeur (Nom + Email)
- Crédits (en CFA, couleur jaune)
- Dépenses totales
- Nombre d'annonces
- Membre depuis
- Actions (3 boutons)

**3 Actions possibles :**
1. **➕ Ajouter** (Vert)
2. **➖ Retirer** (Rouge)
3. **🎁 Offrir** (Violet)

**Modal d'action :**
- Icône colorée selon action
- Solde actuel
- Input montant
- Boutons rapides (500, 1000, 2500, 5000)
- Textarea raison (requis)
- Preview nouveau solde
- Confirmation

**Recherche :**
- Par nom ou email
- Temps réel

---

### 💳 4. Paiements (`/dashboard/admin/payments`)

**KPIs :**
- Revenus du jour
- Total transactions
- Montant en attente
- Taux de succès (%)

**Graphique Revenus :**
- LineChart 7 derniers jours
- Ligne jaune avec dots

**Filtres :**
- Recherche (utilisateur, référence)
- Boutons statut :
  - ✅ Réussi (Vert)
  - ⏰ En attente (Jaune)
  - ❌ Échoué (Rouge)
  - 📋 Tout

**Tableau transactions :**
Colonnes :
- ID Transaction (mono) + Référence
- Utilisateur
- Type (Boost/Recharge)
- Méthode (Orange Money, MTN, Wave, Moov)
- Montant (CFA, en gras)
- Statut (Badge coloré)
- Date (avec icône Calendar)

**Actions :**
- Bouton "Exporter rapport" (jaune)

---

## 🎨 Design System

### Palette de couleurs :
- **Bleu foncé** : `#0F172A` (Titres, textes)
- **Jaune/Or** : `#FACC15`, `#FBBF24` (Actions, highlights)
- **Gris clair** : `#F3F4F6` (Backgrounds)
- **Vert** : Success, validations
- **Rouge** : Erreurs, rejets
- **Bleu** : Info, neutral
- **Violet** : Premium, gifts

### Composants partagés :
- **DashboardLayout** : Layout avec sidebar + topbar
- **StatCard** : Carte statistique avec icône
- **Card** : Container de base
- **Button** : Boutons avec variants
- **Input** : Champs de formulaire

### Bibliothèques utilisées :
- **Motion** : Animations (fadeIn, scale, hover)
- **Recharts** : Graphiques (Area, Bar, Line, Pie)
- **Lucide React** : Icônes
- **React Router** : Navigation

---

## 🔄 Navigation

### Sidebar Vendeur :
1. Vue d'ensemble
2. Mes annonces
3. Booster
4. Recharger
5. Statistiques
6. Paramètres
7. Déconnexion

### Sidebar Admin :
1. Vue d'ensemble
2. Modération
3. Utilisateurs
4. Crédits
5. Paiements
6. Analytics
7. Paramètres
8. Déconnexion

### Topbar (commune) :
- Logo + Menu toggle (mobile)
- Notification badge (point rouge)
- Avatar utilisateur + Nom + Rôle

### Mobile :
- Sidebar en overlay
- Menu hamburger
- Overlay noir semi-transparent

---

## ✨ Fonctionnalités Premium

### Animations :
- FadeIn sur chargement pages
- Hover scale sur cartes
- Smooth transitions
- Loading spinners
- Modal animations

### Micro-interactions :
- Boutons avec hover effects
- Icons qui bougent
- Progress bars animées
- Gradients animés (background)

### UX Excellence :
- États empty (aucune donnée)
- États loading
- Confirmations avant actions
- Feedback visuel instantané
- Tooltips et helpers
- Responsive mobile-first

### Sécurité :
- Badges SSL
- Confirmations 2 étapes
- Validation côté client
- Messages d'erreur clairs

---

## 🚀 Pour accéder aux dashboards :

### Vendeur :
1. Se connecter sur `/connexion`
2. Accéder à `/dashboard/vendeur`

### Admin :
1. Se connecter avec compte admin
2. Accéder à `/dashboard/admin`

---

## 📝 Notes importantes :

1. **Mock Data** : Toutes les données sont actuellement simulées pour la démo
2. **Backend** : Nécessite connexion API pour fonctionnalités réelles
3. **Mobile Money** : Intégrations à connecter (Orange, MTN, Wave, Moov)
4. **OAuth** : Google et Facebook à configurer
5. **Notifications** : Système de notifications à implémenter
6. **Analytics** : Tracking réel à ajouter

---

## 🎯 Prochaines étapes suggérées :

1. ✅ Créer pages "Mes annonces" vendeur
2. ✅ Créer page "Utilisateurs" admin
3. ✅ Créer page "Analytics" admin
4. ✅ Créer page "Paramètres" pour les deux
5. ✅ Ajouter système de notifications
6. ✅ Connecter backend API
7. ✅ Implémenter authentification réelle
8. ✅ Intégrer Mobile Money APIs
9. ✅ Ajouter envoi d'emails
10. ✅ Tests et optimisations

---

**Version** : 1.0.0
**Date** : 18 Décembre 2024
**Créé pour** : annonceauto.ci - Marketplace automobile ivoirien
