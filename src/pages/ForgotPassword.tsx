import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { AuthLayout } from "@/components/AuthLayout";

const ForgotPassword = () => {
  return (
    <AuthLayout
      title="Recuperar sua senha"
      description="Não se preocupe. Insira seu e-mail e enviaremos um link para redefinir sua senha."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPassword;