import { useState, useEffect } from 'react';
import { ManagerLayout } from '@/components/manager/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Mail, 
  Phone, 
  FileText,
  Loader2,
  Save
} from 'lucide-react';
import { useManagerAdministradoras } from '@/contexts/ManagerAdministradorasContext';
import { supabase } from '@/integrations/supabase/client';
import { showRadixSuccess, showRadixError } from '@/utils/toast';

const ManagerConfiguracoes = () => {
  const { activeAdministrator, refetch } = useManagerAdministradoras();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nif: "",
    email: "",
    phone: "",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <TabsList>
            <TabsTrigger value="general">Informações Gerais</TabsTrigger>
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
        </Tabs>
      </div>
    </ManagerLayout>
  );
};

export default ManagerConfiguracoes;