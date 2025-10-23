import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import LandingPageContent from "@/components/LandingPageContent";

const Index = () => {
  const { session, profile, loading, profileLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Só age quando o carregamento inicial e a tentativa de buscar o perfil estiverem completos
    if (!loading && profileLoaded) {
      if (session) {
        if (profile) {
          // Usuário está logado e tem um perfil, redireciona com base na função
          switch (profile.role) {
            case 'Administrador':
              navigate('/admin', { replace: true });
              break;
            case 'Administradora':
            case 'Síndico':
              navigate('/gestor-dashboard', { replace: true });
              break;
            case 'Morador':
              navigate('/morador-dashboard', { replace: true });
              break;
            default:
              // Fallback para funções desconhecidas ou se profile.role não estiver definido
              navigate('/', { replace: true });
              break;
          }
        } else {
          // Usuário está logado, mas não tem perfil (ex: novo usuário após o cadastro, antes do registro do administrador)
          const checkSystemSetupAndRedirect = async () => {
            const { data: systemSettings, error: settingsError } = await supabase
              .from('system_settings')
              .select('id', { count: 'exact', head: true });

            if (settingsError && settingsError.code !== 'PGRST116') {
              console.error("Index: Erro ao verificar configurações do sistema:", settingsError);
              // Potencialmente redirecionar para uma página de erro genérica ou login
              navigate("/", { replace: true });
            } else if ((systemSettings?.count || 0) === 0) {
              // Se não houver configurações do sistema, é o primeiro usuário, vai para a configuração mestre
              navigate("/setup-master", { replace: true });
            } else {
              // O sistema está configurado, mas o usuário não tem perfil (precisa registrar a administradora)
              navigate("/registrar-administradora", { replace: true });
            }
          };
          checkSystemSetupAndRedirect();
        }
      } else {
        // Nenhuma sessão, renderiza LandingPageContent (que é o padrão para '/')
        // Nenhuma navegação explícita é necessária aqui, pois já está em '/'
      }
    }
  }, [loading, profileLoaded, session, profile, navigate]);

  // Mostra o spinner enquanto o estado inicial de autenticação está sendo determinado
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  // Se não estiver carregando e não houver sessão, ou se a sessão existir, mas a lógica de redirecionamento ainda não foi acionada,
  // renderiza o LandingPageContent. O useEffect acima lidará com o redirecionamento, se aplicável.
  return <LandingPageContent />;
};

export default Index;