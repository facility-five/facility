import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-white border-b p-4 flex justify-between items-center">
        <div>
            <img src="https://a4f4baa75172da68aa688051984fd151.cdn.bubble.io/f1744250402403x458193812617061060/facility_logo.svg" alt="Facility Fincas Logo" className="h-8" />
        </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
    </header>
  );
};