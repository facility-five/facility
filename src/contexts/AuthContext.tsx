"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  role: 'Admin do SaaS' | 'Administrador' | 'Administradora' | 'Síndico' | 'Funcionário' | 'Morador';
  status: 'Ativo' | 'Inativo';
  whatsapp: string;
  email: string; // Adicionado o campo email aqui
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean; // True while initial session/profile is being fetched
  profileLoaded: boolean; // True once profile fetch attempt is complete
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

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
              ...(userProfile as Omit<Profile, 'email'>),
              email: currentSession.user.email || '',
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

  const value = {
    session,
    user,
    profile,
    loading,
    profileLoaded,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};