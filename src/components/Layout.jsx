import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

// Lo comun a todas las vistas se escribe una sola vez.
// Outlet marca el lugar donde React Router dibuja la ruta hija.
function Layout() {
    return (
        <div className="contenedor">
            <header className="cabecera">
                <p className="cabecera__etiqueta">Serviclima, S.A.</p>
                <h1>Panel de ordenes de servicio</h1>

                {/* NavLink agrega la clase "active" al enlace de la ruta actual.
            end: "/" solo queda activo en "/" y no en todas las rutas. */}
                <nav className="navegacion">
                    <NavLink to="/" end className="navegacion__enlace">
                        Ordenes
                    </NavLink>
                    <NavLink to="/ordenes/nueva" className="navegacion__enlace">
                        Nueva orden
                    </NavLink>
                </nav>
            </header>

            {/* Aqui entra ListadoOrdenes, DetalleOrden, NuevaOrden... */}
            <Outlet />
        </div>
    );
}

export default Layout;
