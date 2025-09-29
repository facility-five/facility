import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpForm } from "@/components/SignUpForm";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUsers = async () => {
      const { data: isSetup } = await supabase.rpc('is_system_setup');
      if (!isSetup) {
        navigate("/setup-master");
      }
      setLoading(false);
    };
    checkUsers();
  }, [navigate]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 space-y-4">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Crie sua conta de Gestor
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Cadastre sua administradora ou condomínio para começar a usar a plataforma.
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;