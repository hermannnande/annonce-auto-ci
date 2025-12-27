# 🐛 Diagnostic Erreur Recharge Crédits

## 🚨 Erreur actuelle
```
Edge Function returned a non-2xx status code
```

L'Edge Function `payfonte-create-checkout` renvoie une erreur (probablement 400, 401, ou 500).

---

## 🔍 **ÉTAPE 1 : Voir les logs Supabase**

1. Va sur : **https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/logs/edge-functions**
2. Sélectionne **"payfonte-create-checkout"** dans le menu déroulant
3. **Regarde les derniers logs** (refresh si besoin)
4. **Cherche une ligne rouge** (erreur) avec :
   - Le message d'erreur exact
   - Le code HTTP (400, 401, 500...)
   - La stack trace

**Copie-moi le message d'erreur complet !**

---

## 🔑 **ÉTAPE 2 : Vérifier les Secrets (cause probable)**

### Va vérifier que TOUS les secrets sont bien définis :

**Supabase Dashboard → Edge Functions → Secrets**

Tu dois avoir **EXACTEMENT** :

| Nom du secret | Valeur | Statut |
|---------------|--------|--------|
| `PAYFONTE_CLIENT_ID` | (ton client ID) | ✅ |
| `PAYFONTE_CLIENT_SECRET` | (ton secret) | ✅ |
| `PAYFONTE_WEBHOOK_URL` | `https://vnhwllsawfaueivykhly.supabase.co/functions/v1/payfonte-webhook` | ✅ |
| `PAYFONTE_ENV` | `sandbox` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | (service_role key depuis Settings → API) | ✅ |

---

## 🐛 **Causes possibles**

### 1. Secrets manquants
**Symptôme** : L'Edge Function ne peut pas appeler l'API Payfonte.

**Log typique** :
```
❌ Erreur Payfonte: { message: 'Unauthorized', code: 401 }
```

**Solution** : Ajoute tous les secrets (voir tableau ci-dessus).

---

### 2. Secrets incorrects
**Symptôme** : `PAYFONTE_CLIENT_ID` ou `PAYFONTE_CLIENT_SECRET` invalides.

**Log typique** :
```
❌ Erreur Payfonte: { message: 'Invalid credentials', code: 401 }
```

**Solution** : Vérifie que les clés Payfonte sont correctes (va sur ton compte Payfonte).

---

### 3. Schéma DB incorrect
**Symptôme** : L'Edge Function ne peut pas insérer dans `credits_transactions`.

**Log typique** :
```
⚠️ Erreur sauvegarde transaction: { code: 'PGRST204', message: 'Could not find column...' }
```

**Solution** : Exécute le script `FIX_SUPABASE_SCHEMA_CACHE.sql` dans Supabase SQL Editor.

---

### 4. RLS Policy manquante
**Symptôme** : L'Edge Function ne peut pas insérer dans `credits_transactions`.

**Log typique** :
```
⚠️ Erreur sauvegarde transaction: { code: '42501', message: 'new row violates row-level security policy' }
```

**Solution** : Exécute ce script SQL :

```sql
-- Policy pour permettre l'insertion via Edge Function
CREATE POLICY "Service role can insert transactions"
  ON credits_transactions FOR INSERT
  WITH CHECK (true);
```

---

### 5. Mauvaise URL webhook
**Symptôme** : Payfonte ne peut pas appeler le webhook.

**Solution** : Vérifie que `PAYFONTE_WEBHOOK_URL` est bien :
```
https://vnhwllsawfaueivykhly.supabase.co/functions/v1/payfonte-webhook
```

---

## 📋 **Checklist de diagnostic**

- [ ] J'ai ajouté **tous les secrets** (5 au total)
- [ ] J'ai vérifié que `PAYFONTE_CLIENT_ID` et `PAYFONTE_CLIENT_SECRET` sont **corrects**
- [ ] J'ai exécuté `FIX_SUPABASE_SCHEMA_CACHE.sql` (refresh cache)
- [ ] J'ai regardé les **logs** de l'Edge Function
- [ ] J'ai fait **Ctrl+Shift+R** sur la page de recharge

---

## 🚀 **Actions immédiates**

### 1️⃣ Va voir les logs
**https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/logs/edge-functions**
→ Sélectionne `payfonte-create-checkout`
→ Copie l'erreur

### 2️⃣ Vérifie les secrets
**https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/settings/functions**
→ Clique "Manage secrets"
→ Ajoute ceux qui manquent

### 3️⃣ Teste à nouveau
**https://www.annonceauto.ci/dashboard/vendeur/recharge**
→ Ctrl+Shift+R
→ Relance une recharge

---

**📢 Envoie-moi le message d'erreur exact depuis les logs Supabase ! (logs/edge-functions)** 🔍

