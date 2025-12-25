# 📸 Guide Visuel d'Installation - AnnonceAuto.ci

Guide pas-à-pas avec des exemples visuels de ce que vous devriez voir.

---

## 🎯 Objectif

Installer et lancer AnnonceAuto.ci sur votre ordinateur en 10 minutes.

---

## ✅ Étape 1 : Vérifier Node.js

### Commande à exécuter :
```bash
node --version
```

### ✅ Ce que vous devriez voir :
```
v18.17.0
```
ou
```
v20.10.0
```

### ❌ Si vous voyez une erreur :
```
'node' n'est pas reconnu en tant que commande interne
```

**➡️ Solution :** Installer Node.js depuis https://nodejs.org/

---

## ✅ Étape 2 : Installer pnpm

### Commande à exécuter :
```bash
npm install -g pnpm
```

### ✅ Ce que vous devriez voir :
```
added 1 package in 2s

1 package is looking for funding
  run `npm fund` for details
```

### Vérification :
```bash
pnpm --version
```

### ✅ Résultat attendu :
```
8.15.0
```

---

## ✅ Étape 3 : Se placer dans le dossier du projet

### Commande à exécuter :
```bash
cd chemin/vers/annonceauto-ci
```

**Exemple Windows :**
```bash
cd C:\Users\VotreNom\Documents\annonceauto-ci
```

**Exemple Mac/Linux :**
```bash
cd ~/Documents/annonceauto-ci
```

### Vérifier que vous êtes au bon endroit :
```bash
ls
```

### ✅ Vous devriez voir :
```
package.json
index.html
vite.config.ts
src/
README.md
...
```

---

## ✅ Étape 4 : Installer les dépendances

### Commande à exécuter :
```bash
pnpm install
```

### ✅ Ce que vous devriez voir :

```
Packages: +1024
++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 1024, reused 1024, downloaded 0, added 1024, done

dependencies:
+ @emotion/react 11.14.0
+ @emotion/styled 11.14.1
+ @mui/material 7.3.5
+ react 18.3.1
+ react-dom 18.3.1
+ react-router-dom 7.11.0
+ ... (et beaucoup d'autres)

Done in 45s
```

### 💡 Notes :
- L'installation prend **2-5 minutes**
- Télécharge environ **500 Mo** de packages
- Crée un dossier `node_modules/`
- Des warnings "WARN deprecated" sont **normaux**

### ❌ Erreurs possibles :

**Erreur 1 : "EACCES: permission denied"**
```
Solution : Utiliser sudo (Linux/Mac)
sudo pnpm install
```

**Erreur 2 : "Network error"**
```
Solution : Vérifier votre connexion internet
```

---

## ✅ Étape 5 : Vérifier l'installation

### Commande à exécuter :
```bash
node check-setup.js
```

### ✅ Ce que vous devriez voir :

```
🔍 Vérification de l'installation AnnonceAuto.ci

1️⃣  Vérification des prérequis système

✅ Node.js v18.17.0 installé
✅ pnpm 8.15.0 installé

2️⃣  Vérification de la structure du projet

✅ Dossier src présent
✅ Dossier src/app présent
✅ Dossier src/app/components présent
✅ Dossier src/app/pages présent
✅ Dossier src/styles présent

3️⃣  Vérification des fichiers essentiels

✅ Fichier package.json présent
✅ Fichier vite.config.ts présent
✅ Fichier index.html présent
✅ Fichier src/main.tsx présent
✅ Fichier src/app/App.tsx présent

4️⃣  Vérification des dépendances

✅ Dossier node_modules présent
✅ Dépendance react installée
✅ Dépendance react-dom installée
✅ Dépendance vite installée
✅ Dépendance tailwindcss installée

==================================================
📊 RÉSUMÉ

✨ Installation parfaite ! Tout est OK.

🚀 Prochaines étapes :
   1. Lancer le serveur : pnpm run dev
   2. Ouvrir : http://localhost:5173
   3. Lire : ARCHITECTURE.md

==================================================
```

---

## ✅ Étape 6 : Lancer le serveur

### Commande à exécuter :
```bash
pnpm run dev
```

### ✅ Ce que vous devriez voir :

