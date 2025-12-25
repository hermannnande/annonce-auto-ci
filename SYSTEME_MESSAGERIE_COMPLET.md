# 💬 **SYSTÈME DE MESSAGERIE PROFESSIONNEL - DOCUMENTATION COMPLÈTE**

---

## 🎯 **FONCTIONNALITÉS IMPLÉMENTÉES**

### ✅ **Base de données (Supabase)**
- Table `conversations` : Stocke toutes les conversations entre acheteur et vendeur
- Table `messages` : Contient tous les messages échangés
- RLS (Row Level Security) : Sécurité avancée pour protéger les données
- Triggers automatiques : Mise à jour automatique des compteurs de messages non lus
- Fonctions SQL : `get_or_create_conversation`, `mark_conversation_as_read`
- Vue admin : `admin_conversations_view` pour voir toutes les conversations
- Vue statistiques : `admin_messages_stats` pour le dashboard admin

### ✅ **Service TypeScript (`messages.service.ts`)**
- CRUD complet pour conversations et messages
- Gestion temps réel avec Supabase Realtime
- Subscriptions pour notifications instantanées
- Méthodes admin pour surveillance globale
- Statistiques de messagerie

### ✅ **Composants UI**
- `ChatBox` : Interface de chat moderne et fluide
- `ConversationsList` : Liste des conversations avec recherche
- Design premium avec animations Framer Motion
- Bulles de messages stylisées
- Compteurs de messages non lus
- Avatars personnalisés

---

## 📋 **STRUCTURE DES DONNÉES**

### **Table `conversations`**
```sql
id                  : UUID (PK)
listing_id          : UUID (FK → listings)
buyer_id            : UUID (FK → profiles)
seller_id           : UUID (FK → profiles)
last_message        : TEXT
last_message_at     : TIMESTAMP
buyer_unread_count  : INTEGER
seller_unread_count : INTEGER
status              : TEXT ('active'|'archived'|'blocked')
created_at          : TIMESTAMP
updated_at          : TIMESTAMP
```

### **Table `messages`**
```sql
id              : UUID (PK)
conversation_id : UUID (FK → conversations)
sender_id       : UUID (FK → profiles)
content         : TEXT
is_read         : BOOLEAN
read_at         : TIMESTAMP
created_at      : TIMESTAMP
```

---

## 🚀 **INSTALLATION**

### **1. Exécuter le SQL dans Supabase**

Va sur **Supabase Dashboard** → **SQL Editor** et exécute :
```sql
-- Contenu de 005_messaging_system.sql
```

Tu dois voir : ✅ **Success**

### **2. Installer la dépendance date-fns**

```bash
pnpm add date-fns
```

---

## 📄 **PAGES À CRÉER**

### **VendorMessages.tsx** (À créer)
```tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChatBox } from '../../components/messages/ChatBox';
import { ConversationsList } from '../../components/messages/ConversationsList';
import { messagesService, Conversation } from '../../services/messages.service';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function VendorMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
      
      // S'abonner aux mises à jour en temps réel
      const subscription = messagesService.subscribeToConversations(user.id, (conversation) => {
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === conversation.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = conversation;
            return updated.sort((a, b) => 
              new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
            );
          }
          return [conversation, ...prev];
        });
      });

      return () => {
        messagesService.unsubscribe(subscription);
      };
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    const fetchedConversations = await messagesService.getUserConversations(user.id);
    setConversations(fetchedConversations);
    if (fetchedConversations.length > 0 && !selectedConversation) {
      setSelectedConversation(fetchedConversations[0]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout userType="vendor">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-[#FACC15]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Messages</h1>
          <p className="text-gray-600">Gérez vos conversations avec les clients</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Liste des conversations */}
          <div className="lg:col-span-1">
            <ConversationsList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id || null}
              onSelectConversation={setSelectedConversation}
              currentUserId={user?.id || ''}
            />
          </div>

          {/* Chat box */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ChatBox conversation={selectedConversation} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">Sélectionnez une conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### **AdminMessages.tsx** (À créer)
```tsx
// Similar à VendorMessages.tsx mais utilise :
// - messagesService.getAllConversations() au lieu de getUserConversations()
// - Affiche TOUTES les conversations de la plateforme
// - Statistiques supplémentaires avec messagesService.getMessagingStats()
```

---

## 🔗 **AJOUTER LES ROUTES**

### **Dans `App.tsx`**
```tsx
import { VendorMessages } from './pages/dashboard/VendorMessages';
import { AdminMessages } from './pages/dashboard/AdminMessages';

// Dans les routes protégées vendeur
<Route path="/dashboard/vendeur/messages" element={<VendorMessages />} />

