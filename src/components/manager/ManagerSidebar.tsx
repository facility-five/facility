import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Home,
  Settings,
  FileText,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "../ui/button";

const navItems = [
  { href: "/gestor-dashboard", icon: LayoutGrid, label: "Panel" },
  { href: "/gestor/condominios", icon: Home, label: "Condominios" },
  { href: "/gestor/configuracoes", icon: Settings, label: "Configurações" },
  { href: "/gestor/plan", icon: FileText, label: "Plan" },
];

const NavItem = ({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) => (
  <NavLink
    to={href}
    end={href === "/gestor-dashboard"}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all text-base font-medium ${
        isActive ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-purple-600/20"
      }`
    }
  >
    <Icon className="h-5 w-5" />
    {label}
  </NavLink>
);

export const ManagerSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="hidden border-r bg-[#1E1E2D] text-white lg:block">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-20 items-center border-b border-gray-800 px-6">
          <div>
            <h1 className="text-xl font-bold text-purple-400">Facility Fincas</h1>
            <p className="text-sm text-gray-400">GpFive</p>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex w-full items-center justify-start gap-3 rounded-lg px-4 py-2.5 text-base font-medium text-gray-300 transition-all hover:bg-purple-600/20 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};