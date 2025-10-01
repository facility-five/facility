import { ManagerLayout } from "@/components/manager/ManagerLayout";

const ManagerPlan = () => {
  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meu Plano</h1>
          <p className="text-muted-foreground">
            Veja os detalhes e gerencie seu plano de assinatura.
          </p>
        </div>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card">
          <p className="text-muted-foreground">Página de Plano em construção.</p>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerPlan;