import { LucideIcon } from "lucide-react";

interface RequirementCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const RequirementCard = ({ icon: Icon, title, description }: RequirementCardProps) => {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-foreground" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
