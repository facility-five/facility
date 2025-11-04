import type { ReactNode } from "react";
import { SyndicSidebar } from "./SyndicSidebar";
import { SyndicHeader } from "./SyndicHeader";

export const SyndicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[260px_1fr]">
      <SyndicSidebar />
      <div className="flex flex-col">
        <SyndicHeader />
        <main className="flex-1 bg-gray-100 p-6">{children}</main>
      </div>
    </div>
  );
};
