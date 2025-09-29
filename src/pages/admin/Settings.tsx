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

const Settings = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuraciones del Sistema</h1>
          <p className="text-gray-500">
            Administre las configuraciones globales del sistema
          </p>
        </div>
        <Tabs defaultValue="stripe" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="stripe">Stripe</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configuraciones Generales</CardTitle>
                <CardDescription>
                  Configure las opciones básicas del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>As configurações gerais estarão disponíveis aqui em breve.</p>
              </CardContent>
            </Card>
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