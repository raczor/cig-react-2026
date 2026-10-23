// Better Auth answers in English; the UI is in Spanish.
const BAD_CREDENTIALS = "Correo o contraseña incorrectos.";
const ALREADY_EXISTS = "Ya existe una cuenta con ese correo.";
const NOT_VERIFIED = "Verifica tu correo antes de iniciar sesión.";
const ORIGIN_NOT_ALLOWED = "Este sitio todavía no está autorizado para iniciar sesión. Avisa al administrador.";
const TOO_MANY = "Demasiados intentos. Espera un momento e intenta de nuevo.";
const GENERIC = "No se pudo completar la solicitud. Intenta de nuevo.";

// The SDK throws (instead of returning an error object) when the service cannot be reached.
export const NETWORK_MESSAGE = "No se pudo conectar con el servicio de acceso. Revisa tu conexión e intenta de nuevo.";

const BY_CODE = {
    INVALID_EMAIL_OR_PASSWORD: BAD_CREDENTIALS,
    INVALID_PASSWORD: BAD_CREDENTIALS,
    USER_NOT_FOUND: BAD_CREDENTIALS,
    USER_ALREADY_EXISTS: ALREADY_EXISTS,
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: ALREADY_EXISTS,
    PASSWORD_TOO_SHORT: "La contraseña es demasiado corta.",
    PASSWORD_TOO_LONG: "La contraseña es demasiado larga.",
    EMAIL_NOT_VERIFIED: NOT_VERIFIED,
    INVALID_EMAIL: "Correo no válido.",
    INVALID_ORIGIN: ORIGIN_NOT_ALLOWED,
};

// Errors thrown by the SDK carry a generic `code`, so the English message is matched as well.
const BY_MESSAGE = [
    [/invalid origin|origin header|missing or null origin/i, ORIGIN_NOT_ALLOWED],
    [/invalid (email or )?password|user not found/i, BAD_CREDENTIALS],
    [/already exists/i, ALREADY_EXISTS],
    [/not verified/i, NOT_VERIFIED],
];

export function authErrorMessage(error) {
    if (BY_CODE[error?.code]) return BY_CODE[error.code];
    const byMessage = BY_MESSAGE.find(([pattern]) => pattern.test(error?.message ?? ""));
    if (byMessage) return byMessage[1];
    return error?.status === 429 ? TOO_MANY : GENERIC;
}

// The SDK's API errors (AuthApiError) have a numeric HTTP status; a network failure does not.
export function isApiError(error) {
    return typeof error?.status === "number";
}
