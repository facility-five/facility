import { ResidentLayout } from "@/components/resident/ResidentLayout";

const Documents = () => {
  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">
            Acesse atas de reunião, regulamentos e outros documentos importantes.
          </p>
        </div>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card">
          <p className="text-muted-foreground">Página de Documentos em construção.</p>
        </div>
      </div>
    </ResidentLayout>
  );
};

export default Documents;