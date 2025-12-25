# 📑 Index du Projet - AnnonceAuto.ci

Index complet de tous les fichiers importants du projet avec leurs descriptions.

## 📚 Documentation (Racine du projet)

| Fichier | Description | Priorité |
|---------|-------------|----------|
| `README.md` | Vue d'ensemble, installation, fonctionnalités principales | ⭐⭐⭐ |
| `ARCHITECTURE.md` | Documentation complète de l'architecture - **À LIRE EN PREMIER** | ⭐⭐⭐⭐⭐ |
| `QUICK_REFERENCE.md` | Référence rapide : patterns, templates, snippets de code | ⭐⭐⭐⭐ |
| `DEVELOPER_GUIDE.md` | Guide de démarrage pour nouveaux développeurs | ⭐⭐⭐⭐ |
| `PROJECT_INDEX.md` | Ce fichier - Index de tous les fichiers du projet | ⭐⭐⭐ |
| `package.json` | Dépendances et scripts npm | ⭐⭐⭐ |

## 🎯 Fichiers principaux

| Fichier | Description | Rôle |
|---------|-------------|------|
| `/src/app/App.tsx` | Point d'entrée, **TOUTES LES ROUTES** définies ici | Configuration centrale |
| `/src/styles/theme.css` | Variables CSS, couleurs, typographie globale | Design system |
| `/src/styles/fonts.css` | Imports Google Fonts (Inter, Poppins, Sora) | Polices |

## 🧩 Composants réutilisables (`/src/app/components/`)

### Composants publics

| Fichier | Description | Utilisation |
|---------|-------------|-------------|
| `Header.tsx` | En-tête du site avec navigation principale | Pages publiques |
| `Footer.tsx` | Pied de page avec liens et infos | Pages publiques |
| `MobileNav.tsx` | Navigation mobile bottom bar | Pages publiques |
| `SearchBar.tsx` | Barre de recherche avancée avec filtres | HomePage, ListingsPage |
| `VehicleCard.tsx` | Carte d'affichage d'un véhicule | ListingsPage |
| `CategoryCard.tsx` | Carte de catégorie de véhicule | HomePage |

### Composants Dashboard (`/src/app/components/dashboard/`)

| Fichier | Description | Rôle crucial |
|---------|-------------|--------------|
| `DashboardLayout.tsx` | **Layout principal de TOUS les dashboards** | Sidebar, navigation, solde |
| `StatCard.tsx` | Carte de statistique (KPI) | Affichage métriques |
| `RecentListings.tsx` | Liste récente des annonces | VendorDashboard |

### Composants UI (`/src/app/components/ui/`)

Bibliothèque complète basée sur shadcn/ui et Radix UI :

| Fichier | Type | Utilisation |
|---------|------|-------------|
| `button.tsx` | Bouton | Actions, CTAs |
| `card.tsx` | Carte/Conteneur | Sections, contenus |
| `input.tsx` | Champ de saisie | Formulaires |
| `select.tsx` | Menu déroulant | Sélection options |
| `dialog.tsx` | Modale/Dialog | Popups, confirmations |
| `tabs.tsx` | Onglets | Navigation interne |
| `badge.tsx` | Badge/Label | Statuts, tags |
| `avatar.tsx` | Avatar utilisateur | Profils |
| `progress.tsx` | Barre de progression | Indicateurs |
| `checkbox.tsx` | Case à cocher | Formulaires |
| `switch.tsx` | Interrupteur | Toggle options |
| `slider.tsx` | Curseur | Plages de valeurs |
| `tooltip.tsx` | Info-bulle | Aide contextuelle |
| `alert.tsx` | Message d'alerte | Notifications |
| `accordion.tsx` | Accordéon | Contenus expandables |
| `dropdown-menu.tsx` | Menu déroulant | Actions multiples |
| `popover.tsx` | Popover | Contenus flottants |
| `scroll-area.tsx` | Zone de scroll | Listes scrollables |
| `separator.tsx` | Séparateur | Divisions visuelles |

## 📄 Pages publiques (`/src/app/pages/`)

