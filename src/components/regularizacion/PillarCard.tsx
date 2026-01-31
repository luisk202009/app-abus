import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PillarCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  requirements: string[];
}

export const PillarCard = ({
  icon: Icon,
  title,
  subtitle,
  requirements,
}: PillarCardProps) => {
  return (
    <Card className="border-2 border-border hover:border-foreground/20 transition-colors bg-background">
      <CardHeader className="pb-3">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">✓</span>
              <span className="text-muted-foreground">{req}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
