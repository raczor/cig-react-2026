// Envoltorio de un campo de formulario: etiqueta, control y mensaje de error.
// No sabe que control lleva adentro: lo recibe en children (composicion, sesion 2).
// Las clases campo, campo__etiqueta y campo__error ya existen en global.css.
//
// Accesibilidad: el label apunta al control con htmlFor y el error lleva un id
// para que el control lo referencie con aria-describedby. El control recibe el
// mismo id: id={`campo-${nombre}`} (ver FormularioOrden).

function Campo({ etiqueta, nombre, error, children }) {
    return (
        <div className="campo">
            <label className="campo__etiqueta" htmlFor={`campo-${nombre}`}>
                {etiqueta}
            </label>
            {children}
            {error && (
                <p className="campo__error" id={`campo-${nombre}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
}

export default Campo;
