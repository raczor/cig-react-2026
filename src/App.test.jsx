import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import * as api from "./services/orders.js";
import { makeOrder } from "./test/fixtures.js";
import { renderWithProviders } from "./test/render.jsx";

vi.mock("./services/orders.js");

const order = makeOrder({ id: 5, code: "OS-2026-005", client: "Hotel Mirador" });

beforeEach(() => {
    vi.resetAllMocks();
    api.getOrders.mockResolvedValue([order]);
    api.getOrder.mockResolvedValue(order);
});

describe("routing", () => {
    it("shows the board on /", async () => {
        renderWithProviders(<App />);
        expect(await screen.findByText("Orden OS-2026-005")).toBeInTheDocument();
    });

    it("shows a not found page for unknown URLs", () => {
        renderWithProviders(<App />, { route: "/no-existe" });
        expect(screen.getByText("La página solicitada no existe.")).toBeInTheDocument();
    });

    it("/orders/new wins over /orders/:id", () => {
        renderWithProviders(<App />, { route: "/orders/new" });
        expect(screen.getByRole("heading", { name: "Registrar orden" })).toBeInTheDocument();
        expect(api.getOrder).not.toHaveBeenCalled();
    });

    it("opens the order detail", async () => {
        renderWithProviders(<App />, { route: "/orders/5" });
        expect(await screen.findByRole("heading", { name: "Orden OS-2026-005" })).toBeInTheDocument();
        expect(screen.getByText("Hotel Mirador")).toBeInTheDocument();
    });

    it("shows an error with a way back when the order does not exist", async () => {
        api.getOrder.mockRejectedValue(new Error("El servidor respondió 404"));
        renderWithProviders(<App />, { route: "/orders/99" });

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo cargar la orden 99: El servidor respondió 404");
        expect(screen.getByRole("link", { name: "Volver al tablero" })).toHaveAttribute("href", "/");
    });

    it("prefills the edit form with the loaded order", async () => {
        renderWithProviders(<App />, { route: "/orders/5/edit" });
        expect(await screen.findByLabelText("Cliente")).toHaveValue("Hotel Mirador");
    });

    it("saving an edit sends only the editable fields: no status, id or code", async () => {
        const user = userEvent.setup();
        api.getOrder.mockResolvedValue(makeOrder({ id: 5, code: "OS-2026-005", client: "Hotel Mirador", status: "in_progress" }));
        api.updateOrder.mockResolvedValue({});
        renderWithProviders(<App />, { route: "/orders/5/edit" });

        const client = await screen.findByLabelText("Cliente");
        await user.clear(client);
        await user.type(client, "Hotel Nuevo");
        await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

        expect(api.updateOrder).toHaveBeenCalledTimes(1);
        const [id, body] = api.updateOrder.mock.calls[0];
        expect(id).toBe("5");
        expect(body).toMatchObject({ client: "Hotel Nuevo", hours: 3.5, amount: 1750 });
        expect(body).not.toHaveProperty("status");
        expect(body).not.toHaveProperty("id");
        expect(body).not.toHaveProperty("code");
    });

    it("Cancelar on the edit form goes back to the order without saving", async () => {
        const user = userEvent.setup();
        renderWithProviders(<App />, { route: "/orders/5/edit" });

        await user.click(await screen.findByRole("button", { name: "Cancelar" }));

        expect(await screen.findByRole("heading", { name: "Orden OS-2026-005" })).toBeInTheDocument();
        expect(api.updateOrder).not.toHaveBeenCalled();
    });

    it("Cancelar on the new order form goes back to the board without creating anything", async () => {
        const user = userEvent.setup();
        renderWithProviders(<App />, { route: "/orders/new" });

        await user.type(screen.getByLabelText("Cliente"), "Algo a medias");
        await user.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(await screen.findByText("Orden OS-2026-005")).toBeInTheDocument();
        expect(api.createOrder).not.toHaveBeenCalled();
    });

    it("the header search goes to the board with ?q=", async () => {
        const user = userEvent.setup();
        renderWithProviders(<App />, { route: "/orders/5" });
        await screen.findByRole("heading", { name: "Orden OS-2026-005" });

        await user.type(screen.getByRole("searchbox", { name: "Buscar por código o cliente" }), "mirador{Enter}");

        expect(await screen.findByText((_, el) => el.matches("p") && el.textContent.startsWith("1 de 1 órdenes para"))).toBeInTheDocument();
    });
});

describe("delete flow", () => {
    it("asks for confirmation, deletes, and returns to the board", async () => {
        const user = userEvent.setup();
        api.deleteOrder.mockResolvedValue({});
        renderWithProviders(<App />, { route: "/orders/5" });
        await screen.findByRole("heading", { name: "Orden OS-2026-005" });

        await user.click(screen.getByRole("button", { name: "Eliminar" }));
        const dialog = screen.getByRole("dialog", { name: "Eliminar orden" });
        expect(dialog).toHaveTextContent("OS-2026-005");
        await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

        // React Query also passes a context argument, so only the id is asserted.
        expect(api.deleteOrder.mock.calls[0][0]).toBe(5);
        expect(await screen.findByText("0 de 0 órdenes")).toBeInTheDocument();
    });

    it("does not delete when the dialog is cancelled", async () => {
        const user = userEvent.setup();
        renderWithProviders(<App />, { route: "/orders/5" });
        await screen.findByRole("heading", { name: "Orden OS-2026-005" });

        await user.click(screen.getByRole("button", { name: "Eliminar" }));
        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancelar" }));

        expect(api.deleteOrder).not.toHaveBeenCalled();
    });

    it("closes the dialog and shows an alert when the delete fails", async () => {
        const user = userEvent.setup();
        api.deleteOrder.mockRejectedValue(new Error("boom"));
        renderWithProviders(<App />, { route: "/orders/5" });
        await screen.findByRole("heading", { name: "Orden OS-2026-005" });

        await user.click(screen.getByRole("button", { name: "Eliminar" }));
        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo eliminar: boom");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
