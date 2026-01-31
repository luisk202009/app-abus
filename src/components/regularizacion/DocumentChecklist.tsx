import { useState } from "react";
import { FileText, FileCheck, Stamp, CreditCard, Upload, Camera, Home } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
}

const documents: DocumentItem[] = [
  {
    id: "empadronamiento",
    icon: Home,
    label: "Empadronamiento histórico",
    description: "Mínimo 2 años de residencia continuada",
  },
  {
    id: "pasaporte",
    icon: FileText,
    label: "Pasaporte vigente",
    description: "Con al menos 6 meses de validez",
  },
  {
    id: "antecedentes",
    icon: Stamp,
    label: "Antecedentes penales apostillados",
    description: "Del país de origen con Apostilla de la Haya",
  },
  {
    id: "contrato",
    icon: FileCheck,
    label: "Contrato de trabajo o formación",
    description: "Mín. 1 año, jornada completa, o curso acreditado",
  },
  {
    id: "medico",
    icon: FileText,
    label: "Certificado médico",
    description: "De un centro autorizado en España",
  },
  {
    id: "tasa",
    icon: CreditCard,
    label: "Tasa 790-052 pagada",
    description: "Aprox. 16-20€ en entidad bancaria",
  },
  {
    id: "foto",
    icon: Camera,
    label: "Foto tipo carnet",
    description: "Fondo blanco, reciente",
  },
];

export const DocumentChecklist = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const progress = (checkedItems.size / documents.length) * 100;

  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Documentos que Necesitarás
            </h2>
            <p className="text-muted-foreground">
              Marca los que ya tienes para ver tu progreso
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Tu preparación</span>
              <span className="font-medium">{checkedItems.size} de {documents.length}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Document list */}
          <div className="bg-background rounded-2xl border-2 border-border divide-y divide-border">
            {documents.map((doc) => {
              const Icon = doc.icon;
              const isChecked = checkedItems.has(doc.id);

              return (
                <label
                  key={doc.id}
                  className={cn(
                    "flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-secondary/50",
                    isChecked && "bg-secondary/30"
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleItem(doc.id)}
                    className="mt-1"
                  />
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium transition-colors",
                      isChecked && "line-through text-muted-foreground"
                    )}>
                      {doc.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
