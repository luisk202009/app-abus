import { Clock } from "lucide-react";

const calculateDaysUntilDeadline = () => {
  const deadline = new Date("2026-06-30");
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const CountdownBanner = () => {
  const daysRemaining = calculateDaysUntilDeadline();

  if (daysRemaining === 0) return null;

  return (
    <div className="sticky top-16 md:top-20 z-40 bg-primary text-primary-foreground py-2.5 px-4 text-center">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <Clock className="w-4 h-4 shrink-0" />
        <span>
          Faltan <span className="font-bold">{daysRemaining} días</span> para el cierre del proceso (30 de Junio)
        </span>
      </div>
    </div>
  );
};
