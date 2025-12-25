# 👋 LISEZ-MOI D'ABORD !

Bienvenue sur **AnnonceAuto.ci** - Plateforme de vente de véhicules pour la Côte d'Ivoire 🚗

## 🎯 Vous voulez :

### 🚀 Installer et tester le site en local ?

➡️ **Débutant** : Lisez [INSTALLATION_LOCALE.md](./INSTALLATION_LOCALE.md) (15 min)  
➡️ **Expérimenté** : Lisez [DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md) (2 min)

**TL;DR :**
```bash
# 1. Installer pnpm
npm install -g pnpm

# 2. Installer les dépendances
pnpm install

# 3. Lancer le serveur
pnpm run dev

# 4. Ouvrir http://localhost:5173
```

### 👨‍💻 Développer sur le projet ?

1. ✅ Lire [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Guide de démarrage
2. ✅ Lire [ARCHITECTURE.md](./ARCHITECTURE.md) - **Documentation complète** ⭐⭐⭐⭐⭐
3. ✅ Garder [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) sous la main

### 🤖 Utiliser Cursor AI pour développer ?

➡️ **Démarrage rapide** : Lisez [README_CURSOR.md](./README_CURSOR.md) (2 min)  
➡️ **Guide complet** : Lisez [CURSOR_AI_GUIDE.md](./CURSOR_AI_GUIDE.md) (30 min)  
➡️ **Prompts prêts** : Consultez [CURSOR_PROMPTS.md](./CURSOR_PROMPTS.md)

**TL;DR :**
1. Installer Cursor : https://cursor.sh/
2. Ouvrir le projet : `cursor .`
3. Utiliser le prompt d'init dans README_CURSOR.md
4. Commencer à coder avec l'IA !

### 🔍 Chercher quelque chose de spécifique ?

➡️ Consultez [PROJECT_INDEX.md](./PROJECT_INDEX.md) - Index complet des fichiers

### ❓ Vérifier l'installation ?

```bash
node check-setup.js
```

## 📚 Documentation disponible

| Fichier | Description | Temps de lecture |
|---------|-------------|------------------|
| **[DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md)** | Installation express | 2 min |
| **[INSTALLATION_LOCALE.md](./INSTALLATION_LOCALE.md)** | Installation complète | 15 min |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Doc technique complète ⭐ | 45 min |
| **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** | Guide développeur | 30 min |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Référence rapide | Selon besoin |
| **[PROJECT_INDEX.md](./PROJECT_INDEX.md)** | Index des fichiers | Selon besoin |
| **[README.md](./README.md)** | Vue d'ensemble | 10 min |
| **[FICHIERS_INSTALLATION.md](./FICHIERS_INSTALLATION.md)** | Liste des fichiers | 5 min |

## 🎨 Qu'est-ce qu'AnnonceAuto.ci ?

Plateforme moderne de petites annonces automobiles pour la Côte d'Ivoire avec :

- 🚗 Publication d'annonces de véhicules
- 💳 Système de crédits et recharge Mobile Money
- ⚡ Boost d'annonces pour plus de visibilité
- 📊 Dashboards ultra-professionnels (vendeur + admin)
- 📱 Design responsive mobile-first
- 🎭 Animations et effets visuels premium

## 🛠️ Technologies

- React 18.3.1 + TypeScript
- Tailwind CSS v4
- Motion (animations)
- Recharts (graphiques)
- React Router DOM
- Vite (build tool)

## 📂 Structure rapide

```
annonceauto-ci/
├── src/
│   ├── app/
│   │   ├── App.tsx              ← Routes principales
│   │   ├── components/          ← Composants
│   │   └── pages/               ← Pages
│   └── styles/
│       └── theme.css            ← Couleurs et design
├── index.html                   ← Point d'entrée
├── package.json                 ← Dépendances
└── Documentation (*.md)
```

## 🎨 Design System

**Couleurs principales :**
- Bleu foncé : `#0F172A` (titres, headers)
- Jaune/Or : `#FACC15` (boutons CTA, accents)
- Gris clair : `#F3F4F6` (fonds)

**Polices Google Fonts :**
- Inter (corps de texte)
- Poppins (titres)
- Sora (accents)

## 🛣️ Pages principales

- `/` - Page d'accueil
- `/annonces` - Liste des annonces
- `/annonces/:id` - Détail d'une annonce
- `/publier` - Publier une annonce
- `/connexion` - Se connecter
- `/dashboard/vendeur` - Dashboard vendeur
- `/dashboard/admin` - Dashboard admin
- `/merci` - Page de remerciement après recharge

## 🚀 Commandes essentielles

```bash
# Installer
pnpm install

# Développement
pnpm run dev                    # Lance sur http://localhost:5173

# Build
pnpm run build                  # Compile pour production

# Preview
pnpm run preview                # Teste le build

# Vérification
node check-setup.js             # Vérifie l'installation
```

## ✅ Checklist rapide

- [ ] Node.js >= 18 installé
- [ ] pnpm installé (`npm install -g pnpm`)
- [ ] Dépendances installées (`pnpm install`)
- [ ] Serveur lancé (`pnpm run dev`)
- [ ] Site accessible (http://localhost:5173)

## 🐛 Problème ?

### Erreur d'installation
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Port déjà utilisé
```bash
pnpm run dev -- --port 3000
```

### Page blanche
1. Ouvrir console (F12)
2. Lire l'erreur
3. Consulter [INSTALLATION_LOCALE.md](./INSTALLATION_LOCALE.md)

## 📖 Parcours recommandé

### Pour tester rapidement (5 min)
1. [DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md)
2. Lancer `pnpm install` puis `pnpm run dev`
3. Explorer le site

### Pour développer (1 jour)
1. [INSTALLATION_LOCALE.md](./INSTALLATION_LOCALE.md)
2. [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
3. [ARCHITECTURE.md](./ARCHITECTURE.md) ⭐⭐⭐⭐⭐
4. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

### Pour comprendre en profondeur (2-3 jours)
1. Lire toute la documentation
2. Explorer tous les fichiers du code source
3. Tester toutes les fonctionnalités
4. Faire les exercices du DEVELOPER_GUIDE

## 🎯 Prochaines étapes

1. ✅ **Installer** : Suivre [DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md)
2. ✅ **Explorer** : Tester toutes les pages
3. ✅ **Comprendre** : Lire [ARCHITECTURE.md](./ARCHITECTURE.md)
4. ✅ **Développer** : Créer votre première page
5. ✅ **Contribuer** : Ajouter des fonctionnalités

## 💡 Conseils

- **Utilisez VS Code** avec les extensions React et Tailwind
- **Gardez la console ouverte** (F12) pour voir les erreurs
- **Testez en responsive** dès le début
- **Suivez les conventions** du projet (voir ARCHITECTURE.md)
- **Réutilisez les composants** existants
- **Consultez QUICK_REFERENCE.md** pour copier-coller des patterns

## 🆘 Besoin d'aide ?

1. **Installation** : [INSTALLATION_LOCALE.md](./INSTALLATION_LOCALE.md)
2. **Développement** : [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
3. **Architecture** : [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Référence** : [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
5. **Fichiers** : [PROJECT_INDEX.md](./PROJECT_INDEX.md)

## 🎉 Prêt à commencer ?

### Installation en 3 commandes :

```bash
npm install -g pnpm    # 1. Installer pnpm
pnpm install           # 2. Installer dépendances
pnpm run dev           # 3. Lancer le serveur
```

### Puis ouvrir :

**http://localhost:5173**

---

**Bon développement ! 🚗💨**

*Pour toute question, consultez la documentation appropriée ci-dessus.*

---

**Version** : 1.0.0  
**Date** : Décembre 2024  
**Projet** : AnnonceAuto.ci