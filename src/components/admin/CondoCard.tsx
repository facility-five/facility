import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export type Condo = {
  id: string;
  name: string;
  status: string;
  responsible_name: string | null;
  total_units: number | null;
};

interface CondoCardProps {
  condo: Condo;
  onDelete: () => void;
}

export const CondoCard = ({ condo, onDelete }: CondoCardProps) => {
  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{condo.name}</h3>
            {condo.status !== 'active' && (
              <Badge variant="destructive" className="mt-1 capitalize">{condo.status}</Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-admin-foreground-muted hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </Button>
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
            <span className="text-admin-foreground-muted">Responsável:</span>
            <span className="font-medium">{condo.responsible_name || 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};