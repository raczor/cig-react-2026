import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./Layout.css";

const ICONS = {
    board: <path d="M3 4h4v16H3zM10 4h4v10h-4zM17 4h4v13h-4z" />,
    plus: <path d="M12 5v14M5 12h14" />,
};

function Icon({ name }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICONS[name]}
        </svg>
    );
}

function Layout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [params] = useSearchParams();
    const [menuOpen, setMenuOpen] = useState(false);
    const search = params.get("q") ?? "";

    // The search lives in the URL (?q=) so it combines with the board filters.
    // From other pages it starts a fresh search on the board.
    function handleSearch(event) {
        event.preventDefault();
        const text = new FormData(event.currentTarget).get("q").trim();
        const next = new URLSearchParams(pathname === "/" ? params : "");
        if (text === "") next.delete("q");
        else next.set("q", text);
        navigate({ pathname: "/", search: next.toString() });
    }

    return (
        <div className={`shell${menuOpen ? " shell--menu-open" : ""}`}>
            <aside className="sidebar" aria-label="Menú">
                <Link to="/" className="sidebar__brand" onClick={() => setMenuOpen(false)}>
                    Serviclima
                </Link>

                <div className="sidebar__profile">
                    <span className="sidebar__avatar" aria-hidden="true">SC</span>
                    <p className="sidebar__welcome">
                        Bienvenido,
                        <br />
                        Serviclima, S.A.
                    </p>
                </div>

                <nav className="sidebar__nav">
                    {/* `end` keeps "/" from matching every route. */}
                    <NavLink to="/" end className="sidebar__link" onClick={() => setMenuOpen(false)}>
                        <Icon name="board" /> Tablero
                    </NavLink>
                    <NavLink to="/orders/new" className="sidebar__link" onClick={() => setMenuOpen(false)}>
                        <Icon name="plus" /> Nueva orden
                    </NavLink>
                </nav>
            </aside>

            <div className="shell__main">
                <header className="topbar">
                    <button
                        type="button"
                        className="topbar__menu"
                        aria-label="Abrir menú"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="topbar__title">ÓRDENES DE SERVICIO</span>

                    {/* key remounts the input when the URL query changes (e.g. "clear filters"). */}
                    <form className="search" role="search" onSubmit={handleSearch}>
                        <input
                            key={search}
                            className="search__input"
                            name="q"
                            type="search"
                            placeholder="Buscar por código o cliente"
                            aria-label="Buscar por código o cliente"
                            defaultValue={search}
                        />
                        <button className="search__button" type="submit" aria-label="Buscar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-4-4" />
                            </svg>
                        </button>
                    </form>

                    <Link to="/orders/new" className="topbar__create">
                        + Crear orden
                    </Link>
                </header>

                <main className="container">
                    <Outlet />
                </main>
            </div>

            {menuOpen && <div className="shell__scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
        </div>
    );
}

export default Layout;
