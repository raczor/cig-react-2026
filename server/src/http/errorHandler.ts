import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AuthError } from "../application/Authenticator.js";
import { OrderNotFoundError } from "../domain/order.js";
import { RequestValidationError } from "./RequestValidationError.js";

// The one place where application errors become HTTP answers, so services and repositories
// never need to know about status codes.
export function handleError(error: FastifyError, request: FastifyRequest, reply: FastifyReply): FastifyReply {
    if (error instanceof AuthError) {
        // Why a token was refused (wrong issuer, expired, bad signature...) goes to the log, not the client.
        if (error.detail) request.log.warn({ reason: error.detail }, "token rejected");
        return reply.code(error.statusCode).send({ message: error.message });
    }

    if (error instanceof OrderNotFoundError) {
        return reply.code(404).send({ message: "Orden no encontrada." });
    }

    if (error instanceof RequestValidationError) {
        return reply.code(400).send({ message: error.message, issues: error.issues });
    }

    // Fastify's own client errors: malformed JSON, unsupported content type, payload too large...
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        return reply.code(error.statusCode).send({ message: error.message });
    }

    request.log.error(error);
    return reply.code(500).send({ message: "Error interno del servidor." });
}

export function handleNotFound(_request: FastifyRequest, reply: FastifyReply): FastifyReply {
    return reply.code(404).send({ message: "Ruta no encontrada." });
}
