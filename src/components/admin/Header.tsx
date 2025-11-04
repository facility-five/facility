import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { DynamicLogo } from "@/components/DynamicLogo";

export const Header = () => {
  const { user, profile, session, loading } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="bg-admin-card border-b border-admin-border px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
            <DynamicLogo className="h-10 mb-0" imageClassName="h-10 w-auto max-h-10" />
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
