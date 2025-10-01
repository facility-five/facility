import { Logo } from "@/components/Logo";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  MessageSquare,
  Wrench,
  Building2,
  FileText,
  User,
  Settings,
} from "lucide-react";

const mainNav = [
  { href: "/morador-dashboard", icon: LayoutGrid, label: "Início" },
  { href: "/morador/reservas", icon: Calendar, label: "Reservas" },
  { href: "/morador/comunicados", icon: MessageSquare, label: "Comunicados" },
  { href: "/morador/solicitudes", icon: Wrench, label: "Solicitudes" },
  { href: "/morador/unidade", icon: Building2, label: "Unidade" },
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
  return (
    <div className="hidden border-r bg-gray-900 text-white lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <Logo theme="dark" />
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <NavItem {...mainNav[0]} />
            <div className="my-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Mi Condominio
            </div>
            {mainNav.slice(1).map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
            <div className="my-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Cuenta
            </div>
            {accountNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};