import { AuthForm } from "@/components/AuthForm";
import { AuthLayout } from "@/components/AuthLayout";

function Login() {
  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      description="Faça login na sua conta para continuar."
    >
      <AuthForm />
    </AuthLayout>
  );
}

export default Login;