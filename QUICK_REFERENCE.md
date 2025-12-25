# 📖 Référence Rapide - AnnonceAuto.ci

Guide de référence rapide pour les développeurs. Pour la documentation complète, voir [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🎨 Couleurs du site

```tsx
// Bleu foncé (titres, headers, boutons secondaires)
className="text-[#0F172A] bg-[#0F172A]"

// Jaune/Or (boutons CTA, accents)
className="text-[#FACC15] bg-[#FACC15]"
className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24]"

// Gris clair (fonds)
className="bg-[#F3F4F6] bg-gray-50"

// Bouton primaire standard
className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold shadow-lg"

// Bouton secondaire standard
className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] hover:from-[#1e293b] hover:to-[#0F172A] text-white font-bold"
```

## 🛣️ Routes principales

```tsx
// Public
/                                   → HomePage
/annonces                          → ListingsPage
/annonces/:id                      → VehicleDetailPage
/publier                           → PublishPage

// Auth
/connexion                         → LoginPage
/inscription                       → RegisterPage
/mot-de-passe-oublie              → ForgotPasswordPage

// Vendeur
/dashboard/vendeur                 → VendorDashboard
/dashboard/vendeur/annonces        → VendorListings
/dashboard/vendeur/recharge        → VendorRecharge
/dashboard/vendeur/booster         → VendorBooster
/dashboard/vendeur/stats           → VendorStats
/dashboard/vendeur/settings        → VendorSettings

// Admin
/dashboard/admin                   → AdminDashboard
/dashboard/admin/moderation        → AdminModeration
/dashboard/admin/users             → AdminUsers
/dashboard/admin/credits           → AdminCredits
/dashboard/admin/payments          → AdminPayments
/dashboard/admin/analytics         → AdminAnalytics
/dashboard/admin/settings          → AdminSettings

// Autre
/merci?amount=X&credits=Y          → ThankYouPage
```

## 🧩 Imports courants

```tsx
// React
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

// Components
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

// Animations
import { motion } from 'motion/react';

// Icons (vérifier existence avant d'importer!)
import { Icon1, Icon2, Icon3 } from 'lucide-react';

// Charts
import { 
  LineChart, Line, 
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
```

## 📦 Composants UI disponibles

```tsx
// Tous dans /src/app/components/ui/

<Button variant="default | outline | ghost | link">Cliquez</Button>
<Card className="p-6">Contenu</Card>
<Input type="text" placeholder="..." />
<Select>...</Select>
<Dialog>...</Dialog>
<Tabs>...</Tabs>
<Badge>Label</Badge>
<Avatar>...</Avatar>
<Progress value={50} />
<Checkbox />
<Switch />
<Slider />
<Tooltip>...</Tooltip>
<Alert>Message</Alert>
```

## 🎭 Patterns d'animation Motion

```tsx
// Fade in + slide up
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// Scale on appear
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: 'spring', stiffness: 200 }}
>

// Hover effect
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>

// Stagger children
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1 }}
>
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
</motion.div>

// Loop animation
<motion.div
  animate={{ 
    scale: [1, 1.2, 1],
    rotate: [0, 90, 0] 
  }}
  transition={{ 
    duration: 2, 
    repeat: Infinity 
  }}
>
```

## 📊 Templates Recharts

### Line Chart
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
    <XAxis dataKey="name" stroke="#6B7280" />
    <YAxis stroke="#6B7280" />
    <Tooltip />
    <Legend />
    <Line 
      type="monotone" 
      dataKey="value" 
      stroke="#0F172A" 
      strokeWidth={2} 
    />
  </LineChart>
</ResponsiveContainer>
```

### Bar Chart
```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
    <XAxis dataKey="name" stroke="#6B7280" />
    <YAxis stroke="#6B7280" />
    <Tooltip />
    <Legend />
    <Bar dataKey="value" fill="#0F172A" radius={[8, 8, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### Area Chart
```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
    <XAxis dataKey="name" stroke="#6B7280" />
    <YAxis stroke="#6B7280" />
    <Tooltip />
    <Area 
      type="monotone" 
      dataKey="value" 
      stroke="#0F172A" 
      fill="url(#colorValue)" 
    />
  </AreaChart>
</ResponsiveContainer>
```

### Pie Chart
```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      outerRadius={80}
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

## 🎯 Templates de composants

### Page publique avec Header/Footer
```tsx
export function MaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Titre</h1>
          <p className="text-xl text-gray-300">Description</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Card className="p-8 border-0 shadow-lg">
          {/* Contenu */}
        </Card>
      </section>
    </div>
  );
}
```

### Page Dashboard
```tsx
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

export function MaDashboardPage() {
  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Titre</h1>
          <p className="text-gray-600 mt-2">Description</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-0 shadow-lg">
            {/* Stat */}
          </Card>
        </div>

        {/* Main Content */}
        <Card className="p-6 border-0 shadow-lg">
          {/* Contenu */}
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

### Card de statistique
```tsx
<Card className="p-6 border-0 shadow-lg">
  <div className="flex items-start justify-between mb-4">
    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
      <TrendingUp className="w-4 h-4" />
      +12.5%
    </div>
  </div>
  <p className="text-2xl font-bold text-[#0F172A] mb-1">1,234</p>
  <p className="text-sm text-gray-600">Label</p>
</Card>
```

### Formulaire
```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700">
      Label
    </label>
    <Input
      type="text"
      placeholder="..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="h-12"
      required
    />
  </div>

  <Button
    type="submit"
    className="w-full h-12 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold"
  >
    Soumettre
  </Button>
</form>
```

## 🔧 Hooks courants

```tsx
// Navigation
const navigate = useNavigate();
navigate('/dashboard/vendeur');
navigate(-1); // Retour

// Params URL
const { id } = useParams();
const [searchParams] = useSearchParams();
const amount = searchParams.get('amount');

// State
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

// Effect
useEffect(() => {
  // Code à exécuter
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

## 💾 Mock Data Pattern

```tsx
// Au début du fichier, après les imports
const mockData = [
  {
    id: '1',
    title: 'Item 1',
    value: 100,
  },
  {
    id: '2',
    title: 'Item 2',
    value: 200,
  },
];

// Dans le composant
export function MyComponent() {
  const [data, setData] = useState(mockData);
  
  // Pour simuler un appel API
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, []);
}
```

## 📱 Classes Tailwind responsive

```tsx
// Mobile first approach
<div className="
  w-full                    // Mobile (default)
  sm:w-1/2                  // Small screens (640px+)
  md:w-1/3                  // Medium screens (768px+)
  lg:w-1/4                  // Large screens (1024px+)
  xl:w-1/5                  // Extra large (1280px+)
">

// Grid responsive
<div className="
  grid 
  grid-cols-1               // 1 colonne sur mobile
  sm:grid-cols-2            // 2 colonnes sur small+
  md:grid-cols-3            // 3 colonnes sur medium+
  lg:grid-cols-4            // 4 colonnes sur large+
  gap-4
">

// Flex responsive
<div className="
  flex 
  flex-col                  // Column sur mobile
  md:flex-row               // Row sur medium+
  gap-4
">

// Text responsive
<h1 className="
  text-2xl                  // Mobile
  sm:text-3xl               // Small+
  md:text-4xl               // Medium+
  lg:text-5xl               // Large+
">

// Padding responsive
<div className="
  p-4                       // Mobile
  md:p-6                    // Medium+
  lg:p-8                    // Large+
">
```

## 🎨 Effets Glass Morphism

```tsx
<div className="
  bg-white/80 
  backdrop-blur-lg 
  border border-white/20 
  shadow-2xl 
  rounded-2xl
">
  {/* Contenu avec effet verre */}
</div>

// Ou avec fond dégradé
<div className="relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-yellow-50/50 pointer-events-none" />
  <div className="relative z-10">
    {/* Contenu */}
  </div>
</div>
```

## 🌟 Badges et labels

```tsx
// Badge boost
<span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
  BOOST
</span>

// Badge statut
<span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
  <CheckCircle className="w-4 h-4" />
  Actif
</span>

// Badge compteur
<div className="relative">
  <Icon className="w-6 h-6" />
  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
    5
  </span>
</div>
```

## 🔄 Loading States

```tsx
// Skeleton loader
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

// Spinner
<div className="flex items-center justify-center py-12">
  <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FACC15] rounded-full animate-spin"></div>
