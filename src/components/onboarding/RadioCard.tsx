import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RadioCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export const RadioCard = ({ label, description, selected, onClick }: RadioCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all",
        selected
          ? "border-primary bg-secondary/80"
          : "border-border hover:border-muted-foreground/50"
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors",
          selected ? "border-primary bg-primary" : "border-muted-foreground/40"
        )}
      >
        {selected && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>
      <div>
        <p className="font-medium text-base">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </button>
  );
};
