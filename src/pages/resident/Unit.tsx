import { ResidentLayout } from "@/components/resident/ResidentLayout";

const Unit = () => {
  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minha Unidade</h1>
          <p className="text-muted-foreground">
            Informações sobre sua unidade e moradores.
          </p>
        </div>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card">
          <p className="text-muted-foreground">Página da Unidade em construção.</p>
        </div>
      </div>
    </ResidentLayout>
  );
};

export default Unit;