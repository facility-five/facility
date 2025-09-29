import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const InactiveOverlay = () => {
  const { session, profile, loading, signOut } = useAuth();

  if (loading) return null;
  if (!session) return null;
  if (profile?.status !== "Inativo") return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Conta Inativa
        </h1>
        <p className="mb-6 text-gray-600">
          Sua conta está atualmente inativa. Entre em contato com o administrador ou suporte para reativação.
        </p>
        <Button
          onClick={handleSignOut}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Sair
        </Button>
      </div>
    </div>
  );
};

export default InactiveOverlay;