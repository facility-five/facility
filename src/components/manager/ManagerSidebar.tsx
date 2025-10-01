import { DynamicSidebarLogo } from "@/components/DynamicSidebarLogo";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Home,
  Box,
  Building2,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/gestor-dashboard", icon: LayoutGrid, label: "Painel" },
  { href: "/gestor/condominios", icon: Home, label: "Condomínios" },
  { href: "/gestor/blocos", icon: Box, label: "Blocos" },
  { href: "/gestor/unidades", icon: Building2, label: "Unidades" },
  { href: "/gestor/areas-comuns", icon: MapPin, label: "Áreas Comuns" },
  { href: "/gestor/comunicados", icon: MessageSquare, label: "Comunicados" },
  { href: "/gestor/moradores", icon: Users, label: "Moradores" },
];

const NavItem = ({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) => (
  <NavLink
    to={href}
    end
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

export const ManagerSidebar = () => {
  return (
    <div className="hidden border-r bg-gray-900 text-white lg:block">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <DynamicSidebarLogo />
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};