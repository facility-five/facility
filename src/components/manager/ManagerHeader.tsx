import { useNavigate } from "react-router-dom";
import { Building2, CreditCard, LogOut, Settings, User2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";

export const ManagerHeader = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    administrators,
    activeAdministrator,
    activeAdministratorId,
    selectAdministrator,
    loading,
  } = useManagerAdministradoras();

  const firstName = profile?.first_name ?? "";
  const lastName = profile?.last_name ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || profile?.email || "Usuario";
  const initials = (
    (firstName?.[0] ?? "").toUpperCase() + (lastName?.[0] ?? profile?.email?.[0] ?? "").toUpperCase()
  ).trim();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="flex h-20 items-center justify-between gap-4 border-b bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-500">Administradora seleccionada</span>
          {loading ? (
            <Skeleton className="mt-2 h-9 w-60 rounded-md" />
          ) : (
            <Select
              value={activeAdministratorId ?? undefined}
              onValueChange={(value) => {
                const admin = administrators.find(a => a.id === value);
                if (admin) {
                  selectAdministrator(admin);
                }
              }}
              disabled={administrators.length === 0}
            >
              <SelectTrigger className="mt-1 h-9 w-60 border border-purple-200 bg-purple-50/80 text-left text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-100 focus:ring-purple-500">
                <SelectValue
                  placeholder={
                    administrators.length === 0
                      ? "Nenhuma administradora"
                      : "Selecione a administradora"
                  }
                >
                  {activeAdministrator?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white">
                {administrators.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2">
              <Avatar className="h-9 w-9 border border-purple-200">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left text-sm font-medium sm:block">
                <p className="leading-none text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{profile?.role ?? "Usuario"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuLabel className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" onClick={() => handleNavigate("/gestor/mi-plan")}>
              <CreditCard className="h-4 w-4" />
              Meu plano
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2"
              onClick={() => handleNavigate("/gestor/configuracoes")}
            >
              <Settings className="h-4 w-4" />
              Configuracoes
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => handleNavigate("/gestor")}>
              <User2 className="h-4 w-4" />
              Painel do gestor
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
