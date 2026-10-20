# React para Frontend Profesional

Proyecto base del curso **React para Frontend Profesional: Interfaces Escalables y Conexión con APIs**
Colegio de Ingenieros de Guatemala
Docente: Ing. Luis Carlos Contreras Zelada

Durante el curso este proyecto se convierte en un panel de gestión de órdenes de servicio de una empresa de climatización, conectado a una API REST.

---

## Arranque en cuatro pasos

1. Clonar este repositorio con GitHub Desktop.
2. Abrir la carpeta en Visual Studio Code.
3. Copiar el archivo `.env.example` y renombrar la copia como `.env`.
4. Abrir la terminal de VS Code (menú Terminal, Nueva terminal) y ejecutar:

```
npm install
npm run dev
```

El navegador abre en `http://localhost:5173`. Si ve la pantalla de bienvenida del curso, el entorno quedó listo.

Para detener el servidor: `Ctrl` + `C` en la terminal.

---

## Requisitos

| Herramienta | Versión mínima | Para qué |
|---|---|---|
| Node.js | 20 LTS | Ejecutar las herramientas del proyecto |
| Visual Studio Code | reciente | Editor del curso |
| GitHub Desktop | reciente | Control de versiones |
| Chrome o Edge | reciente | Navegador con React Developer Tools |

Verificación: en la terminal, `node --version` debe responder `v20` o superior.

---

## Comandos del proyecto

Esta es la lista completa. No se necesita ningún otro comando durante el curso.

| Comando | Qué hace | Desde qué sesión |
|---|---|---|
| `npm install` | Descarga las dependencias dentro de `node_modules` | Sesión 1 |
| `npm run dev` | Levanta el servidor de desarrollo en el puerto 5173 | Sesión 1 |
| `npm run api` | Levanta el backend local en el puerto 3001 | Sesión 4 |
| `npm run build` | Genera la versión de producción en `dist` | Sesión 6 |
| `npm run preview` | Sirve localmente lo generado por `npm run build` | Sesión 6 |

### La regla de las dos terminales

A partir de la sesión 4 el proyecto necesita **dos terminales abiertas al mismo tiempo**:

| Terminal | Comando | Puerto |
|---|---|---|
| 1 | `npm run dev` | 5173 |
| 2 | `npm run api` | 3001 |

En VS Code se abre una segunda terminal con el botón de dividir panel, en la esquina superior derecha del panel de terminal. Si cierra una terminal, ese servicio se detiene.

Si la aplicación muestra un error de conexión, lo primero que debe revisar es si la terminal del backend sigue corriendo.

---

## Estructura del proyecto

```
react-2026/
├── .env.example          Plantilla de variables de entorno
├── db.json               Base de datos local que sirve json-server
├── index.html            Página única donde React monta la aplicación
├── package.json          Dependencias y comandos del proyecto
├── vite.config.js        Configuración de la herramienta de construcción
└── src/
    ├── main.jsx          Punto de entrada: monta React en index.html
    ├── App.jsx           Componente raíz
    ├── App.css           Estilos del componente raíz
    ├── components/       Componentes reutilizables (sesión 2)
    ├── pages/            Vistas asociadas a una ruta (sesión 5)
    ├── services/         Funciones que hablan con la API (sesión 4)
    ├── hooks/            Hooks propios (sesión 4)
    ├── context/          Estado compartido (sesión 6)
    ├── data/             Listas cerradas (catalogos.js); datos.js se eliminó en la sesión 5
    └── styles/           Variables y estilos globales
```

Las carpetas vacías están creadas a propósito. No cree carpetas nuevas sin acordarlo: la estructura es parte de lo que se evalúa en el proyecto final.

---

## Los datos del curso

El proyecto trabaja sobre 24 órdenes de servicio de **Serviclima, S.A.**, una empresa ficticia de mantenimiento de equipos de climatización.

Campos de cada orden:

| Campo | Tipo | Ejemplo |
|---|---|---|
| `id` | número | `1` |
| `codigo` | texto | `OS-2026-001` |
| `cliente` | texto | `Distribuidora La Ceiba` |
| `nit` | texto | `1234567-8` |
| `departamento` | texto | `Guatemala` |
| `categoria` | texto | `Mantenimiento preventivo` |
| `tecnico` | texto | `Mario Ixcot` |
| `fecha` | texto ISO | `2026-01-14` |
| `horas` | número | `3.5` |
| `monto` | número | `1750` |
| `estado` | texto | `completada` |

Valores posibles:

- **departamento**: Guatemala, Sacatepéquez, Chimaltenango, Quetzaltenango, Escuintla, Alta Verapaz, Baja Verapaz, El Progreso
- **categoria**: Instalación, Mantenimiento preventivo, Reparación, Diagnóstico
- **estado**: pendiente, en proceso, completada, cancelada

Los mismos 24 registros están en dos lugares:

- `src/data/datos.js` como arreglo de JavaScript. Se usa en las sesiones 2 y 3, y se elimina en la sesión 4.
- `db.json` como base de datos servida por HTTP. Se usa desde la sesión 4 en adelante.

---

## Endpoints del backend local

Disponibles con `npm run api` corriendo, en `http://localhost:3001`.

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/ordenes` | Lista todas las órdenes |
| GET | `/ordenes/1` | Devuelve la orden con `id` 1 |
| GET | `/ordenes?departamento=Guatemala` | Filtra por valor exacto |
| GET | `/ordenes?q=Ceiba` | Busca el texto en todos los campos |
| GET | `/ordenes?_sort=fecha&_order=desc` | Ordena los resultados |
| GET | `/ordenes?_page=1&_limit=10` | Pagina los resultados |
| POST | `/ordenes` | Crea una orden nueva |
| PUT | `/ordenes/1` | Reemplaza la orden completa |
| PATCH | `/ordenes/1` | Modifica solo los campos enviados |
| DELETE | `/ordenes/1` | Elimina la orden |

Puede probar cualquier ruta `GET` escribiéndola directamente en el navegador, sin tocar React.

Las escrituras modifican el archivo `db.json` en disco. Si quiere volver al estado original, descarte los cambios de ese archivo desde GitHub Desktop.

---

## Errores frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `npm` no se reconoce como comando | Node.js no está instalado o la terminal se abrió antes de instalarlo | Instalar Node.js y cerrar y volver a abrir VS Code |
| La página carga en blanco | El servidor de desarrollo no está corriendo | Ejecutar `npm run dev` |
| `VITE_API_URL` aparece como no configurada | Falta copiar `.env.example` como `.env` | Crear el archivo `.env` y reiniciar `npm run dev` |
| Error de conexión en la aplicación | El backend no está corriendo | Abrir una segunda terminal y ejecutar `npm run api` |
| El puerto 5173 ya está en uso | Quedó otro servidor corriendo en otra ventana | Cerrar esa terminal o aceptar el puerto que ofrece Vite |
| Cambios en `.env` que no surten efecto | Vite lee las variables al arrancar | Detener con `Ctrl` + `C` y volver a ejecutar `npm run dev` |

---

## Entregas del curso

Cada sesión deja un avance versionado en este mismo repositorio. No se entregan archivos sueltos: se entrega la URL del repositorio.

| Momento | Entrega | Peso |
|---|---|---|
| Fin de sesión 2 | Catálogo con componentes y props | 20 % |
| Fin de sesión 3 | Búsqueda, filtro y formulario en memoria | 20 % |
| Fin de sesión 4 | Datos servidos por HTTP con los cuatro estados | 20 % |
| Una semana después de la sesión 6 | Proyecto completo y desplegado | 40 % |
