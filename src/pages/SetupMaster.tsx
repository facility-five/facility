import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SetupMasterForm } from "@/components/SetupMasterForm";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner"; // Importa o LoadingSpinner

const SetupMaster = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUsers = async () => {
      // Check if system_settings table has any entry
      const { data, error } = await supabase
        .from('system_settings')
        .select('id', { count: 'exact', head: true });

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error checking system settings:", error);
        // Handle error, maybe show a message or retry
      }

      if ((data?.count || 0) > 0) {
        // If system settings exist, it means the system is set up
        navigate("/");
      }
      setLoading(false);
    };
    checkUsers();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <LoadingSpinner size="lg" className="border-primary shadow-lg shadow-primary/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 space-y-4">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Configuração Inicial do Sistema
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Crie a conta do administrador principal para iniciar a configuração da plataforma.
          </p>
        </div>
        <SetupMasterForm />
      </div>
    </div>
  );
};

export default SetupMaster;