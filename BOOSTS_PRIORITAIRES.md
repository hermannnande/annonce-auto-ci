# 🚀 Annonces Boostées - Priorité Garantie

## ✅ **FONCTIONNEMENT**

Les annonces boostées restent **EN TÊTE** pendant **toute la durée du boost**.

### **Ordre d'affichage :**
```
1. 🌟 Annonces BOOSTÉES (boost actif) → Triées par date
2. 📅 Annonces NORMALES → Triées par date
```

---

## 🔧 **MÉCANISME TECHNIQUE**

### **1. Vérification du boost actif**
```typescript
// Une annonce est considérée "boostée active" SI :
- is_boosted = true
- boost_until existe
- boost_until > maintenant (pas expiré)
```

### **2. Tri automatique**
Le tri se fait en **3 étapes** :

```typescript
Étape 1 : Filtrer par status = 'active'
Étape 2 : Trier par boost actif (OUI/NON)
Étape 3 : Trier par date de création (DESC)
```

### **3. Nettoyage automatique**
Un **trigger PostgreSQL** désactive automatiquement les boosts expirés :

```sql
-- Si boost_until est passé :
is_boosted = false (automatiquement)
```

---

## 📊 **EXEMPLE CONCRET**

Supposons ces annonces :

| Annonce | Boost | boost_until | created_at | Position |
|---------|-------|-------------|------------|----------|
| A | ✅ | 2025-01-15 | 2025-01-05 | **1** 🌟 |
| B | ✅ | 2025-01-12 | 2025-01-08 | **2** 🌟 |
| C | ❌ | null | 2025-01-10 | **3** 📅 |
| D | ✅ | 2025-01-07 ⚠️ | 2025-01-01 | **4** 📅 (expiré) |
| E | ❌ | null | 2025-01-09 | **5** 📅 |

**Résultat :**
1. Annonce **A** (boostée, expire le 15)
2. Annonce **B** (boostée, expire le 12)
3. Annonce **C** (normale, plus récente)
4. Annonce **E** (normale)
5. Annonce **D** (boost expiré, ancienne)

---

## 🛠️ **MIGRATIONS À APPLIQUER**

### **Migration 010 : Fix Boost Ordering**

Cette migration garantit que :
- ✅ La colonne `boost_until` existe
- ✅ Les boosts expirés sont désactivés automatiquement
- ✅ Le tri est optimisé avec un index spécial
- ✅ Trigger automatique pour nettoyer les boosts expirés

**À exécuter dans Supabase SQL Editor :**

```sql
-- Copier le contenu de :
supabase/migrations/010_fix_boost_ordering.sql
```

---

## 🧪 **TESTS**

### **Test 1 : Annonce boostée visible**
```
1. Booster une annonce
2. Aller sur la page d'accueil
3. ✅ L'annonce doit être EN PREMIÈRE position
```

### **Test 2 : Boost expiré**
```
1. Attendre l'expiration d'un boost
2. Recharger la page
3. ✅ L'annonce repasse en position normale
4. ✅ is_boosted passe à false automatiquement
```

### **Test 3 : Plusieurs boosts actifs**
```
1. Avoir 3 annonces boostées
2. ✅ Les 3 sont en tête
3. ✅ Triées par date parmi elles (plus récente en premier)
```

### **Test 4 : Vérification SQL**
```sql
-- Voir toutes les annonces boostées actives
SELECT id, title, is_boosted, boost_until, created_at
FROM listings
WHERE status = 'active'
ORDER BY 
  (CASE WHEN is_boosted AND boost_until > NOW() THEN 1 ELSE 0 END) DESC,
  created_at DESC
LIMIT 10;
```

---

## 📋 **CHECKLIST DÉPLOIEMENT**

- [ ] Migration 010 exécutée dans Supabase
- [ ] Code déployé sur Vercel (git push)
- [ ] Test : Booster une annonce
- [ ] Test : Vérifier qu'elle est en tête
- [ ] Test : Attendre expiration (ou modifier boost_until)
- [ ] Test : Vérifier qu'elle repasse en position normale
- [ ] Vérifier dans Supabase : is_boosted = false après expiration

---

## 🔍 **VÉRIFICATIONS POST-DÉPLOIEMENT**

### **1. Vérifier les boosts actifs**
```sql
SELECT COUNT(*) as boosts_actifs
FROM listings
WHERE is_boosted = true 
AND boost_until > NOW()
AND status = 'active';
```

