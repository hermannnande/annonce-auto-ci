# 👨‍💻 Guide Développeur - AnnonceAuto.ci

Bienvenue ! Ce guide vous aidera à démarrer rapidement sur le projet AnnonceAuto.ci.

## 📚 Documentation disponible

1. **[README.md](./README.md)** - Vue d'ensemble du projet, installation, fonctionnalités
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Documentation complète de l'architecture (LISEZ EN PREMIER !)
3. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Référence rapide (patterns, templates, snippets)
4. **Ce fichier** - Guide de démarrage pour nouveaux développeurs

## 🚀 Démarrage rapide (5 minutes)

### 1. Installation

```bash
# Cloner le repository
git clone [url-du-repo]
cd annonceauto-ci

# Installer les dépendances (utilise pnpm)
pnpm install

# Lancer en mode développement
pnpm run dev

# Ouvrir http://localhost:5173 dans le navigateur
```

### 2. Premier tour

1. Ouvrir `/` - Page d'accueil
2. Cliquer sur "Connexion" - Page de connexion
3. Sélectionner "Vendeur" - Dashboard vendeur
4. Explorer les différentes pages du menu

### 3. Comprendre la structure

```
/src/app/
├── App.tsx                    ← Point d'entrée, ROUTES définies ici
├── components/                ← Composants réutilisables
│   ├── dashboard/            ← Spécifiques au dashboard
│   │   └── DashboardLayout.tsx ← Layout principal des dashboards
│   ├── ui/                   ← Composants UI de base (shadcn)
│   ├── Header.tsx            ← En-tête du site public
│   └── Footer.tsx            ← Pied de page
├── pages/                    ← Pages de l'application
│   ├── HomePage.tsx          ← Page d'accueil (/)
│   ├── ListingsPage.tsx      ← Liste annonces (/annonces)
│   ├── VehicleDetailPage.tsx ← Détail annonce (/annonces/:id)
│   ├── PublishPage.tsx       ← Publier (/publier)
│   ├── LoginPage.tsx         ← Connexion (/connexion)
│   ├── ThankYouPage.tsx      ← Remerciement (/merci)
│   └── dashboard/            ← Pages des dashboards
│       ├── VendorDashboard.tsx    ← Dashboard vendeur principal
│       ├── VendorRecharge.tsx     ← Recharge Mobile Money
│       ├── AdminDashboard.tsx     ← Dashboard admin principal
│       ├── AdminAnalytics.tsx     ← Analytics avec graphiques
│       └── ...
└── styles/
    ├── theme.css             ← VARIABLES COULEURS, typographie
    └── fonts.css             ← Google Fonts imports
```

## 🎨 Comprendre le Design System

### Couleurs principales (IMPORTANT)

```css
/* Bleu foncé - Utilisé pour titres, headers, textes importants */
#0F172A

/* Jaune/Or - Utilisé pour boutons CTA, accents, highlights */
#FACC15
#FBBF24

/* Gris clair - Utilisé pour fonds de sections */
#F3F4F6
```

### Comment utiliser les couleurs

```tsx
// ✅ BOUTON PRIMAIRE (jaune/or)
<Button className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] font-bold">
  Action principale
</Button>

// ✅ BOUTON SECONDAIRE (bleu foncé)
<Button className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] text-white font-bold">
  Action secondaire
</Button>

// ✅ TITRE
<h1 className="text-[#0F172A] font-bold">Mon titre</h1>

// ✅ FOND DE SECTION
<section className="bg-[#F3F4F6] py-12">
```

### Règle d'OR sur la typographie

```tsx
// ❌ NE JAMAIS FAIRE (sauf si demandé explicitement)
className="text-2xl font-bold leading-tight"

// ✅ FAIRE
className=""  // Les styles de texte sont définis dans theme.css

// Pourquoi ? theme.css a des styles par défaut pour <h1>, <h2>, <p>, etc.
// Pas besoin de les surcharger avec Tailwind
```

## 🛣️ Comprendre les Routes

Toutes les routes sont dans `/src/app/App.tsx`.

### Routes publiques (avec Header + Footer)

```tsx
/                    → HomePage
/annonces            → ListingsPage
/annonces/:id        → VehicleDetailPage
/publier             → PublishPage
```

### Routes authentification (sans Header/Footer)

```tsx
/connexion                → LoginPage
/inscription              → RegisterPage
/mot-de-passe-oublie      → ForgotPasswordPage
```

### Routes dashboard (avec DashboardLayout)

```tsx
// Vendeur
/dashboard/vendeur                → VendorDashboard
/dashboard/vendeur/annonces       → VendorListings
/dashboard/vendeur/recharge       → VendorRecharge
/dashboard/vendeur/booster        → VendorBooster
/dashboard/vendeur/stats          → VendorStats

// Admin
/dashboard/admin                  → AdminDashboard
/dashboard/admin/moderation       → AdminModeration
/dashboard/admin/analytics        → AdminAnalytics
// ... etc
```

## 🧩 Composants clés à connaître

### 1. DashboardLayout

Utilisé par TOUTES les pages de dashboard.

