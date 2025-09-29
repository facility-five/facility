import { useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { profile, loading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      const checkFirstUser = async () => {
        const { data: isSetup } = await supabase.rpc('is_system_setup');
        if (!isSetup) {
          navigate("/setup-master");
        }
      };
      checkFirstUser();
    }
  }, [loading, session, navigate]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (session && profile) {
    switch (profile.role) {
      case 'Administrador':
        return <Navigate to="/admin" replace />;
      case 'Gestor':
        return <Navigate to="/gestor-dashboard" replace />;
      case 'Usuário':
        return <Navigate to="/morador-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 space-y-4">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Acesse sua conta
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Bem-vindo de volta! Por favor, insira seus dados.
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Index;