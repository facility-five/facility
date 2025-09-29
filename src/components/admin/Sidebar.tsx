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
import { showSuccess } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    showSuccess("Você saiu com sucesso!");
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-admin-card border-r border-admin-border flex flex-col">
      <div className="p-4 border-b border-admin-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-admin-border p-2 rounded-lg transition-colors -m-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Wagner" />
                <AvatarFallback>W</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-admin-foreground">Wagner</p>
                <p className="text-xs text-admin-foreground-muted">wfss1982@gmail.com</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-admin-card border-admin-border text-admin-foreground" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs leading-none text-admin-foreground-muted">
                  Entrou como
                </p>
                <p className="text-sm font-medium leading-none text-purple-400">
                  Wagner Fernando
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-admin-border" />
            <DropdownMenuItem className="focus:bg-admin-border focus:text-admin-foreground" onClick={() => navigate("/admin/minha-conta")}>
              <User className="mr-2 h-4 w-4" />
              <span>Minha Conta</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-admin-border" />
            <DropdownMenuItem className="focus:bg-admin-border focus:text-admin-foreground" onClick={handleLogout}>
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
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-admin-foreground-muted hover:bg-admin-border hover:text-admin-foreground transition-colors",
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