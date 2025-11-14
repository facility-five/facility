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
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  labelKey: string;
  onClick?: () => void;
}

const NavItem = ({ href, icon: Icon, labelKey, onClick }: NavItemProps) => {
  const { t } = useTranslation();
  
  return (
    <NavLink
      to={href}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-purple-700 active:bg-purple-800",
          isActive ? "bg-purple-600 text-white" : "text-gray-300"
        )
      }
    >
      <Icon className="h-5 w-5" />
      <span>{t(labelKey)}</span>
    </NavLink>
  );
};

interface ResidentSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ResidentSidebar = ({ isOpen = false, onClose }: ResidentSidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    onClose?.();
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-purple-600 to-purple-700 text-white transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Mobile Header */}
          <div className="flex h-16 items-center justify-between border-b border-purple-500 px-4">
            <DynamicSidebarLogo />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-purple-100 hover:bg-purple-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex-1 overflow-auto py-4">
            <nav className="space-y-1 px-4">
              {mainNav.map((item) => (
                <NavItem key={item.href} {...item} onClick={handleNavClick} />
              ))}
            </nav>
          </div>
          
          {/* Mobile Footer */}
          <div className="mt-auto border-t border-gray-800 p-4">
            <nav className="space-y-1">
              {accountNav.map((item) => (
                <NavItem key={item.href} {...item} onClick={handleNavClick} />
              ))}
              <Separator className="my-2 bg-gray-700" />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex w-full items-center justify-start gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-purple-700 hover:text-white active:bg-purple-800"
              >
                <LogOut className="h-5 w-5" />
                <span>{t('auth.logout')}</span>
              </Button>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-gray-900 text-white lg:block lg:w-64">
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
    </>
  );
};