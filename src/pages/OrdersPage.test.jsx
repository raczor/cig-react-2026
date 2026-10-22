import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import OrdersPage from "./OrdersPage.jsx";
import * as api from "../services/orders.js";
import { makeOrder } from "../test/fixtures.js";
import { renderWithProviders } from "../test/render.jsx";

vi.mock("../services/orders.js");

const orders = [
    makeOrder({ id: 1, code: "OS-2026-001", client: "Hotel Mirador", department: "Guatemala", status: "pending", date: "2026-01-01" }),
    makeOrder({ id: 2, code: "OS-2026-002", client: "Colegio Santa Inés", department: "Sacatepéquez", status: "in_progress", date: "2026-02-01" }),
    makeOrder({ id: 3, code: "OS-2026-003", client: "Clínica Norte", department: "Guatemala", status: "completed", date: "2026-03-01" }),
];

function Location() {
    const { search } = useLocation();
    return <p data-testid="search">{search}</p>;
}

// The count line can carry a suffix ("para “hotel”") inside the same <p>, so match its start.
const count = (text) => screen.findByText((_, element) => element.matches("p") && element.textContent.startsWith(text));

function renderPage(route = "/") {
    return renderWithProviders(
        <Routes>
            <Route path="/" element={<><OrdersPage /><Location /></>} />
        </Routes>,
        { route }
    );
}

beforeEach(() => {
    vi.resetAllMocks();
    api.getOrders.mockResolvedValue(orders);
});

describe("OrdersPage", () => {
    it("shows a loading message and then the board", async () => {
        renderPage();
        expect(screen.getByText("Cargando órdenes...")).toBeInTheDocument();

        expect(await screen.findByText("Orden OS-2026-001")).toBeInTheDocument();
        expect(await count("3 de 3 órdenes")).toBeInTheDocument();
    });

    it("filters by the search term in the URL", async () => {
        renderPage("/?q=ines");

        expect(await screen.findByText("Orden OS-2026-002")).toBeInTheDocument();
        expect(screen.queryByText("Orden OS-2026-001")).not.toBeInTheDocument();
        expect(await count("1 de 3 órdenes")).toBeInTheDocument();
    });

    it("filters by department from the URL and ignores an unknown department", async () => {
        const { unmount } = renderPage("/?department=Guatemala");
        expect(await count("2 de 3 órdenes")).toBeInTheDocument();
        unmount();

        renderPage("/?department=Narnia");
        expect(await count("3 de 3 órdenes")).toBeInTheDocument();
    });

    it("writes the department filter to the URL when the select changes", async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText("Orden OS-2026-001");

        await user.selectOptions(screen.getByLabelText("Departamento"), "Sacatepéquez");

        expect(screen.getByTestId("search")).toHaveTextContent("?department=Sacatep%C3%A9quez");
        expect(await count("1 de 3 órdenes")).toBeInTheDocument();
    });

    it("clears every filter at once", async () => {
        const user = userEvent.setup();
        renderPage("/?q=hotel&department=Guatemala");
        await count("1 de 3 órdenes");

        await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));

        expect(await count("3 de 3 órdenes")).toBeInTheDocument();
        expect(screen.getByTestId("search")).toBeEmptyDOMElement();
        expect(screen.queryByRole("button", { name: "Limpiar filtros" })).not.toBeInTheDocument();
    });

    it("moves a card to the completed column and persists the status", async () => {
        const user = userEvent.setup();
        api.changeStatus.mockResolvedValue(makeOrder({ id: 1, code: "OS-2026-001", status: "completed" }));
        renderPage();
        await screen.findByText("Orden OS-2026-001");

        const pending = screen.getByRole("region", { name: "Pendiente" });
        await user.click(within(pending).getByRole("button", { name: "Completar" }));

        expect(api.changeStatus).toHaveBeenCalledWith(1, "completed");
        const completed = screen.getByRole("region", { name: "Completada" });
        expect(await within(completed).findByText("Orden OS-2026-001")).toBeInTheDocument();
    });

    it("rolls the card back and shows an alert when the move fails", async () => {
        const user = userEvent.setup();
        api.changeStatus.mockRejectedValue(new Error("Failed to fetch"));
        renderPage();
        await screen.findByText("Orden OS-2026-001");

        await user.click(within(screen.getByRole("region", { name: "Pendiente" })).getByRole("button", { name: "Completar" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo mover la orden OS-2026-001: Failed to fetch");
        expect(within(screen.getByRole("region", { name: "Pendiente" })).getByText("Orden OS-2026-001")).toBeInTheDocument();
    });

    it("shows the error and a retry button when the list cannot load, then recovers", async () => {
        const user = userEvent.setup();
        api.getOrders.mockRejectedValueOnce(new Error("El servidor respondió 500"));
        renderPage();

        expect(await screen.findByRole("alert")).toHaveTextContent("El servidor respondió 500");

        api.getOrders.mockResolvedValue(orders);
        await user.click(screen.getByRole("button", { name: "Reintentar" }));

        expect(await screen.findByText("Orden OS-2026-001")).toBeInTheDocument();
    });
});
