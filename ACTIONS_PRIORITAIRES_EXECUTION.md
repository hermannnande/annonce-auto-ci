# 🎯 EXÉCUTION DES 5 ACTIONS PRIORITAIRES

**Date** : 26 Décembre 2024  
**Durée estimée** : 1 heure  
**Statut** : ✅ Serveur lancé sur http://localhost:5173/

---

## ✅ ACTION 1 : MIGRATION SQL RÉPUTATION (5 min)

### 🎯 Objectif
Créer les tables et fonctions pour le système de badges et réputation vendeurs.

### 📋 Instructions

1. **Ouvrir Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/vnhwllsawfaueivykhly
   ```

2. **Aller dans SQL Editor**
   - Cliquer sur "SQL Editor" dans le menu latéral
   - Cliquer sur "New query"

3. **Copier le contenu ci-dessous** (ou depuis `supabase/migrations/create_vendor_reputation.sql`)

4. **Cliquer sur RUN** ▶️

5. **Vérifier le résultat**
   - Vous devriez voir : "Success. No rows returned"
   - Cela signifie que les 2 tables, 1 vue et 1 fonction ont été créées

### 📄 SQL à exécuter

```sql
-- ============================================
-- SYSTÈME DE BADGES ET RÉPUTATION VENDEURS
-- ============================================

-- 1. Table pour les badges des vendeurs
CREATE TABLE IF NOT EXISTS vendor_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- 2. Table pour les avis/notes des vendeurs
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, buyer_id, listing_id)
);

-- 3. Vue pour les statistiques des vendeurs
CREATE OR REPLACE VIEW vendor_stats AS
SELECT
  p.id as vendor_id,
  p.full_name,
  p.user_type,
  p.created_at as member_since,
  (SELECT COUNT(*) FROM listings WHERE user_id = p.id) as total_listings,
  (SELECT COUNT(*) FROM listings WHERE user_id = p.id AND status = 'active') as active_listings,
  (SELECT COUNT(*) FROM listings WHERE user_id = p.id AND status = 'sold') as sold_listings,
  (SELECT COUNT(*) FROM vendor_reviews WHERE vendor_id = p.id) as total_reviews,
  (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) FROM vendor_reviews WHERE vendor_id = p.id) as avg_rating,
  (SELECT COUNT(*) FROM vendor_badges WHERE user_id = p.id) as total_badges,
  (SELECT array_agg(badge_type) FROM vendor_badges WHERE user_id = p.id) as badges,
  (
    SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (m2.created_at - m1.created_at)) / 3600)::numeric, 1), 0)
    FROM messages m1
    JOIN messages m2 ON m2.conversation_id = m1.conversation_id
    JOIN conversations c ON c.id = m1.conversation_id
    WHERE c.seller_id = p.id
    AND m1.sender_id != p.id
    AND m2.sender_id = p.id
    AND m2.created_at > m1.created_at
    AND m2.created_at = (
      SELECT MIN(created_at) 
      FROM messages 
      WHERE conversation_id = m1.conversation_id 
      AND sender_id = p.id 
      AND created_at > m1.created_at
    )
  ) as avg_response_time_hours,
  (
    SELECT COALESCE(ROUND(
      (COUNT(DISTINCT c.id)::numeric / 
       NULLIF((SELECT COUNT(*) FROM conversations WHERE seller_id = p.id), 0)) * 100, 
      0), 0)
    FROM conversations c
    WHERE c.seller_id = p.id
    AND EXISTS (
      SELECT 1 FROM messages 
      WHERE conversation_id = c.id 
      AND sender_id = p.id
    )
  ) as response_rate
FROM profiles p
WHERE p.user_type IN ('vendor', 'admin');

-- 4. Fonction pour attribuer automatiquement les badges
CREATE OR REPLACE FUNCTION update_vendor_badges(p_vendor_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats RECORD;
BEGIN
  SELECT * INTO v_stats FROM vendor_stats WHERE vendor_id = p_vendor_id;
  IF v_stats IS NULL THEN RETURN; END IF;
  
  -- Badge "Top Seller" : 10+ ventes
  IF v_stats.sold_listings >= 10 THEN
    INSERT INTO vendor_badges (user_id, badge_type)
    VALUES (p_vendor_id, 'top_seller')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Badge "Fast Responder" : < 2h et > 90%
  IF v_stats.avg_response_time_hours < 2 AND v_stats.response_rate > 90 THEN
    INSERT INTO vendor_badges (user_id, badge_type)
    VALUES (p_vendor_id, 'fast_responder')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Badge "Trusted" : >= 4.5 et 10+ avis
  IF v_stats.avg_rating >= 4.5 AND v_stats.total_reviews >= 10 THEN
    INSERT INTO vendor_badges (user_id, badge_type)
    VALUES (p_vendor_id, 'trusted')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Badge "Premium" : 50+ annonces
  IF v_stats.active_listings >= 50 THEN
    INSERT INTO vendor_badges (user_id, badge_type)
    VALUES (p_vendor_id, 'premium')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
END;
$$;

-- 5. Index pour performance
CREATE INDEX IF NOT EXISTS idx_vendor_badges_user_id ON vendor_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_buyer_id ON vendor_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_rating ON vendor_reviews(rating);

-- 6. RLS Policies
ALTER TABLE vendor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON vendor_badges FOR SELECT USING (true);
CREATE POLICY "Anyone can view reviews" ON vendor_reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can create reviews" ON vendor_reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update own reviews" ON vendor_reviews FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Admins can manage badges" ON vendor_badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin')
);

