import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

const schema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "As senhas não coincidem.",
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    // Quando abrimos via link do e-mail, o Supabase aplica o token à sessão automaticamente.
    // Checamos se há sessão de recuperação para habilitar o formulário.
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Mesmo sem sessão persistente, o updateUser aceita se o token de recuperação está na URL.
      // Exibimos o form de qualquer forma; se falhar avisamos o usuário.
      setReady(true);
    };
    check();
  }, []);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      showError(error.message || "Não foi possível atualizar a senha. Abra o link do e-mail novamente e tente de novo.");
      return;
    }
    showSuccess("Senha atualizada com sucesso! Faça login com sua nova senha.");
    navigate("/");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
        <div className="w-full max-w-md text-white">Carregando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 space-y-6">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Definir nova senha
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Digite e confirme sua nova senha para continuar.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="focus-visible:ring-purple-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="confirmPassword" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nova senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="focus-visible:ring-purple-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              Salvar nova senha
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/")}>
              Voltar ao login
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;