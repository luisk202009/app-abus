import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Download, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { generateChecklistPDF } from "@/lib/generateChecklistPDF";

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  country?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  isCountrySpecific: boolean;
}

const generalItems: ChecklistItem[] = [
  { id: "padron", label: "Padrón Histórico (entrada antes del 31/12/2025)", isCountrySpecific: false },
  { id: "antecedentes", label: "Antecedentes Penales apostillados", isCountrySpecific: false },
  { id: "pasaporte", label: "Pasaporte vigente", isCountrySpecific: false },
  { id: "certificado_medico", label: "Certificado médico", isCountrySpecific: false },
  { id: "tasa790", label: "Tasa 790-052", isCountrySpecific: false },
  { id: "foto", label: "Foto carnet", isCountrySpecific: false },
];

const countrySpecificItems: Record<string, ChecklistItem[]> = {
  venezuela: [
    { id: "ve_saren", label: "Legalización SAREN de documentos civiles", isCountrySpecific: true },
    { id: "ve_apostilla", label: "Apostilla vía MPPRE", isCountrySpecific: true },
  ],
  colombia: [
    { id: "co_apostilla", label: "Apostilla digital vía cancilleria.gov.co", isCountrySpecific: true },
  ],
  honduras: [
    { id: "hn_apostilla", label: "Apostilla presencial en Corte Suprema o consulado", isCountrySpecific: true },
  ],
  peru: [
    { id: "pe_rree", label: "Legalización vía RREE", isCountrySpecific: true },
    { id: "pe_apostilla", label: "Apostilla en cancillería peruana", isCountrySpecific: true },
  ],
  marruecos: [
    { id: "ma_traduccion", label: "Traducción jurada de documentos en árabe/francés", isCountrySpecific: true },
  ],
};

const countryNames: Record<string, string> = {
  venezuela: "Venezuela",
  colombia: "Colombia",
  honduras: "Honduras",
  peru: "Perú",
  marruecos: "Marruecos",
};

export const ChecklistModal = ({ isOpen, onClose, userName, userEmail, country }: ChecklistModalProps) => {
  const navigate = useNavigate();
  const allItems = [...(country ? countrySpecificItems[country] || [] : []), ...generalItems];
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const progress = allItems.length > 0 ? Math.round((checked.size / allItems.length) * 100) : 0;

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadPDF = () => {
    generateChecklistPDF({
      userName,
      country,
      items: allItems.map((i) => ({ label: i.label, isCountrySpecific: i.isCountrySpecific })),
    });
  };

  const countrySpecific = allItems.filter((i) => i.isCountrySpecific);
  const general = allItems.filter((i) => !i.isCountrySpecific);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Tu Hoja de Ruta Personalizada
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {userName} • {country ? countryNames[country] || "General" : "General"}
          </p>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Country-specific items */}
        {countrySpecific.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Requisitos — {country ? countryNames[country] : ""}
            </h3>
            {countrySpecific.map((item) => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={checked.has(item.id)}
                  onCheckedChange={() => toggle(item.id)}
                  className="mt-0.5"
                />
                <span className={`text-sm leading-snug transition-colors ${checked.has(item.id) ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* General items */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Documentación General
          </h3>
          {general.map((item) => (
            <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                checked={checked.has(item.id)}
                onCheckedChange={() => toggle(item.id)}
                className="mt-0.5"
              />
              <span className={`text-sm leading-snug transition-colors ${checked.has(item.id) ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>

        {/* Download PDF */}
        <Button variant="outline" className="w-full gap-2" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4" />
          Descargar en PDF
        </Button>

        {/* CTA Plan Pro */}
        <div className="border border-border rounded-xl p-5 space-y-3 bg-muted/30">
          <p className="text-sm text-foreground leading-relaxed">
            ¿Te abruma tanto papeleo? Por solo <span className="font-bold">9,99€</span>, el Plan Pro organiza estos documentos en tu Bóveda Segura y valida tus fechas automáticamente.
          </p>
          <Button
            variant="hero"
            className="w-full gap-2"
            onClick={() => {
              onClose();
              navigate("/explorar");
            }}
          >
            Activar Plan Pro ahora
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
