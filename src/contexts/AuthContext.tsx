import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

type Profile = {
  id: string;
  role: string;
  [key: string]: any;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const setData = async (sess: Session | null) => {
    try {
      setSession(sess);
      const currentUser = sess?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 means 'exact one row was not found', which is fine if profile doesn't exist yet
        setProfile(profileData || null);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error setting auth data:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        await setData(session);
      } catch (err) {
        console.error('supabase.auth.getSession failed:', err);
        if (!isMounted) return;
        await setData(null); // Ensure setData is called even on error to release loading state
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      try {
        if (!isMounted) return;
        await setData(sess);
      } catch (err) {
        console.error('onAuthStateChange handler failed:', err);
        if (!isMounted) return;
        await setData(null); // Ensure setData is called even on error to release loading state
      }
    });

    // Timeout de segurança: evita ficar preso em loading em ambientes problemáticos
    // Este timeout é configurado para disparar uma única vez após 8 segundos se o loading ainda for true.
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(prevLoading => {
          if (prevLoading) {
            console.warn('Auth initialization timeout — releasing loading state.');
            return false;
          }
          return prevLoading;
        });
      }
    }, 8000);

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []); // Dependência vazia: executa apenas uma vez na montagem

  const signOut = async () => {
    await supabase.auth.signOut();
    // Limpeza imediata do estado local para refletir o logout instantaneamente
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
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