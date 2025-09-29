import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const { user, profile, session, loading } = useAuth();

  const handleDebugClick = () => {
    console.log("--- Auth Debug Info ---");
    console.log("Loading:", loading);
    console.log("User:", user);
    console.log("Profile:", profile);
    console.log("Session:", session);
    console.log("-----------------------");
  };

  return (
    <header className="bg-admin-card border-b border-admin-border p-4 flex justify-between items-center">
        <div>
            <img src="https://a4f4baa75172da68aa688051984fd151.cdn.bubble.io/f1744250402403x458193812617061060/facility_logo.svg" alt="Facility Fincas Logo" className="h-8" />
        </div>
      <div className="flex items-center gap-4">
        <div className="text-xs text-right text-admin-foreground-muted">
          {loading ? (
            <p>Auth: Carregando...</p>
          ) : (
            <>
              <p>Email: {user?.email || "N/A"}</p>
              <p>Role: {profile?.role || "N/A"}</p>
              <p>Status: {session ? "Logado" : "Deslogado"}</p>
            </>
          )}
        </div>
        <Button onClick={handleDebugClick} size="sm" variant="outline" className="bg-transparent border-admin-border hover:bg-admin-border">
          Debug Auth
        </Button>
        <NotificationsDropdown />
        <Button variant="ghost" size="icon" className="text-admin-foreground-muted hover:text-admin-foreground hover:bg-admin-border">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};