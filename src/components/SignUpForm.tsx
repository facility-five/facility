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
import { signUpSchema } from "@/utils/validationSchemas";

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
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Criar schema com mensagens traduzidas
  const formSchema = signUpSchema
    .extend({
      firstName: signUpSchema.shape.firstName.min(2, t("auth.signup.errors.firstNameMin")),
      lastName: signUpSchema.shape.lastName.min(2, t("auth.signup.errors.lastNameMin")),
      password: signUpSchema.shape.password.min(6, t("auth.signup.errors.passwordMin")),
      confirmPassword: signUpSchema.shape.confirmPassword.min(6, t("auth.signup.errors.confirmPasswordMin")),
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
    setIsLoading(true);
    
    try {
      // Login automático desativado (necessário confirmar email)
      const { data: { session }, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            role: 'Administradora', // Define role padrão para ativar plano gratuito
          }
        },
      });

      if (error) {
        showRadixError(error.message);
        return;
      }

      if (session) {
        try {
          const selectedPlan = sessionStorage.getItem('selected_plan');
          
          if (!selectedPlan) {
            // Se não há plano selecionado, buscar o plano gratuito
            const { data: freePlan, error: freePlanError } = await supabase
              .from('plans')
              .select('*')
              .eq('price', 0)
              .order('created_at', { ascending: true })
              .limit(1)
              .single();

            if (freePlanError || !freePlan) {
              console.error('Error al buscar plan gratuito:', freePlanError);
              throw new Error("No se pudo encontrar el plan gratuito");
            }

            // Criar pagamento ativo para o plano gratuito
            const { error: paymentError } = await supabase.from('payments').insert({
              user_id: session.user.id,
              plan_id: freePlan.id,
              amount: 0,
              status: 'active'
            });

            if (paymentError) {
              console.error('Error al crear payment:', paymentError);
            }

            showRadixSuccess("Cuenta creada con éxito. Plan gratuito activado.");
            navigate('/gestor');
            return;
          }

          const planData = JSON.parse(selectedPlan);
          
          if (planData.price === 0) {
            // Para plano gratuito
            const { error: paymentError } = await supabase.from('payments').insert({
              user_id: session.user.id,
              plan_id: planData.id,
              amount: 0,
              status: 'active'
            });

            if (paymentError) {
              console.error('Error al crear payment:', paymentError);
            }

            showRadixSuccess("Cuenta creada con éxito. Plan gratuito activado.");
            navigate('/gestor');
          } else {
            // Para plano pago, redireciona para o checkout do Stripe
            navigate('/planes', { state: { fromSignup: true } });
          }
        } catch (error) {
          console.error('Error al procesar el plan:', error);
          showRadixError("Error al procesar el plan seleccionado. Por favor, inténtelo de nuevo.");
          navigate('/planes');
        }
      } else {
        // Caso contrário, redirecionar para página de confirmação
        navigate('/email-confirmation', { 
          state: { email: values.email }
        });
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      showRadixError(error.message || t("auth.signup.errors.createAccount", "Error al crear la cuenta. Por favor, inténtelo de nuevo."));
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Creando su cuenta...
            </div>
          ) : (
            t("auth.signup.createAccount")
          )}
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
