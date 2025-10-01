import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Index = () => {
  const { session, loading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session && profile) {
      switch (profile.role) {
        case 'Administrador':
          navigate('/admin');
          break;
        case 'Gestor':
          navigate('/gestor-dashboard');
          break;
        case 'Usuário':
          navigate('/morador-dashboard');
          break;
        default:
          // Fica na página de login se o perfil for inválido
          break;
      }
    }
  }, [session, loading, profile, navigate]);

  if (loading || (session && profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 space-y-6">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Bem-vindo de volta!
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Faça login para acessar sua conta.
          </p>
        </div>

        <AuthForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Ou continue com</span>
          </div>
        </div>

        <div className="text-center text-sm">
          Não tem uma conta?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-medium text-purple-600 hover:text-purple-500"
            onClick={() => navigate("/criar-conta")}
          >
            Crie uma agora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;