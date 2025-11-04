import { supabase } from "@/integrations/supabase/client";

export interface SendVerificationEmailParams {
  email: string;
  code: string;
  firstName?: string;
  lastName?: string;
}

export const sendVerificationEmail = async ({
  email,
  code,
  firstName,
  lastName,
}: SendVerificationEmailParams) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: {
        email,
        code,
        firstName,
        lastName,
      },
    });

    if (error) {
      console.error('Erro ao enviar email de verificação:', error);
      throw new Error(`Erro ao enviar email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Erro no serviço de email:', error);
    throw error;
  }
};

// Função para gerar código de 6 dígitos
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Função para validar formato de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};