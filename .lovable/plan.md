

# Plan: Corregir sistema de documentos en Dashboard

## Diagnóstico

Revisé el código y encontré lo siguiente:

1. **La persistencia YA funciona**: `useDocumentVault.tsx` ya guarda registros en `user_documents` tras cada upload y los consulta al cargar. La tabla `user_documents` ya existe con RLS configurado correctamente.

2. **El problema real de "pendiente"**: Tras subir un documento, `mockDocumentValidation.ts` tiene un 10-30% de probabilidad de marcarlo como `"error"` aleatoriamente. Esto hace que documentos válidos aparezcan como fallidos tras recargar.

3. **Falta botón "Ver documento"**: No hay forma de abrir el archivo subido en nueva pestaña.

## Cambios a realizar

### 1. `src/lib/mockDocumentValidation.ts` — Deshabilitar validación aleatoria
- `validateDocument()` siempre retorna `{ status: "valid" }` sin delay
- Agregar comentario `// TODO Sprint 8: reemplazar con validación real por OCR/IA`
- Mantener la interfaz y `getStatusText()` intactos

### 2. `src/hooks/useDocumentVault.tsx` — Simplificar flujo post-upload
- Cambiar el estado inicial del documento de `"analyzing"` a `"valid"` directamente
- Eliminar la fase intermedia de "analyzing" + validación mock
- Toast directo: "Documento subido y validado"

### 3. `src/components/dashboard/DocumentStatusCard.tsx` — Agregar botón "Ver"
- Añadir prop `fileUrl` al componente
- Cuando hay un archivo subido, mostrar botón con icono `ExternalLink` que abre `fileUrl` en nueva pestaña
- Ubicarlo junto a los botones existentes de Upload y Delete

### 4. `src/components/dashboard/DocumentCategory.tsx` — Pasar `fileUrl`
- Pasar `fileUrl={userDoc?.file_url}` al `DocumentStatusCard`

## Archivos modificados
- `src/lib/mockDocumentValidation.ts`
- `src/hooks/useDocumentVault.tsx`
- `src/components/dashboard/DocumentStatusCard.tsx`
- `src/components/dashboard/DocumentCategory.tsx`

No se requieren migraciones de base de datos — la tabla y RLS ya existen.

