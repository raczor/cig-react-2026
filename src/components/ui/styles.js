// Shared look for <input> and <select>.
export const controlClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm " +
    "focus:border-brand-600 focus:outline-2 focus:outline-brand-600 aria-[invalid=true]:border-rose-500";

const BUTTON_BASE =
    "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors " +
    "disabled:cursor-not-allowed disabled:opacity-50";

const BUTTON_VARIANTS = {
    primary: "border-transparent bg-brand-600 text-white hover:bg-brand-700",
    secondary: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    danger: "border-rose-300 bg-white text-rose-700 hover:bg-rose-50",
    destructive: "border-transparent bg-rose-600 text-white hover:bg-rose-700",
};

const BUTTON_SIZES = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
};

// Class string for anything that should look like a button, including <Link>.
export function buttonClass({ variant = "primary", size = "md", className = "" } = {}) {
    return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`;
}

export const selectClass = `${controlClass} select-chevron`;
