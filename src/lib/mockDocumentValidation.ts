// Mock AI/OCR validation logic for document verification
export interface ValidationResult {
  status: "valid" | "error";
  message?: string;
}

/**
 * Simulates AI validation of uploaded documents.
 * For Padrón Histórico in Regularización 2026, checks if entry date is before 31/12/2025.
 * 
 * @param documentType - The type of document being validated
 * @param routeType - The migration route type
 * @returns Promise with validation status and optional error message
 */
export const validateDocument = async (
  documentType: string,
  routeType: string
): Promise<ValidationResult> => {
  // Simulate processing delay (2-3 seconds)
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 1000)
  );

  // Special validation for Padrón Histórico in Regularización 2026
  if (
    routeType === "regularizacion2026" &&
    documentType === "padron_historico"
  ) {
    // 70% success rate for mock validation
    const isValid = Math.random() > 0.3;

    if (isValid) {
      return { status: "valid" };
    } else {
      return {
        status: "error",
        message:
          "Atención: Tu padrón no acredita entrada antes de la fecha de corte (31/12/2025).",
      };
    }
  }

  // Special validation for antecedentes penales
  if (documentType === "penales_origen" || documentType === "penales_espana") {
    // 85% success rate
    const isValid = Math.random() > 0.15;
    
    if (isValid) {
      return { status: "valid" };
    } else {
      return {
        status: "error",
        message: "La apostilla no es legible o el documento está vencido.",
      };
    }
  }

  // Default: 90% success rate for other documents
  const isValid = Math.random() > 0.1;
  
  return isValid
    ? { status: "valid" }
    : {
        status: "error",
        message: "El documento no cumple con los requisitos mínimos.",
      };
};

/**
 * Get human-readable status text in Spanish
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case "waiting":
      return "Esperando archivo";
    case "analyzing":
      return "Analizando documento...";
    case "valid":
      return "Válido para presentación";
    case "error":
      return "Error en documento";
    default:
      return "Estado desconocido";
  }
};
