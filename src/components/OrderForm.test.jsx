import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderForm from "./OrderForm.jsx";
import { makeOrder } from "../test/fixtures.js";
import { renderWithProviders } from "../test/render.jsx";

async function fillValid(user) {
    await user.type(screen.getByLabelText("Cliente"), "Hotel Mirador");
    await user.type(screen.getByLabelText("NIT"), "1234567-8");
    await user.selectOptions(screen.getByLabelText("Departamento"), "Guatemala");
    await user.selectOptions(screen.getByLabelText("Categoría"), "repair");
    await user.type(screen.getByLabelText("Técnico"), "Ana Pérez");
    await user.type(screen.getByLabelText("Fecha"), "2026-10-14");
    await user.type(screen.getByLabelText("Horas"), "4");
    await user.type(screen.getByLabelText("Monto (Q)"), "150.5");
}

describe("OrderForm", () => {
    it("shows an error per invalid field and does not submit", async () => {
        const onSubmit = vi.fn();
        const user = userEvent.setup();
        renderWithProviders(<OrderForm onSubmit={onSubmit} submitLabel="Registrar" />);

        await user.click(screen.getByRole("button", { name: "Registrar" }));

        expect(screen.getByText("Cliente obligatorio.")).toBeInTheDocument();
        expect(screen.getByText("Selecciona un departamento.")).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("wires errors to their fields for assistive tech and focuses the first invalid one", async () => {
        const user = userEvent.setup();
        renderWithProviders(<OrderForm onSubmit={vi.fn()} submitLabel="Registrar" />);

        await user.click(screen.getByRole("button", { name: "Registrar" }));

        const client = screen.getByLabelText("Cliente");
        expect(client).toHaveAttribute("aria-invalid", "true");
        expect(client).toHaveAccessibleDescription("Cliente obligatorio.");
        expect(client).toHaveFocus();
    });

    it("submits converted values when the form is valid", async () => {
        const onSubmit = vi.fn().mockResolvedValue();
        const user = userEvent.setup();
        renderWithProviders(<OrderForm onSubmit={onSubmit} submitLabel="Registrar" />);

        await fillValid(user);
        await user.click(screen.getByRole("button", { name: "Registrar" }));

        expect(onSubmit).toHaveBeenCalledWith({
            client: "Hotel Mirador",
            taxId: "1234567-8",
            department: "Guatemala",
            category: "repair",
            technician: "Ana Pérez",
            date: "2026-10-14",
            hours: 4,
            amount: 150.5,
        });
    });

    it("clears the form after a successful save", async () => {
        const user = userEvent.setup();
        renderWithProviders(<OrderForm onSubmit={vi.fn().mockResolvedValue()} submitLabel="Registrar" />);

        await fillValid(user);
        await user.click(screen.getByRole("button", { name: "Registrar" }));

        expect(await screen.findByLabelText("Cliente")).toHaveValue("");
    });

    it("keeps what the user typed and shows the error when saving fails", async () => {
        const user = userEvent.setup();
        renderWithProviders(<OrderForm onSubmit={vi.fn().mockRejectedValue(new Error("sin red"))} submitLabel="Registrar" />);

        await fillValid(user);
        await user.click(screen.getByRole("button", { name: "Registrar" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo guardar: sin red");
        expect(screen.getByLabelText("Cliente")).toHaveValue("Hotel Mirador");
        expect(screen.getByRole("button", { name: "Registrar" })).toBeEnabled();
    });

    it("disables the button while saving so a double click cannot create two orders", async () => {
        let finish;
        const onSubmit = vi.fn(() => new Promise((resolve) => (finish = resolve)));
        const user = userEvent.setup();
        renderWithProviders(<OrderForm onSubmit={onSubmit} submitLabel="Registrar" />);

        await fillValid(user);
        await user.click(screen.getByRole("button", { name: "Registrar" }));

        expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
        finish();
    });

    it("prefills from the order being edited", () => {
        renderWithProviders(<OrderForm initial={makeOrder({ hours: 3.5 })} onSubmit={vi.fn()} />);

        expect(screen.getByLabelText("Cliente")).toHaveValue("Distribuidora La Ceiba");
        expect(screen.getByLabelText("Departamento")).toHaveValue("Guatemala");
        expect(screen.getByLabelText("Horas")).toHaveValue(3.5);
    });
});
