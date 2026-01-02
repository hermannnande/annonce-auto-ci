# 🚀 Guide Rapide : Page Admin Modération

## ⚡ Accès rapide
👉 **https://annonceauto.ci/dashboard/moderation**

---

## 📊 Vue d'ensemble

### 1️⃣ Statistiques (en haut)
```
[Total annonces]  [En attente]  [Approuvées]  [Rejetées]
      25              5             18            2
```

### 2️⃣ Recherche et filtres
- 🔍 Barre de recherche : taper titre ou nom du vendeur
- 🔽 **Filtres avancés** (pliables) :
  - **Statut** : Tous / En attente / Approuvées / Rejetées
  - **Prix** : Tous / Bas / Moyen / Élevé / 🚨 Prix suspects

### 3️⃣ Liste des annonces (gauche)
- Cartes avec image, titre, vendeur, prix, date
- **Badges colorés** par statut :
  - 🟡 Jaune : En attente
  - 🟢 Vert : Approuvée
  - 🔴 Rouge : Rejetée
- **Icône ⚠️** : Prix suspect (trop bas, trop élevé, ou aberrant)

### 4️⃣ Détails de l'annonce (droite)
- Image en grand
- Spécifications : année, km, carburant, transmission
- Description
- Infos vendeur : nom, email, téléphone, date de soumission
- **Actions** : Approuver / Refuser / Contacter

### 5️⃣ Pagination (en bas)
```
Page 1 sur 2    [<] [1] [2] [>]
```

---

## 🎯 Actions principales

### ✅ Approuver une annonce
1. Clique sur une annonce dans la liste (gauche)
2. Vérifie les détails (droite)
3. Clique **"Approuver l'annonce"** (bouton vert)
4. ✅ L'annonce passe au statut "active" et devient visible sur le site
5. Le vendeur reçoit une notification par email
6. Les stats sont mises à jour

### ❌ Refuser une annonce
1. Sélectionne l'annonce
2. Clique **"Refuser l'annonce"** (bouton rouge)
3. **Entre obligatoirement une raison** (ex: "Photos de mauvaise qualité")
4. Clique **"Confirmer le refus"**
5. ✅ L'annonce passe au statut "rejected"
6. Le vendeur reçoit un email avec la raison du refus
7. Les stats sont mises à jour

### 💬 Contacter le vendeur
1. Clique sur l'annonce
2. Clique **"Contacter le vendeur"** (bouton blanc)
3. Une conversation privée s'ouvre dans la messagerie

---

## 🔍 Utiliser les filtres

### Recherche par titre/vendeur
Tape dans la barre de recherche :
- `alfa` → affiche "Alfa Romeo 2003"
- `jean` → affiche toutes les annonces de "ive jean"

### Filtrer par statut
Menu déroulant **"Statut"** :
- **Tous** : affiche toutes les annonces (pending, approved, rejected)
- **En attente** : uniquement les annonces à modérer (par défaut)
- **Approuvées** : annonces actives sur le site
- **Rejetées** : annonces refusées

### Filtrer par prix
Menu déroulant **"Prix"** :
- **Tous** : tous les prix
- **Bas** : < 5M CFA
- **Moyen** : 5M - 15M CFA
- **Élevé** : ≥ 15M CFA
- **🚨 Prix suspects** : prix aberrants (< 500K, > 100M, ou multiples de milliards)

### 🚨 Qu'est-ce qu'un prix suspect ?
Un prix est considéré comme suspect si :
- **< 500 000 CFA** → probablement une erreur (ex: oublié un zéro)
- **> 100 000 000 CFA** → trop élevé (ex: ajouté trop de zéros)
- **4 000 000 000 000 CFA** → aberrant (l'utilisateur s'est trompé)

**Exemple réel de la capture** : "4 000 000 000 000 CFA" → 4 **trillions** de CFA ! ⚠️

---

## 📈 Trier les résultats

Clique sur les boutons en haut à droite :
- **Date** : du plus récent au plus ancien (ou inverse)
- **Prix** : du moins cher au plus cher (ou inverse)
- **Titre** : A-Z ou Z-A

