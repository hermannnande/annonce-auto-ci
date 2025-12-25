# 🤖 Guide Cursor AI - AnnonceAuto.ci

Guide complet pour utiliser Cursor AI sur le projet AnnonceAuto.ci et continuer le développement efficacement.

---

## 📥 Étape 1 : Installer Cursor AI

### Télécharger Cursor

**Site officiel :** https://cursor.sh/

**Plateformes supportées :**
- Windows
- macOS
- Linux

### Installer

1. Télécharger l'installateur pour votre OS
2. Installer Cursor (comme VS Code)
3. Lancer Cursor

---

## 📂 Étape 2 : Ouvrir le projet dans Cursor

### Méthode 1 : Via l'interface

1. Lancer Cursor
2. File → Open Folder
3. Sélectionner le dossier `annonceauto-ci`
4. Cliquer "Open"

### Méthode 2 : Via le terminal

```bash
cd annonceauto-ci
cursor .
```

---

## ⚙️ Étape 3 : Configuration Cursor pour le projet

### Fichiers de configuration créés

Le projet contient déjà :

1. **`.cursorrules`** - Règles du projet pour l'IA
   - Palette de couleurs
   - Conventions de code
   - Architecture
   - Règles strictes à respecter

2. **`.cursorignore`** - Fichiers à ignorer
   - node_modules
   - Build outputs
   - Documentation ancienne

### Configuration recommandée

**Settings → Cursor Settings :**

