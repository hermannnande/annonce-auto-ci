# 🔒 CHECKLIST SÉCURITÉ - ANNONCEAUTO.CI

## ✅ SÉCURITÉ DÉJÀ IMPLÉMENTÉE

### 1. Protection côté Application
- ✅ **Anti Open-Redirect** : Validation des URLs de redirection (`sanitizeRedirectUrl`)
- ✅ **Nettoyage tokens OAuth** : Les tokens sont supprimés de l'URL après connexion
- ✅ **Security Headers** (via `vercel.json`) :
  - `X-Content-Type-Options: nosniff` → Empêche le MIME sniffing
  - `X-Frame-Options: DENY` → Protection contre clickjacking
  - `X-XSS-Protection: 1; mode=block` → Protection XSS navigateur
  - `Strict-Transport-Security` → Force HTTPS (HSTS)
  - `Content-Security-Policy` → Contrôle les ressources chargées
  - `Referrer-Policy` → Contrôle les infos envoyées via referrer
  - `Permissions-Policy` → Désactive caméra/micro/géolocalisation
- ✅ **rel="noopener noreferrer"** : Sur tous les liens externes (Facebook)
- ✅ **Validation des entrées** : Fonctions `isValidEmail`, `isValidIvorianPhone`
- ✅ **Sanitization XSS** : Fonction `sanitizeUserInput` disponible

### 2. Authentification
- ✅ **Supabase Auth** : Gestion sécurisée des sessions
- ✅ **OAuth Google** : Authentification tierce configurée
- ✅ **Redirections sécurisées** : Après login/register/OAuth

---

## ⚠️ À CONFIGURER SUR SUPABASE (URGENT)

### 1. 🔐 Row Level Security (RLS) - **CRITIQUE**
Vérifie que les politiques RLS sont bien actives :

#### a) Vérifier l'état des politiques
```sql
-- Dans SQL Editor de Supabase, exécute :
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

#### b) Politiques à avoir sur chaque table

**Table `profiles` :**
```sql
-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);
```

**Table `listings` :**
```sql
-- Tout le monde peut lire les annonces publiées
CREATE POLICY "Anyone can read published listings"
ON listings FOR SELECT
USING (status = 'published');

-- Les vendeurs peuvent créer leurs annonces
CREATE POLICY "Vendors can create own listings"
ON listings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les vendeurs peuvent modifier leurs annonces
CREATE POLICY "Vendors can update own listings"
ON listings FOR UPDATE
USING (auth.uid() = user_id);

-- Les vendeurs peuvent supprimer leurs annonces
CREATE POLICY "Vendors can delete own listings"
ON listings FOR DELETE
USING (auth.uid() = user_id);

