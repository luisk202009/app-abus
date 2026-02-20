import { Clock } from "lucide-react";

const calculateDaysUntilDeadline = () => {
  const deadline = new Date("2026-06-30");
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const UrgencyBanner = () => {
  const daysRemaining = calculateDaysUntilDeadline();

  if (daysRemaining === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground py-3 px-4 rounded-lg mb-6">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <Clock className="w-4 h-4" />
        <span>
          Faltan <span className="font-bold">{daysRemaining} días</span> para el cierre del proceso (30 de Junio)
        </span>
      </div>
    </div>
  );
};
