import jsPDF from "jspdf";

interface ChecklistPDFData {
  userName: string;
  country?: string;
  items: { label: string; isCountrySpecific: boolean }[];
}

const countryNames: Record<string, string> = {
  venezuela: "Venezuela",
  colombia: "Colombia",
  honduras: "Honduras",
  peru: "Perú",
  marruecos: "Marruecos",
};

export const generateChecklistPDF = (data: ChecklistPDFData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const countryLabel = data.country ? countryNames[data.country] || data.country : "General";

  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ALBUS", 20, 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Tu Hoja de Ruta — Regularización 2026", 20, 24);

  // User info
  let yPos = 45;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Preparado para: ${data.userName}`, 20, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Nacionalidad: ${countryLabel}`, 20, yPos);

  // Divider
  yPos += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Checklist title
  yPos += 12;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Documentos Requeridos", 20, yPos);

  yPos += 10;

  // Country-specific items first
  const countryItems = data.items.filter((i) => i.isCountrySpecific);
  const generalItems = data.items.filter((i) => !i.isCountrySpecific);

  const drawItem = (label: string, y: number) => {
    doc.setDrawColor(180, 180, 180);
    doc.rect(20, y - 3.5, 4, 4);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(label, 28, y);
    return y + 9;
  };

  if (countryItems.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(`REQUISITOS ESPECÍFICOS — ${countryLabel.toUpperCase()}`, 20, yPos);
    yPos += 8;

    for (const item of countryItems) {
      yPos = drawItem(item.label, yPos);
    }

    yPos += 5;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("DOCUMENTACIÓN GENERAL", 20, yPos);
  yPos += 8;

  for (const item of generalItems) {
    yPos = drawItem(item.label, yPos);
  }

  // CTA
  yPos += 15;
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, pageWidth - 30, 22, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("¿Necesitas ayuda organizando estos documentos?", 20, yPos + 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Con el Plan Pro de Albus, guarda tus documentos en una Bóveda Segura y valida tus fechas.", 20, yPos + 16);

  // Footer
  const today = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generado por Albus el ${today}`, pageWidth / 2, 282, { align: "center" });
  doc.text("albus.com.co", pageWidth / 2, 287, { align: "center" });

  doc.save(`Hoja_de_Ruta_${data.userName.replace(/\s+/g, "_")}.pdf`);
};
