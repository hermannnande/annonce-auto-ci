# 🚀 Guide d'Installation Locale - AnnonceAuto.ci

Guide complet pour télécharger et tester le site en local sur votre machine.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :

### 1. Node.js (version 18 ou supérieure)

**Vérifier si Node.js est installé :**
```bash
node --version
```

**Si non installé, télécharger depuis :**
- Site officiel : https://nodejs.org/
- Recommandé : Version LTS (Long Term Support)

### 2. pnpm (gestionnaire de packages)

Le projet utilise **pnpm** au lieu de npm ou yarn.

**Installer pnpm :**
```bash
npm install -g pnpm
```

**Vérifier l'installation :**
```bash
pnpm --version
```

### 3. Git (optionnel mais recommandé)

Pour télécharger le projet si hébergé sur GitHub/GitLab.

```bash
git --version
```

**Si non installé :**
- Windows : https://git-scm.com/download/win
- Mac : `brew install git`
- Linux : `sudo apt install git`

## 📥 Étape 1 : Télécharger le projet

### Option A : Avec Git (recommandé)

```bash
# Cloner le repository
git clone [URL_DU_REPOSITORY]

# Entrer dans le dossier
cd annonceauto-ci
```

### Option B : Téléchargement ZIP

1. Télécharger le fichier ZIP du projet
2. Extraire le ZIP dans un dossier de votre choix
3. Ouvrir un terminal dans ce dossier

**Windows :**
- Clic droit dans le dossier → "Ouvrir dans le terminal"
- Ou utiliser PowerShell/CMD

**Mac :**
- Clic droit dans le dossier → "Services" → "Nouveau terminal au dossier"
- Ou glisser le dossier dans Terminal.app

**Linux :**
- Clic droit → "Ouvrir dans un terminal"

## 📦 Étape 2 : Installer les dépendances

Dans le terminal, à la racine du projet :

```bash
pnpm install
```

Cette commande va :
- Télécharger toutes les dépendances (React, Tailwind, Motion, etc.)
- Créer un dossier `node_modules` (environ 500 Mo)
- Créer un fichier `pnpm-lock.yaml`

⏱️ **Durée estimée :** 2-5 minutes (selon votre connexion internet)

**Si vous voyez des warnings "WARN deprecated", c'est normal, vous pouvez les ignorer.**

## 🚀 Étape 3 : Lancer le serveur de développement

Une fois l'installation terminée :

```bash
pnpm run dev
```

Vous devriez voir quelque chose comme :

```
VITE v6.3.5  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## 🌐 Étape 4 : Ouvrir dans le navigateur

1. Ouvrir votre navigateur (Chrome, Firefox, Safari, Edge)
2. Aller à l'adresse : **http://localhost:5173**
3. Le site devrait s'afficher !

## ✅ Vérification que tout fonctionne

### Test 1 : Page d'accueil
- ✅ La page d'accueil s'affiche
- ✅ Le header avec logo et navigation est visible
- ✅ La barre de recherche fonctionne
- ✅ Les véhicules s'affichent

### Test 2 : Navigation
- ✅ Cliquer sur "Annonces" → Liste des véhicules
- ✅ Cliquer sur une annonce → Page de détail
- ✅ Cliquer sur "Publier" → Formulaire

### Test 3 : Dashboards
1. Aller sur http://localhost:5173/connexion
2. Choisir "Vendeur" → Dashboard vendeur s'affiche
3. Naviguer dans les différents menus

### Test 4 : Responsive
- ✅ Réduire la fenêtre du navigateur
- ✅ Le design s'adapte au mobile
- ✅ Le menu mobile apparaît en bas

## 🛠️ Commandes utiles

```bash
# Lancer en développement (avec hot-reload)
pnpm run dev

# Arrêter le serveur
# Ctrl + C dans le terminal

# Build pour production
pnpm run build

# Prévisualiser le build de production
pnpm run preview

# Réinstaller les dépendances (si problème)
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📱 Tester sur mobile (même réseau Wi-Fi)

### 1. Trouver votre adresse IP locale

**Windows :**
```bash
ipconfig
```
Chercher "Adresse IPv4" (ex: 192.168.1.100)

**Mac/Linux :**
```bash
ifconfig
```
Chercher "inet" (ex: 192.168.1.100)

### 2. Lancer avec --host

```bash
pnpm run dev -- --host
```

### 3. Sur votre mobile

Ouvrir le navigateur et aller à :
```
http://[VOTRE_IP]:5173
```

Exemple : `http://192.168.1.100:5173`

## 🗂️ Structure du projet

Après installation, vous devriez avoir :

```
annonceauto-ci/
├── node_modules/           # Dépendances (ne pas modifier)
├── src/                    # Code source
│   ├── app/               # Application React
│   │   ├── components/    # Composants
│   │   ├── pages/         # Pages
│   │   └── App.tsx        # Point d'entrée App
│   ├── styles/            # Styles CSS
│   └── main.tsx           # Point d'entrée React
├── index.html             # HTML principal
├── package.json           # Configuration npm
├── vite.config.ts         # Configuration Vite
├── README.md              # Documentation
└── ARCHITECTURE.md        # Architecture détaillée
```

