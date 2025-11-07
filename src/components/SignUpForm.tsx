"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { useTranslation } from "react-i18next";

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

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formSchema = z
    .object({
      firstName: z.string().min(2, {
        message: t("auth.signup.errors.firstNameMin"),
      }),
      lastName: z.string().min(2, {
        message: t("auth.signup.errors.lastNameMin"),
      }),
      email: z.string().email({
        message: t("auth.signup.errors.emailInvalid"),
      }),
      password: z.string().min(6, {
        message: t("auth.signup.errors.passwordMin"),
      }),
      confirmPassword: z.string().min(6, {
        message: t("auth.signup.errors.confirmPasswordMin"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.signup.errors.passwordsMismatch"),
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
        },
      },
    });

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess(t("auth.signup.success"));
      
      // Limpar qualquer plano selecionado no sessionStorage
      sessionStorage.removeItem('selected_plan');
      
      // Verificar se o usuário foi criado e tem sessão
      if (data.session) {
        // Login automático funcionou
        console.log("Sessão criada após signup:", data.session);
        
        // Aguardar trigger criar profile e plano
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Fazer logout e login novamente para sincronizar profile
        console.log("Fazendo logout e login para sincronizar profile...");
        await supabase.auth.signOut();
        
        // Fazer login novamente
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (loginError) {
          console.error("Erro ao fazer login após signup:", loginError);
          showRadixError("Conta criada! Por favor, faça login.");
          navigate("/login");
        } else {
          // Aguardar mais um pouco para garantir que o AuthContext carregou
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log("Login bem-sucedido, redirecionando para /gestor");
          navigate("/gestor");
        }
      } else {
        // Confirmação de email necessária
        console.log("Sem sessão após signup, redirecionando para login");
        showRadixSuccess("Por favor, confirme seu email para continuar.");
        navigate("/login");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.firstNameLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder={t("auth.signup.firstNamePlaceholder")}
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
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.lastNameLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth.signup.lastNamePlaceholder")}
                    {...field}
                    className=""
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.signup.emailLabel")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder={t("auth.signup.emailPlaceholder")}
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
              <FormLabel>{t("auth.signup.passwordLabel")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.signup.passwordPlaceholder")}
                    {...field}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                    aria-label={showPassword ? t("auth.hide_password") : t("auth.show_password")}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.signup.confirmPasswordLabel")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                    {...field}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                    aria-label={showConfirmPassword ? t("auth.hide_password") : t("auth.show_password")}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {t("auth.signup.createAccount")}
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              {t("auth.signup.alreadyHaveAccount")}
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link to="/login">{t("auth.signup.loginNow")}</Link>
        </Button>
      </form>
    </Form>
  );
}
