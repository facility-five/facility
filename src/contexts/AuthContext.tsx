"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

import { Profile, User as AppUser } from '@/types/entities';

// Interface local para manter compatibilidade com código existente
interface LocalProfile extends Profile {
  avatar_url?: string;
  role: 'Admin do SaaS' | 'Administrador' | 'Administradora' | 'Síndico' | 'Funcionário' | 'Morador';
  status: 'Ativo' | 'Inativo';
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: LocalProfile | null;
  appUser: AppUser | null;
  loading: boolean; // True while initial session/profile is being fetched
  profileLoaded: boolean; // True once profile fetch attempt is complete
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signUpWithPassword: (data: { 
    email: string; 
    password: string;
    options?: {
      emailRedirectTo?: string;
      data?: Record<string, any>;
    }
  }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  companyDocument?: string;
  companyPhone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = async (currentSession: Session | null) => {
      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // console.log("AuthContext: User found, fetching profile...");
        const { data: userProfiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (isMounted) {
          if (error) {
            console.error("AuthContext: Error fetching user profile:", error);
            setProfile(null);
          } else if (userProfiles && userProfiles.length > 0) {
            // Pegar o profile mais recente (primeiro da lista)
            const userProfile = userProfiles[0];
            // Combina dados do perfil com o email do usuário
            setProfile({
              ...userProfile,
              email: currentSession.user.email || '',
              role: userProfile.role as LocalProfile['role'],
              status: userProfile.status as LocalProfile['status'],
            });

            setAppUser({
              id: userProfile.id,
              email: currentSession.user.email || '',
              user_type: userProfile.role.toLowerCase(),
              created_at: userProfile.created_at,
            });
          } else {
            // Nenhum perfil encontrado para este usuário
            setProfile(null);
          }
        }
      } else {
        // console.log("AuthContext: No user, setting profile=null");
        setProfile(null);
      }
      
      if (isMounted) {
        setLoading(false);
        setProfileLoaded(true);
        // console.log("AuthContext: Auth state processing completed. loading=false, profileLoaded=true");
      }
    };

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      // console.log("AuthContext: Initial session fetched.");
      handleAuthChange(initialSession);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        // console.log("AuthContext: onAuthStateChange event:", _event, "session:", currentSession);
        handleAuthChange(currentSession);
      }
    );

    return () => {
      isMounted = false;
      // console.log("AuthContext: Unsubscribing from auth state changes.");
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to run once on mount

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Função de registro
  const signUp = async (data: SignUpData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            company_name: data.companyName,
            company_document: data.companyDocument,
            company_phone: data.companyPhone,
            role: 'tenant', // Todos começam como tenant
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Função para atualizar o perfil
  const refreshProfile = useCallback(async () => {
    if (user) {
      const { data: userProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error refreshing profile:", error);
        return;
      }

      if (userProfiles && userProfiles.length > 0) {
        const userProfile = userProfiles[0];
        setProfile({
          ...userProfile,
          email: user.email || '',
          role: userProfile.role as LocalProfile['role'],
          status: userProfile.status as LocalProfile['status'],
        });
        setAppUser({
          id: userProfile.id,
          email: user.email || '',
          user_type: userProfile.role.toLowerCase(),
          created_at: userProfile.created_at,
        });
      }
    }
  }, [user]);

  // Função de registro simplificado
  const signUpWithPassword = async ({
    email,
    password,
    options
  }: {
    email: string;
    password: string;
    options?: {
      emailRedirectTo?: string;
      data?: Record<string, any>;
    }
  }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options
      });

      return { error };
    } catch (error) {
      console.error('Error in signUpWithPassword:', error);
      return { error: error as Error };
    }
  };

  const value = useMemo(() => ({
    session,
    user,
    profile,
    appUser,
    loading,
    profileLoaded,
    signIn,
    signUp,
    signUpWithPassword,
    signOut,
    refreshProfile,
  }), [session, user, profile, appUser, loading, profileLoaded, signIn, signUp, signUpWithPassword, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};