### **2. Nettoyer les boosts expirés manuellement (si besoin)**
```sql
-- Désactiver tous les boosts expirés
UPDATE listings
SET is_boosted = false
WHERE is_boosted = true
AND (boost_until IS NULL OR boost_until <= NOW());
```

### **3. Vérifier l'index**
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'listings'
AND indexname LIKE '%boost%';
```

Tu dois voir :
- ✅ `idx_listings_is_boosted`
- ✅ `idx_listings_boost_until`
- ✅ `idx_listings_active_boost_created` ← **NOUVEAU**
- ✅ `idx_listings_boosted_created` ← **NOUVEAU**

---

## 💡 **FONCTIONNEMENT DU BOOST**

### **Quand un vendeur boost une annonce :**

1. **Déduction des crédits**
   ```
   Vendeur a 1000 crédits
   Boost 7 jours = 500 crédits
   → Nouveau solde : 500 crédits
   ```

2. **Activation du boost**
   ```sql
   UPDATE listings
   SET is_boosted = true,
       boost_until = NOW() + INTERVAL '7 days'
   WHERE id = [annonce_id];
   ```

3. **Affichage prioritaire**
   ```
   L'annonce passe en PREMIÈRE position
   pendant 7 jours
   ```

4. **Expiration automatique**
   ```
   Après 7 jours :
   - Trigger désactive automatiquement
   - is_boosted = false
   - Annonce repasse en position normale
   ```

---

## 🎯 **AVANTAGES**

✅ **Pour les vendeurs :**
- Visibilité maximale garantie
- Durée du boost respectée
- ROI mesurable (stats de vues)

✅ **Pour les acheteurs :**
- Voir les annonces "premium" en premier
- Contenu de qualité mis en avant
- Expérience utilisateur optimale

✅ **Pour la plateforme :**
- Monétisation efficace
- Système automatisé (pas de gestion manuelle)
- Performance optimale (indexes SQL)

---

## 🚨 **DÉPANNAGE**

### **Problème : Annonce boostée pas en tête**

**Solution 1 : Vérifier le boost**
```sql
SELECT id, title, is_boosted, boost_until, 
       boost_until > NOW() as est_actif
FROM listings
WHERE id = '[annonce_id]';
```

**Solution 2 : Forcer le tri côté client**
Le code TypeScript fait déjà un double tri (SQL + client) pour garantir l'ordre.

**Solution 3 : Nettoyer le cache**
```typescript
// Vider le cache navigateur (Ctrl + Shift + R)
```

### **Problème : Boost ne s'active pas**

**Vérifier la transaction :**
```sql
SELECT * FROM boosts
WHERE listing_id = '[annonce_id]'
ORDER BY created_at DESC
LIMIT 1;
```

**Vérifier les crédits :**
```sql
SELECT credits FROM profiles
WHERE id = '[user_id]';
```

---

## 📊 **STATISTIQUES UTILES**

### **Revenus des boosts**
```sql
SELECT 
  COUNT(*) as total_boosts,
  SUM(credits_used) as credits_total,
  AVG(credits_used) as credits_moyen
FROM boosts
WHERE created_at > NOW() - INTERVAL '30 days';
```

### **Boosts actifs par durée**
```sql
SELECT 
  duration_days,
  COUNT(*) as nombre,
  SUM(credits_used) as revenus
FROM boosts
WHERE ends_at > NOW()
GROUP BY duration_days
ORDER BY duration_days;
```

### **Taux de conversion**
```sql
-- Annonces vendues après boost
SELECT 
  COUNT(*) FILTER (WHERE status = 'sold') * 100.0 / COUNT(*) as taux_vente_pct
FROM listings
WHERE is_boosted = true OR boost_until IS NOT NULL;
```

---

## ✅ **RÉSUMÉ**

| Fonctionnalité | Statut |
|----------------|--------|
| Tri par boost actif | ✅ Implémenté |
| Nettoyage automatique | ✅ Implémenté |
| Index optimisé | ✅ Implémenté |
| Trigger PostgreSQL | ✅ Implémenté |
| Tests unitaires | ⚠️ À faire |
| Documentation | ✅ Ce fichier |

---

**Date** : 8 Janvier 2025  
**Version** : 2.0  
**Status** : ✅ PRÊT POUR PRODUCTION  

**Les annonces boostées sont TOUJOURS en tête pendant leur période ! 🚀**

