// Tests Deno para create-one-time-payment
// Ejecuta con: supabase--test_edge_functions { functions: ["create-one-time-payment"] }
//
// NOTA: Estos tests llaman a la edge function ya desplegada. Por tanto, validan
// principalmente las ramas de validación de input y autenticación que NO
// requieren credenciales reales de Stripe.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/create-one-time-payment`;

Deno.test("CORS preflight responde 200", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
});

Deno.test("sin Authorization header devuelve 401", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const json = await res.json();
  assertEquals(res.status, 401);
  assert(json.error);
});

Deno.test("token inválido devuelve 401", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer token-invalido-xxx",
    },
    body: JSON.stringify({
      priceId: "price_test",
      email: "test@test.com",
      name: "Test",
    }),
  });
  const json = await res.json();
  assertEquals(res.status, 401);
  assert(json.error, "debe incluir error en la respuesta");
});

Deno.test("método GET no aceptado correctamente (sin body)", async () => {
  const res = await fetch(FN_URL, {
    method: "GET",
    headers: { Authorization: "Bearer x" },
  });
  await res.text();
  // Debe responder con 401 (token inválido) o 4xx, no 500
  assert(res.status >= 400 && res.status < 500, `status fue ${res.status}`);
});
