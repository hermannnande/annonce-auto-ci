# 🚀 DÉPLOIEMENT RAPIDE - 10 MINUTES

## Guide express pour mettre le site en ligne

---

## 📋 CE DONT VOUS AVEZ BESOIN

- ✅ Compte GitHub (gratuit)
- ✅ Compte Vercel (gratuit)
- ✅ 10 minutes

---

## 🚀 ÉTAPES RAPIDES

### 1️⃣ GitHub (2 minutes)

```bash
cd "C:\Users\nande\Downloads\Site Annonces Véhicules (3)"

git init
git add .
git commit -m "Initial commit"
```

Puis créez un dépôt sur https://github.com/new et :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/annonce-auto-ci.git
git push -u origin main
```

---

### 2️⃣ Vercel (5 minutes)

1. **Allez sur** https://vercel.com
2. **Connectez-vous** avec GitHub
3. **Cliquez** "Add New Project"
4. **Sélectionnez** votre dépôt `annonce-auto-ci`
5. **Ajoutez** les variables d'environnement :

```env
VITE_SUPABASE_URL=https://vnhwllsawfaueivykhly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaHdsbHNhd2ZhdWVpdnlraGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzczMTgsImV4cCI6MjA4MjAxMzMxOH0.W4td5ZTiGYxqutPAyGGcGpkRNlXW1PJfQ5JCb-BZt64
```

6. **Cliquez** "Deploy"

---

### 3️⃣ Supabase (3 minutes)

1. **Allez sur** https://supabase.com/dashboard
2. **Ouvrez** votre projet
3. **Settings** → **Authentication** → **URL Configuration**
4. **Ajoutez** :

```
Site URL: https://votre-site.vercel.app
Redirect URLs: https://votre-site.vercel.app/auth/callback
```

(Remplacez par votre vraie URL Vercel)

---

## ✅ C'EST FAIT !

Votre site est maintenant en ligne ! 🎉

**URL:** https://votre-site.vercel.app

---

## 🧪 TESTER

1. Ouvrez votre URL Vercel
2. Testez l'inscription
3. Testez la publication d'annonce
4. Testez le boost

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails, consultez :
**`DEPLOIEMENT_EN_LIGNE.md`**

---

**Déploiement rapide créé le 24 Décembre 2025 🎄🚀**

