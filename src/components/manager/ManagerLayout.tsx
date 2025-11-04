import { ManagerSidebar } from "./ManagerSidebar";
import { ManagerHeader } from "./ManagerHeader";
import { ManagerAdministradorasProvider } from "@/contexts/ManagerAdministradorasContext";

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
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">{children}</main>
        </div>
      </div>
    </ManagerAdministradorasProvider>
  );
};
