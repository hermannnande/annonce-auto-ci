import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérifier si les clés sont configurées (pas les valeurs par défaut)
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://votre-projet.supabase.co' &&
  supabaseAnonKey !== 'votre-cle-anon-publique-ici' &&
  !supabaseUrl.includes('votre-projet') &&
  !supabaseAnonKey.includes('votre-cle');

// Créer le client Supabase
export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Flag pour savoir si Supabase est configuré
export const isSupabaseConfigured = isConfigured;

// Types pour la base de données
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  user_type: 'vendor' | 'admin';
  credits: number;
  avatar_url?: string;
  company_name?: string;
  address?: string;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  price: number;
  year: number;
  mileage: number;
  brand: string;
  model: string;
  fuel_type: 'essence' | 'diesel' | 'electrique' | 'hybride';
  transmission: 'manuelle' | 'automatique';
  condition: 'neuf' | 'occasion';
  location: string;
  images: string[];
  status: 'active' | 'pending' | 'sold' | 'rejected' | 'archived';
  views: number;
  is_boosted: boolean;
  boost_until?: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'spent' | 'refund' | 'bonus';
  description: string;
  payment_method?: string;
  payment_reference?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  credits_before: number;
  credits_after: number;
  created_at: string;
}

export interface Boost {
  id: string;
  listing_id: string;
  user_id: string;
  duration_days: number;
  credits_used: number;
  started_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}