| Fichier | Route | Description |
|---------|-------|-------------|
| `HomePage.tsx` | `/` | Page d'accueil avec hero, recherche, véhicules mis en avant |
| `ListingsPage.tsx` | `/annonces` | Liste de toutes les annonces avec filtres |
| `VehicleDetailPage.tsx` | `/annonces/:id` | Page détail d'une annonce (galerie, infos, contact) |
| `PublishPage.tsx` | `/publier` | Formulaire de création d'annonce |
| `LoginPage.tsx` | `/connexion` | Page de connexion |
| `RegisterPage.tsx` | `/inscription` | Page d'inscription |
| `ForgotPasswordPage.tsx` | `/mot-de-passe-oublie` | Récupération mot de passe |
| `DashboardSelector.tsx` | `/dashboard` | Choix entre dashboard vendeur/admin |
| `ThankYouPage.tsx` | `/merci` | Page de remerciement après recharge |

## 📊 Pages Dashboard Vendeur (`/src/app/pages/dashboard/`)

| Fichier | Route | Description |
|---------|-------|-------------|
| `VendorDashboard.tsx` | `/dashboard/vendeur` | Vue d'ensemble : KPIs, annonces récentes, graphiques |
| `VendorListings.tsx` | `/dashboard/vendeur/annonces` | Gestion des annonces (liste, modifier, supprimer) |
| `VendorRecharge.tsx` | `/dashboard/vendeur/recharge` | Recharge compte via Mobile Money |
| `VendorBooster.tsx` | `/dashboard/vendeur/booster` | Boost d'annonces (Standard, Premium, Super) |
| `VendorStats.tsx` | `/dashboard/vendeur/stats` | Statistiques détaillées (vues, favoris, conversion) |
| `VendorSettings.tsx` | `/dashboard/vendeur/settings` | Paramètres compte vendeur |

## 🛡️ Pages Dashboard Admin (`/src/app/pages/dashboard/`)

| Fichier | Route | Description |
|---------|-------|-------------|
| `AdminDashboard.tsx` | `/dashboard/admin` | Vue d'ensemble plateforme : users, annonces, revenus |
| `AdminModeration.tsx` | `/dashboard/admin/moderation` | Modération des annonces (approuver/rejeter) |
| `AdminUsers.tsx` | `/dashboard/admin/users` | Gestion des utilisateurs (liste, actions) |
| `AdminCredits.tsx` | `/dashboard/admin/credits` | Gestion des crédits vendeurs |
| `AdminPayments.tsx` | `/dashboard/admin/payments` | Historique et gestion des paiements |
| `AdminAnalytics.tsx` | `/dashboard/admin/analytics` | Analytics avancés avec graphiques et filtres de dates |
| `AdminSettings.tsx` | `/dashboard/admin/settings` | Paramètres globaux de la plateforme |

## 🎨 Styles (`/src/styles/`)

| Fichier | Contenu | Importance |
|---------|---------|-----------|
| `theme.css` | **Variables couleurs**, typographie H1-H6, styles globaux | ⭐⭐⭐⭐⭐ |
| `fonts.css` | Imports Google Fonts (Inter, Poppins, Sora) | ⭐⭐⭐ |

### Variables importantes dans theme.css

```css
--primary-dark: #0F172A;     /* Bleu foncé */
--primary-yellow: #FACC15;   /* Jaune/Or */
--background-light: #F3F4F6; /* Gris clair */
```

## 📦 Configuration

| Fichier | Description |
|---------|-------------|
| `package.json` | Dépendances npm, scripts, configuration pnpm |
| `vite.config.js` | Configuration Vite (build tool) |
| `tsconfig.json` | Configuration TypeScript |
| `tailwind.config.js` | Configuration Tailwind (si existe) |

## 🗂️ Structure arborescente complète

