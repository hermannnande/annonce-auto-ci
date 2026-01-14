# 🤖 Système d'Auto-Modération des Annonces

## 📋 Vue d'ensemble

Le système d'auto-modération **approuve automatiquement** les annonces après **5 minutes** si elles passent les vérifications de base (champs obligatoires + cohérence + mots-clés véhicules).

### ✅ Objectifs
- **Réduire la charge de modération** pour les admins
- **Accélérer la publication** des annonces valides
- **Bloquer le spam** automatiquement

---

## 🔍 Validations Effectuées

L'auto-modération vérifie automatiquement :

### 1. **Champs Obligatoires**
- ✅ Titre (≥ 5 caractères)
- ✅ Marque (≥ 2 caractères)
- ✅ Modèle (≥ 1 caractère)
- ✅ Au moins 1 image

### 2. **Cohérence des Données**
- ✅ Prix : entre 100 000 et 500 000 000 FCFA
- ✅ Année : entre 1990 et année actuelle + 1
- ✅ Kilométrage : entre 0 et 1 000 000 km

### 3. **Mots-Clés Véhicules**
Recherche dans le titre/description :
- Mots véhicules : `voiture`, `auto`, `véhicule`, `car`, `suv`, `berline`, etc.
- Termes techniques : `essence`, `diesel`, `automatique`, `manuelle`, `km`, etc.
- États : `neuf`, `occasion`, `importé`

### 4. **Marques Connues**
Validation contre une liste de ~50 marques :
- Toyota, Mercedes, BMW, Audi, Volkswagen, Ford, Peugeot, Renault, etc.

---

## ⚙️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  1. Vendeur publie annonce → status = 'pending'            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. CRON (toutes les 5 min) → appelle Edge Function        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Edge Function → auto_approve_pending_listings()         │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ├─────────────────────────────────────────┐
                    │                                         │
                    ▼                                         ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│  4a. Validation OK            │   │  4b. Validation ÉCHEC         │
│  → status = 'active'          │   │  → status = 'rejected'        │
│  ✅ Annonce publiée           │   │  ❌ Annonce rejetée           │
└───────────────────────────────┘   └───────────────────────────────┘
```

---

## 📂 Fichiers du Système

### 1. **Migration SQL**
**`supabase/migrations/011_auto_moderation.sql`**

Fonctions créées :
- `is_listing_valid_vehicle(listing_id)` : Valide une annonce
- `auto_approve_pending_listings()` : Approuve/rejette les annonces en attente
- `test_auto_moderation(listing_id)` : Teste la validation d'une annonce

### 2. **Edge Function**
**`supabase/functions/auto-moderation/index.ts`**

- Appelable via HTTP POST
- Sécurisée par clé API (`x-api-key`)
- Retourne JSON avec résultats (nb approuvées/rejetées)

### 3. **GitHub Actions CRON**
**`.github/workflows/auto-moderation-cron.yml`**

- Exécute toutes les **5 minutes**
- Appelle automatiquement l'Edge Function

---

## 🚀 Déploiement

### Étape 1 : Appliquer la Migration SQL

```bash
# Via Supabase CLI
supabase db push

# Ou via Dashboard Supabase
# SQL Editor → Coller le contenu de 011_auto_moderation.sql → Run
```

### Étape 2 : Déployer l'Edge Function

```bash
# Déployer la fonction
supabase functions deploy auto-moderation

# Définir le secret CRON (clé API sécurisée)
supabase secrets set CRON_SECRET=votre-cle-secrete-aleatoire
```

### Étape 3 : Configurer les Secrets GitHub

Dans **GitHub → Settings → Secrets and variables → Actions**, ajouter :

| Secret | Valeur |
|--------|--------|
| `SUPABASE_URL` | `https://votre-projet.supabase.co` |
| `SUPABASE_ANON_KEY` | Clé anon depuis Dashboard Supabase |
| `CRON_SECRET` | Même clé que celle définie dans Supabase |

### Étape 4 : Activer GitHub Actions

- Commit et push `.github/workflows/auto-moderation-cron.yml`
- Vérifier dans **Actions** → Le workflow doit s'exécuter toutes les 5 min

---

## 🧪 Tests

### Test Manuel d'une Annonce Spécifique

```sql
-- Tester si une annonce serait approuvée
SELECT test_auto_moderation('uuid-de-l-annonce');

-- Résultat:
-- {
--   "success": true,
--   "listing_id": "...",
--   "title": "Toyota Corolla 2020",
--   "current_status": "pending",
--   "is_valid": true,
--   "would_be_approved": true,
--   "age_minutes": 8.5
-- }
```

### Test Manuel de l'Auto-Approbation

```sql
-- Exécuter manuellement l'auto-modération
SELECT * FROM auto_approve_pending_listings();

-- Résultat:
-- approved_count | rejected_count | details (JSONB)
-- 3              | 1              | [{"id": "...", "action": "approved", ...}, ...]
```

