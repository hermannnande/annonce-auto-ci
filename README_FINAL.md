# 🚗 AnnonceAuto.ci - Plateforme de vente de véhicules

> Plateforme moderne de petites annonces automobiles pour la Côte d'Ivoire

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ecf8e)](https://supabase.com/)

---

## 📸 Aperçu

Application React complète avec design ultra-professionnel, animations premium et backend Supabase prêt à intégrer.

**Fonctionnalités :**
- 🚗 Publication d'annonces de véhicules
- 💳 Système de crédits et recharge Mobile Money
- ⚡ Boost d'annonces pour plus de visibilité
- 📊 Dashboards ultra-professionnels (vendeur + admin)
- 📱 Design responsive mobile-first
- 🎭 Animations et effets visuels premium

---

## 🚀 Démarrage rapide

### Tester le site (5 minutes)

```bash
# 1. Installer pnpm
npm install -g pnpm

# 2. Installer les dépendances
pnpm install

# 3. Lancer le serveur
pnpm run dev

# 4. Ouvrir http://localhost:5173
```

**Note :** À ce stade, le site affiche des données mockées (non persistantes).

---

### Rendre le site fonctionnel (1-3 heures)

Pour avoir un site 100% opérationnel avec base de données :

**👉 Lire : `/COMMENCER_ICI.md`**

Deux options :
- **Option 1** : Avec Cursor AI (1 heure) - Recommandé
- **Option 2** : Manuellement (2-3 heures)

---

## 📚 Documentation

| Guide | Description | Temps |
|-------|-------------|-------|
| **[COMMENCER_ICI.md](./COMMENCER_ICI.md)** | **Rendre le site fonctionnel** ⭐⭐⭐ | Vue d'ensemble |
| [DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md) | Installation express | 2 min |
| [INSTALLATION_LOCALE.md](./INSTALLATION_LOCALE.md) | Installation complète | 15 min |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Documentation technique | 45 min |
| [CURSOR_AI_GUIDE.md](./CURSOR_AI_GUIDE.md) | Développer avec Cursor | 30 min |
| [INSTALLATION_SUPABASE_COMPLETE.md](./INSTALLATION_SUPABASE_COMPLETE.md) | Intégrer Supabase | 1-3h |

---

## 🛠️ Technologies

### Frontend
- **React** 18.3.1 + TypeScript
- **Tailwind CSS** v4
- **Motion** (animations)
- **Recharts** (graphiques)
- **React Router DOM** 7.11.0
- **Radix UI** (composants)
- **Lucide React** (icônes)

### Backend (Prêt à intégrer)
- **Supabase** (BDD + Auth + Storage)
- PostgreSQL
- Row Level Security
- API REST automatique

---

## 📁 Structure du projet

```
annonceauto-ci/
├── src/
│   ├── app/
│   │   ├── App.tsx              # Routes
│   │   ├── pages/               # 20+ pages
│   │   ├── components/          # 50+ composants
│   │   ├── services/            # Services Supabase
│   │   ├── context/             # Context auth
│   │   └── lib/                 # Client Supabase
│   └── styles/                  # CSS & thème
├── index.html
├── package.json
└── Documentation (25+ guides)
```

---

## 🎨 Design System

### Palette de couleurs
```css
Bleu foncé : #0F172A  /* Titres, headers */
Jaune/Or  : #FACC15   /* Boutons CTA, accents */
Gris clair : #F3F4F6  /* Fonds de section */
```

### Polices
- **Inter** - Corps de texte
- **Poppins** - Titres
- **Sora** - Accents

### Effets
- Glass morphism
- Animations Motion
- Gradients animés
- Micro-interactions

---

## 📄 Pages disponibles

### Publiques
- `/` - Page d'accueil
- `/annonces` - Liste des annonces
- `/annonces/:id` - Détail d'une annonce
- `/publier` - Publier une annonce

### Authentification
- `/connexion` - Se connecter
- `/inscription` - S'inscrire
- `/mot-de-passe-oublie` - Réinitialiser
- `/dashboard-selector` - Choisir dashboard

### Dashboard Vendeur
- `/dashboard/vendeur` - Vue d'ensemble
- `/dashboard/vendeur/annonces` - Mes annonces
- `/dashboard/vendeur/stats` - Statistiques
- `/dashboard/vendeur/booster` - Booster annonces
- `/dashboard/vendeur/recharge` - Recharge crédits
- `/dashboard/vendeur/parametres` - Paramètres

### Dashboard Admin
- `/dashboard/admin` - Vue d'ensemble
- `/dashboard/admin/analytics` - Analytics avancés
- `/dashboard/admin/moderation` - Modération
- `/dashboard/admin/utilisateurs` - Gestion users
- `/dashboard/admin/credits` - Gestion crédits
- `/dashboard/admin/paiements` - Paiements
- `/dashboard/admin/parametres` - Paramètres

---

## 🔧 Scripts disponibles

```bash
# Développement
pnpm run dev

# Build production
pnpm run build

# Prévisualiser build
pnpm run preview

# Vérifier installation
node check-setup.js
```

---

## 🚀 Intégration Supabase

Le projet inclut :
- ✅ Services Supabase prêts (`/src/app/services/`)
- ✅ Script SQL complet (`/SUPABASE_SETUP.sql`)
- ✅ Client configuré (`/src/app/lib/supabase.ts`)
- ✅ Context auth (`/src/app/context/AuthContext.tsx`)
- ✅ Protection routes (`/src/app/components/ProtectedRoute.tsx`)

**Pour intégrer :**

### Avec Cursor AI (1 heure)
👉 Lire `/CURSOR_INTEGRATION_RAPIDE.md`

### Manuellement (2-3 heures)
👉 Lire `/INSTALLATION_SUPABASE_COMPLETE.md`

---

## 📊 État du projet

### ✅ Complet
- [x] Frontend React avec 20+ pages
- [x] 50+ composants réutilisables
- [x] Design ultra-professionnel
- [x] Responsive mobile/tablette/desktop
- [x] Animations Motion
- [x] Graphiques Recharts
- [x] Services Supabase (code écrit)
- [x] Script SQL base de données
- [x] Documentation exhaustive (25+ guides)

### ⚠️ À faire (1-3h)
- [ ] Créer compte Supabase
- [ ] Exécuter script SQL
- [ ] Configurer `.env.local`
- [ ] Connecter frontend au backend

---

## 🎯 Cas d'usage

### Je veux tester rapidement
```bash
pnpm install && pnpm run dev
```
→ Site magnifique avec données mockées

### Je veux rendre le site fonctionnel
→ Lire `/COMMENCER_ICI.md`
→ Suivre le guide (1-3h)
→ Site 100% opérationnel

### Je veux développer avec Cursor AI
→ Installer Cursor (https://cursor.sh/)
→ Lire `/CURSOR_AI_GUIDE.md`
→ Utiliser les 60+ prompts fournis

### Je veux comprendre l'architecture
→ Lire `/ARCHITECTURE.md`
→ Documentation complète 45 min

---

## 🤝 Contribution

### Pour contribuer
1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit (`git commit -m 'Ajout fonctionnalité'`)
4. Push (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

### Conventions
- Suivre les règles dans `/.cursorrules`
- Respecter la palette de couleurs
- Code TypeScript strict
- Mobile-first responsive
- Ajouter animations Motion

---

## 📝 Licence

Ce projet est sous licence MIT.

---

## 🆘 Support

### Documentation
Consultez les 25+ guides fournis :
- Installation, développement, architecture
- Intégration Supabase
- Prompts Cursor AI

### Problèmes courants
Voir la section "Dépannage" dans :
- `/INSTALLATION_LOCALE.md`
- `/INSTALLATION_SUPABASE_COMPLETE.md`

### Communauté
- Discord Supabase : https://discord.supabase.com
- Documentation Supabase : https://supabase.com/docs

---

## 🎉 Crédits

**Créé avec :**
- React + TypeScript
- Tailwind CSS v4
- Motion
- Supabase
- Recharts
- Radix UI
- Lucide Icons

**Design :**
- Palette personnalisée (#0F172A, #FACC15, #F3F4F6)
- Google Fonts (Inter, Poppins, Sora)
- Glass morphism
- Animations premium

---

## 📞 Contact

Pour toute question sur le projet, consultez la documentation fournie ou créez une issue.

---

## 🚀 Prochaines étapes

1. **Tester le site** : `pnpm install && pnpm run dev`
2. **Lire la doc** : `/COMMENCER_ICI.md`
3. **Rendre fonctionnel** : Intégrer Supabase (1-3h)
4. **Développer** : Ajouter vos fonctionnalités
5. **Déployer** : Vercel/Netlify

---

**Bon développement ! 🚗💨**

**Le site est prêt à devenir 100% opérationnel en 1-3 heures !**