```
  VITE v6.3.5  ready in 423 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 💡 Le serveur est maintenant lancé !

**Ce que cela signifie :**
- ✅ Le site est accessible localement
- ✅ Le hot-reload est activé (changements en temps réel)
- ✅ Le serveur écoute sur le port 5173

**Pour arrêter le serveur :**
- Appuyer sur `Ctrl + C` dans le terminal

---

## ✅ Étape 7 : Ouvrir dans le navigateur

### Action à faire :
1. Ouvrir votre navigateur (Chrome, Firefox, Safari, Edge)
2. Aller à l'adresse : **http://localhost:5173**

### ✅ Ce que vous devriez voir :

```
┌─────────────────────────────────────────────────┐
│  AnnonceAuto.ci                    [Se connecter]│
├─────────────────────────────────────────────────┤
│                                                  │
│     Trouvez votre voiture idéale                │
│     en Côte d'Ivoire                            │
│                                                  │
│     [Barre de recherche avancée]                │
│                                                  │
│     ┌────────┐ ┌────────┐ ┌────────┐           │
│     │Véhicule│ │Véhicule│ │Véhicule│           │
│     │  Card  │ │  Card  │ │  Card  │           │
│     └────────┘ └────────┘ └────────┘           │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Éléments visibles :**
- ✅ Header avec logo "AnnonceAuto.ci"
- ✅ Navigation (Accueil, Annonces, Publier)
- ✅ Hero section avec titre principal
- ✅ Barre de recherche avec filtres
- ✅ Grille de véhicules
- ✅ Footer en bas de page
- ✅ Design moderne avec couleurs bleu foncé et jaune

---

## ✅ Étape 8 : Tester la navigation

### Actions à faire :

#### Test 1 : Page d'accueil
**URL :** http://localhost:5173/
**✅ Vérifier :**
- Header visible
- Hero avec titre "Trouvez votre voiture idéale"
- Barre de recherche
- Véhicules affichés

#### Test 2 : Liste des annonces
**Action :** Cliquer sur "Annonces" dans le menu
**URL :** http://localhost:5173/annonces
**✅ Vérifier :**
- Filtres sur le côté
- Grille de véhicules
- Possibilité de trier

#### Test 3 : Détail d'une annonce
**Action :** Cliquer sur une carte de véhicule
**URL :** http://localhost:5173/annonces/1
**✅ Vérifier :**
- Galerie de photos
- Prix et informations
- Boutons de contact
- Annonces similaires

#### Test 4 : Page de connexion
**Action :** Cliquer sur "Se connecter"
**URL :** http://localhost:5173/connexion
**✅ Vérifier :**
- Formulaire de connexion
- Design moderne avec glass morphism
- Boutons Vendeur et Admin

#### Test 5 : Dashboard vendeur
**Action :** Cliquer sur "Vendeur" sur la page de connexion
**URL :** http://localhost:5173/dashboard/vendeur
**✅ Vérifier :**
- Sidebar avec menu
- KPIs (cartes de statistiques)
- Graphiques
- Solde de crédits

#### Test 6 : Dashboard admin
**URL :** http://localhost:5173/dashboard/admin
**✅ Vérifier :**
- Menu différent du vendeur
- Analytics
- Modération
- Gestion utilisateurs

---

## ✅ Étape 9 : Tester en mode responsive

### Actions à faire :

1. **Ouvrir les outils développeur**
   - Windows/Linux : `F12` ou `Ctrl + Shift + I`
   - Mac : `Cmd + Option + I`

2. **Activer le mode responsive**
   - Cliquer sur l'icône mobile/tablette
   - Ou appuyer sur `Ctrl + Shift + M` (Windows/Linux)
   - Ou `Cmd + Shift + M` (Mac)

3. **Tester différentes tailles**
   - 📱 iPhone (375px)
   - 📱 iPad (768px)
   - 💻 Desktop (1920px)

### ✅ Ce que vous devriez voir :

**Mode mobile (375px) :**
- Menu hamburger en haut
- Navigation bottom bar
- Cards en colonne unique
- Filtres en accordéon

**Mode tablette (768px) :**
- 2 colonnes de cards
- Sidebar réduite (dashboard)
- Navigation adaptée

**Mode desktop (1920px) :**
- 3-4 colonnes de cards
- Sidebar complète (dashboard)
- Tous les éléments visibles

---

## ✅ Étape 10 : Vérifier la console

### Action à faire :
1. Ouvrir la console (F12 → onglet "Console")

### ✅ Ce que vous NE devriez PAS voir :
- ❌ Erreurs rouges
- ❌ "Failed to fetch"
- ❌ "Module not found"

### ⚠️ Ce qui est normal :
- Warnings jaunes sur le développement
- Logs de React DevTools

### ✅ Console propre :
```
[vite] connected.
[vite] hot updated: /src/app/App.tsx
```

---

## 🎉 Félicitations !

Si vous avez pu suivre toutes les étapes avec succès, votre installation est complète !

### ✅ Récapitulatif

