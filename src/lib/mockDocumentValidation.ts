// TODO Sprint 8: reemplazar con validación real por OCR/IA
// Actualmente todos los documentos se marcan como válidos inmediatamente.

export interface ValidationResult {
  status: "valid" | "error";
  message?: string;
}

/**
 * Validates an uploaded document.
 * Currently returns valid immediately — no mock delays or random failures.
 */
export const validateDocument = async (
  _documentType: string,
  _routeType: string
): Promise<ValidationResult> => {
  return { status: "valid" };
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
