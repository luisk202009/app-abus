import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Country {
  id: string;
  name: string;
  flag: string;
  active: boolean;
}

const countries: Country[] = [
  { id: "spain", name: "España", flag: "🇪🇸", active: true },
  { id: "malta", name: "Malta", flag: "🇲🇹", active: false },
  { id: "dubai", name: "Dubái", flag: "🇦🇪", active: false },
  { id: "usa", name: "USA", flag: "🇺🇸", active: false },
  { id: "canada", name: "Canadá", flag: "🇨🇦", active: false },
];

interface DestinosDropdownProps {
  onCountrySelect: (country: Country) => void;
}

export const DestinosDropdown = ({ onCountrySelect }: DestinosDropdownProps) => {
  const [open, setOpen] = useState(false);
  const activeCountry = countries.find((c) => c.active);

  const handleSelect = (country: Country) => {
    setOpen(false);
    onCountrySelect(country);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
        <span>Destinos</span>
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[160px]">
        {countries.map((country) => (
          <DropdownMenuItem
            key={country.id}
            onClick={() => handleSelect(country)}
            className="flex items-center justify-between gap-3 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </span>
            {country.active ? (
              <span className="text-xs text-primary font-medium">Activo</span>
            ) : (
              <span className="text-xs text-muted-foreground">Soon</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