-- Les admins peuvent tout modifier
CREATE POLICY "Admins can manage all listings"
ON listings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);
```

**Table `favorites` :**
```sql
-- Les utilisateurs peuvent voir leurs propres favoris
CREATE POLICY "Users can read own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent ajouter des favoris
CREATE POLICY "Users can create own favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs favoris
CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (auth.uid() = user_id);
```

**Tables `credits_transactions`, `boosts`, `notifications` :**
→ Même logique : `auth.uid() = user_id` pour les opérations utilisateur.

---

### 2. 📧 SMTP / Email de confirmation - **IMPORTANT**

**Option 1 : Désactiver la confirmation d'email (rapide mais moins sécurisé)**
1. Va sur **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. Désactive "**Confirm email**"
3. **Avantage** : Inscription immédiate
4. **Inconvénient** : Pas de vérification d'email

**Option 2 : Configurer Resend (RECOMMANDÉ)**
1. Crée un compte sur [resend.com](https://resend.com)
2. Génère une **API Key**
3. Dans **Supabase Dashboard** → **Project Settings** → **Auth** → **SMTP Settings** :
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: `[TA_CLE_API_RESEND]`
   - Sender email: `noreply@annonceauto.ci` (configure ton domaine sur Resend)
4. **Test** : Inscris un nouvel utilisateur pour vérifier l'envoi d'email

---

### 3. 🔑 Authentification Multi-Facteurs (MFA) - **OPTIONNEL**

Pour les comptes admins (fortement recommandé) :
1. Va sur **Supabase Dashboard** → **Authentication** → **Multi Factor Auth**
2. Active **TOTP (Time-based One-Time Password)**
3. Implémente dans ton UI admin une option "Activer 2FA"

**Code à ajouter (côté admin) :**
```typescript
// src/services/auth.service.ts
async enableMFA(userId: string) {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });
  return { data, error };
}
```

---

### 4. 💾 Backup & Récupération - **CRITIQUE**

#### a) Backup automatique (Supabase)
1. Va sur **Supabase Dashboard** → **Database** → **Backups**
2. Vérifie que les backups quotidiens sont actifs
3. **Plan gratuit** : 7 jours de rétention
4. **Plan Pro** : 30 jours + exports manuels

#### b) Backup manuel (à faire maintenant)
```bash
# Exporte toute la base de données
pg_dump "postgresql://postgres:[PASSWORD]@db.vnhwllsawfaueivykhly.supabase.co:5432/postgres" > backup_$(date +%Y%m%d).sql
```

#### c) Export des fichiers Storage
1. Va sur **Supabase Dashboard** → **Storage** → **vehicle-images**
2. Clique sur **...** → **Download bucket**
3. Stocke l'archive en lieu sûr

---

### 5. 🚨 Rate Limiting & Protection anti-spam

#### a) Protection Supabase (déjà active par défaut)
- Limite de 30 requêtes/seconde par IP
- Limite de 50 inscriptions/heure par IP

#### b) Ajouter une protection côté app (optionnel)
```typescript
// src/app/lib/rateLimit.ts
const attempts = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(ip: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now - record.timestamp > windowMs) {
    attempts.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false; // Bloqué
  }

  record.count++;
  return true;
}
```

---

### 6. 🔍 Monitoring & Logs

#### a) Activer les logs Supabase
1. Va sur **Supabase Dashboard** → **Logs**
2. Active les logs pour :
   - **API** : Toutes les requêtes
   - **Auth** : Connexions/inscriptions
   - **Database** : Requêtes lentes
   - **Storage** : Uploads/téléchargements

#### b) Créer des alertes (Plan Pro)
- Alerte si > 100 erreurs/heure
- Alerte si > 1000 requêtes/minute
- Alerte si connexion admin échoue 5x

#### c) Monitoring applicatif (optionnel)
Intègre [Sentry](https://sentry.io) pour tracker les erreurs frontend :
```bash
pnpm add @sentry/react
```

---

### 7. 🌐 Validation des URLs Supabase

**Vérifie dans Supabase Dashboard → Authentication → URL Configuration :**
```
Site URL:
✅ https://annonceauto.ci

Redirect URLs:
✅ https://annonceauto.ci/**
✅ https://www.annonceauto.ci/**
✅ https://annonceauto.ci/auth/callback
✅ https://annonceauto.ci/payfonte/callback
✅ http://localhost:5174/** (pour dev uniquement)
```

**IMPORTANT** : Enlève `http://localhost` en production !

---

### 8. 🔐 Sécurité des clés API

#### a) Vérifie que les clés sont bien dans `.env.local` (non commitées)
```bash
# .gitignore doit contenir :
.env.local
.env*.local
```

#### b) Rotation des clés (tous les 6 mois)
1. Va sur **Supabase Dashboard** → **Project Settings** → **API**
2. Génère une nouvelle `anon key` et `service_role key`
3. Mets à jour `.env.local` et Vercel

#### c) Ne JAMAIS exposer la `service_role_key` côté client
→ Elle est uniquement dans les Edge Functions ou backend sécurisé.

---

### 9. 📱 Protection des données utilisateurs (RGPD)

