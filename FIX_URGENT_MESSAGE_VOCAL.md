# 🔴 FIX URGENT : MESSAGE VOCAL DISPARAÎT

**Date** : 26 Décembre 2024  
**Problème** : Message vocal disparaît avant d'être envoyé + Erreur 403 analytics  
**Durée fix** : 10 minutes

---

## 🔍 **DIAGNOSTIC**

### **Erreur 1 : 403 Forbidden**
```
POST https://vnhwllsawfaueivykhly.supabase.co/rest/v1/analytics_online_users?on_conflict=session_id 403 (Forbidden)
```

**Cause** : RLS policies manquantes sur `analytics_online_users`  
**Impact** : Heartbeat analytics bloqué sur toutes les pages

---

### **Erreur 2 : Message vocal disparaît**

**Cause** : RLS policies Storage manquantes sur bucket `message-audios`  
**Impact** : Upload audio échoue → Modal se ferme → Message perdu

**Code concerné** :
- `src/services/audio.service.ts` ligne 24-29 : Upload échoue silencieusement
- `src/app/components/messages/ChatBox.tsx` ligne 264-266 : Erreur capturée mais modal fermé

---

## ✅ **SOLUTION (3 étapes)**

### **ÉTAPE 1 : Corriger Analytics RLS** (3 min)

