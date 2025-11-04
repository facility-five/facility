import { useState, useEffect } from "react";
import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { showRadixSuccess } from "@/utils/toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { User, Mail, Phone, FileText, Building2, MapPin, Calendar, Save, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type ResidentProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  document_number: string | null;
  unit_number: string | null;
  block_name: string | null;
  condominium_name: string | null;
  is_owner: boolean;
  is_tenant: boolean;
  created_at: string;
  avatar_url: string | null;
};

const Profile = () => {
  const { user } = useAuth();
  const { showError } = useErrorHandler();
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('residents')
        .select(`
          *,
          units!inner(
            number,
            blocks!inner(
              name,
              condominiums!inner(
                name
              )
            )
          )
        `)
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      const profileData: ResidentProfile = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        document_number: data.document_number,
        unit_number: data.units?.number,
        block_name: data.units?.blocks?.name,
        condominium_name: data.units?.blocks?.condominiums?.name,
        is_owner: data.is_owner,
        is_tenant: data.is_tenant,
        created_at: data.created_at,
        avatar_url: data.avatar_url,
      };

      setProfile(profileData);
      setFormData({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone || "",
      });
    } catch (error: any) {
      showError("Erro ao carregar perfil: " + error.message, "PROFILE_LOAD_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('residents')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      showRadixSuccess("Perfil atualizado com sucesso!");
      await fetchProfile();
    } catch (error: any) {
      showError("Erro ao atualizar perfil: " + error.message, "PROFILE_UPDATE_ERROR");
    } finally {
      setSaving(false);
    }
  };

  const getResidentType = () => {
    if (!profile) return "";
    if (profile.is_owner && profile.is_tenant) return "Proprietário e Inquilino";
    if (profile.is_owner) return "Proprietário";
    if (profile.is_tenant) return "Inquilino";
    return "Morador";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <ResidentLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </ResidentLayout>
    );
  }

  if (!profile) {
    return (
      <ResidentLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Perfil não encontrado.</p>
        </div>
      </ResidentLayout>
    );
  }

  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Atualize suas informações pessoais e de contato.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="text-lg">
                    {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nome</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Sobrenome</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado. Entre em contato com a administração.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Unidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Unidade
              </CardTitle>
              <CardDescription>
                Dados da sua unidade no condomínio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Condomínio:</span>
                  </div>
                  <span className="text-sm">{profile.condominium_name || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Bloco:</span>
                  </div>
                  <span className="text-sm">{profile.block_name || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Unidade:</span>
                  </div>
                  <span className="text-sm">{profile.unit_number || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tipo:</span>
                  </div>
                  <Badge variant="secondary">{getResidentType()}</Badge>
                </div>

                {profile.document_number && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Documento:</span>
                    </div>
                    <span className="text-sm">{profile.document_number}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Membro desde:</span>
                  </div>
                  <span className="text-sm">{formatDate(profile.created_at)}</span>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                <p>Para alterar informações da unidade, entre em contato com a administração do condomínio.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResidentLayout>
  );
};

export default Profile;
