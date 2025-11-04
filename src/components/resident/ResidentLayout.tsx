import { ResidentSidebar } from "./ResidentSidebar";
import { ResidentHeader } from "./ResidentHeader";

interface ResidentLayoutProps {
  children: React.ReactNode;
}

export const ResidentLayout = ({ children }: ResidentLayoutProps) => {
  return (
    <div className="grid h-screen w-full overflow-hidden lg:grid-cols-[260px_1fr]">
      <ResidentSidebar />
      <div className="flex flex-col overflow-hidden">
        <ResidentHeader />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">{children}</main>
      </div>
    </div>
  );
};