1. **Ouvrir Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/editor
   ```

2. **Aller dans SQL Editor**
   - Cliquer sur "SQL Editor" dans le menu gauche
   - Cliquer sur "New query"

3. **Copier-coller le contenu de `FIX_ANALYTICS_RLS_URGENT.sql`**
   
4. **Cliquer sur RUN** ▶️

5. **Vérifier** : Vous devriez voir une liste de policies créées

---

### **ÉTAPE 2 : Corriger Storage Vocaux RLS** (5 min)

#### **A. Vérifier que le bucket existe**

1. **Aller dans Storage**
   ```
   https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/storage/buckets
   ```

2. **Chercher le bucket `message-audios`**

   **Si le bucket N'EXISTE PAS** :
   - Cliquer sur "New bucket"
   - Name : `message-audios`
   - Public : **OFF** (bucket privé)
   - File size limit : 5 MB
   - Allowed MIME types : `audio/webm,audio/ogg,audio/wav,audio/mpeg`
   - Cliquer "Create bucket"

   **Si le bucket EXISTE** :
   - Passer à l'étape B

#### **B. Ajouter les policies**

1. **Retour dans SQL Editor**
   - Nouvelle query

2. **Copier-coller le contenu de `FIX_STORAGE_VOCAL_RLS_URGENT.sql`**

3. **Cliquer sur RUN** ▶️

4. **Vérifier** : Les 4 policies Storage doivent être créées
   - Users can upload audio for own messages
   - Conversation participants can read audios
   - Users can update own audios
   - Users can delete own audios

---

### **ÉTAPE 3 : Tester** (2 min)

1. **Rafraîchir la page** : F5 dans le navigateur

2. **Ouvrir Console** : F12 → Console

3. **Vérifier qu'il n'y a PLUS d'erreur 403**
   - L'erreur `analytics_online_users 403` devrait disparaître

4. **Tester message vocal**
   - Aller sur une conversation
   - Cliquer sur le bouton 🎤 Micro
   - Enregistrer 5 secondes
   - Cliquer "Envoyer"
   - ✅ Le message vocal doit apparaître dans la conversation

5. **Vérifier dans Supabase Storage**
   - Storage → message-audios
   - Vous devriez voir : `messages/{votre_user_id}/{timestamp}.webm`

---

## 🎯 **VÉRIFICATION COMPLÈTE**

### ✅ Analytics corrigé
```sql
-- Dans SQL Editor, vérifier les policies :
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'analytics_online_users';
```

**Résultat attendu** :
- `Public can upsert analytics_online_users` (ALL)
- `Admins can view analytics_online_users` (SELECT)

---

### ✅ Storage corrigé
```sql
-- Vérifier les policies Storage :
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%audio%';
```

**Résultat attendu** :
- `Users can upload audio for own messages` (INSERT)
- `Conversation participants can read audios` (SELECT)
- `Users can update own audios` (UPDATE)
- `Users can delete own audios` (DELETE)

---

### ✅ Message vocal fonctionne

**Test complet** :
1. ✅ Erreur 403 disparue dans Console
2. ✅ Bouton 🎤 ouvre le modal
3. ✅ Enregistrement fonctionne (forme d'onde visible)
4. ✅ Envoi réussi (message apparaît)
5. ✅ Lecture fonctionne (player audio avec waveform)
6. ✅ Fichier visible dans Storage → message-audios

---

## 🐛 **SI ÇA NE MARCHE TOUJOURS PAS**

### **Erreur : "Bucket not found"**
```sql
-- Créer le bucket via SQL :
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-audios',
  'message-audios',
  false,
  5242880, -- 5 MB
  ARRAY['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg']
);
```

---

### **Erreur : Policy déjà existante**
```sql
-- Supprimer l'ancienne policy et recréer :
DROP POLICY IF EXISTS "nom_de_la_policy" ON storage.objects;
-- Puis re-run le script FIX_STORAGE_VOCAL_RLS_URGENT.sql
```

---

### **Upload échoue toujours**
1. **Vérifier le path** dans Console (F12)
   - Doit être : `messages/{votre_uuid}/timestamp.webm`
   - PAS : `messages/timestamp.webm`

2. **Vérifier authentification**
   ```javascript
   // Dans Console :
   const { data } = await supabase.auth.getUser()
   console.log(data.user?.id) // Doit retourner un UUID
   ```

3. **Utiliser policies dev (temporaire)**
   ```sql
   -- Policies permissives pour DEV UNIQUEMENT :
   CREATE POLICY "Dev: authenticated can upload"
   ON storage.objects FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'message-audios');
   
   CREATE POLICY "Dev: authenticated can read"
   ON storage.objects FOR SELECT TO authenticated
   USING (bucket_id = 'message-audios');
   ```

---

## 📋 **CHECKLIST**

- [ ] ✅ Script `FIX_ANALYTICS_RLS_URGENT.sql` exécuté
- [ ] ✅ Bucket `message-audios` existe
- [ ] ✅ Script `FIX_STORAGE_VOCAL_RLS_URGENT.sql` exécuté
- [ ] ✅ Page rafraîchie (F5)
- [ ] ✅ Erreur 403 disparue dans Console
- [ ] ✅ Message vocal envoyé avec succès
- [ ] ✅ Fichier audio visible dans Storage
- [ ] ✅ Lecture audio fonctionne

---

## 🎉 **RÉSULTAT ATTENDU**

Après ces corrections :

1. ✅ **Analytics** : Heartbeat fonctionne, plus d'erreur 403
2. ✅ **Messages vocaux** : Upload → Envoi → Lecture 100% opérationnels
3. ✅ **Storage** : Fichiers audio organisés dans `messages/{user_id}/`
4. ✅ **Sécurité** : Seuls les participants peuvent lire les audios

---

## 💡 **EXPLICATION TECHNIQUE**

### **Pourquoi le message disparaissait ?**

1. **Utilisateur clique sur 🎤** → Modal s'ouvre
2. **Enregistrement audio** → Blob créé ✅
3. **Clic "Envoyer"** → `handleVoiceRecorded()` appelé
4. **Upload vers Storage** → ❌ **ÉCHOUE** (403 Forbidden - pas de policy)
5. **Erreur capturée** → `catch` block ligne 264
6. **Modal se ferme** → `onRecordingComplete()` termine
7. **Utilisateur voit** → Message disparu (jamais envoyé)

### **Solution**

Ajouter les RLS policies Storage pour permettre :
- **INSERT** : Utilisateurs peuvent uploader dans `messages/{leur_uid}/`
- **SELECT** : Participants conversation peuvent lire les audios
- **UPDATE/DELETE** : Utilisateurs peuvent gérer leurs propres audios

---

## 📞 **BESOIN D'AIDE ?**

Si le problème persiste après ces étapes :

1. **Partager la Console** (F12 → Console → screenshot)
2. **Vérifier policies** (requêtes SQL ci-dessus)
3. **Tester connexion** Supabase :
   ```javascript
   // Dans Console :
   const { data, error } = await supabase.auth.getSession()
   console.log('Session:', data, 'Error:', error)
   ```

---

**Fix créé le 26 Décembre 2024**  
**Durée estimée : 10 minutes**  
**Criticité : 🔴 URGENT**






