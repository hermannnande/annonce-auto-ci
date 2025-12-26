# Configuration Payfonte pour AnnonceAuto.ci

## 🔐 Variables d'environnement

### Fichier `.env.local` (racine du projet)

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Payfonte Payment Gateway
VITE_PAYFONTE_CLIENT_ID=votre_client_id_payfonte
VITE_PAYFONTE_CLIENT_SECRET=votre_client_secret_payfonte
VITE_PAYFONTE_ENV=sandbox  # ou production
VITE_PAYFONTE_WEBHOOK_URL=https://votre-projet.supabase.co/functions/v1/payfonte-webhook
```

### Secrets Supabase (pour les Edge Functions)

Dans le dashboard Supabase → Project Settings → Edge Functions → Secrets, ajoutez :

```
PAYFONTE_CLIENT_ID = votre_client_id_payfonte
PAYFONTE_CLIENT_SECRET = votre_client_secret_payfonte
PAYFONTE_ENV = sandbox
PAYFONTE_WEBHOOK_URL = https://votre-projet.supabase.co/functions/v1/payfonte-webhook
```

---

## 🚀 Déploiement des Edge Functions

### 1. Installer Supabase CLI

```bash
npm install -g supabase
```

### 2. Login Supabase

```bash
supabase login
```

### 3. Lier votre projet

```bash
supabase link --project-ref votre-projet-id
```

### 4. Déployer les Edge Functions

```bash
# Déployer la fonction de création de checkout
supabase functions deploy payfonte-create-checkout

# Déployer la fonction de vérification
supabase functions deploy payfonte-verify-payment

# Déployer le webhook
supabase functions deploy payfonte-webhook
```

### 5. Définir les secrets

```bash
supabase secrets set PAYFONTE_CLIENT_ID=votre_client_id
supabase secrets set PAYFONTE_CLIENT_SECRET=votre_secret
supabase secrets set PAYFONTE_ENV=sandbox
supabase secrets set PAYFONTE_WEBHOOK_URL=https://votre-projet.supabase.co/functions/v1/payfonte-webhook
```

---

## 🔗 Configuration Payfonte Dashboard

### 1. Créer un compte sur Payfonte

Allez sur https://dashboard.payfonte.com/ et créez un compte.

### 2. Obtenir vos clés API

- Dashboard → Settings → API Keys
- Copiez votre `Client ID` et `Client Secret`

### 3. Configurer le webhook

- Dashboard → Settings → Webhooks
- URL: `https://votre-projet.supabase.co/functions/v1/payfonte-webhook`
- Events: Sélectionnez "Payment Success", "Payment Failed", "Payment Cancelled"

---

## 📋 Flow de paiement

### 1. Recharge de crédits

```typescript
import { payfonteService } from './services/payfonte.service';

// Créer un checkout pour recharger des crédits
const result = await payfonteService.createCreditsPurchaseCheckout(
  userId,
  100000, // Montant en FCFA (100 000 FCFA)
  1000,   // Nombre de crédits
  '[email protected]',
  'Jean Kouassi',
  '+2250708000000'
);

if (result.success && result.data) {
  // Rediriger vers la page de paiement Payfonte
  window.location.href = result.data.shortURL;
}
```

### 2. Boost d'annonce

```typescript
// Créer un checkout pour booster une annonce
const result = await payfonteService.createBoostCheckout(
  userId,
  listingId,
  'pro', // Plan ID
  50000, // Montant en FCFA
  '[email protected]',
  'Jean Kouassi',
  '+2250708000000'
);

if (result.success && result.data) {
  window.location.href = result.data.shortURL;
}
```

### 3. Callback après paiement

Après le paiement, Payfonte redirige vers :
```
https://votre-site.com/payfonte/callback?status=success&reference=CREDITS-123456
```

La page `/payfonte/callback` vérifie automatiquement le paiement.

### 4. Webhook (automatique)

Payfonte appelle le webhook automatiquement :
- ✅ Crédite l'utilisateur si le paiement réussit
- ❌ Met à jour le statut si le paiement échoue

---

## 🧪 Tests

### Mode Sandbox

En mode sandbox (`PAYFONTE_ENV=sandbox`), utilisez les cartes de test Payfonte :

- **Carte réussie**: `5531886652142950`
- **Carte échouée**: `5061460410120223901`
- **CVV**: n'importe quel 3 chiffres
- **Date d'expiration**: n'importe quelle date future

### Mode Production

Passez à `PAYFONTE_ENV=production` et utilisez les vraies clés API de production.

---

## 📊 Monitoring

### Logs des Edge Functions

```bash
supabase functions logs payfonte-create-checkout
supabase functions logs payfonte-verify-payment
supabase functions logs payfonte-webhook
```

### Dashboard Supabase

- Tables → `credits_transactions` : Voir toutes les transactions
- Realtime : Écouter les mises à jour en temps réel

---

## 🔒 Sécurité

✅ **Client ID et Secret** : Stockés côté serveur uniquement (Edge Functions)
✅ **Authentification** : Toutes les Edge Functions vérifient l'auth Supabase
✅ **Vérification** : Chaque paiement est vérifié auprès de l'API Payfonte
✅ **Webhook sécurisé** : Le webhook utilise la clé service_role (bypass RLS)

---

## 📞 Support

- Documentation Payfonte : https://docs.payfonte.com/
- Support Payfonte : [email protected]
- Supabase Docs : https://supabase.com/docs