- ✅ **Cursor Tab** : Enabled (autocomplétion IA)
- ✅ **Copilot++** : Enabled (suggestions avancées)
- ✅ **Chat** : Enabled (chat avec l'IA)
- ✅ **Index codebase** : Enabled (indexation du code)

**Privacy :**
- ⚠️ Vérifier que vos paramètres de confidentialité sont OK

---

## 🚀 Étape 4 : Premier démarrage

### Indexation du projet

Cursor va automatiquement indexer votre projet.

**Attendez que l'indexation soit terminée** (barre de progression en bas).

### Vérifier que tout fonctionne

1. Ouvrir un fichier (ex: `/src/app/pages/HomePage.tsx`)
2. Taper du code → L'autocomplétion devrait apparaître
3. Ouvrir le chat (Cmd+L ou Ctrl+L)
4. Taper "Explique-moi ce projet"

---

## 💬 Utiliser le Chat Cursor efficacement

### Raccourcis clavier

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Ouvrir Chat | `Ctrl + L` | `Cmd + L` |
| Nouveau chat | `Ctrl + Shift + L` | `Cmd + Shift + L` |
| Chat inline | `Ctrl + K` | `Cmd + K` |
| Accepter suggestion | `Tab` | `Tab` |

### Contexte à donner à Cursor

**Premier message (IMPORTANT) :**

```
Je travaille sur AnnonceAuto.ci, une plateforme de vente de véhicules pour la Côte d'Ivoire.

Contexte du projet :
- React 18.3.1 + TypeScript
- Tailwind CSS v4 (pas v3 !)
- Motion pour animations
- Couleurs : #0F172A (bleu foncé), #FACC15 (jaune/or), #F3F4F6 (gris)
- Architecture : /src/app/App.tsx (routes), /src/app/pages/ (pages), /src/app/components/ (composants)

RÈGLES STRICTES :
1. NE JAMAIS utiliser text-*, font-*, leading-* (sauf demande explicite)
2. TOUJOURS respecter la palette de couleurs
3. TOUJOURS utiliser Motion pour animations
4. TOUJOURS mobile-first
5. Consulter les fichiers .cursorrules pour les détails

Lis ARCHITECTURE.md pour comprendre le projet en détail.
```

---

## 📖 Prompts utiles pour Cursor

### Comprendre le projet

```
Lis ARCHITECTURE.md et explique-moi l'architecture du projet
```

```
Quels sont les fichiers les plus importants du projet ?
```

```
Explique-moi comment fonctionne le système de routes
```

### Ajouter des fonctionnalités

```
Je veux ajouter une page de profil utilisateur dans le dashboard vendeur.
Respecte les conventions du projet et la palette de couleurs.
Utilise DashboardLayout et ajoute des animations Motion.
```

```
Crée un composant Card pour afficher les statistiques mensuelles.
Utilise les couleurs #0F172A et #FACC15.
Ajoute un graphique Recharts et des animations Motion.
```

```
Ajoute une fonctionnalité de recherche en temps réel sur la page /annonces.
Utilise les composants UI existants et reste cohérent avec le design.
```

### Modifier du code existant

```
@HomePage.tsx Améliore cette page en ajoutant une section "Témoignages clients".
Respecte le design actuel et utilise Motion pour les animations.
```

```
@VendorDashboard.tsx Ajoute un graphique en camembert pour les catégories de véhicules.
Utilise Recharts et les couleurs du thème.
```

### Déboguer

```
J'ai une erreur "Module not found" sur cette ligne.
Comment la corriger ?
```

```
Le responsive ne fonctionne pas sur cette page.
Peux-tu aider ?
```

### Refactoring

```
Ce composant est trop long. Peux-tu le découper en plusieurs composants réutilisables ?
Respecte les conventions du fichier .cursorrules
```

---

## 🎯 Utiliser les fonctionnalités avancées

### 1. Chat avec fichiers en contexte

**Mentionner un fichier avec @:**

```
@App.tsx Comment ajouter une nouvelle route pour /contact ?
```

```
@VehicleCard.tsx @theme.css Comment changer la couleur de fond de cette card ?
```

### 2. Édition en ligne (Cmd+K / Ctrl+K)

1. Sélectionner du code
2. `Cmd+K` (Mac) ou `Ctrl+K` (Windows)
3. Taper votre demande
4. Cursor modifie le code directement

**Exemple :**
```
Ajoute des animations Motion au hover sur ce bouton
```

### 3. Générer des composants complets

```
Crée un composant ComparisonCard qui affiche 2 véhicules côte à côte.
Inclus :
- Images des véhicules
- Prix comparés
- Caractéristiques principales
- Bouton "Voir détails"
- Animations Motion
- Responsive mobile
Respecte les couleurs #0F172A et #FACC15
```

### 4. Recherche sémantique

**Cmd+P (Mac) / Ctrl+P (Windows) puis taper:**

```
> composant qui affiche un véhicule
```

```
> fonction qui gère la navigation
```

### 5. Auto-complétion intelligente

Cursor suggère automatiquement du code basé sur :
- Votre projet
- Les fichiers `.cursorrules`
- Le contexte actuel

**Taper simplement et accepter avec Tab**

---

## 📝 Exemples de tâches complètes

### Tâche 1 : Ajouter une page "À propos"

**Prompt :**
```
Je veux créer une page "À propos" (/a-propos) pour expliquer AnnonceAuto.ci.

Étapes :
1. Créer /src/app/pages/AboutPage.tsx
2. Design moderne avec sections :
   - Hero avec fond dégradé bleu foncé
   - Notre mission
   - Comment ça marche
   - Équipe
   - CTA final
3. Ajouter la route dans App.tsx
4. Utiliser Motion pour les animations
5. Respecter les couleurs du thème
6. Mobile-first responsive

Génère le code complet.
```

### Tâche 2 : Améliorer le dashboard vendeur

**Prompt :**
```
@VendorDashboard.tsx

Améliore ce dashboard en ajoutant :
1. Un graphique en ligne pour l'évolution des vues sur 30 jours
2. Une section "Annonces populaires" (top 3)
3. Des badges animés pour les nouvelles notifications
4. Des transitions Motion fluides

Utilise Recharts pour le graphique.
Respecte le design existant et les couleurs du thème.
```

### Tâche 3 : Créer un système de notifications

**Prompt :**
```
Crée un système de notifications toast pour le site.

Utilise la bibliothèque "sonner" (déjà installée).

Fonctionnalités :
- Toast de succès (vert)
- Toast d'erreur (rouge)
- Toast d'info (bleu)
- Position en haut à droite
- Auto-dismiss après 3 secondes
- Animations d'entrée/sortie

Crée :
1. /src/app/utils/toast.ts avec les helpers
2. Intègre dans App.tsx
3. Exemple d'utilisation dans un composant

Respecte les couleurs du thème.
```

---

## 🔧 Commandes Cursor utiles

### Terminal intégré

**Ouvrir :** `Ctrl + `` ou View → Terminal

```bash
# Installer une dépendance
pnpm add nom-package

# Lancer le serveur
pnpm run dev

# Build
pnpm run build

# Vérifier setup
node check-setup.js
```

### Commandes Cursor

| Commande | Action |
|----------|--------|
| `Cmd/Ctrl + P` | Recherche rapide de fichiers |
| `Cmd/Ctrl + Shift + P` | Palette de commandes |
| `Cmd/Ctrl + F` | Rechercher dans le fichier |
| `Cmd/Ctrl + Shift + F` | Rechercher dans tout le projet |
| `Cmd/Ctrl + L` | Ouvrir chat Cursor |
| `Cmd/Ctrl + K` | Édition inline |
| `Cmd/Ctrl + I` | Composer (génération multi-fichiers) |

---

## 🎨 Bonnes pratiques avec Cursor

### 1. Toujours donner du contexte

❌ **Mauvais :**
```
Crée une page
```

✅ **Bon :**
```
Crée une page de profil vendeur à /dashboard/vendeur/profil.
Utilise DashboardLayout, affiche les infos du vendeur, ses statistiques,
et permet de modifier son profil. Respecte les couleurs du thème et ajoute Motion.
```

### 2. Mentionner les fichiers pertinents

❌ **Mauvais :**
```
Comment ajouter une route ?
```

✅ **Bon :**
```
@App.tsx Comment ajouter une route pour la page contact ?
Consulte aussi @ARCHITECTURE.md pour les conventions.
```

### 3. Spécifier le style et les contraintes

❌ **Mauvais :**
```
Ajoute un bouton
```

✅ **Bon :**
```
Ajoute un bouton CTA avec :
- Dégradé jaune #FACC15 → #FBBF24
- Texte bleu foncé #0F172A
- Animation scale au hover (Motion)
- Ombres shadow-lg
- Responsive
```

### 4. Demander des explications

```
Explique-moi ce que fait ce code ligne par ligne
```

```
Pourquoi utilise-t-on DashboardLayout ici ?
```

```
Quelle est la différence entre ces deux approches ?
```

### 5. Itérer progressivement

**Au lieu de :**
```
Crée un dashboard complet avec 20 fonctionnalités
```

**Faire :**
```
Étape 1 : Crée la structure de base du dashboard
```
*(attendre la réponse)*

```
Étape 2 : Ajoute les KPI cards en haut
```
*(attendre la réponse)*

```
Étape 3 : Ajoute un graphique Recharts
```

---

## 📚 Documentation à mentionner dans vos prompts

### Fichiers de référence

```
Consulte @ARCHITECTURE.md pour l'architecture complète
```

```
Regarde @QUICK_REFERENCE.md pour les patterns de code
```

```
Vérifie @.cursorrules pour les règles du projet
```

### Fichiers de code

```
@App.tsx - Routes principales
@DashboardLayout.tsx - Layout des dashboards
@theme.css - Variables CSS et couleurs
@VehicleCard.tsx - Exemple de composant
```

---

## 🚨 Erreurs courantes et solutions

### Erreur 1 : Cursor ne respecte pas les couleurs

**Cause :** N'a pas lu `.cursorrules`

**Solution :**
```
Lis @.cursorrules et respecte STRICTEMENT la palette de couleurs :
- Bleu foncé : #0F172A
- Jaune/Or : #FACC15
- Gris : #F3F4F6
```

### Erreur 2 : Cursor utilise text-*, font-*

**Cause :** N'a pas compris la règle de typographie

**Solution :**
```
IMPORTANT : Ne pas utiliser text-*, font-*, leading-*.
La typographie est gérée par theme.css.
Lis la section "Typographie" dans @.cursorrules
```

### Erreur 3 : Cursor crée un composant qui existe

**Cause :** N'a pas cherché dans /components/ui/

**Solution :**
```
Avant de créer un composant, vérifie dans /src/app/components/ui/
si un composant similaire existe déjà.
```

### Erreur 4 : Code non responsive

**Cause :** A oublié le mobile-first

**Solution :**
```
Rends ce code responsive en mobile-first :
- Mobile : w-full, flex-col
- Tablette (md:) : w-1/2, flex-row
- Desktop (lg:) : w-1/3

Consulte @QUICK_REFERENCE.md pour les patterns responsive.
```

---

## 💡 Astuces avancées

### 1. Générer plusieurs fichiers d'un coup

**Utiliser Composer (Cmd+I / Ctrl+I) :**

```
Crée une fonctionnalité complète "Favoris" :

Fichiers à créer :
1. /src/app/components/FavoriteButton.tsx - Bouton favori
2. /src/app/pages/FavoritesPage.tsx - Page liste favoris
3. /src/app/utils/favorites.ts - Logique métier
4. Modifier App.tsx pour ajouter la route /favoris

Design :
- Couleurs du thème
- Animations Motion
- Responsive
- Icône Heart de lucide-react
```

### 2. Refactoring global

```
Analyse tous les fichiers dans /src/app/pages/ et identifie :
1. Le code dupliqué
2. Les opportunités de créer des composants réutilisables
3. Les améliorations de performance possibles

Propose un plan de refactoring.
```

### 3. Documentation automatique

```
Génère des commentaires JSDoc pour toutes les fonctions de ce fichier.
Inclus les types TypeScript et des exemples d'utilisation.
```

### 4. Tests (si vous voulez en ajouter)

```
Crée des tests unitaires pour ce composant avec Jest et React Testing Library.
Teste tous les cas d'usage et les interactions utilisateur.
```

---

## 🎯 Workflows recommandés

### Workflow 1 : Ajouter une nouvelle page

1. **Décrire à Cursor :**
```
Je veux ajouter une page [NOM] à /[route].
Fonctionnalités : [liste]
Design : [description]
Contraintes : Respect du design system, Motion, responsive
```

2. **Générer le fichier**
3. **Ajouter la route :**
```
@App.tsx Ajoute une route pour /[route] vers [NomPage]
```

4. **Tester et itérer**

### Workflow 2 : Modifier une fonctionnalité

1. **Ouvrir le fichier**
2. **Sélectionner le code**
3. **Cmd+K / Ctrl+K**
4. **Décrire la modification**
5. **Revoir et accepter**

### Workflow 3 : Déboguer

1. **Copier l'erreur**
2. **Chat avec Cursor :**
```
J'ai cette erreur : [erreur]
Fichier : @[fichier]
Contexte : [ce que je faisais]

Comment la corriger ?
```

3. **Appliquer la solution**

---

## ✅ Checklist avant de commencer

- [ ] Cursor AI installé
- [ ] Projet ouvert dans Cursor
- [ ] Indexation terminée
- [ ] `.cursorrules` présent et lu par Cursor
- [ ] Premier chat ouvert avec contexte du projet
- [ ] Terminal intégré ouvert
- [ ] `pnpm run dev` lancé
- [ ] Documentation consultée (ARCHITECTURE.md)

---

## 🚀 Exemple de session complète

### Objectif : Ajouter une page de contact

**Étape 1 : Chat initial**
```
Je veux créer une page Contact accessible à /contact.

Structure :
- Hero avec titre "Contactez-nous"
- Formulaire (nom, email, sujet, message)
- Carte avec nos coordonnées
- Map (placeholder)
- CTA "Suivez-nous" avec réseaux sociaux

Design :
- Couleurs du thème (#0F172A, #FACC15)
- Animations Motion entrée/sortie
- Glass morphism pour le formulaire
- Mobile-first responsive

Crée le fichier /src/app/pages/ContactPage.tsx
```

**Étape 2 : Ajouter la route**
```
@App.tsx Ajoute une route pour /contact vers ContactPage.
Route publique avec Header et Footer.
```

**Étape 3 : Améliorer**
```
@ContactPage.tsx Ajoute une validation du formulaire avec react-hook-form.
Messages d'erreur en rouge.
Toast de succès après envoi.
```

**Étape 4 : Tester**
- Ouvrir http://localhost:5173/contact
- Tester le formulaire
- Vérifier responsive

---

## 📖 Ressources

### Documentation Cursor AI
- Site officiel : https://cursor.sh/
- Documentation : https://docs.cursor.sh/

### Documentation du projet
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture complète
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Guide développeur
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Référence rapide
- [PROJECT_INDEX.md](./PROJECT_INDEX.md) - Index des fichiers

### Extensions recommandées pour Cursor

Cursor inclut déjà la plupart des extensions utiles, mais vous pouvez ajouter :
- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Formatage automatique
- **Tailwind CSS IntelliSense** - Autocomplétion Tailwind

---

## 🎉 Vous êtes prêt !

Vous avez maintenant tout ce qu'il faut pour utiliser Cursor AI efficacement sur AnnonceAuto.ci.

**Prochaines étapes :**
1. Ouvrir le projet dans Cursor
2. Lancer `pnpm run dev`
3. Commencer à coder avec l'aide de l'IA
4. Consulter ce guide au besoin

**Bon développement avec Cursor AI ! 🚀**

---

**Dernière mise à jour :** Décembre 2024  
**Version :** 1.0.0
