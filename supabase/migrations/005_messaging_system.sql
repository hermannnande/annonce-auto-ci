-- ========================================
-- SYSTÈME DE MESSAGERIE PROFESSIONNEL
-- ========================================

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  buyer_unread_count INTEGER DEFAULT 0,
  seller_unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES pour performances
-- ========================================

CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies pour conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id OR
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Policies pour messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.buyer_id = auth.uid() OR 
        conversations.seller_id = auth.uid() OR
        (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    ) AND
    sender_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can mark their messages as read" ON messages;
CREATE POLICY "Users can mark their messages as read" ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- ========================================
-- FONCTIONS UTILES
-- ========================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_updated_at ON conversations;
CREATE TRIGGER trigger_update_conversation_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- Fonction pour mettre à jour la conversation quand un message est envoyé
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation conversations%ROWTYPE;
BEGIN
  -- Récupérer la conversation
  SELECT * INTO v_conversation FROM conversations WHERE id = NEW.conversation_id;
  
  -- Mettre à jour la conversation
  UPDATE conversations
  SET 
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    buyer_unread_count = CASE 
      WHEN NEW.sender_id = v_conversation.seller_id THEN buyer_unread_count + 1
      ELSE buyer_unread_count
    END,
    seller_unread_count = CASE 
      WHEN NEW.sender_id = v_conversation.buyer_id THEN seller_unread_count + 1
      ELSE seller_unread_count
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_new_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();

-- Fonction pour réinitialiser les messages non lus
CREATE OR REPLACE FUNCTION mark_conversation_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
DECLARE
  v_conversation conversations%ROWTYPE;
BEGIN
  -- Récupérer la conversation
  SELECT * INTO v_conversation FROM conversations WHERE id = p_conversation_id;
  
  -- Mettre à jour les compteurs
  UPDATE conversations
  SET 
    buyer_unread_count = CASE 
      WHEN p_user_id = v_conversation.buyer_id THEN 0
      ELSE buyer_unread_count
    END,
    seller_unread_count = CASE 
      WHEN p_user_id = v_conversation.seller_id THEN 0
      ELSE seller_unread_count
    END
  WHERE id = p_conversation_id;
  
  -- Marquer les messages comme lus
  UPDATE messages
  SET is_read = TRUE, read_at = NOW()
  WHERE conversation_id = p_conversation_id
  AND sender_id != p_user_id
  AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions
GRANT EXECUTE ON FUNCTION mark_conversation_as_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_conversation_on_new_message() TO authenticated;
GRANT EXECUTE ON FUNCTION update_conversation_updated_at() TO authenticated;

-- ========================================
-- VUE POUR ADMIN (Toutes les conversations)
-- ========================================

CREATE OR REPLACE VIEW admin_conversations_view AS
SELECT 
  c.id,
  c.listing_id,
  c.buyer_id,
  c.seller_id,
  c.last_message,
  c.last_message_at,
  c.buyer_unread_count,
  c.seller_unread_count,
  c.status,
  c.created_at,
  l.title as listing_title,
  l.brand as listing_brand,
  l.model as listing_model,
  l.price as listing_price,
  l.images as listing_images,
  bp.full_name as buyer_name,
  bp.phone as buyer_phone,
  bp.avatar_url as buyer_avatar,
  sp.full_name as seller_name,
  sp.phone as seller_phone,
  sp.avatar_url as seller_avatar,
  (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as total_messages
FROM conversations c
LEFT JOIN listings l ON c.listing_id = l.id
LEFT JOIN profiles bp ON c.buyer_id = bp.id
LEFT JOIN profiles sp ON c.seller_id = sp.id
ORDER BY c.last_message_at DESC;

-- Permission pour admin uniquement
GRANT SELECT ON admin_conversations_view TO authenticated;

-- ========================================
-- DONNÉES DE TEST (Optionnel)
-- ========================================

-- Fonction pour créer une conversation (si elle n'existe pas déjà)
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Vérifier si la conversation existe déjà
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE listing_id = p_listing_id
  AND buyer_id = p_buyer_id
  AND seller_id = p_seller_id;
  
  -- Si elle n'existe pas, la créer
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (listing_id, buyer_id, seller_id)
    VALUES (p_listing_id, p_buyer_id, p_seller_id)
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID, UUID) TO authenticated;

-- ========================================
-- STATISTIQUES POUR ADMIN
-- ========================================

CREATE OR REPLACE VIEW admin_messages_stats AS
SELECT 
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN c.id END) as conversations_last_7_days,
  COUNT(m.id) as total_messages,
  COUNT(CASE WHEN m.created_at >= NOW() - INTERVAL '7 days' THEN m.id END) as messages_last_7_days,
  COUNT(CASE WHEN NOT m.is_read THEN m.id END) as total_unread_messages,
  AVG(EXTRACT(EPOCH FROM (m.read_at - m.created_at))/60)::INTEGER as avg_response_time_minutes
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id;

GRANT SELECT ON admin_messages_stats TO authenticated;

-- ========================================
-- ✅ Migration terminée !
-- ========================================




