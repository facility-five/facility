import { ResidentSidebar } from "./ResidentSidebar";
import { ResidentHeader } from "./ResidentHeader";

interface ResidentLayoutProps {
  children: React.ReactNode;
}

export const ResidentLayout = ({ children }: ResidentLayoutProps) => {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <ResidentSidebar />
      <div className="flex flex-col">
        <ResidentHeader />
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
};