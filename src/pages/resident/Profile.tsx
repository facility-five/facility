import { ResidentLayout } from "@/components/resident/ResidentLayout";

const Profile = () => {
  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Atualize suas informações pessoais e de contato.
          </p>
        </div>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card">
          <p className="text-muted-foreground">Página de Perfil em construção.</p>
        </div>
      </div>
    </ResidentLayout>
  );
};

export default Profile;