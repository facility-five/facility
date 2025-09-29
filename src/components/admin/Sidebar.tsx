import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="Wagner" />
            <AvatarFallback>W</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">Wagner</p>
            <p className="text-xs text-gray-500">wfss1982@gmail.com</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors",
                  location.pathname === item.href && "bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
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