# 🤖 AnnonceAuto.ci + Cursor AI

Guide rapide pour démarrer avec Cursor AI sur le projet.

---

## ⚡ Démarrage ultra-rapide (2 minutes)

### 1. Installer Cursor AI
👉 https://cursor.sh/

### 2. Ouvrir le projet
```bash
cd annonceauto-ci
cursor .
```

### 3. Premier prompt (IMPORTANT - Copier-coller)
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

### 4. Commencer à coder !

---

## 📚 Documentation Cursor créée

### Fichiers de configuration
- **`.cursorrules`** ⭐ - Règles du projet pour l'IA (lu automatiquement)
- **`.cursorignore`** - Fichiers à ignorer

### Guides complets
- **`CURSOR_AI_GUIDE.md`** - Guide complet Cursor (30 min)
- **`CURSOR_PROMPTS.md`** - 50+ prompts prêts à l'emploi
- **Ce fichier** - Démarrage rapide

---

## 🎯 Raccourcis essentiels

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Chat | `Ctrl + L` | `Cmd + L` |
| Édition inline | `Ctrl + K` | `Cmd + K` |
| Composer | `Ctrl + I` | `Cmd + I` |

---

## 💬 Prompts les plus utiles

### Créer une page
```
Crée une page [NOM] à /[route].
Structure : [description]
Design : Palette du thème, Motion, responsive
Crée /src/app/pages/[NomPage].tsx
```

### Ajouter une fonctionnalité
```
@[fichier] Ajoute [fonctionnalité].
Respecte le design existant et @.cursorrules
```

### Déboguer
```
J'ai cette erreur : [erreur]
Dans @[fichier]
Comment la corriger ?
```

### Refactoriser
```
@[fichier] Refactorise ce code en plusieurs composants.
Respecte les conventions du projet.
```

---

## 🎨 Règles d'or

### ✅ À FAIRE
- Utiliser les couleurs : #0F172A, #FACC15, #F3F4F6
- Ajouter animations Motion
- Mobile-first (w-full puis sm:, md:, lg:)
- Mentionner les fichiers avec @
- Utiliser les composants UI existants

### ❌ NE PAS FAIRE
- text-*, font-*, leading-* (sauf exception)
- Changer la palette de couleurs
- Créer des composants qui existent
- Oublier le responsive
- Inventer des icônes Lucide

---

## 📖 En savoir plus

| Document | Utilité |
|----------|---------|
| `CURSOR_AI_GUIDE.md` | Guide complet (lire en entier) |
| `CURSOR_PROMPTS.md` | Copier-coller des prompts |
| `ARCHITECTURE.md` | Comprendre le projet |
| `.cursorrules` | Règles auto-appliquées |

---

## 🚀 Exemple de tâche complète

**Objectif :** Ajouter une page "À propos"

**Prompt 1 :**
```
Crée une page À propos accessible à /a-propos.

Structure :
- Hero "Qui sommes-nous ?"
- Mission et valeurs
- Équipe (4 membres avec photos placeholder)
- CTA final

Design :
- Couleurs du thème
- Motion animations
- Glass morphism
- Responsive

Crée /src/app/pages/AboutPage.tsx
```

**Prompt 2 :**
```
@App.tsx Ajoute la route /a-propos vers AboutPage.
Route publique avec Header et Footer.
```

**Résultat :** Page complète en 2 minutes ! ✅

---

## 💡 Tips

1. **Toujours donner du contexte** la première fois
2. **Mentionner les fichiers** avec @fichier
3. **Être spécifique** sur le design
4. **Itérer progressivement** plutôt que tout d'un coup
5. **Consulter `.cursorrules`** si Cursor ne respecte pas les règles

---

## 🆘 Problèmes courants

**Cursor ne respecte pas les couleurs**
```
Lis @.cursorrules et respecte STRICTEMENT :
- #0F172A pour le bleu foncé
- #FACC15 pour le jaune
```

**Cursor utilise text-* ou font-***
```
STOP. Ne pas utiliser text-*, font-*, leading-*.
Consulte la section Typographie dans @.cursorrules
```

**Code non responsive**
```
Rends ce code mobile-first :
Mobile : w-full, flex-col
Tablette (md:) : ...
Desktop (lg:) : ...
```

---

## ✅ Checklist

- [ ] Cursor AI installé
- [ ] Projet ouvert
- [ ] Prompt d'initialisation envoyé
- [ ] `.cursorrules` lu par Cursor
- [ ] Premier composant créé avec succès

---

## 🎉 Vous êtes prêt !

Cursor AI va accélérer votre développement sur AnnonceAuto.ci.

**Pour aller plus loin :**
1. Lire `CURSOR_AI_GUIDE.md` (30 min)
2. Explorer `CURSOR_PROMPTS.md` (50+ exemples)
3. Consulter `ARCHITECTURE.md` pour le projet

**Bon développement avec Cursor ! 🚀**

---

**Questions ?** Consulter les guides ci-dessus ou poser à Cursor !
