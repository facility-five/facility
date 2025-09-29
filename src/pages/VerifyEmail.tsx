import { VerifyEmailForm } from "@/components/VerifyEmailForm";
import { Logo } from "@/components/Logo";

const VerifyEmail = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 space-y-4 text-center">
        <Logo />
        <h1 className="text-2xl font-bold text-gray-800">
          Verifique seu e-mail
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Enviamos um código de verificação para o seu e-mail. Por favor, insira o código de 6 dígitos abaixo para confirmar sua conta.
        </p>
        <VerifyEmailForm />
      </div>
    </div>
  );
};

export default VerifyEmail;