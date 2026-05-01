Plan para corregir el flujo de Regularización 2026:

1. Eliminar el bloqueo por email no confirmado en el flujo de pago
- Ajustar el `Dashboard` para que no muestre el overlay “Verifica tu cuenta” cuando el usuario viene de Regularización 2026 con un pago pendiente o con intención de checkout.
- Mantener el aviso de verificación solo como recordatorio no bloqueante en este caso, para que pueda abrirse Stripe y verse el banner de pago pendiente.
- Cambiar el texto del registro en `AuthModal` cuando `allowUnconfirmed` esté activo: no debe decir “Revisa tu email para confirmar tu cuenta” como requisito para continuar; debe indicar que la cuenta fue creada y que se abrirá el pago.

2. Rehacer el inicio de checkout tras crear cuenta
- En `QualificationSuccess`, dejar de depender únicamente de `useAuth.user`, porque tras signup con confirmación obligatoria Supabase devuelve `email_not_confirmed` y no hay sesión válida.
- Crear un flujo alternativo para Reg2026: tras signup exitoso, si no existe sesión, llamar a una Edge Function con los datos mínimos del usuario y el `leadId`/email para crear la sesión de Stripe y el `pending_payment` desde backend.
- Redirigir siempre al Dashboard con parámetros de contexto (`reg_checkout=1`, `pending_payment=...`) y abrir Stripe si la Edge Function devuelve URL.
- Si Stripe no puede abrirse o hay rate limit, dejar un `pending_payment` visible para reintentar desde el Dashboard.

3. Ajustar backend para permitir pago antes de confirmar email
- Actualizar `create-one-time-payment` para soportar el caso `signup_created_but_unconfirmed`: validar el email y el usuario recién creado usando service role, sin exponer claves al frontend.
- Asociar el pago pendiente con el `user_id` correcto aunque el usuario aún no tenga sesión confirmada.
- Mantener validación estricta de `priceId`, `planType`, email, nombre y origen.
- La función seguirá usando Stripe Checkout en `mode: payment`, con `success_url` hacia `/success` y `cancel_url` hacia `/dashboard?pending_payment=...`.

4. Bloquear Regularización 2026 como ruta gratis
- Cambiar `useRoutes.startRoute`: Reg2026 ya no se debe activar gratis desde el Dashboard ni desde Explorar.
- Si el usuario intenta iniciar Reg2026 sin un pago completado, mostrar la selección de planes Reg2026 (Pro y Premium) o enviar al checkout de pago único, no activar la ruta.
- Mantener que Reg2026 no consuma el contador de “1 ruta gratis”, pero no permitir que se cree hasta que exista `pending_payments.status = completed` o una marca equivalente de acceso pagado.
- Corregir el contador local en `useRoutes`: al iniciar Reg2026, no incrementar `totalRoutesCreated` en memoria.

5. Activar Reg2026 después del pago, no antes
- Ajustar `/success` para procesar `pending_payment` de Reg2026, marcar el contexto `onboarding_source=reg2026` y redirigir/ofrecer ir al Dashboard.
- En el Dashboard, auto-iniciar Reg2026 solo si el pago está completado.
- Si el usuario confirma el correo y llega directo al Dashboard, detectar pagos pendientes/fallidos y mostrar el banner de reintento, pero no activar la ruta gratis.

6. Ajustar UI de rutas para Reg2026
- En `RouteSelector`, `RouteExplorer` y `RouteDetailModal`, tratar Reg2026 como producto de pago independiente:
  - CTA: “Elegir plan Regularización” o “Activar con pago”.
  - No mostrarla como disponible dentro de la ruta gratis.
  - No bloquear el resto de rutas gratuitas por haber comprado Reg2026.

7. Pruebas
- Actualizar pruebas de `AuthModal` para validar que `allowUnconfirmed` no muestra bloqueo ni mensaje obligatorio de email.
- Actualizar pruebas de `QualificationSuccess` para cubrir:
  - signup sin sesión confirmada -> crea checkout/pending payment sin exigir confirmación previa.
  - rate limit -> no redirige falsamente como éxito y mantiene reintento.
  - pago pendiente -> Dashboard muestra banner.
- Actualizar pruebas de `useRoutes`/Dashboard o componentes relacionados para verificar que Reg2026 no se activa gratis y no incrementa el slot gratuito.
- Añadir/ajustar pruebas de Edge Function para validaciones de entrada y reintento de pago.

Cambios esperados para el usuario:
- Tras validar elegibilidad y crear cuenta, el usuario irá al pago sin esperar a confirmar email.
- Si luego confirma el correo, no se activará Reg2026 gratis; verá el Dashboard con el pago pendiente o con la ruta activa solo si Stripe/webhook completó el pago.
- La ruta gratis seguirá disponible para otras rutas, pero Regularización 2026 queda fuera de esa capa gratuita.