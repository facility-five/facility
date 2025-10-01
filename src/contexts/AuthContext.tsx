"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

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
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    navigate('/');
  };

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setProfile(userProfile);
        }
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: userProfile, error }) => {
            if (error) {
              console.error("Error fetching profile on SIGNED_IN:", error);
            } else if (userProfile && session.user.email_confirmed_at) { // <-- Adicionada verificação
              setProfile(userProfile);

              const currentPath = location.pathname;
              const role = userProfile.role;

              const isCorrectPath = 
                (role === 'Administrador' && currentPath.startsWith('/admin')) ||
                (role === 'Administradora' && currentPath.startsWith('/admin')) ||
                (role === 'Síndico' && currentPath.startsWith('/gestor')) ||
                (role === 'Morador' && currentPath.startsWith('/morador'));

              if (!isCorrectPath) {
                switch (role) {
                  case 'Administrador':
                  case 'Administradora':
                    navigate('/admin');
                    break;
                  case 'Síndico':
                    navigate('/gestor-dashboard');
                    break;
                  case 'Morador':
                    navigate('/morador-dashboard');
                    break;
                  default:
                    navigate('/');
                }
              }
            }
          });
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        const publicPaths = ['/', '/criar-conta', '/recuperar-senha', '/nova-senha', '/verificar-email', '/planos', '/acesso-morador'];
        if (!publicPaths.includes(location.pathname)) {
          navigate('/');
        }
      }
    });

    setData();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const value = {
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