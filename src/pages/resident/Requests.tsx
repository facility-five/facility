import { ResidentLayout } from "@/components/resident/ResidentLayout";

const Requests = () => {
  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Solicitações</h1>
          <p className="text-muted-foreground">
            Abra e acompanhe suas solicitações para a administração.
          </p>
        </div>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card">
          <p className="text-muted-foreground">Página de Solicitações em construção.</p>
        </div>
      </div>
    </ResidentLayout>
  );
};

export default Requests;