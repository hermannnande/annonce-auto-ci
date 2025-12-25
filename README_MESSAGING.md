# 📎 Configuration des Pièces Jointes et Réponses

## ✅ Fonctionnalités implémentées

### 1. **Pièces jointes et médias**
- 📷 Upload d'images (JPG, PNG, GIF, WebP)
- 🎥 Upload de vidéos (MP4, MOV, etc.)
- 📄 Upload de documents (PDF, DOC, DOCX, TXT)
- 👁️ Aperçu des images directement dans le chat
- ⬇️ Téléchargement des fichiers
- 🗑️ Suppression des pièces jointes avant envoi
- ⚡ Limite de taille : 10 MB par fichier

### 2. **Réponses aux messages (Quote/Reply)**
- ↩️ Bouton "Répondre" sur chaque message reçu
- 📝 Affichage du message cité dans la réponse
- ❌ Annulation de la réponse avant envoi
- 🎨 Design cohérent avec le reste de l'interface

---

## 🔧 Configuration Supabase (OBLIGATOIRE)

### Étape 1 : Appliquer la migration SQL

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez et exécutez le contenu de `INSTRUCTIONS_SUPABASE.sql`

Cela va :
- ✅ Ajouter la colonne `attachments` à la table `messages`
- ✅ Ajouter la colonne `reply_to_id` à la table `messages`
- ✅ Créer les indexes nécessaires

### Étape 2 : Créer le bucket Storage

1. Dans le Dashboard Supabase, allez dans **Storage**
2. Cliquez sur **Create bucket**
3. Configurez le bucket :
   - **Name**: `message-attachments`
   - **Public bucket**: ✅ OUI (cochez la case)
   - **File size limit**: 10 MB
   - Cliquez sur **Create bucket**

### Étape 3 : Configurer les politiques RLS du bucket

1. Cliquez sur le bucket `message-attachments`
2. Allez dans l'onglet **Policies**
3. Créez 3 nouvelles politiques :

#### Politique 1 : Lecture (SELECT)
- **Nom**: `Users can view attachments in their conversations`
- **Policy command**: SELECT
- **Target roles**: authenticated
- **USING expression**:
```sql
bucket_id = 'message-attachments' AND (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    AND storage.foldername(name)[1] = c.id::text
  )
)
```

#### Politique 2 : Upload (INSERT)
- **Nom**: `Users can upload attachments to their conversations`
- **Policy command**: INSERT
- **Target roles**: authenticated
- **WITH CHECK expression**:
```sql
bucket_id = 'message-attachments' AND (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    AND storage.foldername(name)[1] = c.id::text
  )
)
```

#### Politique 3 : Suppression (DELETE)
- **Nom**: `Users can delete their own attachments`
- **Policy command**: DELETE
- **Target roles**: authenticated
- **USING expression**:
```sql
bucket_id = 'message-attachments' AND (
  auth.uid() IN (
    SELECT sender_id FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE storage.foldername(name)[1] = c.id::text
  )
)
```

---

## 🎨 Interface Utilisateur

### Pièces jointes
- Bouton **📎** (trombone) à côté du champ de saisie
- Aperçu des fichiers avant envoi avec possibilité de suppression
- Affichage des images en haute qualité dans le chat
- Affichage des documents avec icône et taille
- Possibilité de télécharger les fichiers

### Réponses
- Bouton **↩️** qui apparaît au survol de chaque message reçu
- Bandeau jaune affichant le message cité
- Bouton **✕** pour annuler la réponse
- Le message cité est affiché dans le message de réponse

---

## 🚀 Test de fonctionnement

1. ✅ Vérifier que le serveur tourne : `pnpm dev`
2. ✅ Ouvrir la page de messagerie dans le dashboard vendeur
3. ✅ Tester l'upload d'une image
4. ✅ Tester la réponse à un message
5. ✅ Vérifier l'affichage des pièces jointes
6. ✅ Tester le téléchargement d'un fichier

---

## 📁 Fichiers modifiés/créés

### Nouveaux fichiers
- `src/app/components/messages/MessageAttachment.tsx` - Composant d'affichage des pièces jointes
- `src/app/components/messages/QuotedMessage.tsx` - Composant pour les messages cités
- `supabase/migrations/006_add_message_attachments_and_replies.sql` - Migration SQL
- `INSTRUCTIONS_SUPABASE.sql` - Instructions de configuration
- `README_MESSAGING.md` - Ce fichier

### Fichiers modifiés
- `src/app/services/messages.service.ts` - Ajout méthodes upload et gestion replies
- `src/app/components/messages/ChatBox.tsx` - UI des pièces jointes et réponses

---

## 🐛 Dépannage

### Erreur "Failed to upload file"
- Vérifiez que le bucket `message-attachments` existe
- Vérifiez que le bucket est public
- Vérifiez les politiques RLS

### Les images ne s'affichent pas
- Vérifiez que le bucket est **public**
- Vérifiez la politique SELECT (lecture)

### Impossible d'uploader des fichiers
- Vérifiez la politique INSERT
- Vérifiez la taille du fichier (max 10MB)
- Vérifiez le type de fichier (formats supportés)

---

## 🎯 Prochaines améliorations possibles

- [ ] Compression automatique des images
- [ ] Génération de miniatures pour les vidéos
- [ ] Émojis picker
- [ ] Copie du texte d'un message
- [ ] Réactions rapides (👍, ❤️, etc.)
- [ ] Messages vocaux
- [ ] Partage de localisation



