import { useEffect, useState } from "react";

// Hook propio: agrupa el estado y el efecto que cualquier vista necesita
// para pedir datos a la API. Lo usan el listado, el detalle y la edicion.
//
// cargar:    funcion del servicio (obtenerOrdenes, obtenerOrden...).
//            Debe ser una funcion importada, no una flecha creada en el
//            render: una flecha nueva en cada render repite la peticion sin fin.
// parametro: opcional. En el detalle es el id que llega de la URL.
export function useFetch(cargar, parametro) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cambiar intento repite el efecto porque esta en sus dependencias.
  const [intento, setIntento] = useState(0);
  const recargar = () => setIntento((n) => n + 1);

  // EFECTO: se ejecuta despues del render, no durante.
  useEffect(() => {
    let ignorar = false; // lo cambia la limpieza

    // El efecto no puede ser async: la funcion async va adentro.
    async function ejecutar() {
      setCargando(true);
      setError(null);
      try {
        const resultado = await cargar(parametro);
        if (!ignorar) setDatos(resultado);
      } catch (err) {
        // Sin conexion, o un 404/500 convertido en error por el servicio.
        if (!ignorar) setError(err.message);
      } finally {
        // Con exito o con error, la carga termina.
        if (!ignorar) setCargando(false);
      }
    }
    ejecutar();

    // Limpieza: si cambia el parametro o el componente se desmonta antes
    // de la respuesta, esa respuesta ya no es la que se espera y se descarta.
    return () => {
      ignorar = true;
    };
  }, [cargar, parametro, intento]); // al montar, al cambiar el id y al Reintentar

  // setDatos se entrega para que la vista actualice la lista despues de escribir.
  return { datos, setDatos, cargando, error, recargar };
}
