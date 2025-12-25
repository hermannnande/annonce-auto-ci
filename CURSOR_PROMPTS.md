# 💬 Prompts Cursor AI - AnnonceAuto.ci

Collection de prompts prêts à l'emploi pour Cursor AI sur le projet AnnonceAuto.ci.

---

## 🚀 Prompt d'initialisation (TOUJOURS COMMENCER PAR CELUI-CI)

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
- Styles : /src/styles/theme.css (variables CSS)
- Dashboard Layout : /src/app/components/dashboard/DashboardLayout.tsx

RÈGLES ABSOLUES :
1. NE JAMAIS utiliser text-*, font-*, leading-* sauf demande explicite (theme.css gère la typo)
2. TOUJOURS respecter la palette de couleurs ci-dessus
3. TOUJOURS utiliser Motion pour les animations
4. TOUJOURS mobile-first (w-full puis sm:, md:, lg:)
5. TOUJOURS vérifier qu'une icône Lucide existe avant de l'importer
6. Utiliser les composants UI existants dans /src/app/components/ui/

Pour plus de détails, consulte @.cursorrules et @ARCHITECTURE.md

Es-tu prêt à m'aider sur ce projet en respectant ces règles ?
```

---

## 📄 Prompts pour créer des pages

### Page publique simple

```
Crée une page [NOM_PAGE] accessible à /[route].

