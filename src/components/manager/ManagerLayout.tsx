import { ManagerSidebar } from "./ManagerSidebar";
import { ManagerHeader } from "./ManagerHeader";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export const ManagerLayout = ({ children }: ManagerLayoutProps) => {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[260px_1fr]">
      <ManagerSidebar />
      <div className="flex flex-col">
        <ManagerHeader />
        <main className="flex-1 bg-gray-100 p-6">{children}</main>
      </div>
    </div>
  );
};