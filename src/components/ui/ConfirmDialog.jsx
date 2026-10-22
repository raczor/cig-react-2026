import { useEffect, useId, useRef } from "react";
import Button from "./Button.jsx";

// Uses the native <dialog>: Escape, focus trapping and the backdrop come for free.
// While `busy` the dialog cannot be dismissed, so a pending action is never abandoned.
function ConfirmDialog({ open, title, children, confirmLabel = "Confirmar", busyLabel, busy = false, onConfirm, onCancel }) {
    const ref = useRef(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    function dismiss() {
        if (!busy) onCancel();
    }

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                dismiss();
            }}
            // A click on the dialog element itself (not its content) is a click on the backdrop.
            onClick={(event) => event.target === ref.current && dismiss()}
            className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl p-0 shadow-xl backdrop:bg-slate-900/50"
        >
            <div className="p-6">
                <h2 id={titleId} className="mb-2 text-lg font-semibold">{title}</h2>
                <div className="text-slate-600">{children}</div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancel} disabled={busy}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={busy}>
                        {busy ? busyLabel : confirmLabel}
                    </Button>
                </div>
            </div>
        </dialog>
    );
}

export default ConfirmDialog;
