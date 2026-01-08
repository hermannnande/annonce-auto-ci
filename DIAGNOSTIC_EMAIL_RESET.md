# 🔴 DIAGNOSTIC : EMAIL MOT DE PASSE OUBLIÉ PAS REÇU

**Date** : 26 Décembre 2024  
**Problème** : Email de reset pas reçu

---

## ✅ **VÉRIFICATIONS IMMÉDIATES (2 min)**

### **1. Vérifier le dossier SPAM** (30 secondes)

📧 **Vérifie ces dossiers** :
- Spam / Courrier indésirable
- Promotions
- Tous les messages

**Email sender** : Cherche un email de :
- `noreply@onboarding.resend.dev`
- Ou `noreply@annonceauto.ci`
- Sujet : "Reset Password" ou "Réinitialiser mot de passe"

---

### **2. Vérifier les logs Resend** (1 min)

👉 **Clique ce lien** :
```
https://resend.com/emails
```

**Ce que tu dois voir** :
- Si l'email apparaît dans la liste → Email envoyé ✅ (problème de réception)
- Si l'email n'apparaît PAS → Email pas envoyé ❌ (problème SMTP)

---

## 🛠️ **SI L'EMAIL N'EST PAS DANS RESEND**

### **CAUSE : SMTP pas bien configuré**

#### **Étape 1 : Revérifier la config SMTP Supabase**

👉 **Clique ce lien** :
```
https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/settings/auth
```

**Scroll vers "SMTP Settings"**

**Vérifie que :**
- [ ] Enable Custom SMTP : **ON** (toggle vert)
- [ ] Host : `smtp.resend.com`
- [ ] Port : `465`
- [ ] Username : `resend`
- [ ] Password : `re_fkhvfrAt_8yXGWpUyYx1gU332YFuLztaL`
- [ ] Sender email : `noreply@onboarding.resend.dev`
- [ ] Sender name : `AnnonceAuto`

**As-tu bien cliqué "Save" ?** ✅

---

#### **Étape 2 : Tester SMTP directement**

1. Sur la même page (SMTP Settings)
2. **Scroll tout en bas**
3. Clique **"Send test email"**
4. Entre ton email : `hermannnande@gmail.com`
5. Clique "Send"
6. **Vérifie ta boîte mail** (et spam)

**Résultat** :
- ✅ Email reçu → SMTP fonctionne
- ❌ Email pas reçu → Problème de config

---

## 🛠️ **SI L'EMAIL EST DANS RESEND MAIS PAS REÇU**

### **CAUSE : Problème de délivrabilité**

#### **Solution 1 : Vérifier le statut dans Resend**

1. Va sur https://resend.com/emails
2. Clique sur l'email envoyé
3. Regarde le **statut** :
   - `delivered` ✅ = Envoyé avec succès
   - `bounced` ❌ = Rejeté par le serveur
   - `complained` ❌ = Marqué spam

---

#### **Solution 2 : Tester avec un autre email**

1. Réessaie "Mot de passe oublié"
2. Mais avec un **autre email** (si tu en as un)
3. Ou crée un compte temporaire : Gmail, Outlook, etc.

---

## 🛠️ **SI LE TEST SMTP NE MARCHE PAS**

### **Problème : Clé API Resend invalide**

#### **Solution : Régénérer une nouvelle clé API**

1. Va sur **Resend Dashboard**
   ```
   https://resend.com/api-keys
   ```

2. **Supprime l'ancienne clé** (si tu veux)

3. Clique **"Create API Key"**
   ```
   Name: AnnonceAuto Supabase V2
   Permission: Sending access
   ```

4. **COPIE LA NOUVELLE CLÉ** : `re_...`

5. **Retourne dans Supabase → Auth Settings → SMTP**

6. **Remplace** le Password par la **nouvelle clé**

7. **Save**

8. **Teste** à nouveau : "Send test email"

---

## 🛠️ **SI ÇA NE MARCHE TOUJOURS PAS**

### **Option de secours : Désactiver SMTP temporairement**

Si tu veux juste tester le reste du site sans bloquer sur l'email :

1. Supabase → Auth Settings → SMTP
2. **Désactive** "Enable Custom SMTP" → **OFF**
3. Les utilisateurs ne pourront pas reset leur mot de passe, mais le reste fonctionne

---

## 📋 **CHECKLIST DE DIAGNOSTIC**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | Vérifier spam | ⏸️ À faire |
| 2 | Vérifier Resend logs | ⏸️ À faire |
| 3 | Vérifier config SMTP Supabase | ⏸️ À faire |
| 4 | Tester "Send test email" | ⏸️ À faire |
| 5 | Régénérer clé API Resend (si besoin) | ⏸️ À faire |

---

## 🎯 **PROCHAINE ÉTAPE**

**Commence par :**

1. ✅ **Vérifier spam** (30 sec)
2. ✅ **Vérifier Resend logs** (1 min)
   ```
   https://resend.com/emails
   ```

**Puis dis-moi ce que tu vois !** 🔍

---

**Je t'aide à résoudre ça ! 🚀**








