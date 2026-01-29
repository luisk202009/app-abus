import { useState } from "react";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface RouteActionsMenuProps {
  onViewDetails: () => void;
  onDelete: () => void;
}

export const RouteActionsMenu = ({
  onViewDetails,
  onDelete,
}: RouteActionsMenuProps) => {
  const [open, setOpen] = useState(false);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    onViewDetails();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    onDelete();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label="Opciones de ruta"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background">
        <DropdownMenuItem onClick={handleViewDetails} className="gap-2 cursor-pointer">
          <Eye className="w-4 h-4" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar ruta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
