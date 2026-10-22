import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./Layout.css";

function Layout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [params] = useSearchParams();
    const search = params.get("q") ?? "";

    // The search lives in the URL (?q=) so it combines with the sidebar filters.
    // From other pages it starts a fresh search on the list.
    function handleSearch(event) {
        event.preventDefault();
        const text = new FormData(event.currentTarget).get("q").trim();
        const next = new URLSearchParams(pathname === "/" ? params : "");
        if (text === "") next.delete("q");
        else next.set("q", text);
        navigate({ pathname: "/", search: next.toString() });
    }

    return (
        <>
            <header className="site-header">
                <div className="site-header__bar">
                    <Link to="/" className="brand">
                        Serviclima
                    </Link>

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
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-4-4" />
                            </svg>
                        </button>
                    </form>

                    <Link to="/orders/new" className="site-header__action">
                        Nueva orden
                    </Link>
                </div>

                <nav className="site-nav" aria-label="Principal">
                    {/* `end` keeps "/" from matching every route. */}
                    <NavLink to="/" end className="site-nav__link">
                        Órdenes
                    </NavLink>
                    <NavLink to="/orders/new" className="site-nav__link">
                        Nueva orden
                    </NavLink>
                </nav>
            </header>

            <main className="container">
                <Outlet />
            </main>
        </>
    );
}

export default Layout;
