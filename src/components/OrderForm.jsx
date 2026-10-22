import { useState } from "react";
import Field from "./Field.jsx";
import { DEPARTMENTS, CATEGORY_LABELS } from "../data/catalogs.js";
import Button from "./ui/Button.jsx";
import Alert from "./ui/Alert.jsx";
import { controlClass, selectClass } from "./ui/styles.js";

// Inputs always yield strings, even with type="number".
const EMPTY = {
    client: "", taxId: "", department: "", category: "",
    technician: "", date: "", hours: "", amount: "",
};

// Returns one message per invalid field; an empty object means the form is valid.
function validate(values) {
    const errors = {};
    if (values.client.trim() === "") errors.client = "Cliente obligatorio.";

    // Digits, optional dash and a check digit (number or K), or CF.
    const taxId = values.taxId.trim().toUpperCase();
    if (taxId === "") errors.taxId = "NIT obligatorio. Usa CF si no tienes.";
    else if (taxId !== "CF" && !/^\d{1,12}-?[\dK]$/.test(taxId))
        errors.taxId = "Formato de NIT: 1234567-8 o CF.";

    if (values.department === "") errors.department = "Selecciona un departamento.";
    if (values.category === "") errors.category = "Selecciona una categoría.";
    if (values.technician.trim() === "") errors.technician = "Técnico obligatorio.";
    if (values.date === "") errors.date = "Fecha obligatoria.";

    // Number("") is 0 and Number("abc") is NaN: both fail the comparison.
    const hours = Number(values.hours);
    if (!(hours > 0 && hours <= 24)) errors.hours = "Horas entre 0 y 24.";
    if (!(Number(values.amount) > 0)) errors.amount = "Monto mayor que cero.";

    return errors;
}

// Converts the form strings to the types the API stores.
function toPayload(values) {
    return {
        ...values,
        taxId: values.taxId.trim().toUpperCase(),
        hours: Number(values.hours),
        amount: Number(values.amount),
    };
}

// Shared by create and edit. `onSubmit` must return a promise so the form can
// disable the button while it runs and show the error if it rejects.
// `initial` is only read on mount, so the edit page renders the form after the order has loaded.
function OrderForm({ initial = EMPTY, onSubmit, submitLabel = "Guardar" }) {
    const [values, setValues] = useState(initial);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((previous) => ({ ...previous, [name]: value }));
    }

    // id plus aria-invalid / aria-describedby wiring for each control.
    function a11y(name) {
        const hasError = Boolean(errors[name]);
        return {
            id: `field-${name}`,
            "aria-invalid": hasError || undefined,
            "aria-describedby": hasError ? `field-${name}-error` : undefined,
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const found = validate(values);
        setErrors(found);

        // Focus the first invalid field so screen readers announce its error.
        const first = Object.keys(found)[0];
        if (first) {
            document.getElementById(`field-${first}`)?.focus();
            return;
        }

        setSubmitting(true);
        setSubmitError(null);
        try {
            await onSubmit(toPayload(values));
            // Inside the try: if onSubmit fails, what the user typed is kept.
            setValues(initial);
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3" onSubmit={handleSubmit} noValidate>
            <Field label="Cliente" name="client" error={errors.client}>
                <input className={controlClass} name="client" {...a11y("client")}
                    value={values.client} onChange={handleChange} />
            </Field>

            <Field label="NIT" name="taxId" error={errors.taxId}>
                <input className={controlClass} name="taxId" {...a11y("taxId")} placeholder="1234567-8 o CF"
                    value={values.taxId} onChange={handleChange} />
            </Field>

            <Field label="Departamento" name="department" error={errors.department}>
                <select className={selectClass} name="department" {...a11y("department")}
                    value={values.department} onChange={handleChange}>
                    <option value="">Selecciona</option>
                    {DEPARTMENTS.map((name) => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </Field>

            <Field label="Categoría" name="category" error={errors.category}>
                <select className={selectClass} name="category" {...a11y("category")}
                    value={values.category} onChange={handleChange}>
                    <option value="">Selecciona</option>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </Field>

            <Field label="Técnico" name="technician" error={errors.technician}>
                <input className={controlClass} name="technician" {...a11y("technician")}
                    value={values.technician} onChange={handleChange} />
            </Field>

            <Field label="Fecha" name="date" error={errors.date}>
                <input className={controlClass} name="date" {...a11y("date")} type="date"
                    value={values.date} onChange={handleChange} />
            </Field>

            <Field label="Horas" name="hours" error={errors.hours}>
                <input className={controlClass} name="hours" {...a11y("hours")} type="number"
                    min="0" step="0.25" value={values.hours} onChange={handleChange} />
            </Field>

            <Field label="Monto (Q)" name="amount" error={errors.amount}>
                <input className={controlClass} name="amount" {...a11y("amount")} type="number"
                    min="0" step="0.01" value={values.amount} onChange={handleChange} />
            </Field>

            {submitError && (
                <Alert variant="error" className="mb-4 sm:col-span-2 lg:col-span-3">
                    No se pudo guardar: {submitError}
                </Alert>
            )}

            <div className="pt-2 text-right sm:col-span-2 lg:col-span-3">
                <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}

export default OrderForm;
