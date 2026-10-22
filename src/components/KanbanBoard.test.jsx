import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KanbanBoard from "./KanbanBoard.jsx";
import { makeOrder } from "../test/fixtures.js";
import { renderWithProviders } from "../test/render.jsx";

const orders = [
    makeOrder({ id: 1, code: "OS-2026-001", status: "pending" }),
    makeOrder({ id: 2, code: "OS-2026-002", status: "pending" }),
    makeOrder({ id: 3, code: "OS-2026-003", status: "completed" }),
];

function renderBoard(onMove = vi.fn(), list = orders) {
    renderWithProviders(<KanbanBoard orders={list} onMove={onMove} />);
    return onMove;
}

const column = (name) => screen.getByRole("region", { name });

describe("KanbanBoard", () => {
    it("shows one column per status with its count", () => {
        renderBoard();
        expect(within(column("Pendiente")).getByText("2")).toBeInTheDocument();
        expect(within(column("En proceso")).getByText("0")).toBeInTheDocument();
        expect(within(column("Completada")).getByText("1")).toBeInTheDocument();
        expect(within(column("Cancelada")).getByText("Sin órdenes")).toBeInTheDocument();
    });

    it("places each order in the column of its status", () => {
        renderBoard();
        expect(within(column("Completada")).getByText("Orden OS-2026-003")).toBeInTheDocument();
        expect(within(column("Pendiente")).queryByText("Orden OS-2026-003")).not.toBeInTheDocument();
    });

    it("moves an order when its card is dropped on another column", () => {
        const onMove = renderBoard();
        const dataTransfer = { getData: () => "1", setData: vi.fn(), effectAllowed: "" };

        fireEvent.dragStart(screen.getByText("Orden OS-2026-001").closest("article"), { dataTransfer });
        fireEvent.dragOver(column("En proceso"), { dataTransfer });
        fireEvent.drop(column("En proceso"), { dataTransfer });

        expect(onMove).toHaveBeenCalledWith(1, "in_progress");
    });

    it("ignores a drop on the column the order is already in", () => {
        const onMove = renderBoard();
        fireEvent.drop(column("Pendiente"), { dataTransfer: { getData: () => "1" } });
        expect(onMove).not.toHaveBeenCalled();
    });

    it("ignores a drop that does not carry a known order id", () => {
        const onMove = renderBoard();
        fireEvent.drop(column("En proceso"), { dataTransfer: { getData: () => "" } });
        expect(onMove).not.toHaveBeenCalled();
    });

    it("lets keyboard users complete an order", async () => {
        const onMove = renderBoard();
        await userEvent.click(within(column("Pendiente")).getAllByRole("button", { name: "Completar" })[0]);
        expect(onMove).toHaveBeenCalledWith(1, "completed");
    });

    it("lets keyboard users move an order with the select, excluding its own status", async () => {
        const onMove = renderBoard();
        const select = screen.getByLabelText("Mover la orden OS-2026-001 a");

        expect([...select.options].map((o) => o.textContent)).toEqual(["Mover a...", "En proceso", "Completada", "Cancelada"]);
        await userEvent.selectOptions(select, "cancelled");

        expect(onMove).toHaveBeenCalledWith(1, "cancelled");
    });

    it("does not offer Completar on a completed order", () => {
        renderBoard();
        expect(within(column("Completada")).queryByRole("button", { name: "Completar" })).not.toBeInTheDocument();
    });

    it("expands a card to show the extra details", async () => {
        renderBoard();
        const card = within(column("Completada")).getByText("Orden OS-2026-003").closest("article");

        expect(within(card).queryByText("NIT")).not.toBeInTheDocument();
        await userEvent.click(within(card).getByRole("button", { name: "Ver más" }));
        expect(within(card).getByText("NIT")).toBeInTheDocument();
        expect(within(card).getByText("Distribuidora La Ceiba")).toBeInTheDocument();
        await userEvent.click(within(card).getByRole("button", { name: "Ver menos" }));
        expect(within(card).queryByText("NIT")).not.toBeInTheDocument();
    });
});
