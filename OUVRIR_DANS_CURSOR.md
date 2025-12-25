# 🎯 Ouvrir AnnonceAuto.ci dans Cursor AI

Guide ultra-simple en 5 étapes pour ouvrir et utiliser le projet dans Cursor.

---

## ⚡ 5 Étapes pour commencer

### 1️⃣ Télécharger Cursor AI

**Site officiel :** https://cursor.sh/

- Télécharger pour votre système (Windows/Mac/Linux)
- Installer comme une application normale
- Lancer Cursor

### 2️⃣ Télécharger le projet AnnonceAuto.ci

**Depuis Figma Make :**
- Cliquer sur "Export" ou "Download"
- Télécharger tous les fichiers du projet
- Extraire dans un dossier (ex: `Documents/annonceauto-ci`)

### 3️⃣ Ouvrir le projet dans Cursor

**Option A : Via Cursor**
1. Ouvrir Cursor
2. File → Open Folder
3. Sélectionner le dossier `annonceauto-ci`
4. Cliquer "Open"

**Option B : Via Terminal**
```bash
cd /chemin/vers/annonceauto-ci
cursor .
```

**Exemple Windows :**
```bash
cd C:\Users\VotreNom\Documents\annonceauto-ci
cursor .
```

**Exemple Mac/Linux :**
```bash
cd ~/Documents/annonceauto-ci
cursor .
```

### 4️⃣ Attendre l'indexation

Une fois le projet ouvert :
- Cursor va indexer tous les fichiers (barre de progression en bas)
- Cela prend 30 secondes à 2 minutes
- **Attendez que ce soit terminé** avant de continuer

### 5️⃣ Initialiser Cursor avec le contexte

**Ouvrir le chat :**
- Mac : `Cmd + L`
- Windows/Linux : `Ctrl + L`

**Copier-coller ce prompt (IMPORTANT) :**

```
Je travaille sur AnnonceAuto.ci, une plateforme de vente de véhicules pour la Côte d'Ivoire.

CONTEXTE TECHNIQUE :
- React 18.3.1 + TypeScript
- Tailwind CSS v4 (PAS v3 !)
- Motion (ex-Framer Motion) pour animations
- React Router DOM 7.11.0
- Recharts pour graphiques
- Vite comme build tool

PALETTE DE COULEURS (STRICTE) :
- Bleu foncé : #0F172A (titres, headers, boutons secondaires)
- Jaune/Or : #FACC15 (boutons CTA, accents)
- Jaune secondaire : #FBBF24
- Gris clair : #F3F4F6 (fonds de section)

ARCHITECTURE :
- Routes : /src/app/App.tsx
- Pages : /src/app/pages/
- Composants : /src/app/components/
- Styles : /src/styles/theme.css

RÈGLES ABSOLUES :
1. NE JAMAIS utiliser text-*, font-*, leading-* (sauf demande explicite)
2. TOUJOURS respecter la palette de couleurs ci-dessus
3. TOUJOURS utiliser Motion pour les animations
4. TOUJOURS mobile-first (w-full puis sm:, md:, lg:)
5. TOUJOURS vérifier qu'une icône Lucide existe avant import
6. Utiliser les composants UI existants dans /src/app/components/ui/

Consulte @.cursorrules pour les détails complets.
Consulte @ARCHITECTURE.md pour comprendre le projet.

Es-tu prêt à m'aider sur ce projet en respectant ces règles ?
```

**Cursor va répondre qu'il est prêt !**

---

## ✅ Vérifier que tout fonctionne

### Test 1 : Cursor a lu les règles

Dans le chat, demandez :
```
Quelles sont les couleurs principales du projet ?
```

**Réponse attendue :**
- Bleu foncé : #0F172A
- Jaune/Or : #FACC15
- Gris : #F3F4F6

### Test 2 : Générer du code

```
Crée un composant Button test avec les couleurs du thème
```

Cursor devrait utiliser #0F172A et #FACC15 ✅

### Test 3 : Mentionner un fichier

```
@App.tsx Explique-moi ce fichier
```

Cursor devrait lire et expliquer le fichier de routes ✅

---

## 🚀 Installer les dépendances

**Ouvrir le terminal intégré dans Cursor :**
- Mac : `` Ctrl + ` ``
- Windows : `` Ctrl + ` ``
- Ou : View → Terminal

**Dans le terminal :**

```bash
# Installer pnpm (si pas déjà fait)
npm install -g pnpm

# Installer les dépendances du projet
pnpm install

# Lancer le serveur de développement
pnpm run dev
```

**Le serveur démarre sur :** http://localhost:5173

---

## 💬 Premiers prompts à essayer

### Créer une nouvelle page

```
Crée une page "À propos" accessible à /a-propos.

Structure :
- Hero avec titre "Qui sommes-nous ?"
- Section mission
- Section équipe (3 membres)
- CTA final

Design :
- Couleurs : #0F172A, #FACC15, #F3F4F6
- Animations Motion
- Mobile-first responsive
- Glass morphism pour les cartes

Crée /src/app/pages/AboutPage.tsx
```

### Améliorer une page existante

