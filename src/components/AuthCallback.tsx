import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export function AuthCallback() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        // Usuário autenticado e com perfil, redireciona para o dashboard
        navigate('/dashboard');
      } else if (!user) {
        // Usuário não autenticado, volta para o login
        navigate('/login');
      }
      // Se tiver user mas não tiver profile, aguarda o carregamento do profile
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
    </div>
  );
}