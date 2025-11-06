import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import LandingPageV2 from "./LandingPageV2";

const Index = () => {
  const { session, profile, loading, profileLoaded } = useAuth();
  const navigate = useNavigate();

  // Landing page não deve executar nenhum redirecionamento automático.
  // Usuários logados com ou sem perfil permanecem aqui até ação explícita.

  // Mostra o spinner enquanto o estado inicial de autenticação está sendo determinado
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  // Renderiza a LandingPageV2 para todos os usuários (logados ou não)
  return <LandingPageV2 />;
};

export default Index;