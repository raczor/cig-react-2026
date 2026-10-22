// The label points at the control through htmlFor, and the error carries an id
// the control references with aria-describedby (see OrderForm).
function Field({ label, name, error, children }) {
    return (
        <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={`field-${name}`}>
                {label}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-xs text-rose-700" id={`field-${name}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
}

export default Field;
