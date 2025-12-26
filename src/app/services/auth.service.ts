import { supabase, type Profile } from '../lib/supabase';
import { AuthError, User } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  userType: 'vendor' | 'admin';
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Mode DÉMO - localStorage fallback
const DEMO_MODE = false; // ✅ Mode Supabase ACTIVÉ
const DEMO_USERS_KEY = 'annonceauto_demo_users';
const DEMO_CURRENT_USER_KEY = 'annonceauto_demo_current_user';

class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    if (DEMO_MODE) {
      return this.demoSignUp(data);
    }
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            user_type: data.userType,
            phone: data.phone
          }
        }
      });

      if (authError) {
        return { user: null, error: authError };
      }

      // Le profil est créé automatiquement via le trigger
      // Mais on peut mettre à jour le téléphone si fourni
      if (authData.user && data.phone) {
        await supabase
          .from('profiles')
          .update({ phone: data.phone })
          .eq('id', authData.user.id);
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Erreur inscription:', error);
      return { 
        user: null, 
        error: error as AuthError 
      };
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    if (DEMO_MODE) {
      return this.demoSignIn(data);
    }
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        return { user: null, error: authError };
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { 
        user: null, 
        error: error as AuthError 
      };
    }
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    if (DEMO_MODE) {
      localStorage.removeItem(DEMO_CURRENT_USER_KEY);
      return { error: null };
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Connexion avec Google ou Facebook
   */
  async signInWithProvider(provider: 'google' | 'facebook'): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      return { error };
    } catch (error) {
      console.error(`Erreur connexion ${provider}:`, error);
      return { error: error as AuthError };
    }
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser(): Promise<User | null> {
    if (DEMO_MODE) {
      const userJson = localStorage.getItem(DEMO_CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  }

  /**
   * Récupérer le profil complet de l'utilisateur
   */
  async getProfile(userId: string): Promise<Profile | null> {
    if (DEMO_MODE) {
      const usersJson = localStorage.getItem(DEMO_USERS_KEY);
      if (!usersJson) return null;
      
      const users = JSON.parse(usersJson);
      const user = users.find((u: any) => u.id === userId);
      
      if (!user) return null;
      
      // Convertir User en Profile
      const profile: Profile = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email,
        email: user.email,
        phone: user.phone || '',
        user_type: user.user_metadata?.user_type || 'vendor',
        credits: 0,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      
      return profile;
    }
    
    try {
      console.log('🔍 Récupération profil pour userId:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération profil:', error);
        return null;
      }

      console.log('✅ Profil récupéré depuis Supabase (données masquées en production)');
      return data as Profile;
    } catch (error) {
      console.error('❌ Exception récupération profil:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le profil
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ error: Error | null }> {
    if (DEMO_MODE) {
      // En mode DÉMO, on ne stocke pas vraiment le profil séparément
      // car il est généré à la volée depuis l'utilisateur
      return { error: null };
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      return { error: error as Error };
    }
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    if (DEMO_MODE) {
      // En mode DÉMO, on simule le succès
      return { error: null };
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      return { error };
    } catch (error) {
      console.error('Erreur réinitialisation mot de passe:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Changer le mot de passe (utilisateur connecté)
   */
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    if (DEMO_MODE) {
      return { error: null };
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { error };
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Écouter les changements d'authentification
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    if (DEMO_MODE) {
      // En mode DÉMO, retourner un objet avec unsubscribe vide
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
    
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }

  // Méthodes de démo
  private demoSignUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    return new Promise((resolve) => {
      const usersJson = localStorage.getItem(DEMO_USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      const existingUser = users.find((u: any) => u.email === data.email);
      if (existingUser) {
        resolve({ 
          user: null, 
          error: { message: 'Email déjà utilisé', name: 'AuthError', status: 400 } as AuthError 
        });
        return;
      }

      const newUser: any = {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        email_confirmed_at: new Date().toISOString(),
        phone: data.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {
          full_name: data.fullName,
          user_type: data.userType
        },
        aud: 'authenticated',
        role: 'authenticated'
      };

      users.push(newUser);
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
      localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(newUser));
      resolve({ user: newUser as User, error: null });
    });
  }

  private demoSignIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    return new Promise((resolve) => {
      const usersJson = localStorage.getItem(DEMO_USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Chercher l'utilisateur par email (on ignore le mot de passe en mode démo)
      const user = users.find((u: any) => u.email === data.email);
      if (user) {
        localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(user));
        resolve({ user, error: null });
      } else {
        resolve({ 
          user: null, 
          error: { message: 'Email ou mot de passe incorrect', name: 'AuthError', status: 401 } as AuthError 
        });
      }
    });
  }
}

export const authService = new AuthService();