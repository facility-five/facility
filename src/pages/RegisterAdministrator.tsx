import { RegisterAdministratorForm } from "@/components/RegisterAdministratorForm";
import { AuthLayout } from "@/components/AuthLayout";

const RegisterAdministrator = () => {
  return (
    <AuthLayout
      title="Cadastre sua Administradora"
      description="Preencha os dados da sua empresa para finalizar a configuração."
    >
      <RegisterAdministratorForm />
    </AuthLayout>
  );
};

export default RegisterAdministrator;