Vous devriez maintenant avoir :
- ✅ Node.js et pnpm installés
- ✅ Toutes les dépendances téléchargées
- ✅ Serveur Vite lancé sur http://localhost:5173
- ✅ Site accessible dans le navigateur
- ✅ Toutes les pages fonctionnelles
- ✅ Design responsive
- ✅ Aucune erreur dans la console

---

## 🚀 Prochaines étapes

1. **Lire la documentation**
   - [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) pour commencer
   - [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre en profondeur

2. **Explorer le code**
   - Ouvrir le projet dans VS Code
   - Explorer `/src/app/pages/` pour voir les pages
   - Regarder `/src/app/components/` pour les composants

3. **Faire les exercices**
   - Créer une nouvelle page
   - Ajouter un composant
   - Modifier les couleurs

4. **Tester toutes les fonctionnalités**
   - Dashboard vendeur complet
   - Dashboard admin complet
   - Recharge Mobile Money
   - Boost d'annonces
   - Analytics avec filtres

---

## 🐛 Que faire si ça ne marche pas ?

### Scénario 1 : Page blanche

**Symptômes :**
- Le site charge mais affiche une page blanche
- Rien ne s'affiche

**Solution :**
1. Ouvrir la console (F12)
2. Lire l'erreur affichée
3. Vérifier que tous les fichiers sont présents :
   ```bash
   node check-setup.js
   ```

### Scénario 2 : Erreurs dans la console

**Symptômes :**
- Des erreurs rouges apparaissent dans la console
- "Module not found" ou "Cannot resolve"

**Solution :**
```bash
# Réinstaller les dépendances
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Scénario 3 : Styles ne s'appliquent pas

**Symptômes :**
- Le site affiche mais sans styles
- Texte noir sur fond blanc basique

**Solution :**
1. Vérifier que `/src/styles/index.css` existe
2. Vérifier qu'il est importé dans `/src/main.tsx`
3. Redémarrer le serveur

### Scénario 4 : Port déjà utilisé

**Symptômes :**
```
Port 5173 is already in use
```

**Solution :**
```bash
pnpm run dev -- --port 3000
```
Puis ouvrir http://localhost:3000

---

## 📸 Captures d'écran attendues

### Page d'accueil
- Hero avec fond dégradé bleu foncé
- Barre de recherche jaune
- Cartes de véhicules avec ombres

### Dashboard vendeur
- Sidebar bleue foncée à gauche
- 4 KPI cards colorées en haut
- Graphiques Recharts
- Bouton jaune "Recharger"

### Dashboard admin
- Même layout que vendeur
- KPIs différents (utilisateurs, revenus)
- Page Analytics avec filtres de dates
- Graphiques avancés

### Mode responsive mobile
- Navigation bottom bar
- Cards pleine largeur
- Menu hamburger
- Design adapté

---

## 💡 Conseils supplémentaires

### 1. Utiliser VS Code

**Télécharger :** https://code.microsoft.com/

**Ouvrir le projet :**
```bash
code .
```

**Extensions recommandées :**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier
- ESLint

### 2. Activer le hot-reload

Le hot-reload est automatiquement activé avec Vite.

**Test :**
1. Ouvrir `/src/app/pages/HomePage.tsx`
2. Modifier un texte
3. Sauvegarder (Ctrl+S)
4. Le navigateur se met à jour automatiquement !

### 3. Voir les changements en temps réel

```bash
# Terminal 1 : Serveur Vite
pnpm run dev

# Terminal 2 : Ouvrir VS Code
code .
```

---

## ✅ Checklist finale

- [ ] Node.js >= 18 installé et vérifié
- [ ] pnpm installé et vérifié
- [ ] Projet téléchargé/cloné
- [ ] `pnpm install` exécuté sans erreur
- [ ] `node check-setup.js` = tout OK
- [ ] `pnpm run dev` lance sans erreur
- [ ] http://localhost:5173 affiche le site
- [ ] Page d'accueil visible avec styles
- [ ] Navigation fonctionne
- [ ] Dashboard vendeur accessible
- [ ] Dashboard admin accessible
- [ ] Console sans erreurs
- [ ] Mode responsive OK
- [ ] Hot-reload fonctionne

**Si tous les points sont cochés : 🎉 INSTALLATION RÉUSSIE !**

---

## 📚 Ressources

- [DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md) - Version courte
- [INSTALLATION_LOCALE.md](./INSTALLATION_LOCALE.md) - Version détaillée
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Guide développeur
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentation complète
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Référence rapide

---

**Bon développement ! 🚗💨**

*Ce guide sera mis à jour régulièrement.*
