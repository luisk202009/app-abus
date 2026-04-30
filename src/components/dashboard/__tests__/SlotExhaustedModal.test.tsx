import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils/renderWithProviders";
import { SlotExhaustedModal } from "@/components/dashboard/SlotExhaustedModal";

describe("SlotExhaustedModal — selector Pro/Premium", () => {
  it("muestra ambos planes (Pro y Premium) con sus precios", () => {
    renderWithProviders(
      <SlotExhaustedModal
        isOpen={true}
        onClose={vi.fn()}
        onUpgrade={vi.fn()}
        isUpgrading={false}
      />
    );

    expect(screen.getByText(/Plan Pro/i)).toBeInTheDocument();
    expect(screen.getByText(/Plan Premium/i)).toBeInTheDocument();
    expect(screen.getByText(/€9,99\/mes/)).toBeInTheDocument();
    expect(screen.getByText(/€19,99\/mes/)).toBeInTheDocument();
  });

  it("al elegir Pro llama onUpgrade('pro')", () => {
    const onUpgrade = vi.fn();
    renderWithProviders(
      <SlotExhaustedModal
        isOpen={true}
        onClose={vi.fn()}
        onUpgrade={onUpgrade}
        isUpgrading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Elegir Plan Pro/i }));
    expect(onUpgrade).toHaveBeenCalledWith("pro");
  });

  it("al elegir Premium llama onUpgrade('premium')", () => {
    const onUpgrade = vi.fn();
    renderWithProviders(
      <SlotExhaustedModal
        isOpen={true}
        onClose={vi.fn()}
        onUpgrade={onUpgrade}
        isUpgrading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Elegir Plan Premium/i }));
    expect(onUpgrade).toHaveBeenCalledWith("premium");
  });

  it("'Entendido, seguir como Free' llama onClose sin disparar pago", () => {
    const onClose = vi.fn();
    const onUpgrade = vi.fn();
    renderWithProviders(
      <SlotExhaustedModal
        isOpen={true}
        onClose={onClose}
        onUpgrade={onUpgrade}
        isUpgrading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Entendido/i }));
    expect(onClose).toHaveBeenCalled();
    expect(onUpgrade).not.toHaveBeenCalled();
  });
});