Structure :
- Hero section avec fond dégradé bleu foncé (#0F172A)
- [Section 2]
- [Section 3]
- CTA final avec bouton jaune

Design :
- Palette : #0F172A, #FACC15, #F3F4F6
- Animations Motion (fade + slide au scroll)
- Glass morphism pour les cartes
- Mobile-first responsive
- Coins arrondis rounded-2xl
- Ombres shadow-lg, shadow-xl au hover

Crée le fichier /src/app/pages/[NomPage].tsx
Puis aide-moi à ajouter la route dans @App.tsx
```

### Page dashboard

```
Crée une page dashboard [TYPE] à /dashboard/[type]/[route].

TYPE = "vendeur" ou "admin"

Fonctionnalités :
- [Liste des fonctionnalités]

Structure :
- Utiliser DashboardLayout avec userType="[type]"
- Section header avec titre et description
- [Sections principales]

Design :
- Palette du thème
- KPI cards avec icônes et gradients
- Graphiques Recharts si nécessaire
- Animations Motion
- Responsive

Crée /src/app/pages/dashboard/[NomPage].tsx
```

---

## 🧩 Prompts pour créer des composants

### Composant de carte (Card)

```
Crée un composant [NomCard] qui affiche [description].

Props :
- [prop1]: [type] - [description]
- [prop2]: [type] - [description]

Design :
- Background blanc avec shadow-lg
- Coins arrondis rounded-xl
- Padding p-6
- Animation scale au hover (Motion)
- Icône en haut à gauche
- Badge si [condition]

Responsive :
- Mobile : w-full
- Tablette : md:w-1/2
- Desktop : lg:w-1/3

Crée /src/app/components/[NomCard].tsx
```

### Composant formulaire

```
Crée un composant formulaire [NomForm] pour [objectif].

Champs :
- [champ1] : [type] - [validation]
- [champ2] : [type] - [validation]

Utilise :
- react-hook-form pour la gestion
- Composants Input, Select, Button existants
- Validation côté client
- Messages d'erreur en rouge
- Toast de succès (sonner)

Design :
- Glass morphism pour le conteneur
- Labels en bleu foncé
- Bouton submit en dégradé jaune
- Animations Motion

Crée /src/app/components/[NomForm].tsx
```

### Composant modal/dialog

```
Crée un composant Dialog [NomDialog] pour [objectif].

Contenu :
- [Description du contenu]

Utilise :
- Composant Dialog de /src/app/components/ui/dialog.tsx
- Animations d'entrée/sortie Motion
- Boutons d'action (confirmer/annuler)

Design :
- Overlay backdrop-blur
- Conteneur blanc avec shadow-2xl
- Bouton confirmer en jaune
- Bouton annuler en outline

Crée /src/app/components/[NomDialog].tsx
```

---

## 📊 Prompts pour ajouter des graphiques

### Line Chart (Recharts)

```
Ajoute un graphique en ligne (LineChart) dans @[fichier] pour afficher [données].

Données :
- X : [axe X description]
- Y : [axe Y description]

Style :
- Ligne en #0F172A, stroke épaisseur 2
- Grid en pointillés gris
- Tooltip personnalisé
- Area sous la courbe avec gradient
- Responsive : ResponsiveContainer width="100%" height={300}

Animation :
- Apparition progressive
```

### Bar Chart (Recharts)

```
Ajoute un graphique en barres (BarChart) dans @[fichier] pour [données].

Données :
- [Description des données]

Style :
- Barres avec dégradé #FACC15 → #FBBF24
- Coins arrondis en haut : radius={[8, 8, 0, 0]}
- Grid horizontal
- Tooltip avec fond blanc

Responsive et animé.
```

### Pie Chart (Recharts)

```
Ajoute un graphique circulaire (PieChart) dans @[fichier] pour [données].

Données :
- [Catégories et valeurs]

Style :
- Couleurs : alterner entre #0F172A et #FACC15
- Labels avec pourcentages
- Légende en bas
- Tooltip personnalisé

Animation d'entrée.
```

---

## 🎨 Prompts pour améliorer le design

### Ajouter des animations

```
@[fichier] Améliore ce composant en ajoutant des animations Motion :

1. Fade + slide au montage (y: 20)
2. Scale au hover sur les cartes
3. Stagger children pour les listes
4. Transitions fluides (duration: 0.3)

Garde le code existant, ajoute seulement les animations.
```

### Rendre responsive

```
@[fichier] Rends ce composant entièrement responsive mobile-first.

Mobile (défaut) :
- Colonnes uniques
- Texte centré
- Padding réduit

Tablette (md:) :
- 2 colonnes
- Grid gap-4

Desktop (lg:) :
- 3-4 colonnes
- Espaces généreux

Conserve les styles existants, ajoute seulement le responsive.
```

### Ajouter glass morphism

```
Applique un effet glass morphism moderne sur [élément] dans @[fichier].

Style :
- bg-white/80 ou bg-[#0F172A]/80 selon le contexte
- backdrop-blur-lg
- border border-white/20
- shadow-2xl
- rounded-2xl

Transitions au hover.
```

---

## 🔧 Prompts pour modifier du code existant

### Refactoriser un composant

```
@[fichier] Ce composant est trop long. Refactorise-le en :

1. Composant principal : [NomPrincipal]
2. Sous-composants :
   - [SousComposant1]
   - [SousComposant2]

Garde la même fonctionnalité.
Respecte les conventions du projet.
Ajoute des types TypeScript.
```

### Optimiser les performances

```
@[fichier] Analyse ce composant et optimise les performances :

1. Identifie les re-renders inutiles
2. Utilise useMemo/useCallback si nécessaire
3. Optimise les listes avec keys
4. Lazy load si pertinent

Explique chaque optimisation.
```

### Ajouter TypeScript

```
@[fichier] Ajoute des types TypeScript stricts :

1. Interfaces pour toutes les props
2. Types pour les states
3. Types de retour pour les fonctions
4. Évite "any"

Documente avec JSDoc.
```

---

## 🐛 Prompts pour déboguer

### Analyser une erreur

```
J'ai cette erreur dans @[fichier] :

[Coller l'erreur complète]

Contexte :
- [Ce que je faisais]
- [Dernières modifications]

Aide-moi à :
1. Comprendre l'erreur
2. Trouver la cause
3. Proposer une solution
4. Expliquer comment éviter ça à l'avenir
```

### Problème de style

```
@[fichier] Les styles ne s'appliquent pas correctement sur [élément].

Problème observé :
- [Description]

Vérifie :
1. Classes Tailwind correctes
2. Conflits possibles
3. Import de theme.css
4. Spécificité CSS

Propose une solution.
```

### Problème responsive

```
@[fichier] Le responsive ne fonctionne pas sur mobile.

Problèmes :
- [Liste des problèmes]

Breakpoints à vérifier : sm: (640px), md: (768px), lg: (1024px)

Corrige en mobile-first.
```

---

## ➕ Prompts pour ajouter des fonctionnalités

### Système de recherche

```
Ajoute une fonctionnalité de recherche en temps réel sur @[fichier].

Fonctionnalités :
- Barre de recherche avec icône
- Filtrage instantané
- Highlight des résultats
- Message "Aucun résultat"

Utilise :
- Composant Input existant
- State pour le terme de recherche
- Filter sur les données
- Debounce si beaucoup de données
```

### Pagination

```
Ajoute un système de pagination sur @[fichier].

Spécifications :
- [X] éléments par page
- Boutons Précédent/Suivant
- Numéros de pages
- Compteur "Page X sur Y"

Utilise :
- State pour la page courante
- Slice des données
- Composant Button existant
- Animations Motion entre les pages
```

### Système de tri

```
Ajoute un tri multi-critères sur @[fichier].

Critères :
- [critère 1] : croissant/décroissant
- [critère 2] : croissant/décroissant

Utilise :
- Select pour choisir le critère
- Toggle pour croissant/décroissant
- Sort des données
- Animation lors du tri
```

---

## 📱 Prompts pour l'intégration Mobile Money

### Ajouter un opérateur

```
@VendorRecharge.tsx Ajoute un nouvel opérateur Mobile Money [NOM_OPERATEUR].

Informations :
- Logo : [emoji ou URL]
- Frais : [pourcentage]
- Couleur : [gradient]

Ajoute-le dans l'array mobileMoneyProviders.
Garde le même design que les autres.
```

### Améliorer le flow de paiement

```
@VendorRecharge.tsx Améliore le flow de paiement :

1. Ajoute une étape de confirmation visuelle
2. Progress bar pour les étapes
3. Validation du numéro de téléphone
4. Message de loading pendant le traitement
5. Animation de succès avant redirection

Utilise Motion pour les transitions.
```

---

## 📊 Prompts pour le Dashboard Admin

### Ajouter un filtre de dates

```
@AdminAnalytics.tsx Améliore les filtres de dates :

Fonctionnalités :
1. Date picker pour début/fin
2. Raccourcis : Aujourd'hui, 7j, 30j, Ce mois, Mois dernier
3. Validation (fin > début)
4. Bouton "Appliquer"
5. Affichage de la période sélectionnée

Utilise react-day-picker (déjà installé).
Design cohérent avec le dashboard.
```

### Export de données

```
@[fichier] Ajoute une fonctionnalité d'export de données.

Formats :
- CSV
- Excel (XLSX)
- PDF

Utilise :
- Bouton dropdown avec les options
- Génération des fichiers
- Téléchargement automatique
- Toast de confirmation

Design : bouton en bleu foncé avec icône Download.
```

---

## 🎯 Prompts pour optimiser le SEO

### Meta tags

```
@[fichier] Ajoute des meta tags optimisés pour le SEO :

- Title : [titre]
- Description : [description]
- Keywords : [mots-clés]
- Open Graph pour réseaux sociaux
- Twitter Card

Utilise react-helmet-async si nécessaire.
```

### Structure sémantique

```
@[fichier] Améliore la sémantique HTML pour le SEO :

1. Utilise les balises sémantiques (header, nav, main, article, section, footer)
2. Hiérarchie correcte des titres (h1 unique, puis h2, h3)
3. Alt text sur toutes les images
4. ARIA labels pour l'accessibilité

Garde les styles existants.
```

---

## 🧪 Prompts pour tester

### Créer des tests

```
Crée des tests unitaires pour @[fichier] avec Jest et React Testing Library.

Tests à créer :
1. Rendu du composant
2. Interactions utilisateur ([liste])
3. Props ([liste])
4. États ([liste])

Structure :
- describe() pour grouper
- it() pour chaque test
- Bons noms descriptifs
```

### Mock data

```
Crée des données de test réalistes pour @[fichier].

Format :
- [Description du format]

Nombre d'entrées : [X]

Inclus :
- Variété de cas
- Cas limites
- Données en français

Crée /src/app/data/mock[Nom].ts
```

---

## 💡 Prompts pour la documentation

### Documenter un composant

```
@[fichier] Ajoute une documentation complète :

1. JSDoc pour le composant et toutes les fonctions
2. Exemples d'utilisation
3. Props avec types et descriptions
4. Notes importantes

Format :
- Clair et concis
- Exemples de code
- Cas d'usage
```

### README d'un dossier

```
Crée un README.md pour /src/app/[dossier]/ qui explique :

1. Objectif du dossier
2. Liste des fichiers avec descriptions
3. Comment utiliser
4. Conventions à respecter
5. Exemples

Format Markdown, clair et structuré.
```

---

## 🚀 Prompts pour déployer

### Optimisation build

```
Analyse le projet et propose des optimisations pour le build de production :

1. Code splitting
2. Lazy loading des routes
3. Optimisation des images
4. Tree shaking
5. Minification

Explique chaque optimisation et comment l'implémenter.
```

### Variables d'environnement

```
Crée un système de variables d'environnement pour :

- API URL
- API Keys
- Environment (dev/prod)

Fichiers :
- .env.example (template)
- .env.local (gitignored)

Utilisation dans le code avec import.meta.env
```

---

## ✅ Template de prompt personnalisé

```
TÂCHE : [Description de la tâche]

FICHIERS CONCERNÉS :
- @[fichier1]
- @[fichier2]

OBJECTIF :
[Ce que tu veux accomplir]

CONTRAINTES :
- Respecter @.cursorrules
- Couleurs : #0F172A, #FACC15, #F3F4F6
- Mobile-first responsive
- Animations Motion
- [Autres contraintes]

DÉTAILS TECHNIQUES :
- [Spécifications techniques]

DESIGN :
- [Spécifications visuelles]

DELIVRABLE :
- [Ce que tu attends]

CONTEXTE ADDITIONNEL :
[Informations supplémentaires si nécessaire]
```

---

## 📋 Checklist avant d'envoyer un prompt

- [ ] J'ai donné le contexte (première fois)
- [ ] J'ai mentionné les fichiers avec @
- [ ] J'ai spécifié les couleurs du thème
- [ ] J'ai demandé du responsive
- [ ] J'ai demandé des animations Motion
- [ ] J'ai mentionné les contraintes
- [ ] Mon prompt est clair et structuré

---

## 💬 Exemples de conversations complètes

### Exemple 1 : Nouvelle page

**Vous :**
```
Crée une page "FAQ" à /faq.

Sections :
1. Hero avec titre "Questions Fréquentes"
2. Accordéon avec 8-10 questions/réponses
3. CTA "Besoin d'aide ?" avec bouton vers /contact

Design :
- Palette du thème
- Accordion de /src/app/components/ui/accordion.tsx
- Animations Motion
- Mobile-first

Crée /src/app/pages/FaqPage.tsx
```

**Cursor génère le code**

**Vous :**
```
@App.tsx Ajoute la route /faq vers FaqPage
Route publique avec Header et Footer
```

**Cursor modifie App.tsx**

**Vous :**
```
@FaqPage.tsx Ajoute une section "Toujours pas de réponse ?" en bas
avec un formulaire de contact rapide
```

**Cursor améliore la page**

---

**Vous êtes maintenant équipé de dizaines de prompts prêts à l'emploi ! 🚀**

Copiez-collez et adaptez selon vos besoins.

---

**Dernière mise à jour :** Décembre 2024