// Dans les routes protégées admin
<Route path="/dashboard/admin/messages" element={<AdminMessages />} />
```

### **Dans le menu Dashboard**
Ajouter un item "Messages" avec l'icône `MessageCircle`.

---

## 💡 **UTILISATION**

### **Pour démarrer une conversation (depuis VehicleDetailPage.tsx)**
```tsx
import { messagesService } from '../services/messages.service';
import { useNavigate } from 'react-router-dom';

const handleSendMessage = async () => {
  if (!user) return;
  
  const { conversation } = await messagesService.getOrCreateConversation(
    vehicle.id,        // listing_id
    user.id,           // buyer_id
    vehicle.user_id    // seller_id
  );
  
  if (conversation) {
    // Rediriger vers la page messages
    navigate('/dashboard/vendeur/messages');
  }
};

// Remplacer le bouton "Envoyer un message" par :
<Button onClick={handleSendMessage}>
  <Mail className="w-5 h-5" />
  Envoyer un message
</Button>
```

---

## 🎨 **DESIGN FEATURES**

### **ChatBox**
- ✅ Bulles de messages stylisées (doré pour l'envoyeur, blanc pour le destinataire)
- ✅ Avatars avec gradient doré
- ✅ Timestamps relatifs ("il y a 5 min")
- ✅ Double check (✓✓) pour les messages lus
- ✅ Auto-resize du textarea
- ✅ Animation d'envoi
- ✅ Scroll automatique vers le bas

### **ConversationsList**
- ✅ Recherche en temps réel
- ✅ Badge de messages non lus
- ✅ Miniature du véhicule
- ✅ Dernière activité
- ✅ Highlight de la conversation sélectionnée
- ✅ Compteur total en footer

---

## 📊 **STATISTIQUES ADMIN**

Le service fourni `getMessagingStats()` qui retourne :
```typescript
{
  totalConversations: number,
  conversationsLast7Days: number,
  totalMessages: number,
  messagesLast7Days: number,
  totalUnreadMessages: number,
  avgResponseTimeMinutes: number
}
```

Utilise ces stats dans le `AdminDashboard` pour afficher :
- Nombre total de conversations
- Messages envoyés (7 derniers jours)
- Temps de réponse moyen
- Messages non lus

---

## 🔒 **SÉCURITÉ (RLS)**

### **Qui peut voir quoi ?**
- ✅ Un **acheteur** voit uniquement ses conversations (où `buyer_id = user_id`)
- ✅ Un **vendeur** voit uniquement ses conversations (où `seller_id = user_id`)
- ✅ Un **admin** voit TOUTES les conversations
- ✅ Impossible d'envoyer un message dans une conversation dont on ne fait pas partie
- ✅ Les messages sont automatiquement protégés via les conversations

---

## ⚡ **TEMPS RÉEL**

### **Notifications instantanées**
- ✅ `subscribeToMessages(conversationId, callback)` : Reçoit les nouveaux messages
- ✅ `subscribeToConversations(userId, callback)` : Reçoit les mises à jour de conversations
- ✅ Auto-reconnexion en cas de perte de connexion
- ✅ Pas besoin de rafraîchir la page !

---

## 🧪 **TESTS**

### **Test 1 : Créer une conversation**
1. En tant que **vendeur**, publie une annonce
2. En tant que **acheteur**, visite l'annonce
3. Clique sur "Envoyer un message"
4. ✅ Une conversation est créée

### **Test 2 : Envoyer des messages**
1. Tape un message et envoie
2. ✅ Le message apparaît instantanément
3. Connecte-toi avec l'autre utilisateur
4. ✅ Le message apparaît aussi de son côté

### **Test 3 : Compteurs non lus**
1. Envoie un message
2. ✅ Le destinataire voit un badge "1" sur la conversation
3. Il ouvre la conversation
4. ✅ Le badge disparaît

### **Test 4 : Admin voit tout**
1. Connecte-toi en tant qu'**admin**
2. Va dans Messages
3. ✅ Tu vois TOUTES les conversations de la plateforme

---

## 📦 **FICHIERS CRÉÉS**

1. ✅ `supabase/migrations/005_messaging_system.sql`
2. ✅ `src/app/services/messages.service.ts`
3. ✅ `src/app/components/messages/ChatBox.tsx`
4. ✅ `src/app/components/messages/ConversationsList.tsx`
5. ⏳ `src/app/pages/dashboard/VendorMessages.tsx` (À créer)
6. ⏳ `src/app/pages/dashboard/AdminMessages.tsx` (À créer)

---

## 🎯 **PROCHAINES ÉTAPES**

1. **Exécute le SQL** dans Supabase
2. **Installe date-fns** : `pnpm add date-fns`
3. **Crée les pages** VendorMessages et AdminMessages
4. **Ajoute les routes** dans App.tsx
5. **Ajoute le bouton** "Envoyer un message" dans VehicleDetailPage
6. **Teste** le système !

---

**🎉 TON SYSTÈME DE MESSAGERIE EST PRÊT ! C'EST PRO, MODERNE ET EN TEMPS RÉEL ! 💬**




