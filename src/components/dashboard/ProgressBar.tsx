import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  completedSteps: number;
  totalSteps: number;
}

export const ProgressBar = ({ completedSteps, totalSteps }: ProgressBarProps) => {
  const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progreso general</span>
        <span className="font-medium">{percentage}% completado</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {completedSteps} de {totalSteps} pasos completados
      </p>
    </div>
  );
};
