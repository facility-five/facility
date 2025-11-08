import { EmailVerificationBanner } from "./EmailVerificationBanner";

interface BaseLayoutProps {
  children: React.ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <EmailVerificationBanner />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}