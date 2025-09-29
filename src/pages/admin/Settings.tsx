import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemSettingsTab } from "@/components/admin/SystemSettingsTab";
import { SystemUsersTab } from "@/components/admin/SystemUsersTab";
import { EmailTemplatesTab } from "@/components/admin/EmailTemplatesTab";
import StripeSettings from "@/components/admin/StripeSettings";

const Settings = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-admin-foreground-muted">
            Administre as configurações globais e usuários do sistema
          </p>
        </div>
        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-admin-card border-admin-border">
            <TabsTrigger value="system">Configurações do Sistema</TabsTrigger>
            <TabsTrigger value="users">Usuários do Sistema</TabsTrigger>
            <TabsTrigger value="email">Modelos de E-mail</TabsTrigger>
            <TabsTrigger value="stripe">Stripe</TabsTrigger>
          </TabsList>
          <TabsContent value="system">
            <SystemSettingsTab />
          </TabsContent>
          <TabsContent value="users">
            <SystemUsersTab />
          </TabsContent>
          <TabsContent value="email">
            <EmailTemplatesTab />
          </TabsContent>
          <TabsContent value="stripe">
            <StripeSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;