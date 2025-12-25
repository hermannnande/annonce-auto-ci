-- =====================================================
-- ANNONCEAUTO.CI - MIGRATION INITIALE SUPABASE
-- Version: 1.0
-- Date: 22 Décembre 2024
-- =====================================================

-- Active l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: profiles
-- Description: Profils utilisateurs (vendeurs et admins)
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('vendor', 'admin')),
  credits INTEGER DEFAULT 0 CHECK (credits >= 0),
  avatar_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: listings
-- Description: Annonces de véhicules
-- =====================================================

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Infos véhicule
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  price INTEGER NOT NULL CHECK (price > 0),
  location TEXT NOT NULL,
  description TEXT,
  
  -- Caractéristiques
  mileage INTEGER NOT NULL CHECK (mileage >= 0),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Essence', 'Diesel', 'Électrique', 'Hybride')),
  transmission TEXT NOT NULL CHECK (transmission IN ('Automatique', 'Manuelle')),
  condition TEXT NOT NULL CHECK (condition IN ('Neuf', 'Occasion', 'Importé')),
  doors INTEGER NOT NULL CHECK (doors >= 2 AND doors <= 7),
  color TEXT NOT NULL,
  
  -- Images (array de URLs Supabase Storage)
  images TEXT[] DEFAULT '{}',
  
  -- Statut et modération
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'sold')),
  reject_reason TEXT,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Stats
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  is_boosted BOOLEAN DEFAULT false,
  boost_expires_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_brand ON listings(brand);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_year ON listings(year);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_is_boosted ON listings(is_boosted) WHERE is_boosted = true;
CREATE INDEX idx_listings_featured ON listings(featured) WHERE featured = true;

-- Full-text search index (pour recherche avancée)
CREATE INDEX idx_listings_search ON listings USING GIN (
  to_tsvector('french', title || ' ' || brand || ' ' || model || ' ' || COALESCE(description, ''))
);

-- RLS Policies
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Public peut voir SEULEMENT les annonces "active"
CREATE POLICY "Public can view active listings"
  ON listings FOR SELECT
  USING (status = 'active');

-- Vendeurs peuvent voir leurs propres annonces (tous statuts)
CREATE POLICY "Vendors can view own listings"
  ON listings FOR SELECT
  USING (auth.uid() = user_id);

-- Vendeurs peuvent créer des annonces (toujours en "pending")
CREATE POLICY "Vendors can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Vendeurs peuvent modifier leurs annonces "pending" ou "rejected"
CREATE POLICY "Vendors can update own pending/rejected listings"
  ON listings FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status IN ('pending', 'rejected')
  );

-- Vendeurs peuvent marquer leurs annonces comme "sold"
CREATE POLICY "Vendors can mark own listings as sold"
  ON listings FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status = 'active'
  )
  WITH CHECK (
    status = 'sold'
  );

-- Vendeurs peuvent supprimer leurs propres annonces
CREATE POLICY "Vendors can delete own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- Admins peuvent TOUT voir et modifier
CREATE POLICY "Admins can do everything on listings"
  ON listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: favorites
-- Description: Favoris des utilisateurs
-- =====================================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un user ne peut favoriser qu'une fois la même annonce
  UNIQUE(user_id, listing_id)
);

-- Indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);

-- RLS Policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: credits_transactions
-- Description: Historique des transactions de crédits
-- =====================================================

CREATE TABLE credits_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positif = ajout, Négatif = retrait
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  type TEXT NOT NULL CHECK (type IN ('purchase', 'boost', 'admin_adjustment', 'refund', 'gift')),
  description TEXT NOT NULL,
  
  -- Infos paiement (si achat)
  payment_method TEXT,
  payment_reference TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Admin qui a fait l'ajustement (si applicable)
  admin_id UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credits_user_id ON credits_transactions(user_id);
CREATE INDEX idx_credits_type ON credits_transactions(type);
CREATE INDEX idx_credits_created_at ON credits_transactions(created_at DESC);

-- RLS Policies
ALTER TABLE credits_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credits_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON credits_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can create transactions"
  ON credits_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =====================================================
-- TABLE: notifications
-- Description: Notifications utilisateurs
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- TABLE: views_tracking
-- Description: Compteur de vues des annonces
-- =====================================================

