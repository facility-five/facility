import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { AuthLayout } from "@/components/AuthLayout";
import { Eye, EyeOff } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    setReady(true);
  }, []);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      showRadixError(error.message || "Não foi possível atualizar a senha. O link pode ter expirado.");
      return;
    }
    showRadixSuccess("Senha atualizada com sucesso! Faça login com sua nova senha.");
    navigate("/");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  return (
    <AuthLayout
      title="Definir nova senha"
      description="Digite e confirme sua nova senha para continuar."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField name="password" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pr-10" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="confirmPassword" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nova senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pr-10" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
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
    </AuthLayout>
  );
};

export default ResetPassword;
