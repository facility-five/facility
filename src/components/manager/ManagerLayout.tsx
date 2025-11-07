import { ManagerSidebar } from "./ManagerSidebar";
import { ManagerHeader } from "./ManagerHeader";
import { ManagerAdministradorasProvider } from "@/contexts/ManagerAdministradorasContext";
import { UpgradeBanner } from "@/components/UpgradeBanner";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export const ManagerLayout = ({ children }: ManagerLayoutProps) => {
  return (
    <ManagerAdministradorasProvider>
      <div className="grid h-screen w-full overflow-hidden lg:grid-cols-[260px_1fr]">
        <ManagerSidebar />
        <div className="flex flex-col overflow-hidden">
          <ManagerHeader />
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            <div className="mb-6">
              <UpgradeBanner
                title="¡Desbloquea todo el potencial de Facility!"
                description="Actualiza a un plan de pago y obtén acceso completo a todas las funcionalidades."
                ctaText="Ver Planes"
                variant="default"
              />
            </div>
            {children}
          </main>
        </div>
      </div>
    </ManagerAdministradorasProvider>
  );
};
