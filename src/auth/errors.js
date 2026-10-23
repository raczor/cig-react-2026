// Better Auth answers in English; the UI is in Spanish.
const MESSAGES = {
    INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos.",
    INVALID_PASSWORD: "Correo o contraseña incorrectos.",
    USER_NOT_FOUND: "Correo o contraseña incorrectos.",
    USER_ALREADY_EXISTS: "Ya existe una cuenta con ese correo.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Ya existe una cuenta con ese correo.",
    PASSWORD_TOO_SHORT: "La contraseña es demasiado corta.",
    PASSWORD_TOO_LONG: "La contraseña es demasiado larga.",
    EMAIL_NOT_VERIFIED: "Verifica tu correo antes de iniciar sesión.",
    INVALID_EMAIL: "Correo no válido.",
};

// The SDK throws (instead of returning an error object) when the service cannot be reached.
export const NETWORK_MESSAGE = "No se pudo conectar con el servicio de acceso. Revisa tu conexión e intenta de nuevo.";

export function authErrorMessage(error) {
    return MESSAGES[error?.code] ?? "No se pudo completar la solicitud. Intenta de nuevo.";
}
