import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Building } from "lucide-react";

export const SyndicHeader = () => {
  // Valores padrão para substituir o contexto removido
  const condos: any[] = [];
  const loading = false;
  const selectedCondoId: string | null = null;
  const selectCondo = (value: string) => {};

  const hasCondos = condos.length > 0;

  return (
    <header className="flex h-20 items-center justify-between gap-4 border-b bg-white px-6">
      <div className="flex items-center gap-2">
        <Building className="h-5 w-5 text-indigo-500" />
        <span className="text-xs font-semibold uppercase text-slate-500">
          Condomínio ativo
        </span>
      </div>
      <div className="flex items-center">
        {loading ? (
          <Skeleton className="h-9 w-64" />
        ) : hasCondos ? (
          <Select
            value={selectedCondoId ?? undefined}
            onValueChange={(value) => selectCondo(value)}
          >
            <SelectTrigger className="w-64 bg-white">
              <SelectValue placeholder="Selecionar condomínio" />
            </SelectTrigger>
            <SelectContent>
              {condos.map((condo) => (
                <SelectItem key={condo.id} value={condo.id}>
                  {condo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm text-slate-500">
            Nenhum condomínio atribuído ao seu usuário.
          </span>
        )}
      </div>
    </header>
  );
};
