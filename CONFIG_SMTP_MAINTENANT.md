# ⚡ CONFIGURATION SMTP - GUIDE ULTRA-RAPIDE

**Clé API Resend** : `re_fkhvfrAt_8yXGWpUyYx1gU332YFuLztaL` ✅

---

## 🚀 **ÉTAPE 1 : CONFIGURER SMTP** (3 minutes)

### **1. Ouvrir Supabase Auth Settings**

👉 **Clique ce lien** :
```
https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/settings/auth
```

---

### **2. Activer SMTP**

Scroll vers le bas jusqu'à **"SMTP Settings"**

**Active** "Enable Custom SMTP" → **ON** ✅

---

### **3. Remplir les champs**

**Copie-colle exactement ça** :

```
Host: smtp.resend.com
Port: 465
Minimum TLS Version: TLSv1.2
Username: resend
Password: re_fkhvfrAt_8yXGWpUyYx1gU332YFuLztaL

Sender email: noreply@onboarding.resend.dev
Sender name: AnnonceAuto
```

---

### **4. Sauvegarder**

Clique **"Save"** en bas ✅

---

### **5. Tester (optionnel)**

Clique **"Send test email"** en bas

Entre ton email → Clique "Send"

Vérifie ta boîte mail (et spam) → Email reçu = ✅ SMTP fonctionne !

---

## 🚀 **ÉTAPE 2 : DÉSACTIVER CONFIRMATION EMAIL** (1 minute)

### **1. Ouvrir Auth Providers**

👉 **Clique ce lien** :
```
https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/auth/providers
```

---

### **2. Modifier Email Provider**

Clique sur **"Email"** dans la liste

---

### **3. Désactiver confirmation**

**Cherche** "Confirm email"

**Désactive-le** → **OFF** ✅

```
[ ] Confirm email
```

---

### **4. Sauvegarder**

Clique **"Save"** en bas ✅

---

## ✅ **TERMINÉ !**

### **Résultat attendu :**

✅ **Inscription** : Immédiate sans email de confirmation  
✅ **Mot de passe oublié** : Email de reset envoyé via Resend

---

## 🧪 **TESTER MAINTENANT**

### **Test 1 : Inscription (doit être immédiate)**

1. Va sur ton site
2. Déconnecte-toi si connecté
3. Clique "S'inscrire"
4. Entre un nouvel email test :
   ```
   test789@example.com
   Password: Test123456!
   ```
5. ✅ **Résultat attendu** : Redirection immédiate vers dashboard

---

### **Test 2 : Reset mot de passe (doit envoyer email)**

1. Déconnecte-toi
2. Clique "Mot de passe oublié"
3. Entre l'email test : `test789@example.com`
4. Clique "Envoyer"
5. ✅ **Résultat attendu** : 
   - Message "Email envoyé"
   - Email reçu dans la boîte (vérifier spam aussi)
   - Lien dans l'email fonctionne
   - Peut changer le mot de passe

---

## 🐛 **SI PROBLÈME**

### **Email de reset pas reçu ?**

1. **Vérifier spam/courrier indésirable**
2. **Vérifier logs Resend** :
   ```
   https://resend.com/emails
   ```
   → Voir si l'email a été envoyé
3. **Refaire le test SMTP** dans Supabase
4. **Vérifier que tu as bien Save** les paramètres

---

### **Inscription ne marche pas ?**

1. **Vérifier** que "Confirm email" est bien **OFF**
2. **Recharger la page** du site (Ctrl+F5)
3. **Vérifier console** (F12) pour erreurs

---

## 📋 **CHECKLIST**

- [ ] SMTP configuré dans Supabase (Step 1)
- [ ] Email test envoyé avec succès
- [ ] "Confirm email" désactivé (Step 2)
- [ ] Test inscription → Fonctionne immédiatement ✅
- [ ] Test reset mot de passe → Email reçu ✅

---

## ⏱️ **TEMPS TOTAL : 4 MINUTES**

- Configurer SMTP : 3 min
- Désactiver confirmation : 1 min

---

## 🎯 **APRÈS CETTE ACTION**

✅ Action 3 terminée !

**Prochaines actions :**
- **Action 4** : Backup BDD (5 min)
- **Action 5** : Tests complets (30 min)

**Temps restant** : ~35 minutes → Site 100% prêt ! 🚀

---

**Commence maintenant ! Clique le premier lien ! 👆**


