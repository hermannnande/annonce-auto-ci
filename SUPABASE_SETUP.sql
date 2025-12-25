-- ============================================
-- SCRIPT SQL POUR ANNONCEAUTO.CI
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: profiles (profils utilisateurs)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('vendor', 'admin')),
  credits INTEGER DEFAULT 0,
  avatar_url TEXT,
  company_name TEXT,
  address TEXT,
  city TEXT DEFAULT 'Abidjan',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: listings (annonces de véhicules)
-- ============================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER DEFAULT 0,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  fuel_type TEXT CHECK (fuel_type IN ('essence', 'diesel', 'electrique', 'hybride')),
  transmission TEXT CHECK (transmission IN ('manuelle', 'automatique')),
  condition TEXT CHECK (condition IN ('neuf', 'occasion')) DEFAULT 'occasion',
  location TEXT NOT NULL DEFAULT 'Abidjan',
  images TEXT[] DEFAULT '{}', -- Array d'URLs d'images
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rejected', 'archived')),
  views INTEGER DEFAULT 0,
  is_boosted BOOLEAN DEFAULT FALSE,
  boost_until TIMESTAMP WITH TIME ZONE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: credit_transactions (transactions)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spent', 'refund', 'bonus')),
  description TEXT NOT NULL,
  payment_method TEXT, -- 'orange_money', 'mtn_money', 'moov_money', 'wave'
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  credits_before INTEGER DEFAULT 0,
  credits_after INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: boosts (boosts d'annonces)
-- ============================================
CREATE TABLE IF NOT EXISTS boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  credits_used INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: favorites (favoris)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- TABLE: messages (messages entre users)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES pour performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_boosted ON listings(is_boosted, boost_until);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_boosts_listing ON boosts(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, is_read);

-- ============================================
-- FONCTION: Mise à jour automatique updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS pour updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at 
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FONCTION: Créer profil après inscription
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'vendor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Créer profil automatiquement
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: profiles
-- ============================================

-- Tout le monde peut voir tous les profils (pour afficher vendeur sur annonce)
DROP POLICY IF EXISTS "Profiles visibles par tous" ON profiles;
CREATE POLICY "Profiles visibles par tous" 
  ON profiles FOR SELECT 
  USING (true);

-- Utilisateurs peuvent mettre à jour leur propre profil
DROP POLICY IF EXISTS "Users peuvent update leur profil" ON profiles;
CREATE POLICY "Users peuvent update leur profil" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================
-- POLICIES: listings
-- ============================================

-- Tout le monde peut voir les annonces actives
DROP POLICY IF EXISTS "Listings actives visibles par tous" ON listings;
CREATE POLICY "Listings actives visibles par tous" 
  ON listings FOR SELECT 
  USING (
    status = 'active' 
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Users peuvent créer leurs propres annonces
DROP POLICY IF EXISTS "Users peuvent créer listings" ON listings;
CREATE POLICY "Users peuvent créer listings" 
  ON listings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users peuvent modifier leurs propres annonces (ou admin)
DROP POLICY IF EXISTS "Users peuvent update leurs listings" ON listings;
CREATE POLICY "Users peuvent update leurs listings" 
  ON listings FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Users peuvent supprimer leurs propres annonces (ou admin)
DROP POLICY IF EXISTS "Users peuvent delete leurs listings" ON listings;
CREATE POLICY "Users peuvent delete leurs listings" 
  ON listings FOR DELETE 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- ============================================
-- POLICIES: credit_transactions
-- ============================================

-- Users voient seulement leurs transactions (ou admin tout)
DROP POLICY IF EXISTS "Users voient leurs transactions" ON credit_transactions;
CREATE POLICY "Users voient leurs transactions" 
  ON credit_transactions FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Users peuvent créer des transactions
DROP POLICY IF EXISTS "Users créent transactions" ON credit_transactions;
CREATE POLICY "Users créent transactions" 
  ON credit_transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POLICIES: boosts
-- ============================================

-- Users voient leurs boosts (ou admin tout)
DROP POLICY IF EXISTS "Users voient leurs boosts" ON boosts;
CREATE POLICY "Users voient leurs boosts" 
  ON boosts FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Users créent boosts
DROP POLICY IF EXISTS "Users créent boosts" ON boosts;
CREATE POLICY "Users créent boosts" 
  ON boosts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POLICIES: favorites
-- ============================================

-- Users voient leurs favoris
DROP POLICY IF EXISTS "Users voient leurs favoris" ON favorites;
CREATE POLICY "Users voient leurs favoris" 
  ON favorites FOR SELECT 
  USING (auth.uid() = user_id);

-- Users créent favoris
DROP POLICY IF EXISTS "Users créent favoris" ON favorites;
CREATE POLICY "Users créent favoris" 
  ON favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users suppriment favoris
DROP POLICY IF EXISTS "Users suppriment favoris" ON favorites;
CREATE POLICY "Users suppriment favoris" 
  ON favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: messages
-- ============================================

-- Users voient messages envoyés ou reçus
DROP POLICY IF EXISTS "Users voient leurs messages" ON messages;
CREATE POLICY "Users voient leurs messages" 
  ON messages FOR SELECT 
  USING (
    auth.uid() = sender_id 
    OR auth.uid() = recipient_id
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Users créent messages
DROP POLICY IF EXISTS "Users créent messages" ON messages;
CREATE POLICY "Users créent messages" 
  ON messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Users update leurs messages reçus (marquer lu)
DROP POLICY IF EXISTS "Users update messages reçus" ON messages;
CREATE POLICY "Users update messages reçus" 
  ON messages FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- ============================================
-- DONNÉES DE TEST (optionnel)
-- ============================================

-- Créer un utilisateur admin test
-- NOTE: Vous devez d'abord créer cet utilisateur via l'interface Supabase Auth
-- Puis mettre à jour son profil avec cette requête (remplacer l'email)

-- UPDATE profiles 
-- SET user_type = 'admin', full_name = 'Admin Test'
-- WHERE email = 'admin@annonceauto.ci';

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue: Statistiques par utilisateur
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.credits,
  COUNT(DISTINCT l.id) as total_listings,
  COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_listings,
  COUNT(DISTINCT CASE WHEN l.status = 'sold' THEN l.id END) as sold_listings,
  COALESCE(SUM(l.views), 0) as total_views,
  COUNT(DISTINCT b.id) as total_boosts
FROM profiles p
LEFT JOIN listings l ON l.user_id = p.id
LEFT JOIN boosts b ON b.user_id = p.id
GROUP BY p.id, p.email, p.full_name, p.user_type, p.credits;

-- Vue: Annonces avec infos vendeur
CREATE OR REPLACE VIEW listings_with_vendor AS
SELECT 
  l.*,
  p.full_name as vendor_name,
  p.email as vendor_email,
  p.phone as vendor_phone,
  p.company_name as vendor_company,
  p.city as vendor_city
FROM listings l
JOIN profiles p ON p.id = l.user_id;

-- ============================================
-- FONCTIONS UTILES
-- ============================================

-- Fonction: Incrémenter les vues d'une annonce
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings 
  SET views = views + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: Vérifier et désactiver les boosts expirés
CREATE OR REPLACE FUNCTION check_expired_boosts()
RETURNS void AS $$
BEGIN
  -- Désactiver les boosts expirés
  UPDATE boosts 
  SET is_active = false 
  WHERE ends_at < NOW() AND is_active = true;
  
  -- Mettre à jour les listings
  UPDATE listings 
  SET is_boosted = false, boost_until = NULL
  WHERE boost_until < NOW() AND is_boosted = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CONFIGURATION: Désactiver confirmation email
-- (pour développement seulement)
-- ============================================
-- Aller dans: Authentication > Settings > Email Auth
-- Désactiver "Enable email confirmations"

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Vérifier que tout est créé
SELECT 'Tables créées:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'Setup terminé avec succès!' as status;
