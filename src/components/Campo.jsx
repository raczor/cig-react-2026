// Envoltorio de un campo de formulario: etiqueta, control y mensaje de error.
// No sabe que control lleva adentro: lo recibe en children (composicion, sesion 2).
// Las clases campo, campo__etiqueta y campo__error ya existen en global.css.

function Campo({ etiqueta, error, children }) {
    return (
        <label className="campo">
            <span className="campo__etiqueta">{etiqueta}</span>
            {children}
            {error && <p className="campo__error">{error}</p>}
        </label>
    );
}

export default Campo;
