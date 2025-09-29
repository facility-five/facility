"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "O código deve ter 6 dígitos.",
  }),
});

export function VerifyEmailForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!email) {
      showError(
        "E-mail não encontrado. Por favor, tente se cadastrar novamente."
      );
      navigate("/criar-conta");
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: data.pin,
      type: "signup",
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess("E-mail verificado com sucesso! Você será redirecionado.");
      navigate("/planos");
    }
  }

  async function handleResendCode() {
    if (!email) {
      showError(
        "E-mail não encontrado. Por favor, tente se cadastrar novamente."
      );
      navigate("/criar-conta");
      return;
    }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Código de verificação reenviado para o seu e-mail.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel>Código de 6 dígitos</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Verificar
        </Button>
        <div className="text-center text-sm">
          Não recebeu o código?{" "}
          <Button
            variant="link"
            type="button"
            onClick={handleResendCode}
            className="p-0 text-purple-600"
          >
            Reenviar código
          </Button>
        </div>
      </form>
    </Form>
  );
}