### Test de l'Edge Function (via curl)

```bash
curl -X POST \
  "https://votre-projet.supabase.co/functions/v1/auto-moderation" \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "x-api-key: VOTRE_CRON_SECRET" \
  -H "Content-Type: application/json"
```

---

## 📊 Monitoring

### Voir les Logs Edge Function

```bash
# Via CLI
supabase functions logs auto-moderation

# Ou via Dashboard Supabase
# Edge Functions → auto-moderation → Logs
```

### Vérifier les Annonces Auto-Approuvées

```sql
-- Annonces approuvées récemment (dernières 24h)
SELECT id, title, brand, model, created_at, status
FROM listings
WHERE status = 'active'
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Vérifier les Annonces Auto-Rejetées

```sql
-- Annonces rejetées récemment (dernières 24h)
SELECT id, title, brand, model, created_at, status
FROM listings
WHERE status = 'rejected'
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## ⚠️ Cas Particuliers

### Annonces Légitimes Rejetées (Faux Négatifs)

Si une annonce valide est rejetée automatiquement :
1. L'admin peut la **ré-approuver manuellement** depuis le dashboard
2. Analyser pourquoi elle a été rejetée (logs)
3. Ajuster les règles de validation si nécessaire

### Spam Passé (Faux Positifs)

Si du spam est approuvé automatiquement :
1. L'admin peut le **rejeter manuellement**
2. Analyser les patterns du spam
3. Ajouter des mots-clés de blocage dans `is_listing_valid_vehicle()`

---

## 🔧 Configuration Avancée

### Changer le Délai d'Auto-Approbation

Par défaut : **5 minutes**

Pour changer (ex: 10 minutes) :

```sql
-- Dans 011_auto_moderation.sql, ligne ~150
v_cutoff_time := NOW() - INTERVAL '10 minutes';  -- Au lieu de '5 minutes'
```

### Ajouter des Mots-Clés de Blocage

```sql
-- Exemple: bloquer les annonces contenant "gratuit", "offre", etc.
-- Dans is_listing_valid_vehicle(), ajouter:

DECLARE
  v_spam_keywords TEXT[] := ARRAY['gratuit', 'free', 'offre', 'promo', 'cliquez'];
  v_keyword TEXT;
BEGIN
  -- ... autres validations ...
  
  -- Bloquer si spam keywords détectés
  FOREACH v_keyword IN ARRAY v_spam_keywords LOOP
    IF v_title_lower LIKE '%' || v_keyword || '%' THEN
      RAISE NOTICE 'Auto-modération: mot-clé spam détecté (%)', v_keyword;
      RETURN FALSE;
    END IF;
  END LOOP;
END;
```

### Changer la Fréquence du CRON

Dans `.github/workflows/auto-moderation-cron.yml` :

```yaml
# Toutes les 10 minutes
cron: '*/10 * * * *'

# Toutes les heures
cron: '0 * * * *'

# Toutes les 30 minutes
cron: '*/30 * * * *'
```

---

## 📈 Statistiques

### Dashboard Admin

Ajouter ces métriques dans le dashboard admin :

```sql
-- Annonces auto-approuvées (dernières 24h)
SELECT COUNT(*) 
FROM listings 
WHERE status = 'active' 
  AND created_at >= NOW() - INTERVAL '24 hours'
  AND created_at + INTERVAL '5 minutes' >= updated_at;

-- Annonces auto-rejetées (dernières 24h)
SELECT COUNT(*) 
FROM listings 
WHERE status = 'rejected' 
  AND created_at >= NOW() - INTERVAL '24 hours';

-- Taux d'approbation automatique
SELECT 
  COUNT(CASE WHEN status = 'active' THEN 1 END) as approved,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
  ROUND(100.0 * COUNT(CASE WHEN status = 'active' THEN 1 END) / NULLIF(COUNT(*), 0), 1) as approval_rate
FROM listings
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

## 🎯 Prochaines Améliorations

### Court Terme
- [ ] Ajouter notification email aux vendeurs (annonce approuvée/rejetée)
- [ ] Dashboard admin : stats d'auto-modération
- [ ] Logs détaillés des rejets (raison exacte)

### Moyen Terme
- [ ] Validation des images via API IA (OpenAI Vision, Claude)
- [ ] Détection de doublons (même véhicule publié plusieurs fois)
- [ ] Score de confiance (0-100%) au lieu de binaire OK/KO

### Long Terme
- [ ] Machine Learning : apprendre des décisions manuelles des admins
- [ ] Validation du numéro de téléphone (SMS OTP)
- [ ] Vérification d'identité vendeur

---

## 📞 Support

En cas de problème :
1. Vérifier les logs Edge Function
2. Tester manuellement `auto_approve_pending_listings()`
3. Vérifier que le CRON GitHub Actions s'exécute bien
4. Consulter les erreurs Supabase Dashboard

---

**Date** : 2026-01-14  
**Version** : 1.0  
**Auteur** : Assistant AI
