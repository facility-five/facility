"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError } from "@/utils/toast";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "./LoadingSpinner";

// Esquema de validação robusto para login
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "O e-mail é obrigatório." })
    .email({ message: "Por favor, insira um e-mail válido." })
    .max(100, { message: "O e-mail não pode ter mais de 100 caracteres." })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { 
      message: "O formato do e-mail é inválido." 
    }),
  password: z
    .string()
    .min(1, { message: "A senha é obrigatória." })
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres." })
    .max(128, { message: "A senha não pode ter mais de 128 caracteres." })
    .regex(/.*[a-z].*/, { 
      message: "A senha deve conter pelo menos uma letra minúscula." 
    })
    .regex(/.*[A-Z].*/, { 
      message: "A senha deve conter pelo menos uma letra maiúscula." 
    })
    .regex(/.*\d.*/, { 
      message: "A senha deve conter pelo menos um número." 
    })
    .regex(/.*[!@#$%^&*(),.?":{}|<>].*/, { 
      message: "A senha deve conter pelo menos um caractere especial." 
    }),
});
 
// Esquema simplificado para login (sem requisitos complexos de senha)
const simpleLoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "O e-mail é obrigatório." })
    .email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string()
    .min(1, { message: "A senha é obrigatória." })
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof simpleLoginSchema>>({
    resolver: zodResolver(simpleLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof simpleLoginSchema>) {
    setIsLoading(true);
    try {
      // Marcar que o fluxo de login foi iniciado para permitir redireciono pós-login
      sessionStorage.setItem('fromLogin', '1');
    } catch {}
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        showRadixError("Email ou senha inválidos.");
      } else if (error.message.includes("Email not confirmed")) {
        showRadixError("Por favor, confirme seu e-mail antes de fazer login.");
      } else {
        showRadixError(error.message);
      }
      try {
        // Evitar redireciono automático se houve erro
        sessionStorage.removeItem('fromLogin');
      } catch {}
    }
    // A navegação agora é tratada pelo AuthContext
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="seu@email.com"
                    {...field}
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end text-sm">
          <Link
            to="/recuperar-senha"
            className="font-medium text-purple-600 hover:text-purple-500"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              Entrar
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}
