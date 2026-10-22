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
    if (nit === "") errores.nit = "NIT obligatorio. Usa CF si no tienes.";
    else if (nit !== "CF" && !/^\d{1,12}-?[\dK]$/.test(nit))
        errores.nit = "Formato de NIT: 1234567-8 o CF.";

    if (datos.departamento === "") errores.departamento = "Selecciona un departamento.";
    if (datos.categoria === "") errores.categoria = "Selecciona una categoría.";
    if (datos.tecnico.trim() === "") errores.tecnico = "Técnico obligatorio.";
    if (datos.fecha === "") errores.fecha = "Fecha obligatoria.";

    // Number("") es 0 y Number("abc") es NaN: las dos fallan la comparacion.
    const horas = Number(datos.horas);
    if (!(horas > 0 && horas <= 24)) errores.horas = "Horas entre 0 y 24.";
    if (!(Number(datos.monto) > 0)) errores.monto = "Monto mayor que cero.";

    return errores;
}

// Convierte los textos del formulario a los tipos que guarda la API.
// Si monto llegara como texto, el resumen concatenaria en vez de sumar.
function convertir(datos) {
    return {
        ...datos,
        nit: datos.nit.trim().toUpperCase(),
        horas: Number(datos.horas),
        monto: Number(datos.monto),
    };
}

// El mismo formulario sirve para registrar y para editar:
// - inicial:    VACIO al registrar; la orden que trajo el GET al editar.
// - onGuardar:  funcion async de la pagina (crearOrden o actualizarOrden).
//               Tiene que devolver la promesa para que aqui se pueda esperar.
// - textoBoton: "Registrar orden" o "Guardar cambios".
// El formulario no sabe si crea o edita: lo decide la pagina que lo usa.
function FormularioOrden({ inicial = VACIO, onGuardar, textoBoton = "Guardar" }) {
    // useState solo lee inicial al MONTAR. Por eso EditarOrden dibuja el
    // formulario hasta que la orden ya llego.
    const [datos, setDatos] = useState(inicial);
    const [errores, setErrores] = useState({});

    // Estados de la escritura: mientras viaja la peticion y si fallo.
    const [enviando, setEnviando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState(null);

    // Un solo manejador para los ocho campos: el atributo name dice cual cambio.
    function manejarCambio(evento) {
        const { name, value } = evento.target;
        // [name]: value usa el nombre del campo como clave del objeto.
        setDatos((anteriores) => ({ ...anteriores, [name]: value }));
    }

    // Atributos de accesibilidad de cada control: el id que el label espera y,
    // si el campo tiene error, aria-invalid y aria-describedby hacia su mensaje.
    function accesibilidad(nombre) {
        const conError = Boolean(errores[nombre]);
        return {
            id: `campo-${nombre}`,
            "aria-invalid": conError || undefined,
            "aria-describedby": conError ? `campo-${nombre}-error` : undefined,
        };
    }

    async function manejarEnvio(evento) {
        // 1. Sin esto el navegador recarga la pagina y el estado se pierde.
        evento.preventDefault();

        // 2. Validar y mostrar los errores encontrados.
        const encontrados = validar(datos);
        setErrores(encontrados);

        // 3. Si hay al menos un error, no se envia nada. El foco pasa al primer
        //    campo invalido: asi un lector de pantalla anuncia su error (aria-describedby).
        const primero = Object.keys(encontrados)[0];
        if (primero) {
            document.getElementById(`campo-${primero}`)?.focus();
            return;
        }

        // 4. Enviar. El boton queda deshabilitado mientras la peticion viaja:
        //    sin eso, un doble clic registra la orden dos veces.
        setEnviando(true);
        setErrorEnvio(null);
        try {
            await onGuardar(convertir(datos));
            // 5. Limpiar solo si se guardo. Va dentro del try: si onGuardar
            //    falla, salta al catch y lo escrito se conserva para reintentar.
            setDatos(inicial);
        } catch (err) {
            setErrorEnvio(err.message);
        } finally {
            setEnviando(false);
        }
    }

    return (
        // noValidate: la validacion la hace React, no el navegador.
        <form className="formulario" onSubmit={manejarEnvio} noValidate>
            <Campo etiqueta="Cliente" nombre="cliente" error={errores.cliente}>
                <input className="campo__control" name="cliente" {...accesibilidad("cliente")}
                    value={datos.cliente} onChange={manejarCambio} />
            </Campo>

            <Campo etiqueta="NIT" nombre="nit" error={errores.nit}>
                <input className="campo__control" name="nit" {...accesibilidad("nit")} placeholder="1234567-8 o CF"
                    value={datos.nit} onChange={manejarCambio} />
            </Campo>

            <Campo etiqueta="Departamento" nombre="departamento" error={errores.departamento}>
                <select className="campo__control" name="departamento" {...accesibilidad("departamento")}
                    value={datos.departamento} onChange={manejarCambio}>
                    <option value="">Selecciona</option>
                    {DEPARTAMENTOS.map((nombre) => (
                        <option key={nombre} value={nombre}>{nombre}</option>
                    ))}
                </select>
            </Campo>

            <Campo etiqueta="Categoría" nombre="categoria" error={errores.categoria}>
                <select className="campo__control" name="categoria" {...accesibilidad("categoria")}
                    value={datos.categoria} onChange={manejarCambio}>
                    <option value="">Selecciona</option>
                    {CATEGORIAS.map((nombre) => (
                        <option key={nombre} value={nombre}>{nombre}</option>
                    ))}
                </select>
            </Campo>

            <Campo etiqueta="Técnico" nombre="tecnico" error={errores.tecnico}>
                <input className="campo__control" name="tecnico" {...accesibilidad("tecnico")}
                    value={datos.tecnico} onChange={manejarCambio} />
            </Campo>

            <Campo etiqueta="Fecha" nombre="fecha" error={errores.fecha}>
                {/* type="date" entrega texto ISO: "2026-10-14" */}
                <input className="campo__control" name="fecha" {...accesibilidad("fecha")} type="date"
                    value={datos.fecha} onChange={manejarCambio} />
            </Campo>

            <Campo etiqueta="Horas" nombre="horas" error={errores.horas}>
                <input className="campo__control" name="horas" {...accesibilidad("horas")} type="number"
                    min="0" step="0.25" value={datos.horas} onChange={manejarCambio} />
            </Campo>

            <Campo etiqueta="Monto (Q)" nombre="monto" error={errores.monto}>
                <input className="campo__control" name="monto" {...accesibilidad("monto")} type="number"
                    min="0" step="0.01" value={datos.monto} onChange={manejarCambio} />
            </Campo>

            {errorEnvio && (
                <p className="mensaje mensaje--error formulario__error" role="alert">
                    No se pudo guardar: {errorEnvio}
                </p>
            )}

            <div className="formulario__acciones">
                <button className="boton" type="submit" disabled={enviando}>
                    {enviando ? "Guardando..." : textoBoton}
                </button>
            </div>
        </form>
    );
}

export default FormularioOrden;
