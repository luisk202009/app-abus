import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils/renderWithProviders";
import { createMockSupabase, type MockSupabase } from "@/test/utils/mockSupabase";

let mockSupa: MockSupabase;

vi.mock("@/integrations/supabase/client", () => ({
  get supabase() {
    return mockSupa.client;
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "user-123",
      email: "test@test.com",
      user_metadata: { full_name: "Test User" },
    },
    session: { access_token: "fake-token" },
    isLoading: false,
    isPartner: false,
  }),
}));

import { PendingPaymentAlert } from "@/components/dashboard/PendingPaymentAlert";

const PENDING_ROW = {
  id: "pp-123",
  plan_type: "pro",
  route_template: "regularizacion-2026",
  price_id: "price_abc",
  status: "pending",
  email: "test@test.com",
  error_message: null,
};

describe("PendingPaymentAlert", () => {
  beforeEach(() => {
    mockSupa = createMockSupabase();
    (global.fetch as any) = vi.fn();
    (window.open as any) = vi.fn();
  });

  it("renderiza el banner cuando hay un pending payment activo", async () => {
    mockSupa.setQueryResponse("pending_payments", "maybeSingle", {
      data: PENDING_ROW,
      error: null,
    });

    renderWithProviders(<PendingPaymentAlert />);

    await waitFor(() => {
      expect(screen.getByText(/Pago pendiente/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Reintentar pago/i })).toBeInTheDocument();
    });
  });

  it("no renderiza nada si no hay pending payments", async () => {
    mockSupa.setQueryResponse("pending_payments", "maybeSingle", {
      data: null,
      error: null,
    });

    const { container } = renderWithProviders(<PendingPaymentAlert />);

    await waitFor(() => {
      expect(container.querySelector(".bg-amber-50")).toBeNull();
    });
  });

  it("Reintentar pago invoca create-one-time-payment con pendingPaymentId y abre Stripe", async () => {
    mockSupa.setQueryResponse("pending_payments", "maybeSingle", {
      data: PENDING_ROW,
      error: null,
    });
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://checkout.stripe.com/retry_session" }),
    });

    renderWithProviders(<PendingPaymentAlert />);

    const retryBtn = await screen.findByRole("button", { name: /Reintentar pago/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      const call = (global.fetch as any).mock.calls[0];
      expect(call[0]).toContain("create-one-time-payment");
      const body = JSON.parse(call[1].body);
      expect(body.pendingPaymentId).toBe("pp-123");
      expect(body.priceId).toBe("price_abc");
      expect(body.planType).toBe("pro");
    });

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        "https://checkout.stripe.com/retry_session",
        "_blank"
      );
    });
  });

  it("Cancelar marca el registro como cancelled y oculta el banner", async () => {
    mockSupa.setQueryResponse("pending_payments", "maybeSingle", {
      data: PENDING_ROW,
      error: null,
    });

    renderWithProviders(<PendingPaymentAlert />);

    await screen.findByText(/Pago pendiente/i);

    // El segundo botón es el de cerrar (icono X) — buscamos por su clase distintiva
    const buttons = screen.getAllByRole("button");
    const closeBtn = buttons[buttons.length - 1];
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(mockSupa.update).toHaveBeenCalledWith(
        "pending_payments",
        expect.objectContaining({ status: "cancelled" })
      );
    });
  });

  it("Realtime: cuando se recibe UPDATE, se vuelve a consultar el banner", async () => {
    mockSupa.setQueryResponse("pending_payments", "maybeSingle", {
      data: PENDING_ROW,
      error: null,
    });

    renderWithProviders(<PendingPaymentAlert />);
    await screen.findByText(/Pago pendiente/i);

    // Ahora simulamos que el webhook completó el pago
    mockSupa.setQueryResponse("pending_payments", "maybeSingle", {
      data: null,
      error: null,
    });
    mockSupa.triggerRealtime("pending_payments_user-123", {
      eventType: "UPDATE",
      new: { ...PENDING_ROW, status: "completed" },
    });

    await waitFor(() => {
      expect(screen.queryByText(/Pago pendiente/i)).not.toBeInTheDocument();
    });
  });
});
