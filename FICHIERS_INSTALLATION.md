# 📦 Fichiers d'Installation - AnnonceAuto.ci

Liste de tous les fichiers nécessaires pour faire fonctionner le site en local.

## ✅ Fichiers créés pour l'installation locale

### 🎯 Fichiers essentiels

| Fichier | Description | Obligatoire |
|---------|-------------|-------------|
| `index.html` | Point d'entrée HTML | ✅ Oui |
| `src/main.tsx` | Point d'entrée React | ✅ Oui |
| `vite.config.ts` | Configuration Vite | ✅ Oui |
| `package.json` | Dépendances et scripts | ✅ Oui |
| `.gitignore` | Fichiers à ignorer par Git | ⚠️ Recommandé |

### 📚 Guides d'installation

| Fichier | Description | Pour qui ? |
|---------|-------------|------------|
| `INSTALLATION_LOCALE.md` | Guide complet d'installation (15 min) | Débutants |
| `DEMARRAGE_RAPIDE.md` | Guide ultra-rapide (2 min) | Expérimentés |
| `check-setup.js` | Script de vérification | Tous |

### 📖 Documentation du projet

| Fichier | Description | Priorité |
|---------|-------------|----------|
| `README.md` | Vue d'ensemble du projet | ⭐⭐⭐ |
| `ARCHITECTURE.md` | Documentation complète | ⭐⭐⭐⭐⭐ |
| `DEVELOPER_GUIDE.md` | Guide développeur | ⭐⭐⭐⭐ |
| `QUICK_REFERENCE.md` | Référence rapide | ⭐⭐⭐⭐ |
| `PROJECT_INDEX.md` | Index des fichiers | ⭐⭐⭐ |

## 📂 Structure complète après installation

```
annonceauto-ci/
│
├── 📄 Fichiers de configuration
│   ├── index.html                    ← HTML principal
│   ├── package.json                  ← Scripts et dépendances
│   ├── pnpm-lock.yaml               ← Lock file (généré)
│   ├── vite.config.ts               ← Config Vite
│   ├── postcss.config.mjs           ← Config PostCSS
│   ├── tsconfig.json                ← Config TypeScript
│   └── .gitignore                   ← Ignorer node_modules, etc.
│
├── 📚 Documentation
│   ├── README.md                    ← Vue d'ensemble
│   ├── ARCHITECTURE.md              ← Doc complète ⭐⭐⭐⭐⭐
│   ├── DEVELOPER_GUIDE.md           ← Guide démarrage
│   ├── QUICK_REFERENCE.md           ← Référence rapide
│   ├── PROJECT_INDEX.md             ← Index fichiers
│   ├── INSTALLATION_LOCALE.md       ← Guide installation
│   ├── DEMARRAGE_RAPIDE.md          ← Quick start
│   └── FICHIERS_INSTALLATION.md     ← Ce fichier
│
├── 🔧 Utilitaires
│   └── check-setup.js               ← Script vérification
│
├── 📦 Dépendances (généré)
│   └── node_modules/                ← ~500 Mo (ne pas commit)
│
└── 📁 Code source
    └── src/
        ├── main.tsx                 ← Point d'entrée React
        ├── app/
        │   ├── App.tsx             ← Composant principal + Routes
        │   ├── components/         ← Composants réutilisables
        │   │   ├── ui/            ← Composants UI (shadcn)
        │   │   ├── dashboard/     ← Composants dashboard
        │   │   └── ...
        │   └── pages/             ← Pages de l'application
        │       ├── HomePage.tsx
        │       ├── dashboard/     ← Pages dashboards
        │       └── ...
        └── styles/
            ├── index.css          ← Import principal
            ├── theme.css          ← Variables et thème
            ├── fonts.css          ← Google Fonts
            └── tailwind.css       ← Tailwind
```

## 🚀 Processus d'installation complet

### Étape 1 : Obtenir les fichiers

**Option A : Git Clone**
```bash
git clone [url]
cd annonceauto-ci
```

**Option B : Télécharger ZIP**
- Télécharger et extraire
- Ouvrir terminal dans le dossier

### Étape 2 : Vérifier les prérequis

```bash
# Vérifier Node.js (doit être >= 18)
node --version

# Installer pnpm
npm install -g pnpm
```

### Étape 3 : Vérifier les fichiers essentiels

Exécuter le script de vérification :
```bash
node check-setup.js
```

### Étape 4 : Installer les dépendances

```bash
pnpm install
```

Cela crée :
- `node_modules/` (~500 Mo)
- `pnpm-lock.yaml` (fichier de verrouillage)

### Étape 5 : Lancer le serveur

