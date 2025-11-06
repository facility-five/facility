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
  disabled?: boolean;
}

export const PlanCard = ({
  name,
  description,
  price,
  period,
  features,
  buttonText,
  onClick,
  disabled = false,
}: PlanCardProps) => {
  return (
    <Card className="w-full bg-[#1f1f2e] text-white rounded-2xl border border-[#3a3a50] shadow-lg transform hover:scale-105 transition-transform duration-300 h-full flex flex-col">
      <CardHeader className="p-6">
        <CardTitle className="text-2xl font-bold text-white">{name}</CardTitle>
        <CardDescription className="text-gray-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-1 flex flex-col">
        <div className="mb-6">
          <span className="text-5xl font-extrabold text-white">{price}</span>
          <span className="text-gray-300">{period}</span>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-purple-400 mr-3" />
              <span className="text-white">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-600"
          onClick={onClick}
          disabled={disabled}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};