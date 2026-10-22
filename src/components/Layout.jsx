import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

function Layout() {
    return (
        <div className="container">
            <header className="page-header">
                <p className="page-header__label">Serviclima, S.A.</p>
                <h1>Panel de órdenes de servicio</h1>

                <nav className="nav">
                    {/* `end` keeps "/" from matching every route. */}
                    <NavLink to="/" end className="nav__link">
                        Órdenes
                    </NavLink>
                    <NavLink to="/orders/new" className="nav__link">
                        Nueva orden
                    </NavLink>
                </nav>
            </header>

            <Outlet />
        </div>
    );
}

export default Layout;
