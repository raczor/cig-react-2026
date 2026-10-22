import "./Panel.css";

function Panel({ title, children }) {
    return (
        <section className="panel">
            <h2 className="panel__title">{title}</h2>
            {children}
        </section>
    );
}

export default Panel;
