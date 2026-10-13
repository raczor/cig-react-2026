import "./Panel.css";

// Panel no sabe que lleva adentro: lo recibe en la prop children.
// Esa es toda la idea de composicion.
function Panel({ titulo, children }) {
    return (
        <section className="panel">
            <h2 className="panel__titulo">{titulo}</h2>
            {children}
        </section>
    );
}

export default Panel;
