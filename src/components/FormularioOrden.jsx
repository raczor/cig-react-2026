import { useState } from "react";
import Campo from "./Campo.jsx";
import { DEPARTAMENTOS, CATEGORIAS } from "../data/catalogos.js";
import "./FormularioOrden.css";

// Valores iniciales. Fuera del componente porque se reutilizan para limpiar.
// Todos son texto: un input siempre entrega texto, aunque sea type="number".
const VACIO = {
    cliente: "", nit: "", departamento: "", categoria: "",
    tecnico: "", fecha: "", horas: "", monto: "",
};

// Devuelve un objeto con un mensaje por cada campo invalido.
// Un objeto vacio {} significa que el formulario es valido.
function validar(datos) {
    const errores = {};
    if (datos.cliente.trim() === "") errores.cliente = "Cliente obligatorio.";

    // NIT: digitos, guion opcional y digito verificador (numero o K), o CF.
    const nit = datos.nit.trim().toUpperCase();
    if (nit === "") errores.nit = "NIT obligatorio. Use CF si no tiene.";
    else if (nit !== "CF" && !/^\d{1,12}-?[\dK]$/.test(nit))
        errores.nit = "Formato de NIT: 1234567-8 o CF.";

    if (datos.departamento === "") errores.departamento = "Seleccione un departamento.";
    if (datos.categoria === "") errores.categoria = "Seleccione una categoria.";
    if (datos.tecnico.trim() === "") errores.tecnico = "Tecnico obligatorio.";
    if (datos.fecha === "") errores.fecha = "Fecha obligatoria.";

    // Number("") es 0 y Number("abc") es NaN: las dos fallan la comparacion.
    const horas = Number(datos.horas);
    if (!(horas > 0 && horas <= 24)) errores.horas = "Horas entre 0 y 24.";
    if (!(Number(datos.monto) > 0)) errores.monto = "Monto mayor que cero.";

    return errores;
}

function FormularioOrden({ onAgregar }) {
    const [datos, setDatos] = useState(VACIO);
    const [errores, setErrores] = useState({});

    // Un solo manejador para los ocho campos: el atributo name dice cual cambio.
    function manejarCambio(evento) {
        const { name, value } = evento.target;
        // [name]: value usa el nombre del campo como clave del objeto.
        setDatos((anteriores) => ({ ...anteriores, [name]: value }));
    }

    function manejarEnvio(evento) {
        // 1. Sin esto el navegador recarga la pagina y el estado se pierde.
        evento.preventDefault();

        // 2. Validar y mostrar los errores encontrados.
        const encontrados = validar(datos);
        setErrores(encontrados);

        // 3. Si hay al menos un error, no se entrega nada.
        if (Object.keys(encontrados).length > 0) return;

        // 4. Entregar al padre con los numeros ya convertidos.
        //    Si monto llegara como texto, el resumen concatenaria en vez de sumar.
        onAgregar({
            ...datos,
            nit: datos.nit.trim().toUpperCase(),
            horas: Number(datos.horas),
            monto: Number(datos.monto),
        });

        // 5. Limpiar el formulario.
        setDatos(VACIO);
    }

    return (
        // noValidate: la validacion la hace React, no el navegador.
        <form className="formulario" onSubmit={manejarEnvio} noValidate>
            <Campo etiqueta="Cliente" error={errores.cliente}>
                <input className="campo__control" name="cliente"
                    value={datos.cliente} onChange={manejarCambio} />
            </Campo>

            <Campo etiqueta="NIT" error={errores.nit}>
                <input className="campo__control" name="nit" placeholder="1234567-8 o CF"
                    value={datos.nit} onChange={manejarCambio} />
            </Campo>

            <Campo etiqueta="Departamento" error={errores.departamento}>
                <select className="campo__control" name="departamento"
                    value={datos.departamento} onChange={manejarCambio}>
                    <option value="">Seleccione</option>
                    {DEPARTAMENTOS.map((nombre) => (
                        <option key={nombre} value={nombre}>{nombre}</option>
                    ))}
                </select>
            </Campo>

            <Campo etiqueta="Categoria" error={errores.categoria}>
                <select className="campo__control" name="categoria"
                    value={datos.categoria} onChange={manejarCambio}>
                    <option value="">Seleccione</option>
                    {CATEGORIAS.map((nombre) => (
                        <option key={nombre} value={nombre}>{nombre}</option>
                    ))}
                </select>
            </Campo>

            <Campo etiqueta="Tecnico" error={errores.tecnico}>
                <input className="campo__control" name="tecnico"
                    value={datos.tecnico} onChange={manejarCambio} />
            </Campo>

            <Campo etiqueta="Fecha" error={errores.fecha}>
                {/* type="date" entrega texto ISO: "2026-10-14" */}
                <input className="campo__control" name="fecha" type="date"
                    value={datos.fecha} onChange={manejarCambio} />
            </Campo>

            <Campo etiqueta="Horas" error={errores.horas}>
                <input className="campo__control" name="horas" type="number"
                    min="0" step="0.25" value={datos.horas} onChange={manejarCambio} />
            </Campo>

            <Campo etiqueta="Monto (Q)" error={errores.monto}>
                <input className="campo__control" name="monto" type="number"
                    min="0" step="0.01" value={datos.monto} onChange={manejarCambio} />
            </Campo>

            <div className="formulario__acciones">
                <button className="boton" type="submit">Registrar orden</button>
            </div>
        </form>
    );
}

export default FormularioOrden;
