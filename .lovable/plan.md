

# Plan: Sección "Abogados" en el Dashboard del usuario

## Resumen
Agregar una nueva entrada de menú "Abogados" entre "Documentos" y "Recursos" en el Dashboard, que muestra el directorio de abogados verificados con filtros, modal de perfil y formulario de consulta. Acceso completo para usuarios `premium` o con ruta activa de Regularización 2026; bloqueado con overlay para `pro` y `free`.

## Lógica de acceso
- **Acceso completo** si: `subscriptionStatus === "premium"` **OR** existe `activeRoutes` con `template_id === TEMPLATE_IDS.regularizacion2026` (`"57b27d4a-190b-4ece-a1c3-de1859d58217"`).
- **Bloqueado (con overlay)** en el resto de casos. El overlay muestra: *"Disponible para usuarios Premium y usuarios de Regularización 2026."* y un CTA de upgrade.

## Archivos a crear

### 1. `src/components/dashboard/LawyersSection.tsx`
Componente principal de la sección. Recibe props: `hasAccess: boolean`, `onUpgrade: () => void`.
- Header con título "Directorio de Abogados Verificados".
- Filtros: `Select` por especialidad (regularización, arraigos, recursos, nómada digital) y `Select` por ciudad (lista distinta dinámica).
- Query a `lawyers` con `is_verified=true` y `is_active=true`, JOIN manual a `lawyer_services` para obtener precio mínimo activo por abogado.
- Grid responsive (1/2/3 columnas) de `LawyerCard`.
- Si `!hasAccess`: el grid se renderiza con `pointer-events-none blur-sm` y encima un overlay absoluto con candado, mensaje y botón "Upgrade a Premium".
- Maneja apertura de `LawyerProfileModal` al hacer clic en una tarjeta.

### 2. `src/components/dashboard/LawyerCard.tsx`
Tarjeta individual: avatar (`photo_url` o iniciales), nombre, ciudad, badges de especialidades, idiomas, precio base ("Desde X€"). Botón "Ver perfil".

### 3. `src/components/dashboard/LawyerProfileModal.tsx`
Modal (Dialog) con:
- Cabecera: avatar grande, nombre, colegio, número colegiado, ciudad, idiomas, badges de especialidades, bio.
- Lista de servicios desde `lawyer_services` (descripción + precio EUR).
- Sección "Enviar consulta":
  - Antes de enviar, query a `lawyer_inquiries` filtrando por `user_id`, `lawyer_id`, `status != 'closed'`.
  - **Si existe consulta activa**: mostrar tarjeta con badge de estado (pending/assigned/active) y mensaje "Ya tienes una consulta activa con este abogado." (oculta el formulario).
  - **Si no existe**: textarea con validación mínima 50 caracteres + contador. Botón "Enviar solicitud" (deshabilitado hasta cumplir longitud).
  - Al enviar: INSERT en `lawyer_inquiries` con `user_id=auth.uid()`, `lawyer_id`, `submission_id` (obtenido de `onboarding_submissions` por user_id), `message`, `status='pending'`. Toast de confirmación: *"Tu solicitud fue enviada. El equipo de Albus revisará tu caso y lo asignará en menos de 24 horas."*

## Archivos a modificar

### 4. `src/components/dashboard/DashboardSidebar.tsx`
Insertar item `{ id: "lawyers", label: "Abogados", icon: <Scale className="w-5 h-5" /> }` entre "documents" y "resources". Importar `Scale` de lucide-react.

### 5. `src/pages/Dashboard.tsx`
- Importar `LawyersSection`.
- Calcular `hasLawyersAccess`: `subscriptionStatus === "premium" || activeRoutes.some(r => r.template_id === TEMPLATE_IDS.regularizacion2026)`.
- Añadir `case "lawyers"` en el switch de `renderContent` que renderice `<LawyersSection hasAccess={hasLawyersAccess} onUpgrade={() => handleCheckout()} />`.

## Lo que NO cambia
- Tablas, RLS y migraciones: las políticas existentes ya permiten todo lo necesario:
  - `lawyers`: SELECT público para verificados+activos.
  - `lawyer_services`: SELECT público para activos.
  - `lawyer_inquiries`: usuarios pueden INSERT con `user_id=auth.uid()` y SELECT propios.
- El Admin Panel y las rutas de checkout permanecen intactos.