CREATE TABLE views_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  
  -- Session tracking (pour éviter double comptage)
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Une session ne peut voir qu'une fois la même annonce
  UNIQUE(listing_id, session_id)
);

-- Index
CREATE INDEX idx_views_listing_id ON views_tracking(listing_id);
CREATE INDEX idx_views_viewed_at ON views_tracking(viewed_at DESC);

-- RLS Policies
ALTER TABLE views_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track views"
  ON views_tracking FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can view tracking"
  ON views_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id AND l.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all tracking"
  ON views_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour incrémenter les vues
CREATE OR REPLACE FUNCTION increment_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET views = views + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajuster les crédits
CREATE OR REPLACE FUNCTION adjust_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_admin_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Mettre à jour le solde
  UPDATE profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;
  
  -- Enregistrer la transaction
  INSERT INTO credits_transactions (
    user_id,
    amount,
    balance_after,
    type,
    description,
    admin_id
  ) VALUES (
    p_user_id,
    p_amount,
    v_new_balance,
    p_type,
    p_description,
    p_admin_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour booster une annonce
CREATE OR REPLACE FUNCTION boost_listing(
  p_listing_id UUID,
  p_user_id UUID,
  p_duration_days INTEGER DEFAULT 7
)
RETURNS JSONB AS $$
DECLARE
  v_cost INTEGER := 50; -- 50 crédits par boost
  v_user_credits INTEGER;
  v_result JSONB;
BEGIN
  -- Vérifier le solde
  SELECT credits INTO v_user_credits
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_credits < v_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Crédits insuffisants'
    );
  END IF;
  
  -- Débiter les crédits
  PERFORM adjust_credits(
    p_user_id,
    -v_cost,
    'boost',
    'Boost annonce #' || p_listing_id
  );
  
  -- Activer le boost
  UPDATE listings
  SET 
    is_boosted = true,
    boost_expires_at = NOW() + (p_duration_days || ' days')::INTERVAL
  WHERE id = p_listing_id AND user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Annonce boostée avec succès',
    'expires_at', NOW() + (p_duration_days || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VUES UTILITAIRES
-- =====================================================

-- Vue: Statistiques globales
CREATE OR REPLACE VIEW global_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'vendor') AS total_vendors,
  (SELECT COUNT(*) FROM listings WHERE status = 'active') AS total_active_listings,
  (SELECT COUNT(*) FROM listings WHERE status = 'pending') AS pending_listings,
  (SELECT SUM(credits) FROM profiles) AS total_credits_in_circulation,
  (SELECT SUM(amount) FROM credits_transactions WHERE amount > 0 AND type = 'purchase') AS total_credits_purchased,
  (SELECT SUM(amount) FROM credits_transactions WHERE amount < 0) AS total_credits_spent,
  (SELECT COUNT(*) FROM favorites) AS total_favorites,
  (SELECT SUM(views) FROM listings) AS total_views;

-- Vue: Top annonces (par vues)
CREATE OR REPLACE VIEW top_listings AS
SELECT
  l.*,
  p.full_name AS seller_name,
  p.phone AS seller_phone,
  p.verified AS seller_verified
FROM listings l
JOIN profiles p ON l.user_id = p.id
WHERE l.status = 'active'
ORDER BY l.views DESC
LIMIT 20;

-- =====================================================
-- DONNÉES DE DÉMO (Optionnel - à commenter en prod)
-- =====================================================

-- Créer un admin par défaut
-- ⚠️ À COMMENTER EN PRODUCTION
-- INSERT INTO profiles (id, email, full_name, phone, user_type, credits, verified)
-- VALUES (
--   'ADMIN_UUID_HERE',
--   'admin@annonceauto.ci',
--   'Admin AnnonceAuto',
--   '+225 07 00 00 00 00',
--   'admin',
--   1000,
--   true
-- );

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

-- Afficher un message de succès
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration 001_initial_schema.sql terminée avec succès !';
  RAISE NOTICE '📊 Tables créées: profiles, listings, favorites, credits_transactions, notifications, views_tracking';
  RAISE NOTICE '🔐 Row Level Security activé sur toutes les tables';
  RAISE NOTICE '⚡ Indexes de performance créés';
  RAISE NOTICE '🚀 Prêt pour la production !';
END $$;
