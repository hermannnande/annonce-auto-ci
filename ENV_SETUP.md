# Configuration des Variables d'Environnement

## 📝 Fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec ce contenu :

```env
# =====================================================
# SUPABASE
# =====================================================
VITE_SUPABASE_URL=https://vnhwllsawfaueivykhly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaHdsbHNhd2ZhdWVpdnlraGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzczMTgsImV4cCI6MjA4MjAxMzMxOH0.W4td5ZTiGYxqutPAyGGcGpkRNlXW1PJfQ5JCb-BZt64

# =====================================================
# PAYFONTE (Payment Gateway)
# =====================================================
# ⚠️ REMPLACEZ PAR VOS VRAIES CLÉS PAYFONTE
VITE_PAYFONTE_CLIENT_ID=votre_payfonte_client_id_ici
VITE_PAYFONTE_CLIENT_SECRET=votre_payfonte_client_secret_ici
VITE_PAYFONTE_ENV=sandbox
VITE_PAYFONTE_WEBHOOK_URL=https://vnhwllsawfaueivykhly.supabase.co/functions/v1/payfonte-webhook

# =====================================================
# SITE
# =====================================================
VITE_SITE_URL=http://localhost:5173
```

## 🔐 Secrets Supabase (Pour les Edge Functions)

Dans le dashboard Supabase, allez dans **Project Settings → Edge Functions → Secrets** et ajoutez :

```
PAYFONTE_CLIENT_ID = votre_payfonte_client_id
PAYFONTE_CLIENT_SECRET = votre_payfonte_client_secret  
PAYFONTE_ENV = sandbox
PAYFONTE_WEBHOOK_URL = https://vnhwllsawfaueivykhly.supabase.co/functions/v1/payfonte-webhook
```

Ou via la CLI :

```bash
supabase secrets set PAYFONTE_CLIENT_ID=votre_client_id
supabase secrets set PAYFONTE_CLIENT_SECRET=votre_secret
supabase secrets set PAYFONTE_ENV=sandbox
supabase secrets set PAYFONTE_WEBHOOK_URL=https://vnhwllsawfaueivykhly.supabase.co/functions/v1/payfonte-webhook
```

## 📋 Où obtenir les clés Payfonte ?

1. Allez sur https://dashboard.payfonte.com/
2. Créez un compte (ou connectez-vous)
3. Allez dans **Settings → API Keys**
4. Copiez votre **Client ID** et **Client Secret**

## 🧪 Mode Sandbox vs Production

### Sandbox (Test)
- `VITE_PAYFONTE_ENV=sandbox`
- Utilisez les clés API de test Payfonte
- Utilisez les cartes de test pour les paiements

### Production (Réel)
- `VITE_PAYFONTE_ENV=production`
- Utilisez les vraies clés API de production
- Les vrais paiements seront traités

## ✅ Vérification

Après avoir configuré les variables, vérifiez que tout fonctionne :

```bash
# Relancer le serveur de dev
pnpm dev

# Vérifier les Edge Functions
supabase functions list
```

Si tout est OK, vous devriez pouvoir :
- Accéder à la page de recharge
- Cliquer sur "Procéder au paiement"
- Être redirigé vers Payfonte



