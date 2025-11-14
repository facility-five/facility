import { User, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export const Header = () => {
  const { user, profile, session, loading } = useAuth();
  const { t } = useTranslation();
  const [hasLogoError, setHasLogoError] = useState(false);

  return (
    <header className="bg-admin-card border-b border-admin-border px-4 py-3 flex justify-between items-center">
        <div className="flex items-center h-16">
          {hasLogoError ? (
            <div className="h-16 w-16 bg-purple-600 rounded-md flex items-center justify-center text-white">
              <Building size={32} />
            </div>
          ) : (
            <img
              src="/logo_main.png"
              alt="Facility Fincas Logo"
              className="h-16 w-auto max-h-16 object-contain"
              onError={() => setHasLogoError(true)}
            />
          )}
        </div>
      <div className="flex items-center gap-4">
        <div className="text-xs text-right text-admin-foreground-muted">
          {loading ? (
            <p>{t('admin.header.authLoading')}</p>
          ) : (
            <>
              <p>{t('admin.header.email')}: {user?.email || "N/A"}</p>
              <p>{t('admin.header.role')}: {profile?.role || "N/A"}</p>
              <p>{t('admin.header.status')}: {session ? t('admin.header.loggedIn') : t('admin.header.loggedOut')}</p>
            </>
          )}
        </div>

        <NotificationsDropdown />
        <Button variant="ghost" size="icon" className="text-admin-foreground-muted hover:text-admin-foreground hover:bg-admin-border">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
