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
import { useForm, FormProvider } from "react-hook-form"; // Import FormProvider
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
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { useEffect, useState } from "react";
import { User as UserIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { ImageUpload } from "@/components/admin/ImageUpload"; // Import ImageUpload

const profileFormSchema = z.object({
  firstName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  lastName: z.string().min(2, "O sobrenome deve ter pelo menos 2 caracteres."),
  avatar_file: z.any().optional(), // Adicionado para o upload da imagem
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, "A senha atual deve ter pelo menos 6 caracteres."),
    password: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

const MyAccount = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      avatar_file: undefined,
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
        // Fetch profile data from public.profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url') // Incluir avatar_url
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching profile for MyAccount:", error);
        } else if (profileData) {
          profileForm.reset({
            firstName: profileData.first_name || "",
            lastName: profileData.last_name || "",
            avatar_file: profileData.avatar_url || undefined, // Definir avatar_file com a URL existente
          });
        }
      }
    };
    fetchUser();
  }, [profileForm]);

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    const loadingId = showLoading("Salvando alterações do perfil...");
    try {
      const { firstName, lastName, avatar_file } = values;
      let newAvatarUrl = profileForm.getValues('avatar_file'); // Começa com o valor atual do formulário

      // Lidar com o upload do arquivo de avatar se um novo arquivo for selecionado
      if (avatar_file instanceof File) {
        const fileExt = avatar_file.name.split('.').pop();
        const fileName = `${user?.id}_${Date.now()}.${fileExt}`; // Nome de arquivo único
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars') // Usar o bucket 'avatars'
          .upload(fileName, avatar_file, { upsert: true });

        if (uploadError) {
          showRadixError(`Erro ao carregar foto de perfil: ${uploadError.message}`);
          return;
        }
        const { data: publicURL } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
        newAvatarUrl = publicURL.publicUrl;
      } else if (avatar_file === null && user?.user_metadata.avatar_url) {
        // Se avatar_file for explicitamente definido como null (removido pelo usuário)
        newAvatarUrl = null;
        // Opcionalmente, excluir o avatar antigo do storage
        const oldPath = user.user_metadata.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // Atualizar metadados auth.users
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          avatar_url: newAvatarUrl, // Atualizar avatar_url nos metadados auth.users
        },
      });

      if (authError) {
        showRadixError(authError.message);
        return;
      }

      // Atualizar tabela public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_url: newAvatarUrl, // Atualizar avatar_url em public.profiles
        })
        .eq('id', user?.id);

      if (profileError) {
        showRadixError(profileError.message);
      } else {
        showRadixSuccess("Perfil atualizado com sucesso!");
        // Re-buscar usuário para atualizar o estado local com a nova avatar_url
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        if (updatedUser) {
          setUser(updatedUser); // Atualizar o estado do usuário em MyAccount
        }
        // Resetar o formulário com os novos valores para limpar o estado 'dirty' e atualizar a pré-visualização
        profileForm.reset({
          firstName: firstName,
          lastName: lastName,
          avatar_file: newAvatarUrl, // Passar a URL de volta para o formulário para exibição
        });
      }
    } catch (err: any) {
      console.error("Erro não tratado durante a atualização do perfil:", err);
      showRadixError("Ocorreu um erro inesperado ao atualizar o perfil.");
    } finally {
      dismissToast(loadingId);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    const loadingId = showLoading("Alterando senha...");
    try {
      if (!email) {
        showRadixError("Não foi possível identificar seu e-mail.");
        return;
      }

      // Re-autenticar o usuário para verificar a senha atual
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: values.currentPassword,
      });

      if (reauthError) {
        showRadixError("Senha atual incorreta. Tente novamente.");
        return;
      }

      // Atualizar a senha do usuário
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        showRadixError(error.message);
      } else {
        showRadixSuccess("Senha alterada com sucesso!");
        passwordForm.reset({
          currentPassword: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err: any) {
      console.error("Erro não tratado durante a alteração da senha:", err);
      showRadixError("Ocorreu um erro inesperado ao alterar a senha.");
    } finally {
      dismissToast(loadingId);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minha Conta</h1>
          <p className="text-admin-foreground-muted">
            Gerencie as informações do seu perfil e configurações de senha.
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-admin-card border border-admin-border rounded-md">
            <TabsTrigger
              value="profile"
              className="text-admin-foreground-muted data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-admin-border"
            >
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="text-admin-foreground-muted data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-admin-border"
            >
              Senha
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-admin-card border-admin-border text-admin-foreground">
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription className="text-admin-foreground-muted">
                  Atualize a foto e os dados pessoais da sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormProvider {...profileForm}> {/* Envolver o formulário com FormProvider */}
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <ImageUpload
                        name="avatar_file"
                        label="Foto de Perfil"
                        currentImageUrl={profileForm.getValues('avatar_file')}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Seu nome"
                                {...field}
                                className="bg-admin-background border-admin-border"
                              />
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
                              <Input
                                placeholder="Seu sobrenome"
                                {...field}
                                className="bg-admin-background border-admin-border"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <Label className="text-admin-foreground">Email</Label>
                      <Input
                        type="email"
                        value={email}
                        disabled
                        className="bg-admin-background border-admin-border"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">Salvar Alterações</Button>
                    </div>
                  </form>
                </FormProvider>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="bg-admin-card border-admin-border text-admin-foreground">
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription className="text-admin-foreground-muted">
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
                              className="bg-admin-background border-admin-border"
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
                              className="bg-admin-background border-admin-border"
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
                              className="bg-admin-background border-admin-border"
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
