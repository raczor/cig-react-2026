import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Field from "../components/Field.jsx";
import Alert from "../components/ui/Alert.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import { controlClass } from "../components/ui/styles.js";
import { useAuth } from "../auth/auth-context.js";

const credentialsSchema = z.object({
    email: z.string().trim().min(1, "Correo obligatorio.").pipe(z.email("Correo no válido.")),
    password: z.string().min(8, "Mínimo 8 caracteres."),
});

function LoginPage() {
    const { enabled, user, signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState("signIn");
    const [notice, setNotice] = useState(null);

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(credentialsSchema), defaultValues: { email: "", password: "" } });

    // Back to the page that sent the user here (see RequireAuth), or the board.
    const destination = location.state?.from ?? "/";

    // Without login there is nothing to do here, and a signed-in user does not need this page.
    if (!enabled || user) return <Navigate to={destination} replace />;

    const creating = mode === "signUp";

    function switchMode() {
        setMode(creating ? "signIn" : "signUp");
        setNotice(null);
        clearErrors("root");
    }

    async function submit({ email, password }) {
        setNotice(null);
        try {
            if (creating) {
                const signedIn = await signUp(email, password);
                if (!signedIn) {
                    setMode("signIn");
                    setNotice("Cuenta creada. Inicia sesión para continuar.");
                    return;
                }
            } else {
                await signIn(email, password);
            }
            navigate(destination, { replace: true });
        } catch (err) {
            setError("root.auth", { message: err.message });
        }
    }

    const field = (name, options) => {
        const error = errors[name];
        return {
            ...register(name, options),
            id: `field-${name}`,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error ? `field-${name}-error` : undefined,
        };
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
            <Card className="w-full max-w-sm p-6">
                <p className="mb-1 text-2xl font-bold tracking-tight text-brand-600">Serviclima</p>
                <h1 className="mb-4 text-lg font-semibold">{creating ? "Crear cuenta" : "Iniciar sesión"}</h1>

                {notice && <Alert className="mb-4">{notice}</Alert>}
                {errors.root?.auth && (
                    <Alert variant="error" className="mb-4">
                        {errors.root.auth.message}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(submit)} noValidate>
                    <Field label="Correo" name="email" error={errors.email?.message}>
                        <input className={controlClass} type="email" autoComplete="email" {...field("email")} />
                    </Field>

                    <Field label="Contraseña" name="password" error={errors.password?.message}>
                        <input
                            className={controlClass}
                            type="password"
                            autoComplete={creating ? "new-password" : "current-password"}
                            {...field("password")}
                        />
                    </Field>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Un momento..." : creating ? "Crear cuenta" : "Entrar"}
                    </Button>
                </form>

                <p className="mt-4 text-center text-slate-600">
                    {creating ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
                    <button type="button" onClick={switchMode} className="text-brand-700 hover:underline">
                        {creating ? "Inicia sesión" : "Crea una"}
                    </button>
                </p>
            </Card>
        </main>
    );
}

export default LoginPage;
