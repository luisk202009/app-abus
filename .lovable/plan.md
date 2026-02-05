
# Plan: Corregir Botón "Entrar" y Rediseñar "+ Añadir Ruta"

## Resumen

Dos correcciones de UX:
1. El botón "Entrar" en el navbar debe abrir directamente la vista de **iniciar sesión** en lugar de crear cuenta
2. El botón "+ Añadir ruta" debe usar el mismo diseño visual que la sección "Explorar Rutas"

---

## Cambio 1: Botón "Entrar" → Iniciar Sesión

### Problema Actual
El `AuthModal` siempre abre en modo `"signup"` por defecto, incluso cuando el usuario hace clic en "Entrar".

### Solución
Añadir una prop `defaultMode` al `AuthModal` para controlar qué vista mostrar al abrir.

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/auth/AuthModal.tsx` | Añadir prop `defaultMode?: "signup" \| "login"` |
| `src/components/Navbar.tsx` | Pasar `defaultMode="login"` al AuthModal |

---

## Cambio 2: Rediseño Botón "+ Añadir Ruta"

### Problema Actual
El botón actual es un simple `Button variant="outline" size="sm"` que no coincide con el estilo premium del explorador de rutas.

### Diseño Propuesto

```text
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Mis Rutas Activas                                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │  🧭  Explorar más rutas                                    │  │
│  │                                                             │  │
│  │  Descubre todas las rutas migratorias disponibles          │  │
│  │                                                             │  │
│  │                         [ Ver rutas disponibles → ]        │  │
│  │                                                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Características del Nuevo Diseño
- Tarjeta con bordes redondeados (`rounded-2xl`) como en RouteExplorer
- Icono `Compass` consistente con la sección de explorar
- Texto descriptivo breve
- Botón de acción con flecha (`ArrowRight`)
- Hover effect con sombra y borde primary

### Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Dashboard.tsx` | Reemplazar botón simple por tarjeta estilizada |

---

## Implementación

### 1. AuthModal.tsx

```typescript
// Añadir prop
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  leadId?: string;
  onSuccess?: () => void;
  defaultMode?: "signup" | "login";  // Nueva prop
}

// Usar la prop para inicializar el estado
const [mode, setMode] = useState<"signup" | "login">(defaultMode || "signup");

// Resetear mode cuando cambia defaultMode o se abre el modal
useEffect(() => {
  if (isOpen && defaultMode) {
    setMode(defaultMode);
  }
}, [isOpen, defaultMode]);
```

### 2. Navbar.tsx

```typescript
<AuthModal
  isOpen={showAuthModal}
  onClose={() => setShowAuthModal(false)}
  onSuccess={() => navigate("/dashboard")}
  defaultMode="login"  // Añadir esta línea
/>
```

### 3. Dashboard.tsx - Nueva Tarjeta de Explorar

```typescript
{canAddRoute && (
  <div
    className="group relative rounded-2xl border border-dashed border-border p-6 
               transition-all hover:shadow-lg hover:border-primary/30 
               bg-background/50 cursor-pointer"
    onClick={() => setActiveNavItem("explorer")}
  >
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" />
          <h4 className="font-semibold group-hover:text-primary transition-colors">
            Explorar más rutas
          </h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Descubre todas las rutas migratorias disponibles
        </p>
      </div>
      <Button variant="ghost" size="sm" className="gap-1">
        Ver rutas
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  </div>
)}
```

---

## Verificación

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Click en "Entrar" (navbar) | Modal abre con título "Inicia sesión" |
| Click en "Empezar Gratis" | Modal abre con título "Crea tu cuenta" |
| Dashboard con rutas activas | Nueva tarjeta de explorar con diseño premium |
| Hover sobre tarjeta explorar | Sombra y borde primary aparecen |
| Click en tarjeta explorar | Navega a la sección de explorar rutas |
