import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export type Administrator = {
  id: string;
  code: string;
  name: string;
  nif: string;
  condos: { count: number }[];
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
};

interface AdministratorCardProps {
  admin: Administrator;
  onDelete: () => void;
}

export const AdministratorCard = ({ admin, onDelete }: AdministratorCardProps) => {
  const responsibleName = admin.profiles ? `${admin.profiles.first_name || ''} ${admin.profiles.last_name || ''}`.trim() : 'N/A';

  return (
    <Card className="bg-gray-50 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500">{admin.code}</p>
            <h3 className="font-bold text-lg">{admin.name}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
          </Button>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">NIF:</span>
            <span className="font-medium">{admin.nif || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Condomínios:</span>
            <span className="font-medium">{admin.condos[0]?.count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Responsável:</span>
            <span className="font-medium">{responsibleName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};