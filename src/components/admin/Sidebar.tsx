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
  UserCheck, // Import icon for Leads
  Palette, // Import icon for Design System
  ListTodo, // Icon for Tareas
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
import { useTranslation } from "react-i18next";

const navItems = [
  { href: "/admin", icon: LayoutGrid, labelKey: "navigation.dashboard" },
  { href: "/admin/administradoras", icon: Building, labelKey: "navigation.administrators" },
  { href: "/admin/condominios", icon: Home, labelKey: "navigation.condominiums" },
  { href: "/admin/bloques", icon: Box, labelKey: "navigation.blocks" },
  { href: "/admin/unidades", icon: Building2, labelKey: "navigation.units" },
  { href: "/admin/areas-comunes", icon: Building, labelKey: "navigation.commonAreas" },
  { href: "/admin/soporte", icon: MessageSquare, labelKey: "navigation.support" },
  { href: "/admin/tareas", icon: ListTodo, labelKey: "navigation.tasks" },
  { href: "/admin/usuarios", icon: Users, labelKey: "navigation.users" },
  { href: "/admin/moradores", icon: Users, labelKey: "navigation.residents" },
  { href: "/admin/planes", icon: FileText, labelKey: "navigation.plans" },
  { href: "/admin/clientes-potenciales", icon: UserCheck, labelKey: "navigation.leads" },
  { href: "/admin/pagos", icon: DollarSign, labelKey: "navigation.payments" },
  { href: "/admin/design-system", icon: Palette, labelKey: "navigation.designSystem" },
  { href: "/admin/configuracoes", icon: Settings, labelKey: "navigation.settings" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth(); // Get profile from AuthContext
  const { t } = useTranslation();

  const handleLogout = async () => {
    await signOut();
    showRadixSuccess(t('auth.logoutSuccess'));
    navigate("/");
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0F1222] text-gray-100 border-r border-[#1F2238] flex flex-col">
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors",
                  location.pathname === item.href &&
                    "bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {t(item.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sticky bottom-0 z-10 p-4 border-t border-[#1F2238] bg-[#0F1222] mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors -m-2">
              <Avatar>
                <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
                <AvatarFallback>{getInitials(profile?.first_name, profile?.last_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-white">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-xs text-gray-400">{profile?.role}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#14172B] border-[#1F2238] text-gray-100" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs leading-none text-gray-400">
                  {t('auth.logged_in_as')}
                </p>
                <p className="text-sm font-medium leading-none text-purple-400">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs leading-none text-gray-400">
                  {profile?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1F2238]" />
            <DropdownMenuItem className="focus:bg-white/10 focus:text-white" onClick={() => navigate("/admin/minha-conta")}>
              <User className="mr-2 h-4 w-4" />
              <span>{t('navigation.myAccount')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1F2238]" />
            <DropdownMenuItem className="focus:bg-white/10 focus:text-white" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('auth.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};
