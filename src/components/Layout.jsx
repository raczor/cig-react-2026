import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { buttonClass } from "./ui/styles.js";

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

function sidebarLinkClass({ isActive }) {
    return `flex items-center gap-3 border-l-4 px-6 py-3 text-[0.95rem] text-white hover:bg-brand-600 ${
        isActive ? "border-brand-300 bg-brand-700 font-bold" : "border-transparent"
    }`;
}

function Layout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [params] = useSearchParams();
    const [menuOpen, setMenuOpen] = useState(false);
    const search = params.get("q") ?? "";
    const closeMenu = () => setMenuOpen(false);

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
        <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
            {/* Off-canvas drawer on phones; `invisible` keeps it out of the tab order while closed. */}
            <aside
                aria-label="Menú"
                className={`fixed inset-y-0 left-0 z-20 w-64 overflow-y-auto bg-brand-500 py-4 text-white transition-transform
                    lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 lg:visible ${
                        menuOpen ? "visible translate-x-0" : "invisible -translate-x-full"
                    }`}
            >
                <Link to="/" onClick={closeMenu} className="block px-6 pb-4 text-2xl font-bold tracking-tight">
                    Serviclima
                </Link>

                <div className="flex items-center gap-2 px-6 py-4">
                    <span
                        aria-hidden="true"
                        className="inline-flex size-12 flex-none items-center justify-center rounded-full bg-brand-100 font-bold text-brand-600"
                    >
                        SC
                    </span>
                    <p className="m-0 text-sm leading-snug opacity-90">
                        Bienvenido,
                        <br />
                        Serviclima, S.A.
                    </p>
                </div>

                <nav className="mt-2">
                    {/* `end` keeps "/" from matching every route. */}
                    <NavLink to="/" end onClick={closeMenu} className={sidebarLinkClass}>
                        <Icon name="board" /> Tablero
                    </NavLink>
                    <NavLink to="/orders/new" onClick={closeMenu} className={sidebarLinkClass}>
                        <Icon name="plus" /> Nueva orden
                    </NavLink>
                </nav>
            </aside>

            <div className="min-w-0">
                <header className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
                    <button
                        type="button"
                        aria-label="Abrir menú"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                        className="rounded-lg p-1 text-slate-600 lg:hidden"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="hidden whitespace-nowrap text-xs font-bold tracking-widest text-slate-500 lg:block">
                        ÓRDENES DE SERVICIO
                    </span>

                    {/* key remounts the input when the URL query changes (e.g. "clear filters"). */}
                    <form
                        role="search"
                        onSubmit={handleSearch}
                        className="flex min-w-0 flex-1 overflow-hidden rounded-full border border-slate-300 focus-within:border-brand-600 focus-within:outline-2 focus-within:outline-brand-600 lg:ml-auto lg:max-w-md"
                    >
                        <input
                            key={search}
                            name="q"
                            type="search"
                            placeholder="Buscar por código o cliente"
                            aria-label="Buscar por código o cliente"
                            defaultValue={search}
                            className="min-w-0 flex-1 px-4 py-2 text-sm focus:outline-none"
                        />
                        <button
                            type="submit"
                            aria-label="Buscar"
                            className="bg-brand-600 px-4 text-white hover:bg-brand-700"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-4-4" />
                            </svg>
                        </button>
                    </form>

                    <Link to="/orders/new" className={`${buttonClass()} max-lg:hidden whitespace-nowrap`}>
                        + Crear orden
                    </Link>
                </header>

                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>

            {menuOpen && (
                <div className="fixed inset-0 z-10 bg-slate-900/50 lg:hidden" onClick={closeMenu} aria-hidden="true" />
            )}
        </div>
    );
}

export default Layout;