```tsx
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

export function MaDashboardPage() {
  return (
    <DashboardLayout userType="vendor"> {/* ou "admin" */}
      <div className="space-y-6">
        {/* Votre contenu ici */}
      </div>
    </DashboardLayout>
  );
}
```

**Ce qu'il fait :**
- Affiche la sidebar avec menu
- Gère la navigation mobile
- Affiche le solde (vendeur) ou stats (admin)
- Change les items du menu selon userType

### 2. Card (composant UI)

```tsx
import { Card } from '../components/ui/card';

<Card className="p-6 border-0 shadow-lg">
  {/* Contenu de la carte */}
</Card>
```

### 3. Button (composant UI)

```tsx
import { Button } from '../components/ui/button';

<Button variant="default">Défaut</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### 4. VehicleCard

Utilisé pour afficher un véhicule dans la liste.

```tsx
import { VehicleCard } from '../components/VehicleCard';

<VehicleCard
  id="123"
  title="Toyota Camry 2020"
  price={15000000}
  year={2020}
  mileage="45,000 km"
  location="Abidjan"
  image="https://..."
  isBoosted={true}
/>
```

## 🎭 Animations avec Motion

```tsx
import { motion } from 'motion/react';

// Animation simple : fade + slide
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Contenu qui apparaît en fondu
</motion.div>

// Animation au hover
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Bouton animé
</motion.button>
```

## 📊 Graphiques avec Recharts

Exemple basique d'un line chart :

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lun', value: 100 },
  { name: 'Mar', value: 150 },
  { name: 'Mer', value: 120 },
];

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="value" stroke="#0F172A" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
```

**Voir [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) pour plus d'exemples de graphiques.**

## 🔍 Où trouver quoi ?

| Besoin | Fichier |
|--------|---------|
| Ajouter une route | `/src/app/App.tsx` |
| Changer les couleurs | `/src/styles/theme.css` |
| Ajouter une police | `/src/styles/fonts.css` |
| Layout dashboard | `/src/app/components/dashboard/DashboardLayout.tsx` |
| Composants UI | `/src/app/components/ui/*` |
| Page d'accueil | `/src/app/pages/HomePage.tsx` |
| Dashboard vendeur | `/src/app/pages/dashboard/VendorDashboard.tsx` |
| Dashboard admin | `/src/app/pages/dashboard/AdminDashboard.tsx` |
| Analytics | `/src/app/pages/dashboard/AdminAnalytics.tsx` |
| Recharge Mobile Money | `/src/app/pages/dashboard/VendorRecharge.tsx` |
| Page remerciement | `/src/app/pages/ThankYouPage.tsx` |

## ✅ Checklist première contribution

Avant de faire votre première modification :

- [ ] J'ai lu [ARCHITECTURE.md](./ARCHITECTURE.md) en entier
- [ ] J'ai exploré toutes les pages du site en local
- [ ] Je comprends la palette de couleurs (#0F172A, #FACC15)
- [ ] Je sais où sont définies les routes (/src/app/App.tsx)
- [ ] J'ai regardé comment DashboardLayout fonctionne
- [ ] Je sais comment utiliser les composants UI (/components/ui/)
- [ ] J'ai compris le système de navigation
- [ ] Je sais qu'il ne faut PAS utiliser text-*, font-*, leading-* (sauf demande)

## 🎯 Premiers exercices

### Exercice 1 : Ajouter une page simple

1. Créer `/src/app/pages/TestPage.tsx`
2. Ajouter la route dans `App.tsx`
3. Naviguer vers `/test`

```tsx
// /src/app/pages/TestPage.tsx
export function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#0F172A] mb-4">
          Ma première page !
        </h1>
        <p className="text-gray-600">
          J'ai réussi à ajouter une page 🎉
        </p>
      </div>
    </div>
  );
}
```

```tsx
// Dans /src/app/App.tsx
import { TestPage } from './pages/TestPage';

// Dans <Routes>
<Route path="/test" element={<TestPage />} />
```

### Exercice 2 : Ajouter une page dashboard

1. Créer `/src/app/pages/dashboard/VendorTestPage.tsx`
2. Utiliser DashboardLayout
3. Ajouter une Card avec contenu

```tsx
// /src/app/pages/dashboard/VendorTestPage.tsx
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Sparkles } from 'lucide-react';

export function VendorTestPage() {
  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#0F172A]">Ma page test</h1>
        
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-[#FACC15]" />
            <h2 className="text-xl font-bold text-[#0F172A]">Test réussi !</h2>
          </div>
          <p className="text-gray-600">
            Je sais maintenant créer une page dashboard.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

```tsx
// Dans /src/app/App.tsx
<Route path="/dashboard/vendeur/test" element={<VendorTestPage />} />
```

### Exercice 3 : Ajouter une animation

Modifier votre Card pour qu'elle apparaisse en fondu :

```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <Card className="p-6 border-0 shadow-lg">
    {/* ... */}
  </Card>
</motion.div>
```

## 🚨 Pièges à éviter

### 1. Imports d'icônes Lucide

```tsx
// ❌ NE PAS importer sans vérifier
import { SuperRareIcon } from 'lucide-react'; // Risque d'erreur

// ✅ Vérifier d'abord que l'icône existe
// Utiliser bash tool : grep "SuperRareIcon" node_modules/lucide-react/...
```

### 2. Styles de texte

```tsx
// ❌ Surcharge la typographie définie dans theme.css
<h1 className="text-4xl font-bold leading-tight">

// ✅ Laisse theme.css gérer la typographie
<h1 className="">Titre</h1>

// Exception : si changement explicite demandé
<h1 className="text-5xl">Titre plus grand</h1>
```

### 3. Couleurs

```tsx
// ❌ Utilise des couleurs aléatoires
<Button className="bg-blue-500">

// ✅ Utilise les couleurs du thème
<Button className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24]">
```

### 4. Navigation

```tsx
// ❌ Hard-coded href
<a href="/dashboard">Dashboard</a>

