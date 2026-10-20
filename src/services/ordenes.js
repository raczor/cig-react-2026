// Capa de servicios: el UNICO archivo del proyecto que conoce la URL del
// backend y que llama a fetch. Los componentes piden datos a estas funciones.
//
// La URL sale de .env (copia de .env.example). Vite solo expone las variables
// que empiezan con VITE_ y las lee al arrancar: si cambia .env, reinicie npm run dev.
// En la sesion 6 se cambia solo .env para apuntar a la API alojada.
const API_URL = import.meta.env.VITE_API_URL;

// Todas las llamadas pasan por aqui: un solo fetch, una sola revision de ok.
// opciones trae method y body; headers se agrega siempre.
async function pedir(ruta, opciones = {}) {
    const respuesta = await fetch(API_URL + ruta, {
        // Sin esta cabecera json-server no interpreta el cuerpo y guarda
        // una orden que solo tiene id.
        headers: { "Content-Type": "application/json" },
        ...opciones,
    });

    // fetch solo rechaza cuando no hubo respuesta (backend apagado, sin red).
    // Un 404 o un 500 SI son respuestas: se convierten en error a mano
    // para que caigan en el catch de quien llama.
    if (!respuesta.ok) {
        throw new Error(`El servidor respondio ${respuesta.status}`);
    }

    // json() tambien es asincrono: convierte el cuerpo de texto en objetos.
    // json-server responde con JSON incluso en DELETE ({}).
    return respuesta.json();
}

// GET /ordenes: el arreglo completo.
export const obtenerOrdenes = () => pedir("/ordenes");

// GET /ordenes/8: una orden. Si no existe, el servidor responde 404.
export const obtenerOrden = (id) => pedir(`/ordenes/${id}`);

// POST /ordenes y despues PATCH del codigo.
// El id lo asigna json-server (el mayor + 1) y el codigo depende del id,
// por eso se arma cuando el POST ya respondio.
// En un backend real el codigo lo generaria el servidor.
export async function crearOrden(datos) {
    // 1. POST sin id: el cuerpo viaja como texto JSON.
    const creada = await pedir("/ordenes", {
        method: "POST",
        body: JSON.stringify({ ...datos, estado: "pendiente" }),
    });

    // 2. Con el id ya conocido se arma el codigo: 25 => OS-2026-025.
    const codigo = "OS-2026-" + String(creada.id).padStart(3, "0");

    // 3. PATCH: solo viaja el campo que faltaba. Devuelve la orden completa.
    return pedir(`/ordenes/${creada.id}`, {
        method: "PATCH",
        body: JSON.stringify({ codigo }),
    });
}

// PUT /ordenes/8: REEMPLAZA la orden completa. Lo que no venga en el
// cuerpo se pierde, por eso se usa solo con el formulario de edicion lleno.
export const actualizarOrden = (id, orden) =>
    pedir(`/ordenes/${id}`, {
        method: "PUT",
        body: JSON.stringify(orden),
    });

// PATCH /ordenes/8: COMBINA. Solo cambia el campo estado.
export const cambiarEstado = (id, estado) =>
    pedir(`/ordenes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ estado }),
    });

// DELETE /ordenes/8: json-server responde 200 con {}.
export const eliminarOrden = (id) =>
    pedir(`/ordenes/${id}`, { method: "DELETE" });
