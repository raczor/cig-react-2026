import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

// Renders with a fresh router and query client so tests never share cache.
export function renderWithProviders(ui, { route = "/" } = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[route]} future={FUTURE}>
                {ui}
            </MemoryRouter>
        </QueryClientProvider>
    );
}
