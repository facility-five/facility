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
import { SystemSettingsTab } from "@/components/admin/SystemSettingsTab";
import { SystemUsersTab } from "@/components/admin/SystemUsersTab";

const Settings = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-gray-500">
            Administre as configurações globais e usuários do sistema
          </p>
        </div>
        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="system">Configurações do Sistema</TabsTrigger>
            <TabsTrigger value="users">Usuários do Sistema</TabsTrigger>
            <TabsTrigger value="stripe">Stripe</TabsTrigger>
          </TabsList>
          <TabsContent value="system">
            <SystemSettingsTab />
          </TabsContent>
          <TabsContent value="users">
            <SystemUsersTab />
          </TabsContent>
          <TabsContent value="stripe">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Stripe</CardTitle>
                <CardDescription>
                  Conecte sua conta Stripe para processar pagamentos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publishable-key">Chave Publicável</Label>
                  <Input id="publishable-key" placeholder="pk_test_..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret-key">Chave Secreta</Label>
                  <Input id="secret-key" type="password" placeholder="sk_test_..." />
                </div>
                <div className="flex justify-end">
                  <Button>Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;