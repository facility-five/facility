import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutGrid,
  Building,
  Home,
  Box,
  Building2,
  MapPin,
  MessageSquare,
  Users,
  FileText,
  DollarSign,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess } from "@/utils/toast";

const navItems = [
  { href: "/admin", icon: LayoutGrid, label: "Painel" },
  { href: "/admin/administradoras", icon: Building, label: "Administradoras" },
  { href: "/admin/condominios", icon: Home, label: "Condominios" },
  { href: "/admin/bloques", icon: Box, label: "Bloques" },
  { href: "/admin/unidades", icon: Building2, label: "Unidades" },
  { href: "/admin/areas-comunes", icon: MapPin, label: "Áreas Comunes" },
  { href: "/admin/comunicados", icon: MessageSquare, label: "Comunicados" },
  { href: "/admin/usuarios", icon: Users, label: "Usuarios" },
  { href: "/admin/planes", icon: FileText, label: "Planes" },
  { href: "/admin/pagos", icon: DollarSign, label: "Pagos" },
  { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("Você saiu com sucesso!");
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm flex flex-col">
      <div className="p-4 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors -m-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Wagner" />
                <AvatarFallback>W</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">Wagner</p>
                <p className="text-xs text-gray-500">wfss1982@gmail.com</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs leading-none text-muted-foreground">
                  Entrou como
                </p>
                <p className="text-sm font-medium leading-none text-purple-600">
                  Wagner Fernando
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin/minha-conta")}>
              <User className="mr-2 h-4 w-4" />
              <span>Minha Conta</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors",
                  location.pathname === item.href &&
                    "bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};