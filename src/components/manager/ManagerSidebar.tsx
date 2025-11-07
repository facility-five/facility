import type { ElementType } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Home,
  Layers,
  Users,
  PawPrint,
  Car,
  Settings,
  CreditCard,
  Building2,
  DoorOpen,
  MessageSquare,
  MapPin,
  Calendar,
  Crown,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { DynamicSidebarLogo } from "@/components/DynamicSidebarLogo";

const navItems = [
  { href: "/gestor", icon: LayoutGrid, labelKey: "navigation.dashboard" },
  { href: "/gestor/administradoras", icon: Building2, labelKey: "navigation.administrators" },
  { href: "/gestor/condominios", icon: Home, labelKey: "navigation.condominiums" },
  { href: "/gestor/blocos", icon: Layers, labelKey: "navigation.blocks" },
  { href: "/gestor/unidades", icon: DoorOpen, labelKey: "navigation.units" },
  { href: "/gestor/areas-comuns", icon: MapPin, labelKey: "navigation.commonAreas" },
  { href: "/gestor/reservas", icon: Calendar, labelKey: "navigation.reservations" },
  { href: "/gestor/residentes", icon: Users, labelKey: "navigation.residents" },
  { href: "/gestor/mascotas", icon: PawPrint, labelKey: "navigation.pets" },
  { href: "/gestor/vehiculos", icon: Car, labelKey: "navigation.vehicles" },
  { href: "/gestor/comunicados", icon: MessageSquare, labelKey: "navigation.communications" },
  { href: "/gestor/mi-plan", icon: CreditCard, labelKey: "navigation.plans" },
  { href: "/gestor/configuracoes", icon: Settings, labelKey: "navigation.settings" },
];

const NavItem = ({ href, icon: Icon, labelKey }: { href: string; icon: ElementType; labelKey: string }) => {
  const { t } = useTranslation();
  
  return (
    <NavLink
      to={href}
      end={href === "/gestor"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all text-sm font-medium ${
          isActive ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-purple-600/20"
        }`
      }
    >
      <Icon className="h-5 w-5" />
      {t(labelKey)}
    </NavLink>
  );
};

export const ManagerSidebar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleUpgrade = () => {
    navigate('/gestor/mi-plan');
  };

  return (
    <div className="hidden h-full border-r bg-[#1E1E2D] text-white lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center border-b border-gray-800 px-6">
          <DynamicSidebarLogo />
        </div>
        <div className="flex-1 py-4">
          <nav className="grid items-start px-4">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-lg p-4 shadow-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-yellow-400/20 p-1.5 rounded-full">
                <Crown className="h-4 w-4 text-yellow-300" />
              </div>
              <Sparkles className="h-4 w-4 text-yellow-300" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              ¡Actualiza tu Plan!
            </h4>
            <p className="text-xs text-purple-100 mb-3 leading-relaxed">
              Desbloquea todas las funcionalidades premium
            </p>
            <Button
              onClick={handleUpgrade}
              size="sm"
              className="w-full bg-white text-purple-700 hover:bg-purple-50 font-semibold text-xs shadow-md"
            >
              Ver Planes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
