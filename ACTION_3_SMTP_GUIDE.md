# 📧 ACTION 3 : CONFIGURER SMTP / EMAIL

**Durée** : 10 minutes (ou 2 min si option rapide)  
**Objectif** : Permettre l'inscription sans erreur d'email

---

## 🎯 **PROBLÈME ACTUEL**

Lors de l'inscription, Supabase essaie d'envoyer un **email de confirmation**, mais :
- Pas de SMTP configuré → ❌ Erreur
- L'utilisateur ne reçoit pas l'email
- Inscription bloquée

---

## ✅ **2 OPTIONS AU CHOIX**

### **OPTION A : Désactiver confirmation email** ⚡ (2 min - RAPIDE)

**Avantages** :
- ✅ Inscription immédiate
- ✅ Pas de configuration
- ✅ Parfait pour dev/beta

**Inconvénients** :
- ⚠️ Pas de validation d'email
- ⚠️ Possibilité d'emails invalides

**Comment faire :**

1. Va sur **Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/auth/providers
   ```

2. Clique sur **"Email"** dans la liste des providers

3. **Désactive** "Confirm email"
   - Toggle sur **OFF**

4. Clique **"Save"**

5. ✅ **Terminé !** Les utilisateurs peuvent s'inscrire immédiatement

---

### **OPTION B : Configurer SMTP Resend** 🌟 (10 min - PRO)

**Avantages** :
- ✅ Emails professionnels
- ✅ Validation d'email
- ✅ Meilleure sécurité
- ✅ 3000 emails/mois gratuits

**Inconvénients** :
- ⏱️ Configuration supplémentaire
- 📝 Compte externe requis

**Comment faire :**

#### **Étape 1 : Créer compte Resend** (3 min)

1. Va sur **https://resend.com/signup**

2. Inscris-toi avec ton email

3. Vérifie ton email

4. Connecte-toi au dashboard Resend

---

#### **Étape 2 : Générer une API Key** (2 min)

1. Dans Resend Dashboard, clique **"API Keys"**

2. Clique **"Create API Key"**

3. Nom : `AnnonceAuto Supabase`

4. Permission : **"Sending access"**

5. Clique **"Create"**

6. **COPIE LA CLÉ** (commence par `re_...`)
   - ⚠️ Tu ne pourras plus la voir après !

---

#### **Étape 3 : Configurer domaine** (optionnel - 3 min)

Si tu as un domaine (ex: `annonceauto.ci`) :

1. Dans Resend → **"Domains"** → **"Add Domain"**

2. Entre ton domaine : `annonceauto.ci`

3. Ajoute les enregistrements DNS fournis :
   - SPF
   - DKIM
   - DMARC

4. Attends la vérification (quelques minutes)

**Si tu n'as pas de domaine** : Utilise `onboarding.resend.dev` (domaine de test)

---

#### **Étape 4 : Configurer Supabase** (2 min)

1. Va sur **Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/settings/auth
   ```

2. Scroll vers **"SMTP Settings"**

3. **Active** "Enable Custom SMTP" → **ON**

4. **Remplis les champs** :
   ```
   Host: smtp.resend.com
   Port: 465
   Username: resend
   Password: [COLLE_TA_CLE_API_RESEND_ICI]
   
   Sender email: noreply@annonceauto.ci
   (ou noreply@onboarding.resend.dev si pas de domaine)
   
   Sender name: AnnonceAuto.ci
   ```

5. Clique **"Save"**

---

#### **Étape 5 : Tester** (1 min)

1. Clique sur **"Send test email"**

2. Entre ton email

3. Vérifie ta boîte mail

4. ✅ Si tu reçois l'email → **Configuré !**

---

## 🎯 **QUELLE OPTION CHOISIR ?**

### **Choisis Option A si :**
- ✅ Tu veux tester rapidement
- ✅ C'est pour du dev/beta privé
- ✅ Tu configures SMTP plus tard

### **Choisis Option B si :**
- ✅ Tu veux un site pro
- ✅ Tu as 10 minutes
- ✅ Tu veux valider les emails

---

## 📝 **RÉCAPITULATIF**

| Critère | Option A | Option B |
|---------|----------|----------|
| **Temps** | 2 min ⚡ | 10 min |
| **Difficulté** | Facile | Moyenne |
| **Emails envoyés** | ❌ Non | ✅ Oui |
| **Validation email** | ❌ Non | ✅ Oui |
| **Coût** | Gratuit | Gratuit (3k/mois) |
| **Production ready** | ⚠️ Non | ✅ Oui |

---

## 💡 **MA RECOMMANDATION**

Pour le moment : **Option A** (2 min)
- Lance la beta rapidement
- Configure SMTP plus tard (avant lancement public)

Pour la prod : **Option B** (10 min)
- Emails pro
- Meilleure expérience utilisateur

---

## ✅ **APRÈS CETTE ACTION**

Une fois fait, on passe à :
- **Action 4** : Backup BDD (5 min)
- **Action 5** : Tests complets (30 min)

---

**Quelle option tu choisis ? A (rapide) ou B (pro) ?** 🤔


