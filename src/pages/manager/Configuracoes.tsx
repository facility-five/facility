import { useState, useEffect } from 'react';
import { ManagerLayout } from '@/components/manager/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Mail, 
  Phone, 
  FileText,
  Loader2,
  Save,
  User,
  Bell,
  Shield,
  CreditCard,
  Key,
  Clock,
  CheckCircle2,
  AlertCircle,
  Crown
} from 'lucide-react';
import { useManagerAdministradoras } from '@/contexts/ManagerAdministradorasContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { supabase } from '@/integrations/supabase/client';
import { showRadixSuccess, showRadixError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const ManagerConfiguracoes = () => {
  const { activeAdministrator, refetch } = useManagerAdministradoras();
  const { profile, user } = useAuth();
  const { currentPlan, hasActivePlan, isFreePlan } = usePlan();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Dados da administradora
  const [formData, setFormData] = useState({
    name: "",
    nif: "",
    email: "",
    phone: "",
  });

  // Dados do perfil do usuário
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  // Dados de senha
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Configurações de notificações
  const [notifications, setNotifications] = useState({
    email_new_residents: true,
    email_reservations: true,
    email_communications: true,
    email_payments: false,
  });

  // Carrega os dados da administradora ativa
  useEffect(() => {
    if (activeAdministrator) {
      setFormData({
        name: activeAdministrator.name || "",
        nif: activeAdministrator.nif || "",
        email: activeAdministrator.email || "",
        phone: activeAdministrator.phone || "",
      });
    }
  }, [activeAdministrator]);

  // Carrega os dados do perfil do usuário
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: user?.email || "",
      });
    }
  }, [profile, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!activeAdministrator?.id) {
      showRadixError("Nenhuma administradora selecionada");
      return;
    }

    if (!formData.name.trim()) {
      showRadixError("O nome da administradora é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("administrators")
        .update({
          name: formData.name,
          nif: formData.nif || null,
          email: formData.email || null,
          phone: formData.phone || null,
        })
        .eq("id", activeAdministrator.id);

      if (error) throw error;

      showRadixSuccess("Configurações salvas com sucesso!");
      await refetch();
    } catch (error: any) {
      showRadixError(error.message || "Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      showRadixError("Usuário não autenticado");
      return;
    }

    if (!profileData.first_name.trim() || !profileData.last_name.trim()) {
      showRadixError("Nome e sobrenome são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
        })
        .eq("id", user.id);

      if (error) throw error;

      showRadixSuccess("Perfil atualizado com sucesso!");
    } catch (error: any) {
      showRadixError(error.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.new_password || !passwordData.confirm_password) {
      showRadixError("Preencha todos os campos de senha");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      showRadixError("As senhas não coincidem");
      return;
    }

    if (passwordData.new_password.length < 6) {
      showRadixError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (error) throw error;

      showRadixSuccess("Senha alterada com sucesso!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: any) {
      showRadixError(error.message || "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as informações da sua administradora.
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Building2 className="h-4 w-4 mr-2" />
              Administradora
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Meu Perfil
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="plan">
              <CreditCard className="h-4 w-4 mr-2" />
              Plano
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Dados da Administradora
                </CardTitle>
                <CardDescription>
                  Informações básicas e dados de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Nome da Administradora *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Nome da administradora"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nif" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      NIF
                    </Label>
                    <Input
                      id="nif"
                      value={formData.nif}
                      onChange={(e) => handleInputChange("nif", e.target.value)}
                      placeholder="X0000000X"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@exemplo.com"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+34 000 000 000"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Perfil do Usuário */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize seus dados pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nome *</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => handleProfileChange("first_name", e.target.value)}
                      placeholder="Seu nome"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Sobrenome *</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => handleProfileChange("last_name", e.target.value)}
                      placeholder="Seu sobrenome"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="profile_email">E-mail</Label>
                    <Input
                      id="profile_email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-muted-foreground">
                      O e-mail não pode ser alterado
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Perfil
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Segurança */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-600" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">Nova Senha *</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => handlePasswordChange("new_password", e.target.value)}
                      placeholder="Digite a nova senha"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirmar Nova Senha *</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => handlePasswordChange("confirm_password", e.target.value)}
                      placeholder="Confirme a nova senha"
                      disabled={loading}
                    />
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Requisitos de senha:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Mínimo de 6 caracteres</li>
                          <li>Recomendado: use letras, números e símbolos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Alterar Senha
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Plano */}
          <TabsContent value="plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  Seu Plano Atual
                </CardTitle>
                <CardDescription>
                  Informações sobre sua assinatura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
                  <div className="flex items-center gap-3">
                    {isFreePlan ? (
                      <div className="p-2 rounded-full bg-gray-100">
                        <CreditCard className="h-6 w-6 text-gray-600" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-full bg-purple-100">
                        <Crown className="h-6 w-6 text-purple-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg">
                        {currentPlan?.name || "Plano Gratuito"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isFreePlan ? "Plano básico" : "Plano premium ativo"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isFreePlan ? "secondary" : "default"} className="text-sm px-3 py-1">
                    {isFreePlan ? "Gratuito" : `€${currentPlan?.price}/mês`}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Recursos do seu plano
                  </h4>
                  <div className="grid gap-3">
                    {currentPlan?.features?.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    )) || (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Acesso básico à plataforma</span>
                      </div>
                    )}
                  </div>
                </div>

                {isFreePlan && (
                  <>
                    <Separator />
                    <div className="rounded-lg bg-gradient-to-r from-purple-100 to-indigo-100 p-4 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-900 mb-1">
                            Desbloqueie todo o potencial!
                          </h4>
                          <p className="text-sm text-purple-800 mb-3">
                            Faça upgrade para um plano pago e tenha acesso a recursos avançados de gestão.
                          </p>
                          <Button
                            onClick={() => navigate('/gestor/mi-plan')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Ver Planos Disponíveis
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ManagerLayout>
  );
};

export default ManagerConfiguracoes;