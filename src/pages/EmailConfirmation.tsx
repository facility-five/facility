import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function EmailConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = location.state?.email;

  // Se não tiver email no state ou usuário já estiver confirmado, redireciona
  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    if (user?.email_confirmed_at) {
      navigate('/dashboard');
    }
  }, [email, user, navigate]);

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verifique seu email</CardTitle>
          <CardDescription className="text-lg">
            Enviamos um link de confirmação para:
          </CardDescription>
          <p className="mt-1 font-medium text-primary">{email}</p>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p>
            Por favor, clique no link que enviamos para seu email para ativar sua conta.
          </p>
          <p className="text-sm text-muted-foreground">
            Se não encontrar o email, verifique sua caixa de spam.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Voltar para o login
          </Button>

          <Button
            variant="link"
            className="w-full text-sm text-muted-foreground"
            onClick={() => window.location.href = 'mailto:'}
          >
            Não recebeu o email? Verifique sua caixa de spam ou clique para abrir seu cliente de email
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}