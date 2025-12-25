# 🚀 GUIDE MIGRATION VERS PRODUCTION - CURSOR AI
## AnnonceAuto.CI - Migration localStorage → Supabase

**Date :** 22 Décembre 2024  
**Version :** 1.0  
**Pour :** Cursor AI Assistant

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture actuelle (DÉMO)](#architecture-actuelle-démo)
3. [Architecture cible (PRODUCTION)](#architecture-cible-production)
4. [Schémas de base de données](#schémas-de-base-de-données)
5. [Configuration Supabase](#configuration-supabase)
6. [Migration des données](#migration-des-données)
7. [Mise à jour du code](#mise-à-jour-du-code)
8. [Tests et validation](#tests-et-validation)

---

## 🎯 VUE D'ENSEMBLE

### État actuel
- ✅ Application 99% fonctionnelle en mode **DÉMO localStorage**
- ✅ Toutes les fonctionnalités implémentées
- ✅ UI/UX complète et professionnelle
- ⚠️ Données volatiles (effacées si cache navigateur vidé)

### Objectif
- 🎯 Migrer vers **Supabase** pour persistance réelle
- 🎯 Authentification sécurisée avec JWT
- 🎯 Base de données PostgreSQL
- 🎯 Storage pour images des véhicules
- 🎯 Row Level Security (RLS) pour la sécurité
- 🎯 Export/Import des données

---

## 🔧 ARCHITECTURE ACTUELLE (DÉMO)

### Stockage localStorage

```typescript
// Clés utilisées dans localStorage
{
  "annonceauto_user": {
    id: string,
    email: string,
    profile: {
      name: string,
      phone: string,
      user_type: 'vendor' | 'admin'
    }
  },
  
  "annonceauto_demo_listings": [
    {
      id: string,
      title: string,
      brand: string,
      model: string,
      year: number,
      price: number,
      location: string,
      description: string,
      images: string[],
      status: 'pending' | 'active' | 'rejected' | 'sold',
      mileage: number,
      fuel_type: string,
      transmission: string,
      condition: string,
      doors: number,
      color: string,
      views: number,
      is_boosted: boolean,
      featured: boolean,
      created_at: string,
      updated_at: string,
      seller: {
        name: string,
        type: string,
        verified: boolean,
        phone: string
      }
    }
  ],
  
  "annonceauto_favorites": string[], // Array d'IDs
  
  "annonceauto_views": {
    [vehicleId: string]: boolean
  }
}
```

### Limitations localStorage
- ❌ Limite de 5-10 MB par domaine
- ❌ Pas de synchronisation multi-appareils
- ❌ Pas de sécurité (accessible via console)
- ❌ Pas de requêtes complexes
- ❌ Données perdues si cache vidé
- ❌ Pas de backup automatique

---

## 🎯 ARCHITECTURE CIBLE (PRODUCTION)

### Stack Supabase

```
┌─────────────────────────────────────────┐
│         FRONTEND (React + Vite)         │
│  - Authentification JWT                 │
│  - Upload images                        │
│  - Requêtes API REST/GraphQL            │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│            SUPABASE BACKEND             │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   PostgreSQL Database             │  │
│  │   - Tables normalisées            │  │
│  │   - Relations (FK)                │  │
│  │   - Indexes pour performance      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   Authentication (Auth)           │  │
│  │   - JWT tokens                    │  │
│  │   - Email/Password                │  │
│  │   - Social login (Google, etc)    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   Storage (Fichiers)              │  │
│  │   - Images véhicules              │  │
│  │   - Documents vendeurs            │  │
│  │   - CDN global                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   Row Level Security (RLS)        │  │
│  │   - Vendeur: CRUD ses annonces    │  │
│  │   - Admin: Tout                   │  │
│  │   - Public: Lecture annonces actives │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 📊 SCHÉMAS DE BASE DE DONNÉES

### 1. Table `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('vendor', 'admin')),
  credits INTEGER DEFAULT 0,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_email ON profiles(email);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public peut lire tous les profils (pour infos vendeur)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users peuvent insérer leur propre profil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

### 2. Table `listings` (Annonces)

```sql
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
  views INTEGER DEFAULT 0,
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
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_is_boosted ON listings(is_boosted) WHERE is_boosted = true;

-- Full-text search index
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

-- Vendeurs peuvent créer des annonces
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

-- Vendeurs peuvent supprimer leurs propres annonces
CREATE POLICY "Vendors can delete own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- Admins peuvent TOUT voir et modifier
CREATE POLICY "Admins can do everything"
  ON listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );
```

---

### 3. Table `favorites` (Favoris)

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un user ne peut favoriser qu'une fois la même annonce
  UNIQUE(user_id, listing_id)
);

-- Index pour performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);

-- RLS Policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users peuvent voir leurs propres favoris
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users peuvent ajouter des favoris
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users peuvent supprimer leurs favoris
CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 4. Table `credits_transactions`

```sql
CREATE TABLE credits_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positif = ajout, Négatif = retrait
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

-- Users peuvent voir leur historique
CREATE POLICY "Users can view own transactions"
  ON credits_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all transactions"
  ON credits_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Admins peuvent créer des ajustements
CREATE POLICY "Admins can create adjustments"
  ON credits_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );
```

---

### 5. Table `notifications`

```sql
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

-- Users peuvent voir leurs notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users peuvent marquer leurs notifications comme lues
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users peuvent supprimer leurs notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 6. Table `views_tracking` (Compteur de vues)

```sql
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

-- Tous peuvent ajouter des vues
CREATE POLICY "Anyone can track views"
  ON views_tracking FOR INSERT
  WITH CHECK (true);

-- Seuls admins et propriétaires peuvent voir
CREATE POLICY "Owners and admins can view tracking"
  ON views_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id 
      AND (l.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'))
    )
  );
```

---

## ⚙️ CONFIGURATION SUPABASE

### Étape 1 : Créer un projet Supabase

1. **Aller sur :** https://supabase.com
2. **Cliquer :** "Start your project"
3. **Créer un nouveau projet :**
   - Name: `annonceauto-ci`
   - Database Password: (générer un mot de passe fort)
   - Region: `West EU (Ireland)` (plus proche de la Côte d'Ivoire)
4. **Attendre 2-3 minutes** pour provisioning

---

### Étape 2 : Récupérer les credentials

Dans Supabase Dashboard → Settings → API :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

---

### Étape 3 : Créer le fichier `.env`

```bash
# Créer à la racine du projet
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

⚠️ **IMPORTANT :** Ajouter `.env` au `.gitignore`

---

### Étape 4 : Exécuter les migrations SQL

Dans Supabase Dashboard → SQL Editor :

1. **Copier le contenu du fichier :** `/supabase/migrations/001_initial_schema.sql`
2. **Coller dans SQL Editor**
3. **Cliquer :** "Run"
4. **Vérifier :** Tables apparaissent dans "Table Editor"

---

### Étape 5 : Configurer le Storage

Dans Supabase Dashboard → Storage :

1. **Créer un bucket :** `vehicle-images`
2. **Configuration :**
   - Public: `Yes`
   - File size limit: `5 MB`
   - Allowed MIME types: `image/jpeg, image/png, image/webp`
3. **Créer les policies :**

```sql
-- Tout le monde peut lire
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-images');

-- Vendeurs peuvent upload
CREATE POLICY "Vendors can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND auth.role() = 'authenticated'
  );

-- Vendeurs peuvent supprimer leurs images
CREATE POLICY "Vendors can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 📦 MIGRATION DES DONNÉES

### Script d'export localStorage → JSON

```typescript
// Fichier: /scripts/export-localstorage-data.ts

import fs from 'fs';

// Fonction à exécuter dans la console navigateur
function exportLocalStorageData() {
  const data = {
    users: localStorage.getItem('annonceauto_user') 
      ? JSON.parse(localStorage.getItem('annonceauto_user')!) 
      : null,
    
    listings: localStorage.getItem('annonceauto_demo_listings')
      ? JSON.parse(localStorage.getItem('annonceauto_demo_listings')!)
      : [],
    
    favorites: localStorage.getItem('annonceauto_favorites')
      ? JSON.parse(localStorage.getItem('annonceauto_favorites')!)
      : [],
    
    views: localStorage.getItem('annonceauto_views')
      ? JSON.parse(localStorage.getItem('annonceauto_views')!)
      : {},
    
    exportedAt: new Date().toISOString()
  };
  
  // Créer un Blob et télécharger
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `annonceauto-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('✅ Données exportées avec succès !');
  console.log(`📊 ${data.listings.length} annonces`);
  console.log(`❤️ ${data.favorites.length} favoris`);
}

// Exécuter dans la console
exportLocalStorageData();
```

**Instructions :**
1. Ouvrir l'application dans le navigateur
2. Ouvrir la console (F12)
3. Copier/coller la fonction ci-dessus
4. Appuyer sur Enter
5. Le fichier JSON se télécharge automatiquement

---

### Script d'import JSON → Supabase

```typescript
// Fichier: /scripts/import-to-supabase.ts

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!; // Clé service (admin)

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importData() {
  // Lire le fichier JSON
  const data = JSON.parse(fs.readFileSync('./backup.json', 'utf-8'));
  
  console.log('🚀 Début de l\'import...');
  
  // 1. Importer les profils
  if (data.users) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.users.id,
        email: data.users.email,
        full_name: data.users.profile.name,
        phone: data.users.profile.phone,
        user_type: data.users.profile.user_type,
        credits: 100 // Bonus de bienvenue
      });
    
    if (profileError) {
      console.error('❌ Erreur profil:', profileError);
    } else {
      console.log('✅ Profil importé');
    }
  }
  
  // 2. Importer les annonces
  for (const listing of data.listings) {
    const { error: listingError } = await supabase
      .from('listings')
      .insert({
        id: listing.id,
        user_id: data.users.id,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        year: listing.year,
        price: listing.price,
        location: listing.location,
        description: listing.description,
        mileage: listing.mileage,
        fuel_type: listing.fuel_type,
        transmission: listing.transmission,
        condition: listing.condition,
        doors: listing.doors,
        color: listing.color,
        images: listing.images,
        status: listing.status,
        views: listing.views || 0,
        is_boosted: listing.is_boosted || false,
        created_at: listing.created_at,
        updated_at: listing.updated_at
      });
    
    if (listingError) {
      console.error(`❌ Erreur annonce ${listing.title}:`, listingError);
    } else {
      console.log(`✅ Annonce importée: ${listing.title}`);
    }
  }
  
  // 3. Importer les favoris
  for (const favoriteId of data.favorites) {
    const { error: favError } = await supabase
      .from('favorites')
      .insert({
        user_id: data.users.id,
        listing_id: favoriteId
      });
    
    if (favError && favError.code !== '23505') { // Ignore duplicates
      console.error(`❌ Erreur favori:`, favError);
    }
  }
  
  console.log('🎉 Import terminé !');
}

importData();
```

**Exécution :**
```bash
npx tsx scripts/import-to-supabase.ts
```

---

## 🔄 MISE À JOUR DU CODE

### 1. Fichier `/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ ERREUR: Variables d\'environnement Supabase manquantes.\n' +
    'Créez un fichier .env à la racine avec:\n' +
    'VITE_SUPABASE_URL=votre_url\n' +
    'VITE_SUPABASE_ANON_KEY=votre_clé'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types TypeScript générés
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          user_type: 'vendor' | 'admin';
          credits: number;
          avatar_url: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          brand: string;
          model: string;
          year: number;
          price: number;
          location: string;
          description: string | null;
          mileage: number;
          fuel_type: string;
          transmission: string;
          condition: string;
          doors: number;
          color: string;
          images: string[];
          status: 'pending' | 'active' | 'rejected' | 'sold';
          reject_reason: string | null;
          approved_at: string | null;
          rejected_at: string | null;
          views: number;
          is_boosted: boolean;
          boost_expires_at: string | null;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at' | 'updated_at' | 'views'>;
        Update: Partial<Database['public']['Tables']['listings']['Insert']>;
      };
      // ... autres tables
    };
  };
};

