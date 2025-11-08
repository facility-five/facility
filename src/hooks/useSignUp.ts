import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/utils/toast';

interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
}

export function useSignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUpWithPassword } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async ({ 
    email, 
    password, 
    confirmPassword 
  }: SignUpData) => {
    if (password !== confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUpWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      // Usuário criado com sucesso
      toast.success('Conta criada com sucesso! Você receberá um email de confirmação.');
      
      // Redirecionar para a página de confirmação
      navigate('/email-confirmation', { 
        state: { email } 
      });
    } catch (error: any) {
      // Tratar erros específicos do Supabase
      switch (error?.message) {
        case 'User already registered':
          toast.error('Este email já está cadastrado');
          break;
        case 'Password should be at least 6 characters':
          toast.error('A senha deve ter no mínimo 6 caracteres');
          break;
        case 'Invalid email':
          toast.error('Email inválido');
          break;
        default:
          toast.error('Erro ao criar conta. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSignUp
  };
}