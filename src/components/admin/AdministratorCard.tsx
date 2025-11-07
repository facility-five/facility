import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

export type Administrator = {
  id: string;
  code: string;
  name: string;
  nif: string;
  condos: { count: number }[];
  profiles: {
    first_name: string;
    last_name: string;
    email?: string;
  } | null;
};

interface AdministratorCardProps {
  admin: Administrator;
  onDelete: () => void;
  onEdit: () => void;
}

export const AdministratorCard = ({ admin, onDelete, onEdit }: AdministratorCardProps) => {
  const responsibleName = admin.profiles ? `${admin.profiles.first_name || ''} ${admin.profiles.last_name || ''}`.trim() : 'N/A';

  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-admin-foreground-muted">{admin.code}</p>
            <h3 className="font-bold text-lg">{admin.name}</h3>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onEdit} className="text-admin-foreground-muted hover:text-blue-500">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-admin-foreground-muted hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-admin-foreground-muted">NIF:</span>
            <span className="font-medium">{admin.nif || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-admin-foreground-muted">Condomínios:</span>
            <span className="font-medium">{admin.condos[0]?.count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-admin-foreground-muted">Responsável:</span>
            <span className="font-medium">{responsibleName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};