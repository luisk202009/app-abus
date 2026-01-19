import jsPDF from "jspdf";

interface UserData {
  fullName: string;
  nationality: string;
  currentLocation: string;
  email: string;
  professionalProfile?: string;
}

export const generateTasa790PDF = (userData: UserData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor = "#000000";
  const grayColor = "#666666";
  const lightGray = "#f5f5f5";

  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MODELO 790 - CÓDIGO 012", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("TASA POR TRAMITACIÓN DE AUTORIZACIONES", pageWidth / 2, 23, { align: "center" });
  doc.text("ADMINISTRATIVAS RELATIVAS A EXTRANJERÍA", pageWidth / 2, 29, { align: "center" });

  // Subtitle
  doc.setTextColor(primaryColor);
  doc.setFontSize(9);
  doc.text("AGENCIA TRIBUTARIA", pageWidth / 2, 45, { align: "center" });
  
  // Section 1: Datos del interesado
  let yPos = 55;
  
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. DATOS DEL INTERESADO", 20, yPos + 5.5);
  
  yPos += 15;
  
  // Form fields
  const drawField = (label: string, value: string, x: number, y: number, width: number) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor);
    doc.text(label, x, y);
    
    doc.setDrawColor(200, 200, 200);
    doc.rect(x, y + 2, width, 8);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(primaryColor);
    doc.text(value || "", x + 3, y + 7.5);
  };

  // Row 1: Name
  drawField("APELLIDOS Y NOMBRE", userData.fullName.toUpperCase(), 20, yPos, pageWidth - 40);
  
  yPos += 18;
  
  // Row 2: Nationality and NIE
  drawField("NACIONALIDAD", userData.nationality.toUpperCase(), 20, yPos, 70);
  drawField("NIE / PASAPORTE", "", 100, yPos, pageWidth - 120);
  
  yPos += 18;
  
  // Row 3: Address
  drawField("DOMICILIO EN ESPAÑA", userData.currentLocation.toUpperCase(), 20, yPos, pageWidth - 40);
  
  yPos += 18;
  
  // Row 4: City, Province, Postal Code
  drawField("MUNICIPIO", "", 20, yPos, 60);
  drawField("PROVINCIA", "", 85, yPos, 55);
  drawField("C.P.", "", 145, yPos, 45);
  
  yPos += 18;
  
  // Row 5: Phone and Email
  drawField("TELÉFONO", "", 20, yPos, 60);
  drawField("CORREO ELECTRÓNICO", userData.email.toLowerCase(), 85, yPos, pageWidth - 105);
  
  yPos += 25;
  
  // Section 2: Representante
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor);
  doc.text("2. DATOS DEL REPRESENTANTE (si procede)", 20, yPos + 5.5);
  
  yPos += 15;
  
  drawField("APELLIDOS Y NOMBRE / RAZÓN SOCIAL", "", 20, yPos, pageWidth - 40);
  
  yPos += 18;
  
  drawField("NIF / NIE", "", 20, yPos, 70);
  drawField("TELÉFONO", "", 100, yPos, pageWidth - 120);
  
  yPos += 25;
  
  // Section 3: Autorización solicitada
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("3. AUTORIZACIÓN SOLICITADA", 20, yPos + 5.5);
  
  yPos += 15;
  
  // Authorization type based on profile
  const getAuthorizationType = () => {
    if (userData.professionalProfile === "remote_worker") {
      return "AUTORIZACIÓN DE RESIDENCIA PARA TELETRABAJO DE CARÁCTER INTERNACIONAL";
    }
    if (userData.professionalProfile === "student") {
      return "AUTORIZACIÓN DE ESTANCIA POR ESTUDIOS";
    }
    if (userData.professionalProfile === "entrepreneur") {
      return "AUTORIZACIÓN DE RESIDENCIA PARA EMPRENDEDORES";
    }
    return "AUTORIZACIÓN DE RESIDENCIA NO LUCRATIVA";
  };
  
  drawField("TIPO DE AUTORIZACIÓN", getAuthorizationType(), 20, yPos, pageWidth - 40);
  
  yPos += 25;
  
  // Section 4: Liquidación
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("4. LIQUIDACIÓN", 20, yPos + 5.5);
  
  yPos += 15;
  
  // Fee amount
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(grayColor);
  doc.text("IMPORTE A INGRESAR", 20, yPos);
  
  doc.setDrawColor(200, 200, 200);
  doc.rect(20, yPos + 2, 50, 12);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor);
  doc.text("16,08 €", 25, yPos + 10);
  
  // Fee description
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(grayColor);
  doc.text("Tarifa aplicable según Orden HAC/841/2024", 75, yPos + 7);
  
  yPos += 30;
  
  // Section 5: Signature
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor);
  doc.text("5. FECHA Y FIRMA", 20, yPos + 5.5);
  
  yPos += 15;
  
  const today = new Date();
  const dateStr = today.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`En _________________, a ${dateStr}`, 20, yPos + 5);
  
  // Signature box
  doc.setDrawColor(200, 200, 200);
  doc.rect(120, yPos - 5, 70, 30);
  doc.setFontSize(8);
  doc.setTextColor(grayColor);
  doc.text("Firma del interesado", 155, yPos + 28, { align: "center" });
  
  // Footer
  doc.setFontSize(7);
  doc.setTextColor(grayColor);
  doc.text("Documento generado automáticamente por Albus Pro", pageWidth / 2, 280, { align: "center" });
  doc.text("Este documento es un borrador. Verifique la información antes de presentar.", pageWidth / 2, 285, { align: "center" });

  // Save the PDF
  doc.save(`Tasa_790-012_${userData.fullName.replace(/\s+/g, "_")}.pdf`);
};
