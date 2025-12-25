# 🎯 GUIDE RAPIDE : CORRIGER L'ERREUR

## 🚨 ERREUR ACTUELLE
```
ERR_NAME_NOT_RESOLVED
Erreur désactivation boosts expirés
```

## ✅ SOLUTION : 3 CLICS

### 1️⃣ Aller dans Vercel
🔗 https://vercel.com/dashboard → Votre projet → **Settings** → **Environment Variables**

### 2️⃣ Copier-coller ces 2 variables

**Variable 1 :**
```
Name: VITE_SUPABASE_URL
Value: https://vnhwllsawfaueivykhly.supabase.co
Environment: ✅ Production ✅ Preview ✅ Development
```

**Variable 2 :**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaHdsbHNhd2ZhdWVpdnlraGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzczMTgsImV4cCI6MjA4MjAxMzMxOH0.W4td5ZTiGYxqutPAyGGcGpkRNlXW1PJfQ5JCb-BZt64
Environment: ✅ Production ✅ Preview ✅ Development
```

### 3️⃣ Redéployer
**Deployments** → Dernier déploiement → Menu **⋯** → **Redeploy**

---

## ⏱️ Temps estimé : 2 minutes

C'est tout ! ✅

