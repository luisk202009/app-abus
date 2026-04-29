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

const signUpFn = vi.fn();
const signInFn = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    isLoading: false,
    isPartner: false,
    signUp: signUpFn,
    signIn: signInFn,
    signOut: vi.fn(),
  }),
}));

import { AuthModal } from "@/components/auth/AuthModal";

const fillSignupForm = () => {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "nuevo@test.com" } });
  fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "Password1!" } });
  fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));
};

describe("AuthModal — flujo de pago Regularización", () => {
  beforeEach(() => {
    mockSupa = createMockSupabase();
    signUpFn.mockReset();
    signInFn.mockReset();
  });

  it("signup exitoso con allowUnconfirmed dispara onSuccess y onClose", async () => {
    signUpFn.mockResolvedValueOnce({ error: null });
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    renderWithProviders(
      <AuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} allowUnconfirmed />
    );

    fillSignupForm();

    await waitFor(() => {
      expect(signUpFn).toHaveBeenCalledWith("nuevo@test.com", "Password1!");
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("rate limit (429) muestra toast específico y NO llama onSuccess", async () => {
    signUpFn.mockResolvedValueOnce({
      error: { message: "email rate limit exceeded" },
    });
    const onSuccess = vi.fn();

    renderWithProviders(
      <AuthModal isOpen={true} onClose={vi.fn()} onSuccess={onSuccess} allowUnconfirmed />
    );

    fillSignupForm();

    await waitFor(() => {
      expect(screen.getByText(/Demasiados intentos/i)).toBeInTheDocument();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("email duplicado cambia automáticamente a modo login", async () => {
    signUpFn.mockResolvedValueOnce({
      error: { message: "User already registered" },
    });

    renderWithProviders(<AuthModal isOpen={true} onClose={vi.fn()} allowUnconfirmed />);
    fillSignupForm();

    await waitFor(() => {
      expect(screen.getByText(/Ya tienes una cuenta/i)).toBeInTheDocument();
    });

    // Tras 1.5s cambia a modo login
    await waitFor(
      () => {
        expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
