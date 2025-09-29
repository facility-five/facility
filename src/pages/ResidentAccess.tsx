import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ResidentAccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 space-y-6 text-center">
        <Logo />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Acesso do Morador
          </h1>
          <p className="text-gray-500 mt-2">
            Para acessar a plataforma como morador, você precisa receber um convite do gestor ou síndico do seu condomínio.
          </p>
          <p className="text-gray-500 mt-2">
            Se você já recebeu o convite por e-mail, utilize o link enviado para criar sua conta.
          </p>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link to="/">Voltar para o Login</Link>
        </Button>
      </div>
    </div>
  );
};

export default ResidentAccess;