import { ManagerLayout } from "@/components/manager/ManagerLayout";

const ManagerCondominios = () => {
  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Condominios</h1>
          <p className="text-muted-foreground">
            Gerencie seus condomínios.
          </p>
        </div>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card">
          <p className="text-muted-foreground">Página de Condomínios em construção.</p>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerCondominios;