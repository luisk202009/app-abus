import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Languages } from "lucide-react";

export interface LawyerCardData {
  id: string;
  full_name: string;
  city: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  languages: string[] | null;
  college: string | null;
  bar_number: string | null;
  bio: string | null;
  minPrice: number | null;
}

interface LawyerCardProps {
  lawyer: LawyerCardData;
  onView: (lawyer: LawyerCardData) => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const LawyerCard = ({ lawyer, onView }: LawyerCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardContent className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14">
            {lawyer.photo_url ? <AvatarImage src={lawyer.photo_url} alt={lawyer.full_name} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(lawyer.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{lawyer.full_name}</h3>
            {lawyer.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{lawyer.city}</span>
              </div>
            )}
          </div>
        </div>

        {lawyer.specialties && lawyer.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {lawyer.specialties.slice(0, 3).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs capitalize">
                {s}
              </Badge>
            ))}
          </div>
        )}

        {lawyer.languages && lawyer.languages.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Languages className="w-3.5 h-3.5" />
            <span className="capitalize truncate">{lawyer.languages.join(", ")}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t">
          <span className="text-sm">
            {lawyer.minPrice !== null ? (
              <>
                <span className="text-muted-foreground">Desde </span>
                <span className="font-semibold">{lawyer.minPrice}€</span>
              </>
            ) : (
              <span className="text-muted-foreground">Consultar precio</span>
            )}
          </span>
          <Button size="sm" onClick={() => onView(lawyer)}>
            Ver perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
