// Capa de servicios: el UNICO archivo del proyecto que conoce la URL del
// backend y que llama a fetch. Los componentes piden datos a estas funciones.
//
// La URL sale de .env (copia de .env.example). Vite solo expone las variables
// que empiezan con VITE_ y las lee al arrancar: si cambia .env, reinicie npm run dev.
// En la sesion 6 se cambia solo .env para apuntar a la API alojada.
const API_URL = import.meta.env.VITE_API_URL;

// GET /ordenes. Devuelve el arreglo completo de ordenes.
export async function obtenerOrdenes() {
    const respuesta = await fetch(`${API_URL}/ordenes`);

    // fetch solo rechaza cuando no hubo respuesta (backend apagado, sin red).
    // Un 404 o un 500 SI son respuestas: hay que convertirlas en error a mano
    // para que caigan en el catch de quien llama.
    if (!respuesta.ok) {
        throw new Error(`El servidor respondio ${respuesta.status}`);
    }

    // json() tambien es asincrono: convierte el cuerpo de texto en objetos.
    return respuesta.json();
}

// Sesion 5: aqui se agregan obtenerOrden(id), crearOrden(datos),
// actualizarOrden(id, datos) y eliminarOrden(id).
