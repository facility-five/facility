import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/AuthLayout";

function Login() {
  // Define a URL de redirecionamento para a raiz do aplicativo.
  // O AuthContext se encarregará de redirecionar para o dashboard correto após o login.
  const redirectToUrl = window.location.origin + '/';

  return (
    <AuthLayout
      title="" // Título vazio para evitar conflito com o título interno do Auth UI
      description="" // Descrição vazia para evitar conflito
    >
      <Auth
        supabaseClient={supabase}
        providers={[]} // Desabilita provedores sociais, mantendo apenas e-mail/senha
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'hsl(262.1 83.3% 57.8%)', // Cor principal roxa
                brandAccent: 'hsl(262.1 83.3% 47.8%)', // Cor de destaque roxa
                defaultButtonBackground: 'hsl(262.1 83.3% 57.8%)',
                defaultButtonBackgroundHover: 'hsl(262.1 83.3% 47.8%)',
                defaultButtonBorder: 'hsl(262.1 83.3% 57.8%)',
                defaultButtonText: 'hsl(0 0% 100%)',
                inputBackground: 'hsl(0 0% 100%)',
                inputBorder: 'hsl(214.3 31.8% 91.4%)',
                inputBorderHover: 'hsl(214.3 31.8% 81.4%)',
                inputBorderFocus: 'hsl(262.1 83.3% 57.8%)',
                inputText: 'hsl(222.2 84% 4.9%)',
                inputLabelText: 'hsl(222.2 47.4% 11.2%)',
                anchorText: 'hsl(262.1 83.3% 57.8%)',
                anchorTextHover: 'hsl(262.1 83.3% 47.8%)',
              },
            },
          },
        }}
        theme="light"
        redirectTo={redirectToUrl} // Adiciona a URL de redirecionamento
        view="sign_in" // Garante que a tela de login seja exibida por padrão
      />
    </AuthLayout>
  );
}

export default Login;