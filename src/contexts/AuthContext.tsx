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
  const [loading, setLoading] = useState(true); // Initial loading of session and profile
  const [profileLoaded, setProfileLoaded] = useState(false); // True once profile fetch attempt is done

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    console.log("AuthContext: useEffect triggered, setting loading=true, profileLoaded=false");
    setLoading(true);
    setProfileLoaded(false); // Reset profileLoaded on new auth state change cycle

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("AuthContext: onAuthStateChange event:", _event, "session:", session);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log("AuthContext: Session user found, fetching profile...");
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error("AuthContext: Error fetching user profile:", error);
            setProfile(null); // Ensure profile is null on error
          } else {
            console.log("AuthContext: Profile fetched:", userProfile);
            setProfile(userProfile ?? null);
          }
        } else {
          console.log("AuthContext: No session user, setting profile=null");
          setProfile(null);
        }
        console.log("AuthContext: onAuthStateChange completed. Setting loading=false, profileLoaded=true");
        setLoading(false);
        setProfileLoaded(true); // Profile fetch attempt is complete
      }
    );

    return () => {
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