## 🎨 Personnalisation

### Changer les couleurs

Modifier `/src/styles/theme.css` :

```css
--primary-dark: #0F172A;     /* Bleu foncé */
--primary-yellow: #FACC15;   /* Jaune/Or */
--background-light: #F3F4F6; /* Gris clair */
```

### Ajouter une page

1. Créer `/src/app/pages/MaPage.tsx`
2. Ajouter la route dans `/src/app/App.tsx`

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour plus de détails.

## 🐛 Résolution de problèmes

### Problème 1 : "command not found: pnpm"

**Solution :**
```bash
npm install -g pnpm
```

### Problème 2 : "Port 5173 already in use"

**Solution A :** Arrêter l'autre processus qui utilise le port

**Solution B :** Utiliser un autre port
```bash
pnpm run dev -- --port 3000
```

### Problème 3 : Erreurs d'installation

**Solution :**
```bash
# Nettoyer le cache
pnpm store prune

# Réinstaller
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Problème 4 : "Module not found"

**Solution :**
```bash
# Vérifier que l'installation est complète
pnpm install

# Si le problème persiste, nettoyer et réinstaller
rm -rf node_modules
pnpm install
```

### Problème 5 : Page blanche

**Solutions :**
1. Ouvrir la console du navigateur (F12)
2. Regarder les erreurs affichées
3. Vérifier que le serveur Vite tourne
4. Rafraîchir la page (Ctrl+R ou Cmd+R)

### Problème 6 : "Cannot find module 'react'"

**Solution :**
```bash
pnpm add react react-dom
```

### Problème 7 : Styles ne s'appliquent pas

**Solution :**
1. Vérifier que `/src/styles/index.css` est importé dans `main.tsx`
2. Vider le cache du navigateur (Ctrl+Shift+Delete)
3. Redémarrer le serveur Vite

## 💡 Conseils

### 1. Utiliser un éditeur de code

**Recommandé : Visual Studio Code**
- Télécharger : https://code.microsoft.com/

**Extensions utiles :**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

### 2. Hot Module Replacement (HMR)

Vite active automatiquement le HMR :
- Modifier un fichier `.tsx` ou `.css`
- La page se met à jour automatiquement
- Pas besoin de rafraîchir manuellement

### 3. Console du navigateur

Toujours garder la console ouverte (F12) pour voir :
- Les erreurs JavaScript
- Les warnings
- Les logs de débogage

### 4. React DevTools

Installer l'extension React DevTools :
- Chrome : https://chrome.google.com/webstore
- Firefox : https://addons.mozilla.org/firefox

### 5. Mode développement vs Production

**Développement (pnpm run dev) :**
- Code non minifié
- Messages d'erreur détaillés
- Hot reload activé
- Plus lent mais meilleur pour déboguer

**Production (pnpm run build) :**
- Code optimisé et minifié
- Pas de messages de débogage
- Performances maximales
- Fichiers dans `/dist`

## 📊 Performance

### Taille du projet

- **Source code** : ~5 Mo
- **node_modules** : ~500 Mo
- **Build production** : ~2-3 Mo

### Temps de compilation

- **Premier démarrage** : 2-5 secondes
- **Hot reload** : <100ms
- **Build production** : 10-30 secondes

## 🔄 Mise à jour

Si le projet est mis à jour sur Git :

```bash
# Récupérer les dernières modifications
git pull

# Mettre à jour les dépendances
pnpm install

# Relancer le serveur
pnpm run dev
```

## 📚 Ressources supplémentaires

- [README.md](./README.md) - Vue d'ensemble du projet
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentation complète ⭐
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Guide développeur
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Référence rapide

## 🆘 Besoin d'aide ?

### Documentation officielle

- **Vite** : https://vitejs.dev/
- **React** : https://react.dev/
- **Tailwind CSS** : https://tailwindcss.com/
- **pnpm** : https://pnpm.io/

### Communauté

- Stack Overflow : https://stackoverflow.com/
- React Discord : https://discord.gg/react
- Reddit : r/reactjs

## ✅ Checklist d'installation

- [ ] Node.js installé (version 18+)
- [ ] pnpm installé
- [ ] Projet téléchargé
- [ ] `pnpm install` exécuté sans erreur
- [ ] `pnpm run dev` lance le serveur
- [ ] http://localhost:5173 affiche le site
- [ ] Navigation fonctionne
- [ ] Dashboards accessibles
- [ ] Responsive vérifié

## 🎉 Félicitations !

Vous avez installé AnnonceAuto.ci en local !

**Prochaines étapes :**
1. Explorer toutes les pages
2. Lire [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Tester les fonctionnalités
4. Commencer à développer

**Bon développement ! 🚀**

---

**Dernière mise à jour :** Décembre 2024
