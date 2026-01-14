# 🚀 Guide Rapide : Page Admin Crédits

## ⚡ Accès rapide
👉 **https://annonceauto.ci/dashboard/credits**

---

## 📊 Vue d'ensemble

### 1️⃣ Statistiques (en haut)
```
[Vendeurs actifs]  [Crédits en circulation]  [Revenus totaux]  [Crédits achetés]
      11                    11150                  0K                  0
```

### 2️⃣ Transactions récentes (pliable)
Affiche les 10 dernières transactions :
- Qui a reçu/dépensé des crédits
- Montant (+/-)
- Date

### 3️⃣ Recherche et filtres
- 🔍 Barre de recherche : taper nom ou email
- 🔽 Filtre par crédits : Tous / Faibles / Moyens / Élevés

### 4️⃣ Tableau des vendeurs
Colonnes :
- **Vendeur** (nom + avatar)
- **Email**
- **Crédits** (badge vert)
- **Membre depuis** (mois + année)
- **Actions** : [Ajouter] [Retirer] [Offrir]

### 5️⃣ Pagination (en bas)
```
Page 1 sur 5 (67 résultats)    [<] [1] [2] [3] [4] [5] [>]
```

---

## 🎯 Actions principales

### ➕ Ajouter des crédits
1. Clique **"Ajouter"** à côté du vendeur
2. Entre le **montant** (ex: 100)
3. Entre la **raison** (ex: "Bonus de bienvenue")
4. Clique **"Confirmer"**
5. ✅ Toast vert de confirmation
6. Le solde du vendeur **augmente immédiatement**

### ➖ Retirer des crédits
1. Clique **"Retirer"**
2. Entre le montant (ex: 50)
3. Entre la raison (ex: "Correction erreur")
4. Confirme
5. ✅ Le solde diminue (ne peut pas être négatif)

### 🎁 Offrir des crédits
Identique à "Ajouter", mais :
- Type de transaction = `gift` (au lieu de `admin_adjustment`)
- Utilisé pour les cadeaux/promotions

---

## 🔍 Utiliser les filtres

### Recherche par nom/email
Tape dans la barre de recherche :
- `koffi` → affiche "Koffi Nande"
- `@gmail.com` → affiche tous les emails Gmail

### Filtrer par crédits
Menu déroulant :
- **Tous** : affiche tout le monde
- **Faibles** : vendeurs avec < 50 crédits
- **Moyens** : entre 50 et 200 crédits
- **Élevés** : ≥ 200 crédits

---

## 📈 Trier les résultats

Clique sur les boutons en haut à droite :
- **Nom** : tri alphabétique A-Z ou Z-A
- **Crédits** : du plus petit au plus grand (ou inverse)
- **Date** : du plus récent au plus ancien (ou inverse)

**Indicateur** : Une icône `↕` apparaît sur le tri actif

---

## 📄 Naviguer dans les pages

### Si tu as plus de 15 vendeurs
- La pagination apparaît automatiquement
- Clique sur les **numéros de page** ou les **flèches** `<` `>`
- La page **scroll automatiquement en haut** lors du changement

---

## 💡 Astuces

### Voir les transactions récentes
1. Clique **"Afficher"** dans la section "Transactions récentes"
2. Les 10 dernières transactions apparaissent
3. **Vert** = ajout de crédits
4. **Rouge** = retrait/dépense de crédits

### Vérifier qu'un ajout a fonctionné
Après avoir ajouté des crédits :
1. ✅ Le **badge vert** du vendeur est mis à jour
2. ✅ Les **stats en haut** changent ("Crédits en circulation" +X)
3. ✅ La transaction apparaît dans **"Transactions récentes"**

### Retrouver un vendeur rapidement
- Utilise la **recherche** (nom ou email)
- OU utilise le **filtre** (ex: faibles crédits si tu cherches quelqu'un qui manque de crédits)
- OU utilise le **tri** (ex: tri par crédits décroissant pour voir les vendeurs avec le plus de crédits en premier)

---

## 🛡️ Sécurité

### Permissions requises
- ✅ Tu dois être **admin** pour accéder à cette page
- ✅ Seuls les **admins** peuvent modifier les crédits d'autres utilisateurs

### Vérifications automatiques
- ❌ Le solde ne peut **jamais** être négatif
- ✅ Toutes les actions sont **enregistrées** dans `credits_transactions`
- ✅ L'ID de l'admin qui a fait l'action est **sauvegardé** (`admin_id`)

---

## 🐛 Dépannage

### "Aucun vendeur trouvé"
- Vérifie qu'il y a bien des vendeurs inscrits (`user_type = vendor`)
- Vérifie les filtres (essaie "Tous les vendeurs")

### L'ajout de crédits ne fonctionne pas
- Vérifie que tu es bien **admin**
- Vérifie que la policy RLS `"Admins can update any profile"` existe
- Vérifie les logs de Supabase (Auth Logs / Database Logs)

### Les transactions récentes sont vides
- Normal si aucune transaction n'a été faite
- Fais un ajout/retrait de crédit → ça apparaîtra

---

## 📊 Exemple complet

### Scénario : "Koffi Nande a besoin de 100 crédits bonus"

1. **Recherche** : tape "koffi" dans la barre de recherche
2. **Koffi Nande** apparaît (solde actuel : 100 crédits)
3. Clique **"Ajouter"**
4. Entre **100** dans "Montant"
5. Entre **"Bonus de bienvenue"** dans "Raison"
6. Clique **"Confirmer"**
7. ✅ Toast : "Ajout de 100 crédits réussi pour Koffi Nande"
8. Le solde de Koffi est maintenant **200 crédits**
9. Dans "Transactions récentes" : 
   ```
   Koffi Nande            +100 crédits
   Bonus de bienvenue     27/12/2025
   ```

---

## 🎉 Résultat

Tu peux maintenant **gérer facilement** des **milliers de vendeurs** avec :
- ✅ Pagination (15 par page)
- ✅ Recherche instantanée
- ✅ Filtres intelligents
- ✅ Tri en 1 clic
- ✅ Transactions récentes visibles

---

## 🔗 Liens utiles

- Page Admin Crédits : https://annonceauto.ci/dashboard/credits
- Supabase Dashboard : https://supabase.com/dashboard/project/vnhwllsawfaueivykhly
- Documentation complète : `AMELIORATIONS_ADMIN_CREDITS.md`