-- 7. Permissions
GRANT SELECT ON vendor_stats TO authenticated;
GRANT EXECUTE ON FUNCTION update_vendor_badges(UUID) TO authenticated;
```

### ✅ Vérification

Après exécution, vérifier que les tables ont été créées :

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('vendor_badges', 'vendor_reviews');
```

Vous devriez voir 2 lignes retournées.

---

## ✅ ACTION 2 : RLS POLICIES VOCAUX (10 min)

### 🎯 Objectif
Sécuriser l'accès au bucket `message-audios` avec 2 policies RLS.

### 📋 Instructions

1. **Aller dans Supabase Dashboard → Storage**
   ```
   https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/storage/buckets
   ```

2. **Vérifier que le bucket `message-audios` existe**
   - Si non : créer un bucket privé nommé `message-audios`

3. **Cliquer sur le bucket `message-audios`**

4. **Aller dans l'onglet "Policies"**

5. **Créer la Policy 1 : Upload**
   - Cliquer sur "New Policy"
   - Choisir "Custom"
   - Name : `Users can upload audio for own messages`
   - Target roles : `authenticated`
   - Policy definition → FOR : `INSERT`
   - WITH CHECK expression :

```sql
bucket_id = 'message-audios'
AND (storage.foldername(name))[1] = (auth.uid())::text
```

6. **Créer la Policy 2 : Lecture**
   - Cliquer sur "New Policy"
   - Choisir "Custom"
   - Name : `Conversation participants can read audios`
   - Target roles : `authenticated`
   - Policy definition → FOR : `SELECT`
   - USING expression :

```sql
bucket_id = 'message-audios'
AND EXISTS (
  SELECT 1 
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  WHERE m.audio_url LIKE ('%'::text || (name)::text)
  AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
)
```

### ⚠️ Alternative SQL Editor

Si l'interface graphique ne fonctionne pas, exécuter dans SQL Editor :

```sql
-- Policy 1 : Upload
CREATE POLICY "Users can upload audio for own messages" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'message-audios'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Policy 2 : Lecture
CREATE POLICY "Conversation participants can read audios" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'message-audios'
  AND EXISTS (
    SELECT 1 
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.audio_url LIKE ('%'::text || (name)::text)
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);
```

### ✅ Vérification

Vérifier que les policies ont été créées :

```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

---

## ✅ ACTION 3 : SMTP RESEND (10 min)

### 🎯 Objectif
Permettre l'inscription sans erreur d'envoi d'email.

### 📋 Option A : Désactiver confirmation email (RAPIDE - 2 min)

1. **Aller dans Supabase Dashboard → Authentication**
   ```
   https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/auth/providers
   ```

2. **Cliquer sur "Email" dans la liste des providers**

3. **Désactiver "Confirm email"**
   - Toggle sur OFF

4. **Cliquer sur "Save"**

✅ **Avantage** : Inscription immédiate sans email  
⚠️ **Inconvénient** : Pas de validation d'email

---

### 📋 Option B : Configurer SMTP Resend (PRO - 10 min)

1. **Créer un compte sur Resend**
   ```
   https://resend.com/signup
   ```

2. **Générer une API Key**
   - Dashboard Resend → API Keys → Create API Key
   - Nom : "AnnonceAuto Supabase"
   - Permission : "Sending access"
   - Copier la clé générée (commence par `re_`)

3. **Configurer SMTP dans Supabase**
   ```
   https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/settings/auth
   ```

4. **Aller dans "SMTP Settings"**

5. **Remplir les champs**
   ```
   Enable Custom SMTP : ON
   Host : smtp.resend.com
   Port : 465
   Username : resend
   Password : [COLLER_LA_CLE_API_RESEND]
   Sender email : noreply@annonceauto.ci
   Sender name : AnnonceAuto.ci
   ```

6. **Cliquer sur "Save"**

7. **Envoyer un email de test**
   - Cliquer sur "Send test email"
   - Vérifier réception

✅ **Avantage** : Emails professionnels + validation  
⚠️ **Inconvénient** : Configuration supplémentaire

---

## ✅ ACTION 4 : BACKUP BDD (5 min)

### 🎯 Objectif
Créer une sauvegarde complète de la base de données.

### 📋 Option A : Via Supabase Dashboard (SIMPLE)

1. **Aller dans Database → Backups**
   ```
   https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/database/backups
   ```

2. **Cliquer sur "Download backup"**

3. **Sauvegarder le fichier**
   - Nom suggéré : `annonceauto_backup_26dec2024.sql`
   - Emplacement : `C:\Users\nande\Desktop\backups\`

---

### 📋 Option B : Via pg_dump (AVANCÉ)

⚠️ **Nécessite PostgreSQL installé localement**

1. **Récupérer la chaîne de connexion**
   - Supabase Dashboard → Project Settings → Database
   - Copier "Connection string" (format URI)

2. **Exécuter dans PowerShell**

```powershell
# Créer dossier backups
mkdir C:\Users\nande\Desktop\backups

