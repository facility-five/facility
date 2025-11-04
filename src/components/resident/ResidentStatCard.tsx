import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ResidentStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string;
  description?: string;
}

export const ResidentStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColorClass = "text-muted-foreground",
  description 
}: ResidentStatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};