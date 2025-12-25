-- =====================================================
-- MIGRATION: Ajout des colonnes pour paramètres utilisateur
-- Date: 23 Décembre 2024
-- Description: Ajoute les colonnes pour notifications, adresse et entreprise
-- =====================================================

-- Ajouter les colonnes d'adresse
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Abidjan';

-- Ajouter les colonnes de notifications
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notify_views BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_favorites BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_messages BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_moderation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_boost_expired BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_low_credits BOOLEAN DEFAULT true;

-- Ajouter les colonnes d'entreprise
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'Particulier' CHECK (account_type IN ('Particulier', 'Professionnel', 'Concessionnaire')),
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_id TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT;

-- Index pour améliorer les requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

-- ✅ Migration terminée avec succès !




