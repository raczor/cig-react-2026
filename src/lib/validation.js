// Inputs always yield strings, even with type="number".
export const EMPTY = {
    client: "", taxId: "", department: "", category: "",
    technician: "", date: "", hours: "", amount: "",
};

// Returns one message per invalid field; an empty object means the form is valid.
export function validate(values) {
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
export function toPayload(values) {
    return {
        ...values,
        taxId: values.taxId.trim().toUpperCase(),
        hours: Number(values.hours),
        amount: Number(values.amount),
    };
}

