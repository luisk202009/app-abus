// Tests Deno para stripe-webhook
// Ejecuta con: supabase--test_edge_functions { functions: ["stripe-webhook"] }
//
// Estos tests cubren las ramas que NO requieren ejecutar Stripe SDK con
// firma válida (eso requeriría el secreto real). Validan estructura HTTP.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/stripe-webhook`;

Deno.test("CORS preflight responde 200", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
});

Deno.test("POST sin stripe-signature devuelve 400", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "checkout.session.completed" }),
  });
  const text = await res.text();
  assertEquals(res.status, 400);
  assert(text.toLowerCase().includes("signature"), `respuesta: ${text}`);
});

Deno.test("POST con firma inválida devuelve 400 sin tocar BD", async () => {
  const fakeBody = JSON.stringify({
    id: "evt_test",
    type: "checkout.session.completed",
    data: { object: { id: "cs_test" } },
  });
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": "t=1,v1=invalid_signature",
    },
    body: fakeBody,
  });
  const text = await res.text();
  assertEquals(res.status, 400);
  assert(
    text.toLowerCase().includes("webhook") || text.toLowerCase().includes("signature"),
    `respuesta: ${text}`
  );
});
