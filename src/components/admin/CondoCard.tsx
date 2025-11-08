import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

export type Condo = {
  id: string;
  code: string;
  name: string;
  status: string;
  responsible_name: string | null;
  total_units: number | null;
  administrator_id: string | null;
  administrator_name?: string;
  address?: string | null;
  nif: string | null;
  website: string | null;
  area: string | null;
  condo_type: string | null;
  total_blocks: number | null;
  email: string | null;
  phone: string | null;
  observations: string | null;
};

interface CondoCardProps {
  condo: Condo;
  onDelete: () => void;
  onEdit: () => void;
}

export const CondoCard = ({ condo, onDelete, onEdit }: CondoCardProps) => {
  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{condo.name}</h3>
            {condo.status !== "active" && (
              <Badge variant="destructive" className="mt-1 capitalize">
                {condo.status}
              </Badge>
            )}
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="text-admin-foreground-muted hover:text-blue-500"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-admin-foreground-muted hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-admin-foreground-muted">Unidades:</span>
            <span className="font-medium">{condo.total_units || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-admin-foreground-muted">Moradores:</span>
            <span className="font-medium">124</span>
          </div>
          <div className="flex justify-between">
            <span className="text-admin-foreground-muted">Administradora Seleccionada:</span>
            <span className="font-medium">{condo.responsible_name || "N/A"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