```bash
pnpm run dev
```

### Étape 6 : Ouvrir dans le navigateur

http://localhost:5173

## ✅ Checklist de vérification

### Fichiers présents

- [ ] `index.html` existe
- [ ] `src/main.tsx` existe
- [ ] `src/app/App.tsx` existe
- [ ] `vite.config.ts` existe
- [ ] `package.json` existe

### Prérequis installés

- [ ] Node.js >= 18 installé
- [ ] pnpm installé
- [ ] Git installé (optionnel)

### Dépendances installées

- [ ] `pnpm install` exécuté
- [ ] `node_modules/` créé
- [ ] Pas d'erreurs d'installation

### Serveur fonctionne

- [ ] `pnpm run dev` démarre sans erreur
- [ ] http://localhost:5173 accessible
- [ ] Page d'accueil s'affiche
- [ ] Navigation fonctionne

### Documentation lue

- [ ] `DEMARRAGE_RAPIDE.md` lu
- [ ] `INSTALLATION_LOCALE.md` consulté
- [ ] `ARCHITECTURE.md` parcouru

## 🐛 Fichiers manquants ?

### Si `index.html` manque :

Créer à la racine :
```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AnnonceAuto.ci</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Si `src/main.tsx` manque :

Créer dans `/src/` :
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### Si `vite.config.ts` manque :

Créer à la racine :
```ts
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Si `.gitignore` manque :

Créer à la racine :
```
node_modules/
dist/
*.local
.env
.DS_Store
```

## 📝 Scripts package.json

Vérifier que `package.json` contient :

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 🔍 Commandes de vérification

```bash
# Vérifier Node.js
node --version

# Vérifier pnpm
pnpm --version

# Vérifier que les fichiers existent
ls -la index.html
ls -la src/main.tsx
ls -la vite.config.ts

# Vérifier la structure
tree -L 2 src/

# Lister les dépendances installées
pnpm list --depth=0

# Vérifier la configuration complète
node check-setup.js
```

## 💾 Taille des fichiers

| Élément | Taille approximative |
|---------|---------------------|
| Code source (src/) | ~5 Mo |
| Documentation (*.md) | ~1 Mo |
| node_modules/ | ~500 Mo |
| Build production (dist/) | ~2-3 Mo |
| **Total projet** | ~506 Mo |

## 🚨 Erreurs courantes

### 1. "Cannot find module 'vite'"

**Cause :** Dépendances non installées  
**Solution :**
```bash
pnpm install
```

### 2. "Failed to resolve entry for package"

**Cause :** Fichier `main.tsx` ou `App.tsx` manquant  
**Solution :** Vérifier que les fichiers existent

### 3. "Port 5173 already in use"

**Cause :** Port déjà utilisé  
**Solution :**
```bash
pnpm run dev -- --port 3000
```

### 4. Page blanche

**Cause :** Erreur JavaScript  
**Solution :**
1. Ouvrir console (F12)
2. Lire l'erreur
3. Vérifier les imports

## 📦 Export du projet

Pour partager le projet sans node_modules :

```bash
# Créer une archive (sans node_modules)
zip -r annonceauto-ci.zip . -x "node_modules/*" -x "dist/*" -x "*.log"

# Ou avec tar
tar -czf annonceauto-ci.tar.gz --exclude=node_modules --exclude=dist .
```

La personne qui reçoit doit :
1. Extraire l'archive
2. Exécuter `pnpm install`
3. Exécuter `pnpm run dev`

## 🌐 Déploiement

Pour déployer en production :

```bash
# Build
pnpm run build

# Le dossier dist/ contient les fichiers à déployer
```

Voir les plateformes de déploiement :
- **Vercel** : https://vercel.com/
- **Netlify** : https://netlify.com/
- **GitHub Pages** : https://pages.github.com/

## 🆘 Besoin d'aide ?

1. **Lire la doc** : [INSTALLATION_LOCALE.md](./INSTALLATION_LOCALE.md)
2. **Vérifier l'installation** : `node check-setup.js`
3. **Consulter** : [ARCHITECTURE.md](./ARCHITECTURE.md)

## ✅ Installation réussie ?

Vous devriez pouvoir :

- ✅ Lancer `pnpm run dev` sans erreur
- ✅ Ouvrir http://localhost:5173
- ✅ Naviguer sur toutes les pages
- ✅ Voir les styles s'appliquer
- ✅ Tester en mode responsive
- ✅ Accéder aux dashboards

**Si tout fonctionne, félicitations ! 🎉**

Prochaine étape : Lire [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

---

**Dernière mise à jour :** Décembre 2024
