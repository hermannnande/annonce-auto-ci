# 🤖 Pour utiliser ce projet dans Cursor AI

## ⚡ En 3 étapes

### 1. Télécharger et installer Cursor

👉 **https://cursor.sh/**

### 2. Ouvrir ce projet

```bash
cd annonceauto-ci
cursor .
```

ou **File → Open Folder** dans Cursor

### 3. Initialiser Cursor (IMPORTANT)

**Ouvrir le chat :** `Cmd + L` (Mac) ou `Ctrl + L` (Windows)

**Copier-coller ce prompt :**

```
Je travaille sur AnnonceAuto.ci, une plateforme de vente de véhicules pour la Côte d'Ivoire.

CONTEXTE TECHNIQUE :
- React 18.3.1 + TypeScript
- Tailwind CSS v4 (PAS v3 !)
- Motion pour animations
- Couleurs : #0F172A (bleu foncé), #FACC15 (jaune/or), #F3F4F6 (gris)

RÈGLES ABSOLUES :
1. NE JAMAIS utiliser text-*, font-*, leading-* (theme.css gère la typo)
2. TOUJOURS respecter la palette de couleurs
3. TOUJOURS utiliser Motion pour animations
4. TOUJOURS mobile-first

Consulte @.cursorrules et @ARCHITECTURE.md pour les détails.

Es-tu prêt ?
```

---

## ✅ C'est tout !

Cursor connaît maintenant tout le projet grâce au fichier `.cursorrules`.

---

## 💬 Exemples de prompts

### Créer une page

```
Crée une page Contact accessible à /contact.
Formulaire + coordonnées + CTA.
Design : couleurs du thème, Motion, responsive.
```

### Améliorer un composant

```
@HomePage.tsx
Ajoute une section témoignages avec 3 cartes.
Animations au scroll.
```

### Créer un composant

```
Crée un composant PriceCard pour afficher un prix avec badge.
Props : price, badge, highlighted
Animations hover.
```

---

## 📚 Documentation complète

- **[OUVRIR_DANS_CURSOR.md](./OUVRIR_DANS_CURSOR.md)** - Guide détaillé
- **[CURSOR_AI_GUIDE.md](./CURSOR_AI_GUIDE.md)** - Guide complet (30 min)
- **[CURSOR_PROMPTS.md](./CURSOR_PROMPTS.md)** - 50+ prompts prêts
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture projet

---

## 🚀 Installer et lancer

**Terminal dans Cursor :** `` Ctrl + ` ``

```bash
# Installer pnpm
npm install -g pnpm

# Installer dépendances
pnpm install

# Lancer le serveur
pnpm run dev
```

**Ouvrir :** http://localhost:5173

---

## 🎯 Raccourcis Cursor

- **Chat** : `Cmd/Ctrl + L`
- **Édition inline** : `Cmd/Ctrl + K`
- **Composer** : `Cmd/Ctrl + I`
- **Terminal** : `` Ctrl + ` ``

---

## ✨ Fichiers importants

- **`.cursorrules`** - Règles du projet (lu par Cursor)
- **`ARCHITECTURE.md`** - Tout sur le projet
- **`CURSOR_PROMPTS.md`** - Prompts à copier-coller

---

**C'est tout ! Développez avec l'IA ! 🚀**
