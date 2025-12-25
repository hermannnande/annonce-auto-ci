# 🚗 AnnonceAuto.ci - Guide d'Architecture Complet

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure des dossiers](#structure-des-dossiers)
3. [Système de design](#système-de-design)
4. [Architecture des routes](#architecture-des-routes)
5. [Composants principaux](#composants-principaux)
6. [Pages et fonctionnalités](#pages-et-fonctionnalités)
7. [Dashboards](#dashboards)
8. [Conventions de code](#conventions-de-code)
9. [Comment ajouter de nouvelles fonctionnalités](#comment-ajouter-de-nouvelles-fonctionnalités)
10. [Dépendances importantes](#dépendances-importantes)

---

## 🎯 Vue d'ensemble

AnnonceAuto.ci est une plateforme moderne de vente de véhicules pour le marché ivoirien. Le site permet aux vendeurs (particuliers et professionnels) de créer des annonces, de les booster avec un système de crédits, et offre aux administrateurs des outils complets de modération et d'analyse.

### Technologies utilisées

- **React 18.3.1** - Framework frontend
- **TypeScript** - Typage statique
- **React Router DOM** - Navigation
- **Tailwind CSS v4** - Styling
- **Motion (Framer Motion)** - Animations
- **Recharts** - Graphiques et analytics
- **Lucide React** - Icônes
- **Radix UI** - Composants UI accessibles

---

## 📁 Structure des dossiers

```
/src/app/
├── components/          # Composants réutilisables
│   ├── dashboard/      # Composants spécifiques au dashboard
│   ├── ui/             # Composants UI de base (shadcn/ui)
│   ├── figma/          # Composants pour images Figma
│   ├── Header.tsx      # En-tête du site public
│   ├── Footer.tsx      # Pied de page
│   ├── MobileNav.tsx   # Navigation mobile
│   ├── SearchBar.tsx   # Barre de recherche
│   └── ...
│
├── pages/              # Pages principales
│   ├── dashboard/      # Pages du dashboard
│   │   ├── VendorDashboard.tsx
│   │   ├── VendorRecharge.tsx
│   │   ├── VendorBooster.tsx
│   │   ├── VendorStats.tsx
│   │   ├── VendorListings.tsx
│   │   ├── VendorSettings.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminModeration.tsx
│   │   ├── AdminCredits.tsx
│   │   ├── AdminPayments.tsx
│   │   ├── AdminAnalytics.tsx
│   │   ├── AdminUsers.tsx
│   │   └── AdminSettings.tsx
│   │
│   ├── HomePage.tsx
│   ├── ListingsPage.tsx
│   ├── VehicleDetailPage.tsx
│   ├── PublishPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── DashboardSelector.tsx
│   └── ThankYouPage.tsx
│
├── styles/             # Fichiers de style
│   ├── theme.css       # Variables CSS et thème global
│   └── fonts.css       # Imports de polices Google Fonts
│
└── App.tsx             # Point d'entrée, configuration des routes

/public/                # Fichiers statiques
```

---

## 🎨 Système de design

### Palette de couleurs

Le site utilise une palette de couleurs cohérente définie dans `/src/styles/theme.css` :

```css
--primary-dark: #0F172A    /* Bleu foncé - Titres, headers, éléments principaux */
--primary-yellow: #FACC15  /* Jaune/Or - Boutons CTA, accents, highlights */
--secondary-yellow: #FBBF24
--background-light: #F3F4F6 /* Gris clair - Fonds de section */
--white: #FFFFFF
```

### Utilisation des couleurs

- **Titres et textes importants** : `text-[#0F172A]`
- **Boutons d'action primaires** : `bg-gradient-to-r from-[#FACC15] to-[#FBBF24]`
- **Boutons secondaires** : `bg-gradient-to-r from-[#0F172A] to-[#1e293b]`
- **Fonds de section** : `bg-[#F3F4F6]` ou `bg-gray-50`
- **Cartes** : `bg-white` avec `shadow-lg`

### Polices Google Fonts

Définies dans `/src/styles/fonts.css` :

- **Inter** - Police principale pour le corps de texte
- **Poppins** - Titres et headers
- **Sora** - Textes spéciaux et accents

### Principes de design

1. **Mobile-first** : Toutes les pages sont responsive
2. **Espaces blancs** : Design aéré avec beaucoup d'espaces
3. **Coins arrondis** : `rounded-xl` (12px) ou `rounded-2xl` (16px)
4. **Ombres** : `shadow-lg` pour les cartes, `shadow-xl` pour les éléments au hover
5. **Glass morphism** : `backdrop-blur-lg` avec opacité
6. **Animations** : Utilisation de Motion pour des transitions fluides
7. **Micro-interactions** : Hover effects, scale animations

---

## 🛣️ Architecture des routes

### Routes publiques (avec Header/Footer)

```tsx
/                    → HomePage
/annonces            → ListingsPage
/annonces/:id        → VehicleDetailPage
/publier             → PublishPage
```

### Routes d'authentification (sans Header/Footer)

```tsx
/connexion           → LoginPage
/inscription         → RegisterPage
/mot-de-passe-oublie → ForgotPasswordPage
```

### Routes Dashboard

```tsx
/dashboard           → DashboardSelector (choix vendeur/admin)

# Dashboard Vendeur
/dashboard/vendeur                → VendorDashboard (vue d'ensemble)
/dashboard/vendeur/annonces       → VendorListings (mes annonces)
/dashboard/vendeur/recharge       → VendorRecharge (recharge Mobile Money)
/dashboard/vendeur/booster        → VendorBooster (booster annonces)
/dashboard/vendeur/stats          → VendorStats (statistiques)
/dashboard/vendeur/settings       → VendorSettings (paramètres)

# Dashboard Admin
/dashboard/admin                  → AdminDashboard (vue d'ensemble)
/dashboard/admin/moderation       → AdminModeration (modérer annonces)
/dashboard/admin/users            → AdminUsers (gestion utilisateurs)
/dashboard/admin/credits          → AdminCredits (gestion crédits)
/dashboard/admin/payments         → AdminPayments (paiements)
/dashboard/admin/analytics        → AdminAnalytics (analytics avancés)
/dashboard/admin/settings         → AdminSettings (paramètres admin)
```

### Route de remerciement

```tsx
/merci?amount=X&credits=Y&method=Z&transactionId=ABC → ThankYouPage
```

**Paramètres URL** :
- `amount` : Montant rechargé (format avec virgules)
- `credits` : Nombre de crédits reçus
- `method` : Méthode de paiement (encodée)
- `transactionId` : ID unique de transaction

---

## 🧩 Composants principaux

### 1. DashboardLayout (`/components/dashboard/DashboardLayout.tsx`)

Composant de layout pour tous les dashboards (vendeur et admin).

**Props** :
```tsx
{
  userType: 'vendor' | 'admin'
  children: React.ReactNode
}
```

**Fonctionnalités** :
- Sidebar avec navigation
- Navbar mobile responsive
- Affichage du solde (vendeur) ou stats globales (admin)
- Menu items différents selon userType
- Gestion de l'état mobile/desktop

**Menu Vendeur** :
- Vue d'ensemble
- Mes annonces
- Recharge
- Booster
- Statistiques
- Paramètres

**Menu Admin** :
- Vue d'ensemble
- Modération
- Utilisateurs
- Crédits
- Paiements
- Analytics
- Paramètres

### 2. Header (`/components/Header.tsx`)

En-tête du site public avec navigation principale.

**Fonctionnalités** :
- Logo avec lien vers accueil
- Navigation desktop (Accueil, Annonces, Publier)
- Boutons Connexion/Inscription
- Version mobile responsive

### 3. SearchBar (`/components/SearchBar.tsx`)

Barre de recherche avancée pour filtrer les véhicules.

**Filtres disponibles** :
- Marque (Toyota, Mercedes, BMW, etc.)
- Modèle
- Année (de - à)
- Prix (min - max)
- Kilométrage
- Type de carburant
- Transmission
- Ville

### 4. VehicleCard (`/components/VehicleCard.tsx`)

Carte d'affichage d'un véhicule.

**Props** :
```tsx
{
  id: string
  title: string
  price: number
  year: number
  mileage: string
  location: string
  image: string
  isBoosted?: boolean
  isPremium?: boolean
}
```

**Fonctionnalités** :
- Badge "BOOST" pour annonces boostées
- Badge "PREMIUM" pour comptes premium
- Prix formaté en FCFA
- Icônes pour année, kilométrage, localisation
- Animation au hover
- Lien vers la page détail

### 5. Composants UI (`/components/ui/`)

Bibliothèque de composants réutilisables basée sur shadcn/ui et Radix UI :

- **Button** : Boutons avec variants (default, outline, ghost, link)
- **Card** : Conteneurs avec bordure et ombre
- **Input** : Champs de saisie
- **Select** : Menus déroulants
- **Dialog** : Modales
- **Tabs** : Onglets
- **Badge** : Badges/labels
- **Avatar** : Avatars utilisateur
- **Progress** : Barres de progression
- **Slider** : Curseurs
- **Switch** : Interrupteurs
- **Checkbox** : Cases à cocher
- **Radio Group** : Boutons radio
- **Tooltip** : Info-bulles
- **Alert** : Messages d'alerte

---

## 📄 Pages et fonctionnalités

### HomePage (`/pages/HomePage.tsx`)

**Sections** :
1. **Hero** : Titre accrocheur + CTA + stats (annonces, vendeurs, villes)
2. **SearchBar** : Recherche avancée
3. **Featured Vehicles** : Annonces mises en avant
4. **Categories** : Types de véhicules (Berline, SUV, 4x4, Pick-up)
5. **How it works** : Étapes pour vendre/acheter
6. **CTA** : Appel à l'action final

### ListingsPage (`/pages/ListingsPage.tsx`)

Page de liste des annonces avec filtres.

**Fonctionnalités** :
- Grille responsive de VehicleCards
- Filtres latéraux (marque, prix, année, etc.)
- Tri (récent, prix croissant/décroissant)
- Pagination
- Nombre de résultats
- Annonces boostées en premier

### VehicleDetailPage (`/pages/VehicleDetailPage.tsx`)

Page de détail d'une annonce.

**Sections** :
1. **Galerie photos** : Carrousel d'images
2. **Informations principales** : Prix, titre, localisation
3. **Caractéristiques** : Année, kilométrage, carburant, transmission, etc.
4. **Description** : Texte descriptif du vendeur
5. **Équipements** : Liste des options (climatisation, GPS, etc.)
6. **Contact vendeur** : Boutons appel, WhatsApp, message
7. **Annonces similaires** : Suggestions

### PublishPage (`/pages/PublishPage.tsx`)

Formulaire de création d'annonce.

**Étapes** :
1. **Type de véhicule** : Catégorie
2. **Informations** : Marque, modèle, année, kilométrage, prix
3. **Caractéristiques** : Carburant, transmission, couleur
4. **Description** : Texte libre
5. **Photos** : Upload (max 10)
6. **Localisation** : Ville
7. **Contact** : Téléphone, email

**Validation** :
- Tous les champs obligatoires
- Prix minimum 100,000 FCFA
- Année entre 1990 et 2024
- Au moins 1 photo

### LoginPage & RegisterPage

Pages d'authentification avec :
- Formulaire centré
- Design moderne avec glass morphism
- Validation des champs
- Lien vers mot de passe oublié
- Lien vers inscription/connexion

### ThankYouPage (`/pages/ThankYouPage.tsx`)

Page de confirmation après recharge.

**Fonctionnalités** :
- Animation de confettis (5 secondes)
- Icône de succès animée
- Récapitulatif transaction (montant, crédits, méthode, ID, date)
- Bouton télécharger reçu
- CTAs : Retour dashboard ou Publier annonce
- Message de confirmation email

**Paramètres URL requis** :
- `amount` : Montant payé
- `credits` : Crédits reçus
- `method` : Méthode de paiement
- `transactionId` : ID transaction

---

## 📊 Dashboards

### Dashboard Vendeur

#### VendorDashboard (`/pages/dashboard/VendorDashboard.tsx`)

Vue d'ensemble du compte vendeur.

**KPIs affichés** :
- Annonces actives
- Vues totales
- Favoris
- Messages

**Sections** :
- Solde de crédits avec bouton recharge
- Annonces récentes (tableau)
- Graphique des vues (7 derniers jours)
- Suggestions d'amélioration

#### VendorRecharge (`/pages/dashboard/VendorRecharge.tsx`)

Page de recharge du compte via Mobile Money.

**Étapes** :
1. **Sélection** : Choix opérateur (Orange, MTN, Moov, Wave)
2. **Montant** : Montants rapides ou personnalisé
3. **Numéro** : Téléphone Mobile Money
4. **Confirmation** : Récapitulatif avant paiement
5. **Redirection** : Vers ThankYouPage après succès

**Opérateurs disponibles** :
```tsx
{
  id: 'orange' | 'mtn' | 'moov' | 'wave'
  name: string
  logo: emoji
  color: gradient
  fee: percentage
}
```

**Calcul crédits** : 1 crédit = 1000 FCFA

#### VendorBooster (`/pages/dashboard/VendorBooster.tsx`)

Page pour booster les annonces.

**Types de boost** :
1. **Boost Standard** (5 crédits) : 7 jours en tête
2. **Boost Premium** (10 crédits) : 14 jours + badge
3. **Super Boost** (20 crédits) : 30 jours + badge + homepage

**Fonctionnalités** :
- Liste des annonces avec statut
- Sélection de l'annonce à booster
- Choix du pack de boost
- Aperçu du résultat
- Confirmation et paiement en crédits

#### VendorStats (`/pages/dashboard/VendorStats.tsx`)

Statistiques détaillées du vendeur.

**Graphiques** :
- Vues par annonce (bar chart)
- Évolution des vues (line chart)
- Performance par ville (pie chart)
- Taux de conversion

**Métriques** :
- Vues totales
- Taux de clics
- Messages reçus
- Taux de conversion

#### VendorListings (`/pages/dashboard/VendorListings.tsx`)

Gestion des annonces du vendeur.

**Actions disponibles** :
- Voir toutes les annonces
- Modifier une annonce
- Supprimer une annonce
- Booster une annonce
- Voir les statistiques
- Marquer comme vendu

**Filtres** :
- Toutes / Actives / Expirées / Vendues
- Tri par date, vues, prix

#### VendorSettings (`/pages/dashboard/VendorSettings.tsx`)

Paramètres du compte vendeur.

**Sections** :
- Informations personnelles
- Mot de passe
- Notifications (email, SMS)
- Préférences d'affichage
- Suppression du compte

### Dashboard Admin

#### AdminDashboard (`/pages/dashboard/AdminDashboard.tsx`)

Vue d'ensemble de la plateforme.

**KPIs globaux** :
- Utilisateurs totaux
- Annonces actives
- En attente de modération
- Revenus du mois

**Sections** :
- Annonces à modérer (liste)
- Graphique croissance utilisateurs
- Graphique revenus mensuels
- Activité récente

#### AdminModeration (`/pages/dashboard/AdminModeration.tsx`)

Interface de modération des annonces.

**Fonctionnalités** :
- Liste des annonces en attente
- Filtres (toutes, en attente, approuvées, rejetées)
- Actions : Approuver, Rejeter, Voir détails
- Raisons de rejet
- Historique de modération

**Statuts** :
- En attente (jaune)
- Approuvée (vert)
- Rejetée (rouge)

#### AdminCredits (`/pages/dashboard/AdminCredits.tsx`)

Gestion des crédits vendeurs.

**Fonctionnalités** :
- Ajouter/retirer des crédits manuellement
- Historique des transactions
- Statistiques d'utilisation
- Graphiques de consommation
- Offres spéciales et promotions

#### AdminPayments (`/pages/dashboard/AdminPayments.tsx`)

Gestion des paiements.

**Sections** :
- Transactions récentes
- Filtres par date, statut, méthode
- Export des données (PDF, Excel)
- Statistiques par opérateur
- Graphique revenus journaliers

**Informations par transaction** :
- ID
- Date/heure
- Utilisateur
- Montant
- Méthode
- Statut (réussie, en attente, échouée)

#### AdminAnalytics (`/pages/dashboard/AdminAnalytics.tsx`)

Analytics avancés de la plateforme.

**KPIs** :
- Vues totales
- Nouveaux utilisateurs
- Annonces actives
- Revenus (CFA)

**Graphiques** :
1. **Croissance utilisateurs** : Area chart (total + actifs)
2. **Revenus mensuels** : Stacked bar chart (crédits + boosts)
3. **Statut annonces** : Line chart (publiées, en attente, rejetées)
4. **Catégories populaires** : Pie chart
5. **Villes actives** : Barres de progression

**Filtre de dates** :
- Sélecteur rapide : 7j, 30j, 90j, 1 an
- **Filtre personnalisé** : Date de début et fin
- Raccourcis : Aujourd'hui, 7 derniers jours, 30 derniers jours, Ce mois, Mois dernier
- Indicateur de filtre actif
- Boutons : Réinitialiser, Appliquer

**Export** :
- PDF
- Excel

#### AdminUsers (`/pages/dashboard/AdminUsers.tsx`)

Gestion des utilisateurs.

**Fonctionnalités** :
- Liste de tous les utilisateurs
- Filtres (tous, vendeurs, admins, suspendus)
- Actions : Voir profil, Suspendre, Supprimer
- Recherche par nom/email
- Statistiques par type

#### AdminSettings (`/pages/dashboard/AdminSettings.tsx`)

Paramètres globaux de la plateforme.

**Sections** :
- Configuration des tarifs (crédits, boosts)
- Gestion des catégories
- Paramètres de modération
- Configuration emails
- API keys (Mobile Money)

---

## 💻 Conventions de code

### Nomenclature

1. **Composants** : PascalCase (`VehicleCard.tsx`)
2. **Fichiers utilitaires** : camelCase (`formatPrice.ts`)
3. **Constantes** : UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
4. **Variables/fonctions** : camelCase (`handleSubmit`, `isLoading`)

### Structure d'un composant

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComponentName } from './components/ComponentName';
import { Icon1, Icon2 } from 'lucide-react';

// Types/Interfaces
interface Props {
  // ...
}

// Constantes locales
const CONSTANT_VALUE = 'value';

// Composant principal
export function MyComponent({ prop1, prop2 }: Props) {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState('');
  const navigate = useNavigate();
  
  // 2. Fonctions handlers
  const handleClick = () => {
    // ...
  };
  
  // 3. Render
  return (
    <div className="...">
      {/* Contenu */}
    </div>
  );
}
```

### Classes Tailwind

**Ordre recommandé** :
1. Layout (flex, grid, position)
2. Spacing (padding, margin)
3. Sizing (width, height)
4. Typography (text, font)
5. Colors (bg, text)
6. Borders (border, rounded)
7. Effects (shadow, opacity)
8. Transitions (transition, duration)

**Exemple** :
```tsx
<div className="flex items-center justify-between p-6 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
```

### Animations Motion

**Pattern de base** :
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Contenu */}
</motion.div>
```

**Hover effects** :
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Cliquez-moi
</motion.button>
```

### Gestion des données

**Mock data** : Pour l'instant, toutes les données sont en dur dans les composants.

**Pour passer à une vraie API** :
1. Créer un dossier `/src/app/services/`
2. Créer des fichiers par domaine (`vehicleService.ts`, `userService.ts`)
3. Utiliser `fetch` ou `axios` pour les requêtes
4. Remplacer les données en dur par des appels API
5. Gérer le loading et les erreurs

**Exemple de service** :
```tsx
// /src/app/services/vehicleService.ts
export const vehicleService = {
  async getAll() {
    const response = await fetch('/api/vehicles');
    return response.json();
  },
  
  async getById(id: string) {
    const response = await fetch(`/api/vehicles/${id}`);
    return response.json();
  },
  
  async create(data: VehicleData) {
    const response = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

---

## ➕ Comment ajouter de nouvelles fonctionnalités

### Ajouter une nouvelle page

1. **Créer le fichier** : `/src/app/pages/MaNouvellePage.tsx`

```tsx
export function MaNouvellePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenu */}
    </div>
  );
}
```

2. **Ajouter la route** dans `/src/app/App.tsx` :

```tsx
import { MaNouvellePage } from './pages/MaNouvellePage';

// Dans le composant App
<Route path="/ma-route" element={
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <MaNouvellePage />
    </main>
    <Footer />
    <MobileNav />
  </div>
} />
```

### Ajouter une page dashboard

1. **Créer le fichier** : `/src/app/pages/dashboard/VendorNouvellePage.tsx`

```tsx
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

export function VendorNouvellePage() {
  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-6">
        {/* Contenu */}
      </div>
    </DashboardLayout>
  );
}
```

2. **Ajouter la route** dans `/src/app/App.tsx` :

```tsx
<Route path="/dashboard/vendeur/nouvelle-page" element={<VendorNouvellePage />} />
```

3. **Ajouter le menu** dans `/src/app/components/dashboard/DashboardLayout.tsx` :

```tsx
const vendorMenuItems = [
  // ... items existants
  {
    icon: MonIcon,
    label: 'Ma Nouvelle Page',
    href: '/dashboard/vendeur/nouvelle-page',
  },
];
```

### Ajouter un composant réutilisable

1. **Créer le fichier** : `/src/app/components/MonComposant.tsx`

```tsx
interface MonComposantProps {
  titre: string;
  description?: string;
}

export function MonComposant({ titre, description }: MonComposantProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h3 className="font-bold text-[#0F172A]">{titre}</h3>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}
```

2. **Utiliser le composant** :

```tsx
import { MonComposant } from '../components/MonComposant';

<MonComposant titre="Titre" description="Description" />
```

### Ajouter un graphique Recharts

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Fév', value: 300 },
  // ...
];

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
    <XAxis dataKey="name" stroke="#6B7280" />
    <YAxis stroke="#6B7280" />
    <Tooltip />
    <Line 
      type="monotone" 
      dataKey="value" 
      stroke="#0F172A" 
      strokeWidth={2} 
    />
  </LineChart>
</ResponsiveContainer>
```

### Ajouter une animation Motion

```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
  whileHover={{ scale: 1.05 }}
>
  {/* Contenu animé */}
</motion.div>
```

---

## 📦 Dépendances importantes

### UI et Styling

- **tailwindcss** `4.1.12` - Framework CSS
- **@tailwindcss/vite** `4.1.12` - Plugin Vite pour Tailwind
- **class-variance-authority** `0.7.1` - Variants de composants
- **clsx** `2.1.1` - Utilitaire pour classes conditionnelles
- **tailwind-merge** `3.2.0` - Fusion de classes Tailwind

### Composants UI (Radix UI)

Tous les composants Radix sont préfixés `@radix-ui/react-*` :
- `accordion`, `alert-dialog`, `avatar`, `checkbox`, `dialog`, `dropdown-menu`
- `hover-card`, `label`, `popover`, `progress`, `radio-group`, `scroll-area`
- `select`, `separator`, `slider`, `switch`, `tabs`, `tooltip`

### Animations

- **motion** `12.23.24` - Animations fluides (ex-Framer Motion)
  - Import : `import { motion } from 'motion/react'`
  - Appeler toujours "Motion" (pas "Framer Motion")

### Graphiques

- **recharts** `2.15.2` - Bibliothèque de graphiques
  - Types : LineChart, BarChart, AreaChart, PieChart
  - Composants : XAxis, YAxis, Tooltip, Legend, ResponsiveContainer

### Icônes

- **lucide-react** `0.487.0` - Icônes modernes
  - Vérifier l'existence avant d'importer : `bash` tool sur `lucide-react/dist/esm/icons/index.js`

### Formulaires

- **react-hook-form** `7.55.0` - Gestion de formulaires
- **input-otp** `1.4.2` - Input OTP

### Utilitaires

- **date-fns** `3.6.0` - Manipulation de dates
- **sonner** `2.0.3` - Notifications toast
  - Import : `import { toast } from "sonner"`

### Drag & Drop

- **react-dnd** `16.0.1` - Drag and drop
- **react-dnd-html5-backend** `16.0.1` - Backend HTML5

### Autres

- **react-slick** `0.31.0` - Carrousels
- **react-responsive-masonry** `2.7.1` - Masonry grids
- **embla-carousel-react** `8.6.0` - Carrousels avancés
- **next-themes** `0.4.6` - Gestion thème dark/light
- **vaul** `1.1.2` - Drawers mobiles

---

## 🔧 Configuration

### Tailwind CSS v4

Le fichier `/src/styles/theme.css` contient :
- Variables CSS custom
- Configuration typographie
- Styles globaux
- Animations custom

**Important** :
- **NE PAS** utiliser les classes Tailwind pour : `text-*` (taille), `font-*` (poids), `leading-*` (line-height)
- La typographie est gérée par défaut dans `theme.css`
- Sauf si demandé explicitement par l'utilisateur

### Vite

Configuration dans `vite.config.js` (si existe).

### Package Manager

Le projet utilise **pnpm** (voir `"pnpm"` dans package.json).

Pour installer une nouvelle dépendance :
```bash
pnpm add nom-du-package
```

---

## 🚀 Démarrage du projet

```bash
# Installer les dépendances
pnpm install

# Lancer en développement
pnpm run dev

# Build pour production
pnpm run build
```

---

## 📝 Notes importantes

### Images

1. **Figma assets** : Utiliser `figma:asset/...` (PAS de préfixe `./` ou `../`)
2. **SVGs importés** : Utiliser chemins relatifs depuis `/src/imports`
3. **Nouvelles images** : Utiliser `ImageWithFallback` component
4. **Photos Unsplash** : Utiliser `unsplash_tool` (jamais d'URLs inventées)

### Routes protégées

Actuellement, toutes les routes sont accessibles.

**Pour ajouter l'authentification** :
1. Créer un `AuthContext` pour gérer l'état de connexion
2. Créer un composant `ProtectedRoute`
3. Wrapper les routes dashboard avec `ProtectedRoute`
4. Rediriger vers `/connexion` si non authentifié

### Backend

Le site est actuellement en **frontend-only** avec données mock.

**Pour connecter un backend** :
1. Créer des services dans `/src/app/services/`
2. Remplacer les données en dur par des appels API
3. Gérer l'authentification (JWT, sessions)
4. Gérer le upload de fichiers (photos)
5. Connecter Mobile Money (API Orange, MTN, etc.)

### Mobile Money

Les opérateurs sont définis dans `VendorRecharge.tsx` :
```tsx
mobileMoneyProviders = [
  { id: 'orange', name: 'Orange Money', fee: '1%' },
  { id: 'mtn', name: 'MTN Mobile Money', fee: '1%' },
  { id: 'moov', name: 'Moov Money', fee: '1%' },
  { id: 'wave', name: 'Wave', fee: '0%' },
]
```

**Pour intégrer vraiment** :
1. Obtenir les API keys des opérateurs
2. Implémenter les webhooks de confirmation
3. Gérer les erreurs de paiement
4. Envoyer les notifications

### Système de crédits

**Règle de calcul** : 1 crédit = 1000 FCFA

**Coûts des actions** :
- Publier annonce : 1 crédit
- Boost Standard (7j) : 5 crédits
- Boost Premium (14j) : 10 crédits
- Super Boost (30j) : 20 crédits

---

## 🎯 Roadmap suggérée

### Phase 1 : Backend et Base de données
- [ ] Créer API REST (Node.js/Express ou autre)
- [ ] Base de données (PostgreSQL/MongoDB)
- [ ] Authentification JWT
- [ ] Upload de fichiers (AWS S3 ou Cloudinary)
- [ ] Gestion des utilisateurs

### Phase 2 : Fonctionnalités manquantes
- [ ] Messagerie entre acheteurs/vendeurs
- [ ] Système de favoris persistant
- [ ] Notifications en temps réel
- [ ] Recherche avancée (full-text)
- [ ] Pagination réelle

### Phase 3 : Paiements
- [ ] Intégration Mobile Money (Orange, MTN, Moov, Wave)
- [ ] Webhooks de confirmation
- [ ] Historique des transactions
- [ ] Remboursements

### Phase 4 : Amélioration UX
- [ ] Progressive Web App (PWA)
- [ ] Mode hors-ligne
- [ ] Optimisation SEO
- [ ] Analytics (Google Analytics, Mixpanel)
- [ ] A/B testing

### Phase 5 : Modération
- [ ] IA pour détecter annonces frauduleuses
- [ ] Système de signalement
- [ ] Vérification téléphone/email
- [ ] KYC pour vendeurs professionnels

---

## 🐛 Debugging

### Erreurs courantes

1. **"useState is not defined"**
   - Vérifier : `import { useState } from 'react';`

2. **"Module not found"**
   - Vérifier le chemin d'import (relatif ou absolu)
   - Vérifier que le package est installé

3. **"Icon is not exported"**
   - Vérifier que l'icône existe dans lucide-react
   - Utiliser `bash` tool pour chercher dans `lucide-react/dist/esm/icons/index.js`

4. **Tailwind classes ne fonctionnent pas**
   - Vérifier que Tailwind v4 est bien configuré
   - Vérifier `/src/styles/theme.css` est importé

### Console utiles

```bash
# Vérifier une icône lucide-react
grep "IconName" node_modules/lucide-react/dist/esm/icons/index.js

# Lister les packages installés
pnpm list

# Vérifier la version d'un package
pnpm list nom-package
```

---

## 📞 Support

Pour toute question sur l'architecture :

1. Consulter ce guide en premier
2. Lire les commentaires dans le code
3. Vérifier la documentation des librairies utilisées
4. Consulter les exemples dans les composants existants

---

## ✅ Checklist avant déploiement

- [ ] Toutes les routes fonctionnent
- [ ] Design responsive sur mobile/tablet/desktop
- [ ] Pas d'erreurs console
- [ ] Images optimisées
- [ ] SEO meta tags ajoutés
- [ ] Analytics configuré
- [ ] Variables d'environnement configurées
- [ ] Backend API connecté
- [ ] Paiements Mobile Money testés
- [ ] Emails de confirmation fonctionnels
- [ ] Sauvegardes base de données configurées

---

**Ce guide est un document vivant. Mettez-le à jour au fur et à mesure des évolutions du projet !**

Dernière mise à jour : Décembre 2024
Version : 1.0.0
