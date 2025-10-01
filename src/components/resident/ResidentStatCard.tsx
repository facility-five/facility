import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResidentStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColorClass?: string;
}

export const ResidentStatCard = ({ title, value, icon: Icon, iconColorClass }: ResidentStatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className={cn("h-5 w-5 text-gray-400", iconColorClass)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};