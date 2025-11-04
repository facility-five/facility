import type { ElementType } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, Building2, Megaphone, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/sindico", icon: LayoutGrid, label: "Painel" },
  { href: "/sindico/blocos", icon: Building2, label: "Blocos" },
  { href: "/sindico/comunicados", icon: Megaphone, label: "Comunicados" },
];

const NavItem = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: ElementType;
  label: string;
}) => {
  return (
    <NavLink
      to={href}
      end={href === "/sindico"}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-300 hover:bg-slate-800/40",
        ].join(" ")
      }
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  );
};

export const SyndicSidebar = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="hidden border-r bg-slate-950 text-white lg:block">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-20 items-center border-b border-slate-800 px-6">
          <div>
            <h1 className="text-xl font-bold text-indigo-400">
              Facility Fincas
            </h1>
            <p className="text-sm text-slate-400">
              {profile?.role || "Síndico"}
            </p>
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
            className="flex w-full items-center justify-start gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800/40 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};
