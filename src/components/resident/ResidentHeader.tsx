import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Bell, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ResidentHeader = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Portal do Morador</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notificações */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
            3
          </span>
        </Button>

        {/* Menu do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 hover:bg-gray-100">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url} alt="Avatar" />
                <AvatarFallback>
                  {getInitials(profile?.first_name, profile?.last_name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/morador/perfil')}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/morador/configuracoes')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Ajuda e Suporte</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};