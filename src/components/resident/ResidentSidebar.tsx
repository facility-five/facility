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
import { useTranslation } from "react-i18next";

const mainNav = [
  { href: "/morador-dashboard", icon: LayoutGrid, labelKey: "navigation.dashboard" },
  { href: "/morador/reservas", icon: Calendar, labelKey: "navigation.reservations" },
  { href: "/morador/comunicados", icon: MessageSquare, labelKey: "navigation.communications" },
  { href: "/morador/solicitudes", icon: Wrench, labelKey: "navigation.requests" },
  { href: "/morador/unidade", icon: Building2, labelKey: "navigation.unit" },
  { href: "/morador/documentos", icon: FileText, labelKey: "navigation.documents" },
];

const accountNav = [
  { href: "/morador/perfil", icon: User, labelKey: "navigation.profile" },
  { href: "/morador/configuracoes", icon: Settings, labelKey: "navigation.settings" },
];

const NavItem = ({ href, icon: Icon, labelKey }: { href: string, icon: React.ElementType, labelKey: string }) => {
  const { t } = useTranslation();
  
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-purple-700 ${
          isActive ? "bg-purple-600 text-white" : "text-gray-300"
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {t(labelKey)}
    </NavLink>
  );
};

export const ResidentSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
              {t('auth.logout')}
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};