export type Listing = Database['public']['Tables']['listings']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
```

---

### 2. Service d'authentification `/src/services/auth.service.ts`

**AVANT (localStorage) :**
```typescript
async function login(email: string, password: string) {
  // Vérification manuelle
  const user = { id: '1', email, profile: { ... } };
  localStorage.setItem('annonceauto_user', JSON.stringify(user));
  return { user, error: null };
}
```

**APRÈS (Supabase) :**
```typescript
import { supabase } from '../lib/supabase';

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) return { user: null, error };
    
    // Charger le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    return { 
      user: { ...data.user, profile },
      error: null
    };
  },
  
  async signup(email: string, password: string, userData: any) {
    // 1. Créer le compte auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (authError) return { user: null, error: authError };
    
    // 2. Créer le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user!.id,
        email,
        full_name: userData.name,
        phone: userData.phone,
        user_type: 'vendor',
        credits: 100 // Bonus inscription
      });
    
    if (profileError) return { user: null, error: profileError };
    
    return { user: authData.user, error: null };
  },
  
  async logout() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    return { ...session.user, profile };
  }
};
```

---

### 3. Service listings `/src/services/listings.service.ts`

**AVANT (localStorage) :**
```typescript
async function getListings() {
  const data = localStorage.getItem('annonceauto_demo_listings');
  return JSON.parse(data || '[]');
}
```

**APRÈS (Supabase) :**
```typescript
import { supabase } from '../lib/supabase';

