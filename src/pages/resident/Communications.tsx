import { ResidentLayout } from "@/components/resident/ResidentLayout";

const Communications = () => {
  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Comunicados</h1>
          <p className="text-muted-foreground">
            Fique por dentro dos últimos avisos do condomínio.
          </p>
        </div>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card">
          <p className="text-muted-foreground">Página de Comunicados em construção.</p>
        </div>
      </div>
    </ResidentLayout>
  );
};

export default Communications;