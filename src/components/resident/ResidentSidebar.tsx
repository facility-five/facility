import { DynamicSidebarLogo } from "@/components/DynamicSidebarLogo";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  MessageSquare,
  Wrench,
  Building2,
  FileText,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const mainNav = [
  { href: "/morador-dashboard", icon: LayoutGrid, label: "Início" },
  { href: "/morador/reservas", icon: Calendar, label: "Reservas" },
  { href: "/morador/comunicados", icon: MessageSquare, label: "Comunicados" },
  { href: "/morador/solicitudes", icon: Wrench, label: "Solicitudes" },
  { href: "/morador/unidade", icon: Building2, label: "Unidad" },
  { href: "/morador/documentos", icon: FileText, label: "Documentos" },
];

const accountNav = [
  { href: "/morador/perfil", icon: User, label: "Perfil" },
  { href: "/morador/configuracoes", icon: Settings, label: "Configurações" },
];

const NavItem = ({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) => (
  <NavLink
    to={href}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-purple-700 ${
        isActive ? "bg-purple-600 text-white" : "text-gray-300"
      }`
    }
  >
    <Icon className="h-4 w-4" />
    {label}
  </NavLink>
);

export const ResidentSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="hidden border-r bg-gray-900 text-white lg:block">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <DynamicSidebarLogo />
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {mainNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <nav className="grid items-start text-sm font-medium">
            <Separator className="my-2 bg-gray-700" />
            {accountNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
            <Separator className="my-2 bg-gray-700" />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-purple-700 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};