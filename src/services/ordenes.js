// Capa de servicios: el UNICO archivo del proyecto que conoce la URL del
// backend y que llama a fetch. Los componentes piden datos a estas funciones.
//
// La URL sale de .env (copia de .env.example). Vite solo expone las variables
// que empiezan con VITE_ y las lee al arrancar: si cambia .env, reinicie npm run dev.
// En la sesion 6 se cambia solo .env para apuntar a la API alojada.
// Sin VITE_API_URL solo se acepta el backend local, y solo en desarrollo.
const API_URL =
    import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3001" : undefined);

// ─── Cliente HTTP ─────────────────────────────────────────────

// Todas las llamadas pasan por aqui: un solo fetch, una sola revision de ok.
// body llega como objeto y se convierte a JSON aqui. La cabecera solo viaja
// cuando hay cuerpo: en un GET dispararia una peticion OPTIONS extra (CORS).
async function pedir(ruta, { body, ...opciones } = {}) {
    if (!API_URL) {
        throw new Error("Falta la variable VITE_API_URL: la aplicacion no sabe donde esta la API.");
    }
    const respuesta = await fetch(API_URL + ruta, {
        ...opciones,
        ...(body !== undefined && {
            // Sin esta cabecera json-server no interpreta el cuerpo y guarda
            // una orden que solo tiene id.
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }),
    });

    // fetch solo rechaza cuando no hubo respuesta (backend apagado, sin red).
    // Un 404 o un 500 SI son respuestas: se convierten en error a mano
    // para que caigan en el catch de quien llama.
    if (!respuesta.ok) {
        throw new Error(`El servidor respondio ${respuesta.status}`);
    }

    // json-server responde con JSON incluso en DELETE ({}).
    return respuesta.json();
}

// Un metodo por verbo HTTP: los servicios no repiten method ni JSON.stringify.
const api = {
    get: (ruta, { signal } = {}) => pedir(ruta, { signal }),
    post: (ruta, body) => pedir(ruta, { method: "POST", body }),
    put: (ruta, body) => pedir(ruta, { method: "PUT", body }),
    patch: (ruta, body) => pedir(ruta, { method: "PATCH", body }),
    delete: (ruta) => pedir(ruta, { method: "DELETE" }),
};

// ─── Ordenes ──────────────────────────────────────────────────

// GET /ordenes: el arreglo completo.
// Recibe { signal } con la misma forma que TanStack Query entrega a queryFn,
// por eso se puede pasar directo como queryFn sin una flecha intermedia.
export const obtenerOrdenes = ({ signal } = {}) => api.get("/ordenes", { signal });

// GET /ordenes/8: una orden. Si no existe, el servidor responde 404.
export const obtenerOrden = (id, { signal } = {}) => api.get(`/ordenes/${id}`, { signal });

// POST /ordenes y despues PATCH del codigo.
// El id lo asigna json-server (el mayor + 1) y el codigo depende del id,
// por eso se arma cuando el POST ya respondio.
// En un backend real el codigo lo generaria el servidor.
export async function crearOrden(datos) {
    const creada = await api.post("/ordenes", { ...datos, estado: "pendiente" });
    const codigo = "OS-2026-" + String(creada.id).padStart(3, "0"); // 25 => OS-2026-025
    return api.patch(`/ordenes/${creada.id}`, { codigo });
}

// PUT /ordenes/8: REEMPLAZA la orden completa. Lo que no venga en el
// cuerpo se pierde, por eso se usa solo con el formulario de edicion lleno.
export const actualizarOrden = (id, orden) => api.put(`/ordenes/${id}`, orden);

// PATCH /ordenes/8: COMBINA. Solo cambia el campo estado.
export const cambiarEstado = (id, estado) => api.patch(`/ordenes/${id}`, { estado });

// DELETE /ordenes/8: json-server responde 200 con {}.
export const eliminarOrden = (id) => api.delete(`/ordenes/${id}`);
