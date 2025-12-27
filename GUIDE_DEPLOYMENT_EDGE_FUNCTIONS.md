# 🔐 Authentification Supabase CLI + Déploiement Edge Functions

## ✅ Statut actuel
- ✅ **Scoop** installé
- ✅ **Supabase CLI** installé (v2.67.1)
- ⏳ **Login** requis (token d'accès)

---

## 🚀 Option 1 : Login interactif (RECOMMANDÉ)

### Ouvre un **nouveau PowerShell** (pas dans Cursor) :

```powershell
cd C:\Users\nande\Desktop\annonce-auto-ci
supabase login
```

**Ce qui va se passer** :
1. Une page web s'ouvre : `https://supabase.com/dashboard/account/tokens`
2. Tu te connectes avec ton compte Supabase
3. Un token est généré automatiquement
4. Le CLI se connecte

---

## 🔑 Option 2 : Token manuel (si Option 1 ne marche pas)

### 1. Va sur : https://supabase.com/dashboard/account/tokens

### 2. Génère un **Access Token** :
- Nom : `annonce-auto-cli`
- Clique **Generate token**
- **Copie le token** (il s'affiche une seule fois !)

### 3. Dans PowerShell (projet) :

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_ton_token_ici"
```

Ou bien directement dans la commande de déploiement (plus simple) :

```powershell
supabase functions deploy payfonte-create-checkout --project-ref vnhwllsawfaueivykhly --token "sbp_ton_token_ici"
```

---

## 📦 Déployer les 3 Edge Functions

### Une fois connecté (Option 1 OU Option 2), lance :

```powershell
cd C:\Users\nande\Desktop\annonce-auto-ci

# Déployer les 3 functions
supabase functions deploy payfonte-create-checkout --project-ref vnhwllsawfaueivykhly
supabase functions deploy payfonte-verify-payment --project-ref vnhwllsawfaueivykhly
supabase functions deploy payfonte-webhook --project-ref vnhwllsawfaueivykhly
```

**Output attendu** (pour chaque function) :
```
✓ Deployed function payfonte-create-checkout on project vnhwllsawfaueivykhly
```

---

## 🔐 Vérifier les Secrets (OBLIGATOIRE)

Avant de tester, va dans **Supabase Dashboard → Edge Functions → Secrets** :

Secrets requis :
- ✅ `PAYFONTE_CLIENT_ID` = (ton client ID Payfonte)
- ✅ `PAYFONTE_CLIENT_SECRET` = (ton secret Payfonte)
- ✅ `PAYFONTE_WEBHOOK_URL` = `https://vnhwllsawfaueivykhly.supabase.co/functions/v1/payfonte-webhook`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = (depuis Dashboard → Settings → API → service_role key)
- ✅ `PAYFONTE_ENV` = `sandbox` (ou `production` si en prod)

---

## 🧪 Tester après déploiement

1. Va sur `https://www.annonceauto.ci/dashboard/vendeur/recharge`
2. Fais **Ctrl+Shift+R** (hard refresh)
3. Lance une recharge de crédit
4. **L'erreur CORS doit disparaître** ✅

---

## 🐛 Dépannage

### "Cannot use automatic login flow inside non-TTY"
→ Utilise **Option 2** (token manuel)

### "Invalid project ref"
→ Vérifie que `vnhwllsawfaueivykhly` est bien ton project ref dans Supabase Dashboard → Settings → General

### "Function failed to deploy"
→ Vérifie les logs : 
```powershell
supabase functions logs payfonte-create-checkout --project-ref vnhwllsawfaueivykhly
```

### CORS persiste après déploiement
→ Vérifie que les secrets sont bien configurés (surtout `PAYFONTE_CLIENT_ID` et `PAYFONTE_CLIENT_SECRET`)

---

## 📝 Commandes utiles

```powershell
# Lister les functions déployées
supabase functions list --project-ref vnhwllsawfaueivykhly

# Voir les logs d'une function
supabase functions logs payfonte-create-checkout --project-ref vnhwllsawfaueivykhly

# Supprimer une function
supabase functions delete payfonte-create-checkout --project-ref vnhwllsawfaueivykhly

# Version du CLI
supabase --version
```

---

## ✅ Résumé : ce que tu dois faire

1. **Ouvre un nouveau PowerShell** (normal, pas Cursor)
2. **Lance** : `supabase login` (ça ouvre un navigateur)
3. **Connecte-toi** à Supabase
4. **Reviens dans le terminal** et lance les 3 commandes de déploiement
5. **Vérifie les secrets** dans Supabase Dashboard
6. **Teste** la recharge de crédits sur le site

---

## 🎉 Après ça
- ✅ CORS corrigé
- ✅ Edge Functions déployées avec le bon schéma `credits_transactions`
- ✅ Recharge crédits fonctionnelle

---

**📢 Dis-moi quand tu as fait le login et déployé les functions !**

