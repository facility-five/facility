import { Building2 } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 mb-8">
      <div className="flex items-center gap-2">
        <Building2 className="h-10 w-10 text-purple-600" />
        <span className="text-2xl font-bold">FACILITY FINCAS</span>
      </div>
      <p className="text-sm text-gray-500">Gestão de edifícios e condomínios</p>
    </div>
  );
};