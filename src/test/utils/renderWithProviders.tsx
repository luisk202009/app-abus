import { ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

interface Options {
  route?: string;
}

export const renderWithProviders = (ui: ReactNode, opts: Options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[opts.route ?? "/"]}>
        {ui}
        <Toaster />
      </MemoryRouter>
    </QueryClientProvider>
  );
};
