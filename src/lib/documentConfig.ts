// Document configuration for the Document Vault
export type DocumentStatus = "waiting" | "analyzing" | "valid" | "error";
export type DocumentCategory = "identidad" | "residencia" | "antecedentes";
export type RouteType = "regularizacion2026" | "arraigos";

export interface DocumentType {
  type: string;
  name: string;
  description: string;
  required: boolean;
  hasAiValidation?: boolean;
}

export interface CategoryConfig {
  title: string;
  icon: string;
  documents: DocumentType[];
}

export type RouteDocumentConfig = Record<DocumentCategory, CategoryConfig>;

export const DOCUMENT_CATEGORIES: Record<RouteType, RouteDocumentConfig> = {
  regularizacion2026: {
    identidad: {
      title: "Identidad",
      icon: "user",
      documents: [
        {
          type: "pasaporte",
          name: "Pasaporte Completo",
          description: "Todas las páginas con sellos de entrada",
          required: true,
        },
      ],
    },
    residencia: {
      title: "Residencia",
      icon: "home",
      documents: [
        {
          type: "padron_historico",
          name: "Padrón Histórico",
          description: "Certificado con fecha anterior a 31/12/2025",
          required: true,
          hasAiValidation: true,
        },
        {
          type: "recibos_remesas",
          name: "Recibos / Remesas",
          description: "Comprobantes de alquiler o envíos de dinero",
          required: false,
        },
      ],
    },
    antecedentes: {
      title: "Antecedentes",
      icon: "shield",
      documents: [
        {
          type: "penales_origen",
          name: "Antecedentes Penales",
          description: "Del país de origen, apostillados",
          required: true,
        },
      ],
    },
  },
  arraigos: {
    identidad: {
      title: "Identidad",
      icon: "user",
      documents: [
        {
          type: "pasaporte",
          name: "Pasaporte Completo",
          description: "Todas las páginas con sellos de entrada",
          required: true,
        },
        {
          type: "foto_carnet",
          name: "Fotografías Carnet",
          description: "3 fotos tamaño carnet, fondo blanco",
          required: true,
        },
      ],
    },
    residencia: {
      title: "Residencia",
      icon: "home",
      documents: [
        {
          type: "padron_historico",
          name: "Padrón Histórico",
          description: "Certificado de empadronamiento continuo (2-3 años según tipo)",
          required: true,
        },
        {
          type: "contrato_alquiler",
          name: "Contrato de Alquiler",
          description: "Contrato vigente o recibos de pago",
          required: false,
        },
        {
          type: "informe_insercion",
          name: "Informe de Inserción Social",
          description: "Emitido por la comunidad autónoma o ayuntamiento",
          required: false,
        },
      ],
    },
    antecedentes: {
      title: "Antecedentes",
      icon: "shield",
      documents: [
        {
          type: "penales_origen",
          name: "Antecedentes Penales País de Origen",
          description: "Apostillados y traducidos si no están en español",
          required: true,
        },
        {
          type: "penales_espana",
          name: "Antecedentes Penales España",
          description: "Certificado del Ministerio de Justicia",
          required: true,
        },
      ],
    },
  },
};

// Stripe Price IDs for the new subscription plans
export const STRIPE_PRICES = {
  pro: {
    priceId: "price_1SwlHBGVNlA5jALg4s8gArUM",
    productId: "prod_TuaSNfd5Tx4fhq",
    price: 9.99,
    name: "Plan Pro",
  },
  premium: {
    priceId: "price_1SwlHgGVNlA5jALgqLsLJbSD",
    productId: "prod_TuaSDjmJAYULCy",
    price: 19.99,
    name: "Plan Premium",
  },
} as const;
