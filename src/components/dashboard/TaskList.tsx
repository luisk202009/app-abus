import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
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

export const TaskList = ({ tasks, onTaskToggle }: TaskListProps) => {
  return (
    <div className="bg-background rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold mb-4">Próximas Tareas</h3>
      
      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No tienes tareas pendientes. ¡Buen trabajo!
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={() => onTaskToggle(task.id)}
            >
              {/* Checkbox */}
              <button
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded border-2 transition-colors shrink-0",
                  task.completed
                    ? "bg-primary border-primary"
                    : "border-border hover:border-primary"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskToggle(task.id);
                }}
              >
                {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
              </button>

              {/* Task content */}
              <span
                className={cn(
                  "flex-1 text-sm font-medium transition-colors",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </span>

              {/* Category tag */}
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full",
                  getCategoryColor(task.category)
                )}
              >
                {task.category}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
