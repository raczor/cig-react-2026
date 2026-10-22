import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog.jsx";

function setup(props = {}) {
    const handlers = { onConfirm: vi.fn(), onCancel: vi.fn() };
    const view = render(
        <ConfirmDialog open title="Eliminar orden" confirmLabel="Eliminar" busyLabel="Eliminando..." {...handlers} {...props}>
            ¿Seguro?
        </ConfirmDialog>
    );
    return { ...handlers, ...view };
}

describe("ConfirmDialog", () => {
    it("is hidden until opened and labelled by its title", () => {
        const { rerender, onConfirm, onCancel } = setup({ open: false });
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        rerender(<ConfirmDialog open title="Eliminar orden" onConfirm={onConfirm} onCancel={onCancel}>¿Seguro?</ConfirmDialog>);
        expect(screen.getByRole("dialog", { name: "Eliminar orden" })).toBeInTheDocument();
    });

    it("calls onConfirm and onCancel from its buttons", async () => {
        const { onConfirm, onCancel } = setup();

        await userEvent.click(screen.getByRole("button", { name: "Eliminar" }));
        await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("cancels on Escape and on a backdrop click", () => {
        const { onCancel } = setup();
        const dialog = screen.getByRole("dialog");

        fireEvent(dialog, new Event("cancel", { cancelable: true }));
        fireEvent.click(dialog);

        expect(onCancel).toHaveBeenCalledTimes(2);
    });

    it("does not cancel when the click lands inside the content", async () => {
        const { onCancel } = setup();
        await userEvent.click(screen.getByText("¿Seguro?"));
        expect(onCancel).not.toHaveBeenCalled();
    });

    it("cannot be dismissed while busy and shows the busy label", () => {
        const { onCancel } = setup({ busy: true });
        const dialog = screen.getByRole("dialog");

        fireEvent(dialog, new Event("cancel", { cancelable: true }));
        fireEvent.click(dialog);

        expect(onCancel).not.toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "Eliminando..." })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    });
});