// ✅ Utilise React Router
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
<button onClick={() => navigate('/dashboard')}>Dashboard</button>
```

## 📖 Ressources utiles

### Documentation externe

- [React](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Motion](https://motion.dev/) (ex-Framer Motion)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)
- [Radix UI](https://www.radix-ui.com/)

### Documentation interne

- **Vue d'ensemble** : [README.md](./README.md)
- **Architecture complète** : [ARCHITECTURE.md](./ARCHITECTURE.md) ⭐ À LIRE ABSOLUMENT
- **Référence rapide** : [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **Ce guide** : [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

## 🎓 Parcours d'apprentissage recommandé

### Jour 1 : Découverte
1. ✅ Lire ce guide
2. ✅ Lire [README.md](./README.md)
3. ✅ Installer et lancer le projet
4. ✅ Explorer toutes les pages en local
5. ✅ Faire les 3 exercices ci-dessus

### Jour 2 : Compréhension
1. ✅ Lire [ARCHITECTURE.md](./ARCHITECTURE.md) en ENTIER
2. ✅ Explorer la structure des dossiers
3. ✅ Regarder comment DashboardLayout fonctionne
4. ✅ Comprendre le système de routes
5. ✅ Examiner 2-3 pages en détail

### Jour 3 : Pratique
1. ✅ Créer une nouvelle page simple
2. ✅ Créer une page dashboard
3. ✅ Ajouter des animations Motion
4. ✅ Utiliser les composants UI
5. ✅ Intégrer un graphique Recharts

### Jour 4 : Maîtrise
1. ✅ Modifier une page existante
2. ✅ Créer un composant réutilisable
3. ✅ Ajouter une fonctionnalité complète
4. ✅ Consulter [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) pour patterns

## 🤝 Bonnes pratiques

1. **Avant de coder** : Lire la documentation
2. **Respecter la palette** : #0F172A, #FACC15, #F3F4F6
3. **Réutiliser** : Chercher si un composant existe déjà
4. **Mobile-first** : Toujours tester sur mobile
5. **Animations** : Utiliser Motion pour les interactions
6. **Conventions** : Suivre les patterns existants
7. **Documenter** : Ajouter des commentaires si logique complexe
8. **Tester** : Vérifier sur Chrome, Safari, Firefox

## 💬 Questions fréquentes

### Q: Où ajouter une nouvelle route ?
**R:** Dans `/src/app/App.tsx`, section `<Routes>`

### Q: Comment changer les couleurs du site ?
**R:** Dans `/src/styles/theme.css`, variables CSS

### Q: Comment ajouter un item au menu dashboard ?
**R:** Dans `/src/app/components/dashboard/DashboardLayout.tsx`, arrays `vendorMenuItems` ou `adminMenuItems`

### Q: Où sont les données ?
**R:** Actuellement en mock/dummy data dans les composants. Pour API réelle, créer `/src/app/services/`

### Q: Comment ajouter une animation ?
**R:** Import `motion` from 'motion/react', wrap avec `<motion.div>`, voir [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

### Q: Comment vérifier qu'une icône existe ?
**R:** Utiliser bash tool : `grep "IconName" node_modules/lucide-react/dist/esm/icons/index.js`

### Q: Puis-je utiliser text-2xl, font-bold ?
**R:** NON, sauf demande explicite. theme.css gère la typographie.

## 🎯 Prochaines étapes suggérées

Après avoir maîtrisé les bases :

1. **Backend** : Créer une API REST (Node.js/Express)
2. **Database** : Connecter PostgreSQL ou MongoDB
3. **Auth** : Implémenter JWT authentication
4. **Upload** : Gérer l'upload de photos (S3/Cloudinary)
5. **Mobile Money** : Intégrer les APIs réelles
6. **Tests** : Ajouter tests unitaires et e2e
7. **Deploy** : Déployer sur Vercel/Netlify

## ✨ Bon développement !

Vous êtes maintenant prêt à contribuer au projet AnnonceAuto.ci !

**Rappel des ressources** :
- 📘 [README.md](./README.md) - Vue d'ensemble
- 📗 [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentation complète ⭐
- 📙 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Référence rapide
- 📕 [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Ce guide

**En cas de doute** : Consultez d'abord la documentation, puis regardez comment c'est fait ailleurs dans le code.

Bonne chance ! 🚀