```
annonceauto-ci/
│
├── 📚 Documentation (racine)
│   ├── README.md                      ← Vue d'ensemble
│   ├── ARCHITECTURE.md                ← Doc complète ⭐⭐⭐⭐⭐
│   ├── QUICK_REFERENCE.md             ← Référence rapide
│   ├── DEVELOPER_GUIDE.md             ← Guide démarrage
│   └── PROJECT_INDEX.md               ← Ce fichier
│
├── 📦 Configuration
│   ├── package.json
│   ├── vite.config.js
│   ├── tsconfig.json
│   └── tailwind.config.js
│
└── 📁 src/app/
    │
    ├── 🎯 Fichiers principaux
    │   ├── App.tsx                    ← ROUTES ⭐⭐⭐⭐⭐
    │   └── main.tsx
    │
    ├── 🧩 components/
    │   │
    │   ├── 📱 Composants publics
    │   │   ├── Header.tsx             ← En-tête site
    │   │   ├── Footer.tsx             ← Pied de page
    │   │   ├── MobileNav.tsx          ← Nav mobile
    │   │   ├── SearchBar.tsx          ← Recherche avancée
    │   │   ├── VehicleCard.tsx        ← Carte véhicule
    │   │   └── CategoryCard.tsx       ← Carte catégorie
    │   │
    │   ├── 📊 dashboard/
    │   │   ├── DashboardLayout.tsx    ← Layout principal ⭐⭐⭐⭐⭐
    │   │   ├── StatCard.tsx
    │   │   └── RecentListings.tsx
    │   │
    │   ├── 🎨 ui/                     ← Composants UI (shadcn)
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── input.tsx
    │   │   ├── select.tsx
    │   │   ├── dialog.tsx
    │   │   ├── tabs.tsx
    │   │   ├── badge.tsx
    │   │   ├── avatar.tsx
    │   │   └── ... (30+ composants)
    │   │
    │   └── 🖼️ figma/
    │       └── ImageWithFallback.tsx
    │
    ├── 📄 pages/
    │   │
    │   ├── 🌐 Pages publiques
    │   │   ├── HomePage.tsx           ← / (accueil)
    │   │   ├── ListingsPage.tsx       ← /annonces
    │   │   ├── VehicleDetailPage.tsx  ← /annonces/:id
    │   │   └── PublishPage.tsx        ← /publier
    │   │
    │   ├── 🔐 Auth
    │   │   ├── LoginPage.tsx          ← /connexion
    │   │   ├── RegisterPage.tsx       ← /inscription
    │   │   └── ForgotPasswordPage.tsx ← /mot-de-passe-oublie
    │   │
    │   ├── 🎯 Autres
    │   │   ├── DashboardSelector.tsx  ← /dashboard
    │   │   └── ThankYouPage.tsx       ← /merci
    │   │
    │   └── 📊 dashboard/
    │       │
    │       ├── 👤 Vendeur
    │       │   ├── VendorDashboard.tsx       ← /dashboard/vendeur
    │       │   ├── VendorListings.tsx        ← /dashboard/vendeur/annonces
    │       │   ├── VendorRecharge.tsx        ← /dashboard/vendeur/recharge
    │       │   ├── VendorBooster.tsx         ← /dashboard/vendeur/booster
    │       │   ├── VendorStats.tsx           ← /dashboard/vendeur/stats
    │       │   └── VendorSettings.tsx        ← /dashboard/vendeur/settings
    │       │
    │       └── 🛡️ Admin
    │           ├── AdminDashboard.tsx        ← /dashboard/admin
    │           ├── AdminModeration.tsx       ← /dashboard/admin/moderation
    │           ├── AdminUsers.tsx            ← /dashboard/admin/users
    │           ├── AdminCredits.tsx          ← /dashboard/admin/credits
    │           ├── AdminPayments.tsx         ← /dashboard/admin/payments
    │           ├── AdminAnalytics.tsx        ← /dashboard/admin/analytics
    │           └── AdminSettings.tsx         ← /dashboard/admin/settings
    │
    └── 🎨 styles/
        ├── theme.css                  ← Variables, typographie ⭐⭐⭐⭐⭐
        └── fonts.css                  ← Google Fonts
```

## 🔑 Fichiers clés par fonctionnalité

### Pour modifier les routes
- ✅ `/src/app/App.tsx`

### Pour changer le design system
- ✅ `/src/styles/theme.css` (couleurs, typographie)
- ✅ `/src/styles/fonts.css` (polices)

### Pour modifier la navigation dashboard
- ✅ `/src/app/components/dashboard/DashboardLayout.tsx`

### Pour modifier la page d'accueil
- ✅ `/src/app/pages/HomePage.tsx`

### Pour modifier le système de recharge
- ✅ `/src/app/pages/dashboard/VendorRecharge.tsx`
- ✅ `/src/app/pages/ThankYouPage.tsx`

### Pour modifier les analytics
- ✅ `/src/app/pages/dashboard/AdminAnalytics.tsx`

### Pour ajouter un composant UI réutilisable
- ✅ Créer dans `/src/app/components/ui/`
- ✅ Ou dans `/src/app/components/` si spécifique au projet

