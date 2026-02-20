import jsPDF from "jspdf";

interface EmployerInfoData {
  fullName: string;
  date?: string;
}

export const generateEmployerInfoPDF = (userData: EmployerInfoData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const grayColor = "#666666";

  // Black Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN PARA EL EMPLEADOR", pageWidth / 2, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Derecho al trabajo tras 15 días de admisión a trámite", pageWidth / 2, 28, { align: "center" });
  doc.text("Real Decreto de Regularización Extraordinaria 2026", pageWidth / 2, 34, { align: "center" });

  // Worker name
  let yPos = 55;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Nombre del trabajador/a:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(userData.fullName, 80, yPos);

  // Date
  yPos += 10;
  const dateStr = userData.date || new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.setFont("helvetica", "bold");
  doc.text("Fecha de emisión:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, 70, yPos);

  // Separator
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Legal text
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Estimado/a empleador/a,", 20, yPos);

  yPos += 10;
  doc.setFont("helvetica", "normal");
  const bodyText = [
    "La persona arriba indicada se encuentra en proceso de regularización de su situación",
    "administrativa en España, al amparo del Real Decreto de regularización extraordinaria",
    "de 2026.",
    "",
    "Conforme a la normativa vigente, una vez transcurridos 15 días hábiles desde la",
    "admisión a trámite de la solicitud de autorización de residencia y trabajo, el/la",
    "solicitante queda habilitado/a para trabajar legalmente en España mientras se",
    "resuelve su expediente.",
    "",
    "Esto significa que:",
  ];

  bodyText.forEach((line) => {
    doc.text(line, 20, yPos);
    yPos += 6;
  });

  yPos += 2;

  // Bullet points
  const bullets = [
    "El/la trabajador/a puede ser contratado/a legalmente.",
    "El/la empleador/a no incurre en ninguna infracción al formalizar el contrato.",
    "La Seguridad Social permite dar de alta al trabajador/a con el resguardo de solicitud.",
    "El contrato se rige por las mismas condiciones que cualquier otro trabajador/a.",
  ];

  bullets.forEach((bullet) => {
    doc.text(`•  ${bullet}`, 25, yPos);
    yPos += 7;
  });

  yPos += 5;

  // Marco legal
  doc.setFont("helvetica", "bold");
  doc.text("Marco Legal:", 20, yPos);
  yPos += 8;
  doc.setFont("helvetica", "normal");
  doc.text("•  Real Decreto de regularización extraordinaria 2026", 25, yPos);
  yPos += 7;
  doc.text("•  Artículo 36.4 de la Ley Orgánica 4/2000, sobre derechos y libertades", 25, yPos);
  yPos += 6;
  doc.text("   de los extranjeros en España", 25, yPos);
  yPos += 7;
  doc.text("•  Resguardo de admisión a trámite de la solicitud", 25, yPos);

  yPos += 15;

  // Important note
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPos, pageWidth - 40, 20, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("NOTA IMPORTANTE:", 25, yPos + 7);
  doc.setFont("helvetica", "normal");
  doc.text("Este documento es informativo. Para verificar la situación del trabajador/a,", 25, yPos + 13);
  doc.text("consulte el resguardo de admisión a trámite que le será proporcionado.", 25, yPos + 18);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(grayColor);
  doc.text("Documento generado por Albus — albus.com.co", pageWidth / 2, 280, { align: "center" });
  doc.text("Este documento tiene carácter informativo y no sustituye al asesoramiento legal profesional.", pageWidth / 2, 285, { align: "center" });

  // Save
  doc.save(`Info_Empleador_${userData.fullName.replace(/\s+/g, "_")}.pdf`);
};
