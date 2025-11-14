import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ResidentStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string;
  description?: string;
  compact?: boolean;
}

export const ResidentStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColorClass = "text-muted-foreground",
  description,
  compact = false
}: ResidentStatCardProps) => {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${compact ? 'pb-1' : 'pb-2'}`}>
        <CardTitle className="text-sm font-medium text-gray-700 truncate pr-2">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 flex-shrink-0 ${iconColorClass}`} />
      </CardHeader>
      <CardContent className={compact ? 'pt-1' : 'pt-0'}>
        <div className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-xl lg:text-2xl'}`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};