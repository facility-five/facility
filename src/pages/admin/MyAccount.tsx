import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useEffect, useState } from "react";
import { User as UserIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";

const profileFormSchema = z.object({
  firstName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  lastName: z.string().min(2, "O sobrenome deve ter pelo menos 2 caracteres."),
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, "A senha atual deve ter pelo menos 6 caracteres."),
    password: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

const MyAccount = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || "");
        profileForm.reset({
          firstName: user.user_metadata.first_name || "",
          lastName: user.user_metadata.last_name || "",
        });
      }
    };
    fetchUser();
  }, [profileForm]);

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: values.firstName,
        last_name: values.lastName,
      },
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Perfil atualizado com sucesso!");
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    if (!email) {
      showError("Não foi possível identificar seu e-mail.");
      return;
    }

    // Reautenticar com a senha atual para garantir sessão válida
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: values.currentPassword,
    });

    if (reauthError) {
      showError("Senha atual incorreta. Tente novamente.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Senha alterada com sucesso!");
      passwordForm.reset({
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minha Conta</h1>
          <p className="text-gray-500">
            Gerencie as informações do seu perfil e configurações de senha.
          </p>
        </div>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="password">Senha</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize a foto e os dados pessoais da sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.user_metadata.avatar_url} />
                        <AvatarFallback>
                          <UserIcon className="h-10 w-10" />
                        </AvatarFallback>
                      </Avatar>
                      <Button type="button" variant="outline">
                        Alterar Foto
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sobrenome</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu sobrenome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={email} disabled />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Salvar Alterações</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Para sua segurança, confirme sua senha atual antes de definir uma nova.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha Atual</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova Senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Nova Senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button type="submit">Alterar Senha</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default MyAccount;