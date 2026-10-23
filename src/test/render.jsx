import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "../auth/AuthProvider.jsx";

const FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

// Renders with a fresh router and query client so tests never share cache.
// Login is off here (no VITE_NEON_AUTH_URL), like local development.
export function renderWithProviders(ui, { route = "/" } = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <MemoryRouter initialEntries={[route]} future={FUTURE}>
                    {ui}
                </MemoryRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}