</div>

// Button loading
<Button disabled={loading}>
  {loading ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      Chargement...
    </>
  ) : (
    'Soumettre'
  )}
</Button>
```

## 🎯 Navigation rapide

```tsx
// Depuis n'importe quelle page
navigate('/');                              // Accueil
navigate('/annonces');                      // Annonces
navigate('/publier');                       // Publier
navigate('/connexion');                     // Connexion
navigate('/dashboard/vendeur');             // Dashboard vendeur
navigate('/dashboard/admin');               // Dashboard admin
navigate(`/merci?amount=10000&credits=10`); // Page remerciement

// Retour
navigate(-1);

// Avec state
navigate('/page', { state: { data: 'value' } });
```

## 💡 Tips

1. **Vérifier les icônes Lucide** avant import : utiliser `bash` tool
2. **Ne pas utiliser** `text-*`, `font-*`, `leading-*` sauf si demandé
3. **Toujours** ajouter `motion` pour les pages importantes
4. **Mobile-first** : commencer par mobile, ajouter responsive après
5. **Cohérence** : utiliser les couleurs du thème (#0F172A, #FACC15)
6. **Glass morphism** : `backdrop-blur-lg` + `bg-white/80`
7. **Ombres** : `shadow-lg` normal, `shadow-xl` au hover
8. **Transitions** : toujours ajouter `transition-all duration-300`

## 🚨 Erreurs courantes

```tsx
// ❌ Mauvais
import { useState } from 'React';           // R majuscule
import Button from './components/Button';   // Default import
className="text-xl font-bold"              // Police overriden

// ✅ Bon
import { useState } from 'react';           // r minuscule
import { Button } from './components/Button'; // Named import
className=""                               // Pas de font styles
```

## 📞 Aide

- Documentation complète : [ARCHITECTURE.md](./ARCHITECTURE.md)
- README : [README.md](./README.md)
- Ce guide : [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

**Bon développement ! 🚀**
