import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Field from "./Field.jsx";
import Button from "./ui/Button.jsx";
import Alert from "./ui/Alert.jsx";
import { controlClass, selectClass } from "./ui/styles.js";
import { DEPARTMENTS, CATEGORY_LABELS } from "../data/catalogs.js";
import { orderInputSchema } from "../../shared/order-schema.js";

const EMPTY = {
    client: "", taxId: "", department: "", category: "",
    technician: "", date: "", hours: "", amount: "",
};

// Shared by create and edit. `onSubmit` receives the validated, converted values (the same
// Zod schema the API uses) and must return a promise: the form stays disabled while it
// runs and shows the error if it rejects.
function OrderForm({ initial = EMPTY, onSubmit, submitLabel = "Guardar" }) {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(orderInputSchema),
        defaultValues: initial,
    });

    // register() plus the id and aria attributes that tie each control to its error message.
    // On a failed submit the first invalid field is focused (react-hook-form default).
    // Number inputs yield "" when empty: valueAsNumber turns that into NaN, which the schema rejects.
    function field(name, options) {
        const error = errors[name];
        return {
            ...register(name, options),
            id: `field-${name}`,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error ? `field-${name}-error` : undefined,
        };
    }

    async function submit(values) {
        try {
            await onSubmit(values);
            // Inside the try: if onSubmit fails, what the user typed is kept.
            reset(initial);
        } catch (err) {
            setError("root.server", { message: err.message });
        }
    }

    return (
        <form className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3" onSubmit={handleSubmit(submit)} noValidate>
            <Field label="Cliente" name="client" error={errors.client?.message}>
                <input className={controlClass} {...field("client")} />
            </Field>

            <Field label="NIT" name="taxId" error={errors.taxId?.message}>
                <input className={controlClass} placeholder="1234567-8 o CF" {...field("taxId")} />
            </Field>

            <Field label="Departamento" name="department" error={errors.department?.message}>
                <select className={selectClass} {...field("department")}>
                    <option value="">Selecciona</option>
                    {DEPARTMENTS.map((name) => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </Field>

            <Field label="Categoría" name="category" error={errors.category?.message}>
                <select className={selectClass} {...field("category")}>
                    <option value="">Selecciona</option>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </Field>

            <Field label="Técnico" name="technician" error={errors.technician?.message}>
                <input className={controlClass} {...field("technician")} />
            </Field>

            <Field label="Fecha" name="date" error={errors.date?.message}>
                <input className={controlClass} type="date" {...field("date")} />
            </Field>

            <Field label="Horas" name="hours" error={errors.hours?.message}>
                <input className={controlClass} type="number" min="0" step="0.25" {...field("hours", { valueAsNumber: true })} />
            </Field>

            <Field label="Monto (Q)" name="amount" error={errors.amount?.message}>
                <input className={controlClass} type="number" min="0" step="0.01" {...field("amount", { valueAsNumber: true })} />
            </Field>

            {errors.root?.server && (
                <Alert variant="error" className="mb-4 sm:col-span-2 lg:col-span-3">
                    No se pudo guardar: {errors.root.server.message}
                </Alert>
            )}

            <div className="pt-2 text-right sm:col-span-2 lg:col-span-3">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}

export default OrderForm;
