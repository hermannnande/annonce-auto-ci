# ✅ CONFIGURATION SUPABASE - VALEURS EXACTES

## 🌐 Votre site Vercel
```
https://annonce-auto-ci.vercel.app
```

---

## 🔧 CONFIGURATION À APPLIQUER

### 📍 Où ?
https://supabase.com/dashboard/project/vnhwllsawfaueivykhly

**Navigation :** Settings → Authentication → URL Configuration

---

## 📝 VALEURS À COPIER-COLLER

### 1️⃣ Site URL

**Remplacez par :**
```
https://annonce-auto-ci.vercel.app
```

⚠️ **Pas de slash `/` à la fin !**

---

### 2️⃣ Redirect URLs

**Ajoutez ces 4 lignes (une par ligne) :**

```
https://annonce-auto-ci.vercel.app/auth/callback
https://annonce-auto-ci.vercel.app/payfonte/callback
https://annonce-auto-ci.vercel.app/**
http://localhost:5174/auth/callback
```

**Détails :**
- ✅ `auth/callback` → OAuth Google/Facebook
- 💳 `payfonte/callback` → Paiements
- 🌐 `**` → Wildcard (toutes les routes)
- 🖥️ `localhost:5174` → Développement local

---

## 💾 SAUVEGARDER

Cliquez sur **"Save"** en bas de la page.

---

## ✅ TESTER

1. Allez sur : https://annonce-auto-ci.vercel.app/
2. Créer un compte → Continuer avec Google
3. Devrait rediriger vers Vercel (pas localhost) ✅

---

## 📋 CHECKLIST COMPLÈTE

- [x] Code sur GitHub
- [x] Site déployé sur Vercel
- [x] Variables d'environnement Vercel configurées
- [x] Inscription par email fonctionne
- [ ] **URLs Supabase configurées** ← VOUS ÊTES ICI
- [ ] OAuth Google fonctionne
- [ ] Tests complets

---

## 🎯 APRÈS CETTE CONFIGURATION

**Tout sera 100% fonctionnel !** 🚀

- ✅ Inscription par email
- ✅ Connexion par email
- ✅ OAuth Google
- ✅ Publication d'annonces
- ✅ Boost d'annonces
- ✅ Paiements Payfonte

---

## ⏱️ Temps estimé : 1 minute

