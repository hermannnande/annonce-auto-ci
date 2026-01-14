# 🧪 ACTION 5 : TESTS COMPLETS

**Durée** : 30 minutes  
**Objectif** : Vérifier que tout fonctionne sur le site

---

## 📊 **PROGRESSION**

### ✅ **Actions complétées (4/5)**
- [x] ✅ Action 1 : Migration SQL réputation
- [x] ✅ Action 2 : Messages vocaux (RLS + CSP)
- [x] ✅ Action 3 : SMTP / Email
- [x] ✅ Action 4 : Backups BDD

### 🔄 **Action en cours (1/5)**
- [ ] 🔄 **Action 5 : Tests complets** (EN COURS)

---

## 🧪 **PLAN DE TESTS (30 min)**

### **TEST 1 : Authentification** (5 min)

#### **A. Inscription**
1. Va sur ton site : https://annonceauto.ci (ou localhost si dev)
2. Déconnecte-toi si connecté
3. Clique **"S'inscrire"**
4. Crée un nouveau compte :
   ```
   Email: test.final@example.com
   Nom complet: Test Final
   Mot de passe: TestFinal123!
   Type: Acheteur
   ```
5. ✅ **Résultat attendu** : Redirection immédiate vers dashboard (pas d'email de confirmation)

---

#### **B. Connexion / Déconnexion**
1. Déconnecte-toi
2. Reconnecte-toi avec le compte créé
3. ✅ **Résultat attendu** : Connexion réussie

---

#### **C. Mot de passe oublié**
1. Déconnecte-toi
2. Clique **"Mot de passe oublié"**
3. Entre l'email : `test.final@example.com`
4. ✅ **Résultat attendu** : 
   - Message "Email envoyé"
   - Email reçu (vérifier boîte + spam)
   - Lien fonctionne
   - Peut changer le mot de passe

---

### **TEST 2 : Annonces** (8 min)

#### **A. Créer une annonce**
1. Connecte-toi
2. Va sur **"Vendre"** ou **"Créer une annonce"**
3. Remplis le formulaire complet :
   ```
   Titre: BMW Série 3 2020 Test
   Marque: BMW
   Modèle: Série 3
   Année: 2020
   Kilométrage: 35000
   Prix: 18000000 FCFA
   Description: Véhicule test pour validation
   Photos: Ajoute 3-4 photos
   ```
4. Publie l'annonce
5. ✅ **Résultat attendu** : Annonce créée et visible

---

#### **B. Voir l'annonce**
1. Va sur la page d'accueil
2. Cherche ton annonce
3. Clique dessus
4. ✅ **Résultat attendu** : 
   - Photos visibles
   - Détails corrects
   - Prix affiché
   - Bouton "Contacter" visible

---

#### **C. Modifier l'annonce**
1. Va dans **"Mes annonces"** (dashboard vendeur)
2. Clique **"Modifier"**
3. Change le prix : 17500000 FCFA
4. Sauvegarde
5. ✅ **Résultat attendu** : Prix mis à jour

---

#### **D. Recherche**
1. Va sur la page d'accueil
2. Utilise la barre de recherche : "BMW"
3. Applique des filtres (prix, année, etc.)
4. ✅ **Résultat attendu** : Résultats pertinents

---

### **TEST 3 : Messagerie & Vocaux** (10 min)

#### **A. Créer une conversation**
1. Sur l'annonce que tu as créée, clique **"Contacter le vendeur"**
   (ou connecte-toi avec un 2ème compte pour tester)
2. Envoie un message texte : "Bonjour, est-ce que le véhicule est disponible ?"
3. ✅ **Résultat attendu** : Message envoyé

---

#### **B. Message vocal** 🎤
1. Dans la conversation, clique sur le **micro** 🎤
2. Enregistre un message vocal (2-3 secondes) : "Test vocal final"
3. Envoie
4. ✅ **Résultat attendu** : 
   - Message vocal affiché avec durée
   - Player jaune visible
   - Bouton play ▶️ fonctionne
   - Audio se lit correctement

---

#### **C. Pièces jointes**
1. Dans la conversation, clique sur **"Ajouter pièce jointe"** 📎
2. Upload une image ou un document
3. Envoie
4. ✅ **Résultat attendu** : Pièce jointe visible et téléchargeable

---

### **TEST 4 : Favoris** (2 min)

1. Sur une annonce, clique sur le **cœur** ❤️
2. Va dans **"Mes favoris"**
3. ✅ **Résultat attendu** : Annonce dans les favoris
4. Clique à nouveau sur le cœur (retirer)
5. ✅ **Résultat attendu** : Annonce retirée des favoris

---

### **TEST 5 : Crédits & Boost** (3 min)

#### **A. Vérifier les crédits**
1. Va dans le dashboard vendeur
2. Cherche **"Mes crédits"** ou l'affichage du solde
3. ✅ **Résultat attendu** : Solde de crédits visible

---

#### **B. Booster une annonce** (si tu as des crédits)
1. Va dans **"Mes annonces"**
2. Clique **"Booster"** sur une annonce
3. Choisis un type de boost (Top, Premium, etc.)
4. Confirme
5. ✅ **Résultat attendu** : 
   - Crédits déduits
   - Badge "Top" ou "Premium" visible sur l'annonce

---

### **TEST 6 : Dashboard Vendeur** (2 min)

1. Va dans le **Dashboard Vendeur**
2. Vérifie les sections :
   - Mes annonces
   - Mes crédits
   - Mes conversations
   - Statistiques (vues, favoris)
3. ✅ **Résultat attendu** : Toutes les infos visibles et correctes

---

## 📋 **CHECKLIST DE TEST**

| Test | Fonctionnalité | Statut |
|------|----------------|--------|
| 1A | Inscription immédiate | ⏸️ À tester |
| 1B | Connexion / Déconnexion | ⏸️ À tester |
| 1C | Mot de passe oublié | ⏸️ À tester |
| 2A | Créer annonce | ⏸️ À tester |
| 2B | Voir annonce | ⏸️ À tester |
| 2C | Modifier annonce | ⏸️ À tester |
| 2D | Recherche | ⏸️ À tester |
| 3A | Message texte | ⏸️ À tester |
| 3B | Message vocal 🎤 | ⏸️ À tester |
| 3C | Pièce jointe | ⏸️ À tester |
| 4 | Favoris | ⏸️ À tester |
| 5A | Crédits | ⏸️ À tester |
| 5B | Boost annonce | ⏸️ À tester |
| 6 | Dashboard vendeur | ⏸️ À tester |

---

## 🐛 **SI TU TROUVES UN BUG**

Note-le avec :
- ✍️ Quelle fonctionnalité ?
- ✍️ Quelles étapes pour reproduire ?
- ✍️ Message d'erreur (console F12) ?

Et dis-moi, on corrigera ensemble ! 🛠️

---

## ✅ **APRÈS LES TESTS**

Une fois les tests terminés, on fera un **bilan final** :
- ✅ Fonctionnalités OK
- ⚠️ Bugs à corriger (s'il y en a)
- 🚀 Site prêt pour la beta !

---

**Commence les tests maintenant ! Prends ton temps et note tout ce qui ne marche pas ! 🧪**

**Site** : https://annonceauto.ci (ou http://localhost:5173)