## 📊 Dépendances principales

### Core
- `react` 18.3.1
- `react-dom` 18.3.1
- `react-router-dom` 7.11.0
- `vite` 6.3.5

### Styling
- `tailwindcss` 4.1.12
- `@tailwindcss/vite` 4.1.12

### UI Components
- `@radix-ui/react-*` (30+ composants)
- `lucide-react` 0.487.0 (icônes)

### Animations
- `motion` 12.23.24 (ex-Framer Motion)

### Charts
- `recharts` 2.15.2

### Forms
- `react-hook-form` 7.55.0

### Utilitaires
- `date-fns` 3.6.0
- `clsx` 2.1.1
- `tailwind-merge` 3.2.0

## 🎯 Points d'entrée selon la tâche

| Tâche | Commencer par |
|-------|---------------|
| Ajouter une route | `/src/app/App.tsx` |
| Modifier couleurs | `/src/styles/theme.css` |
| Créer une page publique | `/src/app/pages/MaPage.tsx` |
| Créer une page dashboard | `/src/app/pages/dashboard/MaPage.tsx` |
| Modifier layout dashboard | `/src/app/components/dashboard/DashboardLayout.tsx` |
| Ajouter un composant UI | `/src/app/components/ui/mon-composant.tsx` |
| Modifier la home | `/src/app/pages/HomePage.tsx` |
| Modifier le header | `/src/app/components/Header.tsx` |
| Gérer l'authentification | Créer `/src/app/contexts/AuthContext.tsx` |
| Connecter une API | Créer `/src/app/services/api.ts` |

## 📝 Conventions de nommage

### Fichiers
- **Composants React** : PascalCase (`VehicleCard.tsx`)
- **Utilitaires** : camelCase (`formatPrice.ts`)
- **Styles** : kebab-case (`theme.css`)

### Code
- **Composants** : PascalCase (`function VehicleCard() {}`)
- **Fonctions** : camelCase (`handleSubmit()`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
- **Variables** : camelCase (`userName`)

### Routes
- **URL** : kebab-case (`/dashboard/vendeur/mes-annonces`)
- **Paramètres** : camelCase (`?userId=123`)

## 🚀 Commandes utiles

```bash
# Développement
pnpm run dev              # Lancer le serveur de dev

# Build
pnpm run build            # Build pour production

# Package management
pnpm install              # Installer toutes les dépendances
pnpm add [package]        # Ajouter une dépendance
pnpm remove [package]     # Retirer une dépendance
pnpm list                 # Lister les packages installés

# Utilitaires
grep "IconName" node_modules/lucide-react/dist/esm/icons/index.js  # Vérifier une icône
```

## 🔍 Recherche rapide

Pour trouver où quelque chose est utilisé :

```bash
# Chercher dans tous les fichiers .tsx
grep -r "VehicleCard" src/app/**/*.tsx

# Chercher un import spécifique
grep -r "from 'lucide-react'" src/

# Chercher une classe Tailwind
grep -r "bg-\[#FACC15\]" src/
```

## ✅ Checklist nouveau développeur

Avant de commencer à coder :

- [ ] J'ai lu `ARCHITECTURE.md` en entier
- [ ] J'ai lu `DEVELOPER_GUIDE.md`
- [ ] Je connais la structure des dossiers
- [ ] Je sais où sont les routes (`App.tsx`)
- [ ] Je connais les couleurs principales (#0F172A, #FACC15)
- [ ] Je sais utiliser `DashboardLayout`
- [ ] J'ai exploré les composants UI disponibles
- [ ] Je comprends les conventions de nommage
- [ ] J'ai fait les exercices du `DEVELOPER_GUIDE.md`

## 📞 Besoin d'aide ?

1. **Consultez la documentation** :
   - [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre en profondeur
   - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) pour des snippets rapides
   - [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) pour démarrer

2. **Explorez le code existant** :
   - Regardez comment c'est fait ailleurs
   - Suivez les mêmes patterns

3. **Vérifiez les erreurs courantes** :
   - Import manquants
   - Icônes inexistantes
   - Routes mal configurées

---

**Version du projet** : 1.0.0  
**Dernière mise à jour de l'index** : Décembre 2024

Ce fichier est maintenu à jour. Si vous ajoutez de nouveaux fichiers importants, pensez à les ajouter ici !
