import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManagerStatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  iconBgClass: string;
}

export const ManagerStatCard = ({ title, value, description, icon: Icon, iconBgClass }: ManagerStatCardProps) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        <div className={cn("p-3 rounded-lg", iconBgClass)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </CardContent>
    </Card>
  );
};