import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock window.open globalmente para los tests de checkout
if (typeof window !== "undefined") {
  vi.spyOn(window, "open").mockImplementation(() => null);
}

// Mock global de fetch — los tests individuales lo sobrescriben con vi.mocked
if (typeof global.fetch === "undefined") {
  global.fetch = vi.fn();
}

afterEach(() => {
  vi.clearAllMocks();
});
