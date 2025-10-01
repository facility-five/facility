import { ManagerLayout } from "@/components/manager/ManagerLayout";

const ManagerConfiguracoes = () => {
  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua administradora.
          </p>
        </div>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card">
          <p className="text-muted-foreground">Página de Configurações em construção.</p>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerConfiguracoes;