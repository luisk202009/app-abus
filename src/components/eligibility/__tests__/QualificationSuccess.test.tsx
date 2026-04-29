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

// useAuth devuelve un usuario autenticado para saltar el AuthModal interno
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
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

import { QualificationSuccess } from "@/components/eligibility/QualificationSuccess";

const clickPro = () => {
  // Selecciona el primer botón "Empezar" o similar dentro del PricingCard Pro
  const buttons = screen.getAllByRole("button");
  const proBtn = buttons.find((b) => /pro/i.test(b.textContent || "")) || buttons[0];
  fireEvent.click(proBtn);
};

describe("QualificationSuccess — flujo de checkout Reg2026", () => {
  beforeEach(() => {
    mockSupa = createMockSupabase();
    navigateMock.mockReset();
    (global.fetch as any) = vi.fn();
    (window.open as any) = vi.fn();
  });

  it("flujo feliz: invoca create-one-time-payment y abre Stripe en nueva pestaña", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        url: "https://checkout.stripe.com/test_session",
        pending_payment_id: "pp-123",
      }),
    });

    renderWithProviders(
      <QualificationSuccess routeType="regularizacion2026" onClose={vi.fn()} />
    );

    // Selecciona plan Pro (PricingCard expone CTA — disparamos handleSelectPlan)
    const cards = screen.getAllByText(/Regularización/i);
    expect(cards.length).toBeGreaterThan(0);
    clickPro();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("create-one-time-payment"),
        expect.objectContaining({ method: "POST" })
      );
    });

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        "https://checkout.stripe.com/test_session",
        "_blank"
      );
      expect(navigateMock).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard?pending_payment=pp-123")
      );
    });
  });

  it("checkout falla con pending_payment_id: redirige al Dashboard con payment_error=1", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Stripe error",
        pending_payment_id: "pp-456",
      }),
    });

    renderWithProviders(
      <QualificationSuccess routeType="regularizacion2026" onClose={vi.fn()} />
    );
    clickPro();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(
        expect.stringContaining("pending_payment=pp-456&payment_error=1")
      );
    });
    expect(window.open).not.toHaveBeenCalled();
  });

  it("error de red: navega a /dashboard?payment_error=1 cuando hay user", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network down"));

    renderWithProviders(
      <QualificationSuccess routeType="regularizacion2026" onClose={vi.fn()} />
    );
    clickPro();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/dashboard?payment_error=1");
    });
  });
});