export const listingsService = {
  // Récupérer les annonces publiques (active uniquement)
  async getActiveListings() {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles:user_id (
          full_name,
          phone,
          verified
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Récupérer les annonces d'un vendeur
  async getVendorListings(userId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Créer une annonce
  async createListing(listingData: any) {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listingData,
        status: 'pending' // Toujours pending au départ
      })
      .select()
      .single();
    
    return { data, error };
  },
  
  // Modérer une annonce (admin)
  async moderateListing(listingId: string, action: 'approve' | 'reject', reason?: string) {
    const updates: any = {
      status: action === 'approve' ? 'active' : 'rejected',
      updated_at: new Date().toISOString()
    };
    
    if (action === 'approve') {
      updates.approved_at = new Date().toISOString();
    } else {
      updates.rejected_at = new Date().toISOString();
      updates.reject_reason = reason;
    }
    
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single();
    
    return { data, error };
  },
  
  // Recherche avec filtres
  async searchListings(filters: {
    search?: string;
    brand?: string;
    priceMin?: number;
    priceMax?: number;
    yearMin?: number;
    yearMax?: number;
  }) {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active');
    
    // Full-text search
    if (filters.search) {
      query = query.textSearch('title,brand,model,description', filters.search, {
        type: 'websearch',
        config: 'french'
      });
    }
    
    // Filtres
    if (filters.brand && filters.brand !== 'all') {
      query = query.eq('brand', filters.brand);
    }
    
    if (filters.priceMin) {
      query = query.gte('price', filters.priceMin);
    }
    
    if (filters.priceMax) {
      query = query.lte('price', filters.priceMax);
    }
    
    if (filters.yearMin) {
      query = query.gte('year', filters.yearMin);
    }
    
    if (filters.yearMax) {
      query = query.lte('year', filters.yearMax);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Incrémenter les vues
  async incrementViews(listingId: string, sessionId: string) {
    // Vérifier si déjà vu
    const { data: existing } = await supabase
      .from('views_tracking')
      .select('id')
      .eq('listing_id', listingId)
      .eq('session_id', sessionId)
      .single();
    
    if (existing) return; // Déjà vu
    
    // Ajouter une vue
    await supabase
      .from('views_tracking')
      .insert({
        listing_id: listingId,
        session_id: sessionId
      });
    
    // Mettre à jour le compteur
    await supabase.rpc('increment_views', { listing_id: listingId });
  }
};
```

---

### 4. Upload d'images

```typescript
// /src/services/storage.service.ts

import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const storageService = {
  async uploadVehicleImage(file: File, userId: string): Promise<string | null> {
    try {
      // Valider le fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5 MB
        throw new Error('L\'image ne doit pas dépasser 5 MB');
      }
      
      // Générer un nom unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;
      
      // Upload
      const { data, error } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
      
    } catch (error) {
      console.error('Erreur upload:', error);
      return null;
    }
  },
  
  async deleteVehicleImage(imageUrl: string): Promise<boolean> {
    try {
      // Extraire le path de l'URL
      const path = imageUrl.split('/vehicle-images/')[1];
      
      const { error } = await supabase.storage
        .from('vehicle-images')
        .remove([path]);
      
      return !error;
      
    } catch (error) {
      console.error('Erreur suppression:', error);
      return false;
    }
  }
};
```

---

## ✅ TESTS ET VALIDATION

### Checklist de migration

#### Phase 1 : Configuration (30 min)
- [ ] Créer projet Supabase
- [ ] Récupérer credentials (URL + ANON_KEY)
- [ ] Créer fichier `.env`
- [ ] Exécuter migrations SQL
- [ ] Vérifier tables créées
- [ ] Configurer Storage bucket

#### Phase 2 : Export données (15 min)
- [ ] Exécuter script export localStorage
- [ ] Vérifier fichier JSON téléchargé
- [ ] Sauvegarder backup en lieu sûr

#### Phase 3 : Migration code (2h)
- [ ] Mettre à jour `/src/lib/supabase.ts`
- [ ] Migrer `auth.service.ts`
- [ ] Migrer `listings.service.ts`
- [ ] Créer `storage.service.ts`
- [ ] Mettre à jour `AuthContext`
- [ ] Tester chaque service individuellement

#### Phase 4 : Import données (30 min)
- [ ] Créer compte admin via Supabase Auth
- [ ] Exécuter script import
- [ ] Vérifier données dans Supabase Dashboard

#### Phase 5 : Tests fonctionnels (1h)
- [ ] Inscription nouveau vendeur
- [ ] Login vendeur
- [ ] Publier annonce (avec images)
- [ ] Modération admin
- [ ] Recherche et filtres
- [ ] Favoris
- [ ] Compteur de vues
- [ ] Logout

#### Phase 6 : Performance (30 min)
- [ ] Vérifier temps de chargement
- [ ] Optimiser requêtes si besoin
- [ ] Ajouter cache si nécessaire

---

## 📚 RESSOURCES SUPPLÉMENTAIRES

### Documentation Supabase
- **Démarrage rapide :** https://supabase.com/docs/guides/getting-started
- **Auth :** https://supabase.com/docs/guides/auth
- **Database :** https://supabase.com/docs/guides/database
- **Storage :** https://supabase.com/docs/guides/storage
- **Row Level Security :** https://supabase.com/docs/guides/auth/row-level-security

### Outils utiles
- **Supabase CLI :** https://supabase.com/docs/guides/cli
- **TypeScript types generator :** `npx supabase gen types typescript`
- **Backup automatique :** Supabase Pro (payant)

---

## 🚨 IMPORTANT - SÉCURITÉ

### ⚠️ Ne JAMAIS commiter :
- `.env` (credentials)
- `SUPABASE_SERVICE_KEY` (clé admin)
- Mots de passe en clair

### ✅ À faire :
- Utiliser `.env.example` pour template
- Row Level Security (RLS) activé sur TOUTES les tables
- Valider les inputs côté backend
- Rate limiting sur Supabase (niveau gratuit : 100 req/sec)

---

## 💰 COÛTS SUPABASE

### Plan Gratuit (Free Tier)
- ✅ 500 MB Database
- ✅ 1 GB File storage
- ✅ 2 GB Bandwidth/mois
- ✅ 50,000 Monthly Active Users
- ✅ Row Level Security
- ✅ Authentification sociale

**Largement suffisant pour démarrer !**

### Plan Pro ($25/mois)
- ✅ 8 GB Database
- ✅ 100 GB File storage
- ✅ 50 GB Bandwidth
- ✅ Backup automatique quotidien
- ✅ Support email

**Passer en Pro quand :**
- Plus de 10,000 annonces
- Plus de 1000 utilisateurs actifs/mois
- Besoin de backup professionnel

---

## 📞 SUPPORT

### Questions fréquentes
**Q : Mes données localStorage seront-elles perdues ?**
R : Non, le script d'export sauvegarde tout dans un fichier JSON.

**Q : Puis-je tester Supabase sans supprimer localStorage ?**
R : Oui ! Gardez les deux en parallèle, utilisez une variable d'environnement `VITE_USE_SUPABASE=true/false` pour basculer.

**Q : Et si je dépasse le plan gratuit ?**
R : Supabase vous avertit par email. Vous pouvez upgrader ou optimiser.

---

**Date de création :** 22 Décembre 2024  
**Auteur :** Cursor AI Assistant  
**Version :** 1.0  
**Pour :** Migration Production AnnonceAuto.CI

---

🎯 **PROCHAINE ÉTAPE :** Créer les fichiers SQL de migration