```
@HomePage.tsx 

Ajoute une section "Témoignages clients" après la grille de véhicules.

3 cartes témoignages avec :
- Photo (placeholder)
- Nom et note étoiles
- Texte témoignage
- Animation Motion au scroll

Respecte les couleurs du thème.
```

### Créer un composant

```
Crée un composant TestimonialCard pour afficher un témoignage client.

Props :
- name: string
- rating: number (1-5)
- text: string
- image?: string

Design :
- Background blanc
- Ombres shadow-lg
- Étoiles jaunes (#FACC15)
- Animation hover scale
- Responsive

Crée /src/app/components/TestimonialCard.tsx
```

### Ajouter un graphique

```
@VendorDashboard.tsx

Ajoute un graphique circulaire (PieChart) Recharts pour afficher :
- Répartition des types de véhicules
- Couleurs alternées #0F172A et #FACC15
- Légende en bas
- Animation d'entrée

Place-le après les KPI cards.
```

---

## 🎨 Structure du projet dans Cursor

Quand vous ouvrez le projet, vous verrez :

```
annonceauto-ci/
│
├── 📄 Fichiers de configuration
│   ├── .cursorrules          ← Règles du projet (LU PAR CURSOR)
│   ├── .cursorignore         ← Fichiers à ignorer
│   ├── package.json          ← Dépendances
│   ├── vite.config.ts        ← Config Vite
│   └── index.html            ← HTML principal
│
├── 📚 Documentation
│   ├── README_CURSOR.md      ← Guide Cursor rapide
│   ├── CURSOR_AI_GUIDE.md    ← Guide complet
│   ├── CURSOR_PROMPTS.md     ← 50+ prompts
│   ├── ARCHITECTURE.md       ← Architecture projet
│   └── ...
│
└── 📁 Code source
    └── src/
        ├── main.tsx          ← Point d'entrée React
        ├── app/
        │   ├── App.tsx      ← Routes
        │   ├── components/  ← Composants
        │   └── pages/       ← Pages
        └── styles/          ← CSS
```

---

## 🔧 Raccourcis Cursor essentiels

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| **Ouvrir Chat** | `Ctrl + L` | `Cmd + L` |
| **Nouveau Chat** | `Ctrl + Shift + L` | `Cmd + Shift + L` |
| **Édition Inline** | `Ctrl + K` | `Cmd + K` |
| **Composer** | `Ctrl + I` | `Cmd + I` |
| **Terminal** | `` Ctrl + ` `` | `` Ctrl + ` `` |
| **Recherche** | `Ctrl + P` | `Cmd + P` |
| **Tout sauvegarder** | `Ctrl + K S` | `Cmd + K S` |

---

## 📖 Documentation à avoir ouverte

**Dans Cursor, gardez ces fichiers accessibles :**

1. **`.cursorrules`** - Règles du projet
2. **`ARCHITECTURE.md`** - Architecture complète
3. **`CURSOR_PROMPTS.md`** - Prompts prêts à l'emploi
4. **`QUICK_REFERENCE.md`** - Patterns de code

**Pour les ouvrir rapidement :**
- `Cmd/Ctrl + P` puis taper le nom du fichier

---

## ✅ Workflow recommandé

### 1. Ouvrir Cursor le matin

```bash
cd annonceauto-ci
cursor .
```

### 2. Lancer le serveur

Terminal intégré :
```bash
pnpm run dev
```

Navigateur : http://localhost:5173

### 3. Ouvrir le chat Cursor

`Cmd + L` ou `Ctrl + L`

### 4. Développer avec l'IA

**Exemple de session :**

**Vous :**
```
Je veux ajouter une page de profil vendeur.
Consulte @ARCHITECTURE.md pour les conventions.
```

**Cursor génère le plan**

**Vous :**
```
Crée /src/app/pages/dashboard/VendorProfile.tsx
avec les sections : photo, infos, statistiques, historique
```

**Cursor génère le code**

**Vous :**
```
@App.tsx Ajoute la route /dashboard/vendeur/profil
```

**Cursor modifie App.tsx**

**Vous testez dans le navigateur**

**Vous :**
```
@VendorProfile.tsx Ajoute des animations Motion au scroll
```

**Cursor améliore**

### 5. Sauvegarder et commit

```bash
git add .
git commit -m "feat: ajout page profil vendeur"
```

---

## 🐛 Problèmes courants

### Problème 1 : Cursor ne respecte pas les couleurs

**Symptôme :** Cursor utilise des couleurs aléatoires

**Solution :**
```
STOP. Consulte @.cursorrules et utilise UNIQUEMENT :
- #0F172A pour le bleu foncé
- #FACC15 pour le jaune
- #F3F4F6 pour le gris
```

### Problème 2 : Cursor utilise text-*, font-*

**Symptôme :** Cursor ajoute des classes de typographie

**Solution :**
```
STOP. Ne pas utiliser text-*, font-*, leading-*.
La typographie est gérée par /src/styles/theme.css
Lis la section Typographie dans @.cursorrules
```

### Problème 3 : Cursor oublie le contexte

**Symptôme :** Cursor ne suit plus les règles

