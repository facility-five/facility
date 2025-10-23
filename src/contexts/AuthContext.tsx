"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  role: 'Administrador' | 'Administradora' | 'Síndico' | 'Funcionário' | 'Morador';
  status: 'Ativo' | 'Inativo';
  whatsapp: string;
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

    const getInitialSession = async () => {
      console.log("AuthContext: Fetching initial session...");
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (isMounted) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          console.log("AuthContext: Initial session user found, fetching profile...");
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();
          
          if (isMounted) {
            if (error && error.code !== 'PGRST116') {
              console.error("AuthContext: Error fetching initial user profile:", error);
              setProfile(null);
            } else {
              setProfile(userProfile ?? null);
            }
          }
        } else {
          console.log("AuthContext: No initial session user, setting profile=null");
          setProfile(null);
        }
        setLoading(false);
        setProfileLoaded(true);
        console.log("AuthContext: Initial session fetch completed. loading=false, profileLoaded=true");
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log("AuthContext: onAuthStateChange event:", _event, "session:", currentSession);
        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            console.log("AuthContext: Session user found (from event), fetching profile...");
            const { data: userProfile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
            
            if (isMounted) {
              if (error && error.code !== 'PGRST116') {
                console.error("AuthContext: Error fetching user profile (from event):", error);
                setProfile(null);
              } else {
                setProfile(userProfile ?? null);
              }
            }
          } else {
            console.log("AuthContext: No session user (from event), setting profile=null");
            setProfile(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      console.log("AuthContext: Unsubscribing from auth state changes.");
      subscription.unsubscribe();
    };
  }, []);

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