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
import { User, Settings, LogOut, HelpCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ResidentNotificationsDropdown } from "@/components/resident/ResidentNotificationsDropdown";
import { NetworkIndicator } from "./NetworkIndicator";
import { HeaderLogo } from "./HeaderLogo";

interface ResidentHeaderProps {
  onMenuClick?: () => void;
}

export const ResidentHeader = ({ onMenuClick }: ResidentHeaderProps) => {
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
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-white px-4 lg:h-16 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden hover:bg-gray-100 active:bg-gray-200 transition-colors"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
        
        {/* Logo Mobile + Título Desktop */}
        <div className="flex items-center">
          {/* Logo apenas no mobile */}
          <HeaderLogo />
          
          {/* Título apenas no desktop */}
          <div className="hidden lg:flex lg:flex-col">
            <h2 className="text-base font-semibold text-gray-800 lg:text-lg">
              Portal do Morador
            </h2>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Network Indicator */}
        <NetworkIndicator />
        
        {/* Notificações */}
        <ResidentNotificationsDropdown />

        {/* Menu do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex h-10 items-center gap-2 rounded-full p-1 hover:bg-gray-100 lg:gap-3 lg:rounded-lg lg:p-2"
            >
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
              <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                <AvatarImage src={profile?.avatar_url} alt="Avatar" />
                <AvatarFallback className="text-xs lg:text-sm">
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