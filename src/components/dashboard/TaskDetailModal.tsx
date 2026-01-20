import { X, Info, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    category: string;
  } | null;
}

// Task descriptions and instructions based on task titles
const getTaskDetails = (taskTitle: string): { description: string; tips: string[] } => {
  const details: Record<string, { description: string; tips: string[] }> = {
    "Apostillar Antecedentes Penales": {
      description: "El certificado de antecedentes penales debe estar apostillado por la Haya y tener menos de 3 meses de antigüedad desde su emisión.",
      tips: [
        "Solicita el certificado en tu país de origen",
        "Llévalo a apostillar antes de que pase mucho tiempo",
        "Verifica que la Apostilla esté en el idioma correcto o tradúcelo",
        "Algunos países emiten certificados digitales que también son válidos",
      ],
    },
    "Traducir documentos al español": {
      description: "Todos los documentos que no estén en español deben ser traducidos por un traductor jurado oficial.",
      tips: [
        "Busca traductores jurados autorizados por el MAEC",
        "Algunos consulados españoles tienen lista de traductores",
        "La traducción debe incluir el sello del traductor jurado",
        "Guarda copias digitales de todo",
      ],
    },
    "Pagar Tasa 790-012": {
      description: "La tasa 790-012 es obligatoria para solicitar cualquier autorización de residencia. El pago se realiza antes de la cita.",
      tips: [
        "Puedes generar el formulario pre-rellenado desde Albus Pro",
        "El pago se hace online o en entidades bancarias colaboradoras",
        "Guarda el justificante de pago, lo necesitarás",
        "La tasa actual es de aproximadamente 16€",
      ],
    },
    "Contratar seguro médico": {
      description: "Necesitas un seguro médico privado sin copagos ni carencias que cubra todo el territorio español.",
      tips: [
        "Asegúrate de que no tenga copagos ni carencias",
        "Cobertura mínima de hospitalización y urgencias",
        "Algunas aseguradoras ofrecen planes específicos para visados",
        "Solicita un certificado que indique explícitamente 'sin copagos'",
      ],
    },
    "Obtener certificado bancario": {
      description: "Debes demostrar medios económicos suficientes para residir en España sin trabajar (si aplica a tu visado).",
      tips: [
        "Solicita un certificado con saldo actual y movimientos de 3-6 meses",
        "El mínimo recomendado es 2.646€/mes para nómada digital",
        "Algunos bancos emiten certificados en inglés que pueden servir",
        "También puedes usar declaración de la renta si tienes",
      ],
    },
    "Reservar cita en consulado": {
      description: "Debes solicitar cita en el consulado español de tu jurisdicción para presentar la solicitud de visado.",
      tips: [
        "Las citas suelen tardar semanas en estar disponibles",
        "Revisa el sistema de citas BLS o el del consulado específico",
        "Ten todos los documentos listos antes de la cita",
        "Llega puntual y con copias extra de todo",
      ],
    },
    "Solicitar NIE provisional": {
      description: "El NIE es tu número de identificación de extranjero, necesario para cualquier trámite en España.",
      tips: [
        "Puedes solicitarlo en el consulado antes de viajar",
        "O en España una vez llegues (en la policía)",
        "Es un documento esencial para abrir cuenta bancaria, trabajar, etc.",
        "El NIE provisional te sirve mientras llega el definitivo",
      ],
    },
  };

  // Return specific details or generic fallback
  return details[taskTitle] || {
    description: "Esta tarea es parte de tu proceso migratorio. Complétala para avanzar en tu hoja de ruta.",
    tips: [
      "Revisa los requisitos específicos en la web oficial",
      "Guarda copias de todos los documentos",
      "No dejes pasar las fechas límite",
    ],
  };
};

export const TaskDetailModal = ({ isOpen, onClose, task }: TaskDetailModalProps) => {
  if (!task) return null;

  const details = getTaskDetails(task.title);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{task.title}</DialogTitle>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {task.category}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Description */}
          <DialogDescription className="text-sm text-foreground leading-relaxed">
            {details.description}
          </DialogDescription>

          {/* Tips */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Consejos útiles
            </h4>
            <ul className="space-y-2">
              {details.tips.map((tip, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* External link hint */}
          <div className="pt-2 border-t border-border">
            <a
              href="https://extranjeros.inclusion.gob.es/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Portal oficial de Extranjería
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
