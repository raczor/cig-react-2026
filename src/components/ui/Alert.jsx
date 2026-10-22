const VARIANTS = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    neutral: "border-slate-200 bg-white text-slate-600",
};

// Errors are announced to screen readers; neutral messages (loading, empty) are not.
function Alert({ variant = "neutral", className = "", ...props }) {
    return (
        <div
            role={variant === "error" ? "alert" : undefined}
            className={`rounded-xl border p-4 text-center ${VARIANTS[variant]} ${className}`}
            {...props}
        />
    );
}

export default Alert;