#### a) Pages légales (déjà créées ✅)
- ✅ `/cgu` - Conditions Générales d'Utilisation
- ✅ `/confidentialite` - Politique de Confidentialité
- ✅ `/a-propos` - À propos

**TODO : Remplir le contenu réel de ces pages !**

#### b) Droit à l'oubli (à implémenter)
```typescript
// Ajouter dans auth.service.ts
async deleteAccount(userId: string) {
  // 1. Supprimer les annonces
  await supabase.from('listings').delete().eq('user_id', userId);
  
  // 2. Supprimer les images
  const { data: listings } = await supabase
    .from('listings')
    .select('images')
    .eq('user_id', userId);
  
  for (const listing of listings || []) {
    for (const imageUrl of listing.images) {
      const path = imageUrl.split('/').pop();
      await supabase.storage.from('vehicle-images').remove([path]);
    }
  }
  
  // 3. Supprimer le profil
  await supabase.from('profiles').delete().eq('id', userId);
  
  // 4. Supprimer le compte auth
  await supabase.auth.admin.deleteUser(userId);
}
```

#### c) Export des données (à implémenter)
```typescript
async exportUserData(userId: string) {
  const profile = await supabase.from('profiles').select('*').eq('id', userId).single();
  const listings = await supabase.from('listings').select('*').eq('user_id', userId);
  const favorites = await supabase.from('favorites').select('*').eq('user_id', userId);
  
  return {
    profile: profile.data,
    listings: listings.data,
    favorites: favorites.data,
    exported_at: new Date().toISOString(),
  };
}
```

---

### 10. 🚀 Sécurité des paiements Payfonte

#### a) Vérifier la signature des webhooks
```typescript
// src/services/payfonte.service.ts
import crypto from 'crypto';

function verifyPayfonteSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const computed = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
}
```

#### b) Logger toutes les transactions
→ Déjà fait via `credits_transactions` ✅

#### c) Limites de sécurité
- Max 100,000 FCFA par transaction (déjà implémenté)
- Vérifier l'utilisateur avant de créditer

---

## 📋 CHECKLIST FINALE

### À faire MAINTENANT (prioritaire) :
- [ ] **Vérifier les politiques RLS sur toutes les tables**
- [ ] **Configurer SMTP avec Resend OU désactiver confirmation email**
- [ ] **Faire un backup manuel de la base de données**
- [ ] **Vérifier les URLs de redirection Supabase**
- [ ] **Enlever http://localhost des Redirect URLs en prod**

### À faire cette semaine :
- [ ] **Activer MFA pour les comptes admins**
- [ ] **Configurer les logs et alertes Supabase**
- [ ] **Remplir les pages CGU/Confidentialité avec du vrai contenu**
- [ ] **Tester la suppression de compte utilisateur**

### À planifier (moyen terme) :
- [ ] **Rotation des clés API** (tous les 6 mois)
- [ ] **Audit de sécurité complet** (via un tiers si budget)
- [ ] **Intégrer Sentry pour monitoring des erreurs**
- [ ] **Implémenter rate limiting côté app** (si spam détecté)

---

## 🆘 EN CAS DE PROBLÈME DE SÉCURITÉ

### Si tu détectes une faille :
1. **IMMÉDIAT** : Désactive l'accès (mets le site en maintenance)
2. **Vérifie les logs** Supabase pour identifier l'attaque
3. **Change les clés API** si compromises
4. **Restaure un backup** si données corrompues
5. **Contacte Supabase Support** si besoin

### Commande de maintenance :
```typescript
// Crée une page src/app/pages/Maintenance.tsx
export function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">🔧 Maintenance en cours</h1>
        <p>Le site sera de retour dans quelques instants.</p>
      </div>
    </div>
  );
}

// Dans App.tsx, décommenter en cas d'urgence :
// return <Maintenance />;
```

---

## 📚 RESSOURCES

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Resend Documentation](https://resend.com/docs)

---

**Dernière mise à jour** : 25 décembre 2024  
**Auteur** : Équipe AnnonceAuto CI

