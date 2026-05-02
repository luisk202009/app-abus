## Objetivo

En la pantalla "Tu Bóveda de Documentos" (`src/components/dashboard/DocumentsSection.tsx`):

1. Eliminar por completo la card "Generar Tasa 790-012".
2. Arreglar el bug por el cual, tras subir un documento, sigue apareciendo "Pendiente", el contador muestra "0 subidos" y no existe forma de visualizar el archivo.

## Diagnóstico del bug

`DocumentsSection` declara los documentos con `status: "pending"` hardcoded en `getDocumentsByVisaType` y **nunca consulta la base de datos**. Su `handleFileChange` solo sube el archivo a Supabase Storage, pero:

- No inserta/actualiza ningún registro en la tabla `user_documents`.
- No guarda la `file_url` ni el `file_name` en estado.
- No refresca la lista, así que el badge sigue "Pendiente" y el conteo "0 subidos" nunca cambia.
- No hay botón "Ver" porque no existe `file_url` en memoria.

Ya existe `useDocumentVault` (usado por `DocumentVault.tsx`) que hace exactamente lo correcto: lee `user_documents`, sube a storage, hace upsert del registro y refresca. Vamos a apoyarnos en su misma lógica.

## Cambios

### 1. `src/components/dashboard/DocumentsSection.tsx`

- **Eliminar** todo el bloque de la card "Generar Tasa 790-012" (líneas ~288-340), el handler `handleGenerateTasa790`, el state `isGeneratingPDF` y el import de `generateTasa790PDF`, `Sparkles`, `Download`, `Loader2` que dejen de usarse (mantener `Loader2` si se sigue usando para el upload). También quitar el documento "Formulario Tasa 790" del array por defecto en `getDocumentsByVisaType` (caso default).
- **Refactor de carga/lectura**:
  - Al montar, hacer `useEffect` que consulte `user_documents` para `user.id` filtrando por los `document_type` del listado y guarde un `Map<docId, { id, file_url, file_name, status }>` en estado.
  - Combinar ese mapa con `documents` derivados para renderizar el `status` real (`uploaded` si hay registro, `pending` si no) y los contadores reales.
  - En `handleFileChange`, tras `storage.upload` exitoso:
    - Obtener `getPublicUrl`.
    - Hacer upsert en `user_documents` (buscar por `user_id` + `document_type`; si existe `update`, si no `insert`) con `category: 'identidad'` (o categoría neutra ya que esta sección no tiene categorías), `status: 'valid'`, `file_url`, `file_name`, y `route_type` derivado del `visaType` (mapear: `digital_nomad` → guardamos como string libre; si la columna exige enum, usar la ruta activa actual o un valor genérico como `regularizacion2026` por compatibilidad — confirmar columna; si es free-text se guarda el `visaType`).
    - Actualizar el estado local con el nuevo registro.
  - Mostrar:
    - Badge "Subido" en verde cuando hay archivo.
    - Botón **"Ver"** (icono `ExternalLink`) que abre `file_url` en nueva pestaña, igual que en `DocumentStatusCard`.
    - Botón **"Eliminar"** (icono `Trash2`) opcional que borra el storage + registro y refresca.
- Mantener el modal Premium y el resto del layout intactos.

### 2. Verificación de tipos

- Revisar `RouteType` en `src/lib/documentConfig.ts` (actualmente `"regularizacion2026" | "arraigos"`). Como esta sección usa `visaType` libre (`digital_nomad`, `student`...), guardaremos en `user_documents.route_type` el valor `visaType` directamente y, si TypeScript se queja por enum, casteamos a `any` o usamos la ruta activa del usuario. Confirmar esquema real con un `select` antes de implementar para escoger la opción correcta.

### 3. Sin cambios en

- `DocumentVault.tsx`, `useDocumentVault.tsx`, `DocumentStatusCard.tsx`, `DocumentCategory.tsx`: ya funcionan bien.
- Generador `generateTasa790.ts`: se conserva por si se usa en otra parte (no se borra el archivo, solo se desconecta de esta UI).

## Resultado esperado

- La card dorada/PRO de "Generar Tasa 790-012" desaparece de la vista de Documentos.
- Al subir un documento: aparece badge verde "Subido", el contador "X subidos" se incrementa, y aparece un botón para abrir el archivo en otra pestaña.
- Al recargar la página, el estado se mantiene porque ahora se persiste y se relee de `user_documents`.
