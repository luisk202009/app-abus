import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onTaskToggle: (taskId: string) => Promise<void> | void;
  isSaving?: boolean;
}

const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case "legal":
      return "bg-primary text-primary-foreground";
    case "pago":
      return "bg-secondary text-secondary-foreground border border-border";
    case "documento":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const TaskList = ({ tasks, onTaskToggle, isSaving }: TaskListProps) => {
  const [animatingTasks, setAnimatingTasks] = useState<Set<string>>(new Set());
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);

  const handleToggle = async (taskId: string) => {
    // Add animation
    setAnimatingTasks((prev) => new Set(prev).add(taskId));
    setSavingTaskId(taskId);

    // Call the toggle handler
    await onTaskToggle(taskId);

    // Remove animation after delay
    setTimeout(() => {
      setAnimatingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      setSavingTaskId(null);
    }, 300);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-background rounded-xl border border-border p-6">
      {/* Header with progress */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Próximas Tareas</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} completadas
          </span>
          {isSaving && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No tienes tareas pendientes. ¡Buen trabajo!
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => {
            const isAnimating = animatingTasks.has(task.id);
            const isSavingThis = savingTaskId === task.id;

            return (
              <li
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer",
                  task.completed
                    ? "border-border/50 bg-secondary/30"
                    : "border-border hover:bg-secondary/50",
                  isAnimating && "scale-[0.99]"
                )}
                onClick={() => handleToggle(task.id)}
              >
                {/* Checkbox */}
                <button
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-300 shrink-0",
                    task.completed
                      ? "bg-primary border-primary scale-100"
                      : "border-border hover:border-primary",
                    isAnimating && !task.completed && "scale-110 border-primary"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(task.id);
                  }}
                >
                  {task.completed && (
                    <Check className="w-3 h-3 text-primary-foreground animate-scale-in" />
                  )}
                  {isSavingThis && !task.completed && (
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  )}
                </button>

                {/* Task content */}
                <span
                  className={cn(
                    "flex-1 text-sm font-medium transition-all duration-300",
                    task.completed && "line-through text-muted-foreground/60",
                    isAnimating && task.completed && "opacity-70"
                  )}
                >
                  {task.title}
                </span>

                {/* Category tag */}
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full transition-opacity duration-300",
                    getCategoryColor(task.category),
                    task.completed && "opacity-50"
                  )}
                >
                  {task.category}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
