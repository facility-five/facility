import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ResidentHeader = () => {
  const { profile } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b bg-white px-6">
      <div className="flex items-center gap-3 text-right">
        <div>
          <p className="font-semibold text-sm">Olá, {profile?.first_name} {profile?.last_name}</p>
          <p className="text-xs text-gray-500">{profile?.email}</p>
        </div>
        <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} alt="Avatar" />
            <AvatarFallback>
                {getInitials(profile?.first_name, profile?.last_name)}
            </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};