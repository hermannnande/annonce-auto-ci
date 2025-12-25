import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authService, type SignUpData, type SignInData } from '../services/auth.service';
import { type Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (data: SignInData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    loadUser();

    // Écouter les changements d'authentification (Supabase)
    const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
      console.log('🔄 Auth state changed:', user?.email);
      setUser(user);
      if (user) {
        await loadProfile(user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadUser() {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        await loadProfile(currentUser.id);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile(userId: string) {
    try {
      const userProfile = await authService.getProfile(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  }

  async function signUp(data: SignUpData): Promise<{ error: Error | null }> {
    try {
      const { user: newUser, error } = await authService.signUp(data);
      if (error) {
        return { error: new Error(error.message) };
      }
      if (newUser) {
        setUser(newUser);
        await loadProfile(newUser.id);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function signIn(data: SignInData): Promise<{ error: Error | null }> {
    try {
      const { user: signedInUser, error } = await authService.signIn(data);
      if (error) {
        return { error: new Error(error.message) };
      }
      if (signedInUser) {
        setUser(signedInUser);
        await loadProfile(signedInUser.id);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function signOut() {
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  }

  async function updateProfile(updates: Partial<Profile>): Promise<{ error: Error | null }> {
    if (!user) {
      return { error: new Error('Non connecté') };
    }

    try {
      const { error } = await authService.updateProfile(user.id, updates);
      if (error) {
        return { error };
      }
      // Recharger le profil
      await loadProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id);
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}