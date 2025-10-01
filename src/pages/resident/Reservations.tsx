import { ResidentLayout } from "@/components/resident/ResidentLayout";

const Reservations = () => {
  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground">
            Veja e gerencie suas reservas de áreas comuns.
          </p>
        </div>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card">
          <p className="text-muted-foreground">Página de Reservas em construção.</p>
        </div>
      </div>
    </ResidentLayout>
  );
};

export default Reservations;