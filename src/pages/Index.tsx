import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AuthLayout } from "@/components/AuthLayout";

const Index = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  // Se o contexto ainda está carregando ou se já existe uma sessão,
  // mostramos o spinner. O AuthContext cuidará do redirecionamento.
  if (loading || session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  // Se não está carregando e não há sessão, mostramos o formulário de login.
  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      description="Faça login para acessar sua conta."
    >
      <AuthForm />
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Não tem uma conta?
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full mt-6" onClick={() => navigate("/criar-conta")}>
        Crie uma agora
      </Button>
    </AuthLayout>
  );
};

export default Index;