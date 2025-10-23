import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/AuthLayout";

function Login() {
  return (
    <AuthLayout
      title="Faça login na sua conta"
      description="Insira seu e-mail e senha para acessar a plataforma."
    >
      <Auth
        supabaseClient={supabase}
        providers={[]}
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
      />
    </AuthLayout>
  );
}

export default Login;