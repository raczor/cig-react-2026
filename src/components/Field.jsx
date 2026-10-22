// The label points at the control through htmlFor, and the error carries an id
// the control references with aria-describedby (see OrderForm).
function Field({ label, name, error, children }) {
    return (
        <div className="field">
            <label className="field__label" htmlFor={`field-${name}`}>
                {label}
            </label>
            {children}
            {error && (
                <p className="field__error" id={`field-${name}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
}

export default Field;