# Faire le backup
pg_dump "postgresql://postgres:[PASSWORD]@db.vnhwllsawfaueivykhly.supabase.co:5432/postgres" > C:\Users\nande\Desktop\backups\annonceauto_backup_26dec2024.sql
```

3. **Vérifier le fichier**
   - Taille : Plusieurs Mo
   - Contenu : SQL complet avec CREATE TABLE, INSERT, etc.

### ✅ Vérification

Ouvrir le fichier `.sql` et vérifier qu'il contient :
- `CREATE TABLE profiles`
- `CREATE TABLE listings`
- `CREATE TABLE messages`
- Etc.

---

## ✅ ACTION 5 : TESTS COMPLETS (30 min)

### 🎯 Objectif
Vérifier que toutes les fonctionnalités marchent correctement.

### 📋 Checklist de Tests

#### ✅ Test 1 : Authentification (5 min)

```
Site : http://localhost:5173/
```

- [ ] **Inscription nouveau compte**
  1. Aller sur `/inscription`
  2. Remplir formulaire (email test : `test@example.com`)
  3. Vérifier redirection Dashboard
  4. Vérifier profil créé dans Supabase

- [ ] **Connexion**
  1. Se déconnecter
  2. Aller sur `/connexion`
  3. Se connecter avec compte test
  4. Vérifier redirection Dashboard

- [ ] **OAuth Google** (optionnel)
  1. Cliquer "Connexion avec Google"
  2. Autoriser
  3. Vérifier connexion réussie

- [ ] **Mot de passe oublié**
  1. Aller sur `/mot-de-passe-oublie`
  2. Entrer email
  3. Vérifier email reçu (si SMTP configuré)

---

#### ✅ Test 2 : Annonces (10 min)

- [ ] **Publier annonce**
  1. Aller sur `/dashboard/vendeur/publier`
  2. Remplir formulaire complet
  3. Uploader 3 photos minimum
  4. Voir les **suggestions de prix** s'afficher
  5. Publier
  6. Vérifier annonce dans `/dashboard/vendeur/annonces`

- [ ] **Voir suggestions prix**
  1. Dans le formulaire de publication
  2. Vérifier que le composant `PriceSuggestionCard` s'affiche
  3. Vérifier analyse marché (prix min/max/moyen)

- [ ] **Modifier annonce**
  1. Dans `/dashboard/vendeur/annonces`
  2. Cliquer "Modifier" sur une annonce
  3. Changer le titre
  4. Sauvegarder
  5. Vérifier modification

- [ ] **Supprimer annonce**
  1. Cliquer "Supprimer"
  2. Confirmer
  3. Vérifier disparition

- [ ] **Stats détaillées annonce**
  1. Cliquer sur "Voir stats" d'une annonce
  2. Aller sur `/dashboard/vendeur/annonces/:id/stats`
  3. Vérifier :
     - Vues totales + vues uniques
     - Graphique évolution vues
     - Heures/jours de pic
     - Stats jour de la semaine
     - Auto-refresh 30s

---

#### ✅ Test 3 : Messagerie (10 min)

- [ ] **Créer 2ème compte pour tester**
  1. Ouvrir navigateur incognito
  2. S'inscrire avec email différent
  3. Cliquer "Message" sur une annonce

- [ ] **Envoyer message texte**
  1. Écrire un message
  2. Envoyer
  3. Vérifier réception temps réel (autre compte)
  4. Vérifier double check ✓✓

- [ ] **Envoyer message vocal 🎤**
  1. Cliquer sur bouton micro 🎤
  2. Autoriser micro (navigateur)
  3. Enregistrer 10 secondes
  4. Voir la forme d'onde
  5. Cliquer "Envoyer"
  6. Vérifier upload dans Supabase Storage
  7. Tester lecture audio (autre compte)

- [ ] **Utiliser réponse rapide**
  1. Cliquer sur bouton ⚡ "Réponses rapides"
  2. Choisir un template (ex: "Bonjour ! Le véhicule est disponible...")
  3. Vérifier insertion dans textarea
  4. Envoyer

- [ ] **Envoyer emoji**
  1. Cliquer sur bouton 😊
  2. Choisir emoji
  3. Vérifier insertion

- [ ] **Citer un message**
  1. Hover sur un message reçu
  2. Cliquer "Répondre"
  3. Voir le message quoté
  4. Répondre

---

#### ✅ Test 4 : Crédits & Boost (5 min)

- [ ] **Recharger crédits**
  1. Aller sur `/dashboard/vendeur/recharge`
  2. Choisir pack 50 crédits (1000 FCFA)
  3. Simuler paiement Payfonte
  4. Vérifier solde mis à jour

- [ ] **Booster annonce**
  1. Aller sur `/dashboard/vendeur/booster`
  2. Sélectionner une annonce
  3. Choisir durée boost (3 jours = 50 crédits)
  4. Confirmer
  5. Vérifier badge "🔥 BOOST" sur annonce
  6. Vérifier déduction crédits

- [ ] **Voir historique**
  1. Vérifier onglet "Historique"
  2. Voir transactions crédits

---

#### ✅ Test 5 : Dashboard Admin (5 min)

⚠️ **Nécessite compte admin** (changer `user_type` dans Supabase)

- [ ] **Analytics**
  1. Aller sur `/dashboard/admin/analytics`
  2. Vérifier stats temps réel :
     - Utilisateurs en ligne
     - Événements dernières 24h
  3. Vérifier graphiques :
     - Trafic par heure
     - Top pages visitées
     - Stats devices (pie chart)
     - Stats géographiques
  4. Tester filtres : 7j / 30j / 90j
  5. Vérifier auto-refresh 30s

- [ ] **Modération**
  1. Aller sur `/dashboard/admin/moderation`
  2. Voir liste annonces
  3. Tester validation/refus

- [ ] **Gestion utilisateurs**
  1. Aller sur `/dashboard/admin/utilisateurs`
  2. Voir liste users
  3. Voir statistiques badges/réputation

- [ ] **Surveillance messagerie**
  1. Aller sur `/dashboard/admin/messages`
  2. Voir toutes les conversations
  3. Filtrer par signalements

---

### ✅ CHECKLIST RÉCAPITULATIVE

Cocher chaque action complétée :

- [ ] ✅ **Action 1** : Migration SQL réputation exécutée
- [ ] ✅ **Action 2** : RLS policies vocaux configurées
- [ ] ✅ **Action 3** : SMTP configuré OU confirmation email désactivée
- [ ] ✅ **Action 4** : Backup BDD créé
- [ ] ✅ **Action 5** : Tests complets effectués

---

### 🎉 APRÈS LES 5 ACTIONS

Une fois toutes les actions complétées :

1. **Commit et push les changements (si modifications code)**
   ```bash
   git add .
   git commit -m "feat: finalisation sécurité et tests"
   git push origin main
   ```

2. **Vérifier déploiement Vercel**
   - Attendre 2-3 min
   - Vérifier sur https://vercel.com/dashboard
   - Tester sur URL production

3. **Créer note de lancement**
   - Documenter ce qui a été fait
   - Lister fonctionnalités prêtes
   - Noter points d'attention

4. **Lancement beta privé** 🚀
   - Inviter 5-10 testeurs
   - Recueillir feedback
   - Itérer

---

## 📞 BESOIN D'AIDE ?

### Si erreur SQL
- Vérifier que Supabase est bien connecté
- Vérifier syntaxe SQL
- Consulter logs Supabase (Database → Logs)

### Si erreur upload vocal
- Vérifier RLS policies Storage
- Vérifier permissions micro navigateur
- Consulter Console navigateur (F12)

### Si erreur tests
- Vérifier `.env.local` correct
- Vérifier Supabase URL/KEY
- Relancer serveur : `pnpm dev`

---

**Bon courage ! Le projet est presque terminé ! 💪**

**Temps estimé : 1h → Site 100% opérationnel ! 🎉**






