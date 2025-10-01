import { ResidentLayout } from "@/components/resident/ResidentLayout";

const Settings = () => {
  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua conta.
          </p>
        </div>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card">
          <p className="text-muted-foreground">Página de Configurações em construção.</p>
        </div>
      </div>
    </ResidentLayout>
  );
};

export default Settings;