**Solution :**
1. Ouvrir un nouveau chat (`Cmd/Ctrl + Shift + L`)
2. Renvoyer le prompt d'initialisation
3. Mentionner explicitement `@.cursorrules`

### Problème 4 : "Module not found"

**Symptôme :** Erreur d'import dans le terminal

**Solution :**
```bash
# Réinstaller les dépendances
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Problème 5 : Icône Lucide introuvable

**Symptôme :** "Icon is not exported"

**Solution :**
```
Avant d'importer une icône Lucide, vérifie qu'elle existe.
Consulte la doc Lucide : https://lucide.dev/icons/
Utilise un nom générique si tu n'es pas sûr.
```

---

## 💡 Tips pour être ultra-productif

### 1. Utiliser le Composer (Cmd/Ctrl + I)

Pour générer plusieurs fichiers d'un coup :

```
Crée une fonctionnalité complète "Favoris" :

Fichiers à créer :
1. /src/app/components/FavoriteButton.tsx
2. /src/app/pages/FavoritesPage.tsx
3. /src/app/utils/favorites.ts

Ajoute aussi la route dans App.tsx

Design : respect du thème, animations Motion, responsive
```

### 2. Édition inline (Cmd/Ctrl + K)

1. Sélectionner du code
2. `Cmd/Ctrl + K`
3. Taper : "Ajoute des animations Motion hover"
4. Cursor modifie directement

### 3. Mentionner plusieurs fichiers

```
@HomePage.tsx @theme.css @VehicleCard.tsx

Harmonise les couleurs de ces fichiers.
Tout doit utiliser la palette du thème.
```

### 4. Demander des explications

```
@App.tsx Explique-moi comment le routing fonctionne
```

```
Pourquoi utilise-t-on DashboardLayout ici ?
```

### 5. Générer des tests

```
Crée des tests Jest pour @VehicleCard.tsx
Teste le rendu, les props, les interactions
```

---

## 📊 Résumé visuel

```
VOUS
  ↓
  Télécharger projet depuis Figma Make
  ↓
  Extraire dans un dossier
  ↓
  Ouvrir Cursor AI
  ↓
  File → Open Folder → annonceauto-ci
  ↓
  Attendre indexation (30s-2min)
  ↓
  Cmd/Ctrl + L (ouvrir chat)
  ↓
  Coller prompt d'initialisation
  ↓
  Cursor répond "Je suis prêt !"
  ↓
  Terminal : pnpm install
  ↓
  Terminal : pnpm run dev
  ↓
  Navigateur : http://localhost:5173
  ↓
  DÉVELOPPER AVEC L'IA ! 🚀
```

---

## 🎯 Checklist finale

### Avant de commencer
- [ ] Cursor AI installé
- [ ] Projet téléchargé et extrait
- [ ] Projet ouvert dans Cursor
- [ ] Indexation terminée

### Configuration
- [ ] Chat ouvert (`Cmd/Ctrl + L`)
- [ ] Prompt d'initialisation envoyé
- [ ] Cursor a confirmé qu'il est prêt
- [ ] `.cursorrules` mentionné par Cursor

### Installation technique
- [ ] Terminal ouvert (`` Ctrl + ` ``)
- [ ] `pnpm install` exécuté
- [ ] `pnpm run dev` lancé
- [ ] http://localhost:5173 accessible

### Test
- [ ] Premier prompt envoyé
- [ ] Code généré correctement
- [ ] Couleurs respectées
- [ ] Pas d'erreurs

### Documentation
- [ ] `README_CURSOR.md` lu
- [ ] `CURSOR_PROMPTS.md` exploré
- [ ] `ARCHITECTURE.md` parcouru

---

## 🎉 Vous êtes prêt !

Vous avez maintenant :
- ✅ Le projet ouvert dans Cursor
- ✅ Cursor qui connaît toutes les règles
- ✅ Le serveur qui tourne
- ✅ Les prompts prêts à utiliser

**Commencez à développer avec l'IA ! 🚀**

### Prochaines étapes :

1. Lire `CURSOR_PROMPTS.md` pour trouver des prompts utiles
2. Essayer de créer une nouvelle page
3. Améliorer un composant existant
4. Explorer toutes les fonctionnalités de Cursor

---

## 🆘 Besoin d'aide ?

### Documentation
- `README_CURSOR.md` - Démarrage rapide
- `CURSOR_AI_GUIDE.md` - Guide complet
- `CURSOR_PROMPTS.md` - 50+ exemples
- `ARCHITECTURE.md` - Architecture projet

### Problème avec Cursor ?
- Redémarrer Cursor
- Nouveau chat + prompt d'init
- Vérifier que `.cursorrules` existe

### Problème avec le code ?
- Console navigateur (F12)
- Terminal Cursor pour les erreurs
- Demander à Cursor de déboguer

---

**Bon développement avec Cursor AI ! 🤖💻**

*Le projet est configuré pour que Cursor respecte automatiquement toutes les règles.*

---

**Version** : 1.0.0  
**Date** : Décembre 2024  
**Projet** : AnnonceAuto.ci