**Indicateur** : Une icône `↕` apparaît sur le tri actif

---

## 📄 Naviguer dans les pages

### Si tu as plus de 20 annonces
- La pagination apparaît automatiquement
- Clique sur les **numéros de page** ou les **flèches** `<` `>`
- La page **scroll automatiquement en haut** lors du changement

---

## 💡 Astuces

### Trouver rapidement les annonces à problème
1. Clique sur **"Filtres"** pour déplier
2. Sélectionne **"🚨 Prix suspects"** dans le menu "Prix"
3. Toutes les annonces avec des prix aberrants s'affichent
4. Vérifie et contacte le vendeur pour correction, ou rejette l'annonce

### Modérer efficacement
**Ordre recommandé** :
1. **Filtrer** : "En attente" (par défaut)
2. **Trier** : par "Date" (les plus récentes en premier)
3. **Parcourir** : page par page
4. **Approuver** : les bonnes annonces
5. **Rejeter** : les annonces non conformes (avec raison claire)

### Vérifications à faire avant d'approuver
- ✅ Photos de qualité (pas de flou, bien éclairées)
- ✅ Prix cohérent (pas trop bas, pas trop élevé)
- ✅ Description claire et complète
- ✅ Infos vendeur valides (email, téléphone)
- ✅ Pas de contenu offensant ou spam

### Raisons de rejet courantes
- "Photos de mauvaise qualité"
- "Prix trop bas/élevé, veuillez vérifier"
- "Description insuffisante"
- "Annonce en double"
- "Contenu inapproprié"
- "Informations de contact incorrectes"

---

## 🛡️ Sécurité

### Permissions requises
- ✅ Tu dois être **admin** pour accéder à cette page
- ✅ Seuls les **admins** peuvent approuver/rejeter des annonces

### Vérifications automatiques
- ❌ Les vendeurs ne peuvent **pas** voir les annonces des autres
- ✅ Toutes les actions sont **enregistrées** (audit trail)
- ✅ Les vendeurs reçoivent des **notifications** pour chaque action

---

## 🐛 Dépannage

### "Aucune annonce en attente"
- Normal si tout a été modéré
- Change le filtre "Statut" → "Tous" pour voir toutes les annonces

### Les filtres ne fonctionnent pas
- Vérifie que tu as cliqué sur "Filtres ▼" pour déplier la section
- Essaie de vider la barre de recherche

### L'annonce disparaît après approbation
- Normal ! Elle passe au statut "approved" (active)
- Change le filtre "Statut" → "Approuvées" pour la retrouver

---

## 📊 Exemple complet

### Scénario : "Modérer l'Alfa Romeo avec prix suspect"

1. **Filtre** : active "🚨 Prix suspects"
2. **Annonce visible** : "Alfa Romeo 2003 - 4 000 000 000 000 CFA ⚠️"
3. **Clique** sur l'annonce
4. **Vérifie** les détails à droite
5. **Constate** : le prix est aberrant (4 trillions !)
6. **Clique** "Refuser l'annonce"
7. **Entre la raison** : "Prix incorrect (4 000 000 000 000 CFA). Veuillez corriger et soumettre à nouveau."
8. **Confirme**
9. ✅ Le vendeur reçoit un email avec la raison
10. ✅ Les stats passent : "En attente -1", "Rejetées +1"

---

## 🎉 Résultat

Tu peux maintenant **modérer efficacement** des **centaines d'annonces** avec :
- ✅ **Statistiques en temps réel**
- ✅ **Filtres intelligents** (statut + prix)
- ✅ **Détection automatique** des prix suspects
- ✅ **Tri en 1 clic**
- ✅ **Pagination** (20 par page)
- ✅ **Badges colorés** par statut

---

## 🔗 Liens utiles

- Page Admin Modération : https://annonceauto.ci/dashboard/moderation
- Supabase Dashboard : https://supabase.com/dashboard/project/vnhwllsawfaueivykhly
- Documentation complète : `AMELIORATIONS_ADMIN_MODERATION.md`
- Guide Crédits : `GUIDE_ADMIN_CREDITS_RAPIDE.md`





