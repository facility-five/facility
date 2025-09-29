import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check } from "lucide-react";

interface PlanCardProps {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  onClick?: () => void;
}

export const PlanCard = ({
  name,
  description,
  price,
  period,
  features,
  buttonText,
  onClick,
}: PlanCardProps) => {
  return (
    <Card className="w-full max-w-sm bg-white text-gray-800 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
      <CardHeader className="p-6">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <CardDescription className="text-gray-500">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="mb-6">
          <span className="text-5xl font-extrabold">{price}</span>
          <span className="text-gray-500">{period}</span>
        </div>
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-purple-600 mr-3" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={onClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};