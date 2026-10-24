export interface ValidationIssue {
    path: string;
    message: string;
}

// A request body or parameter that does not satisfy its schema. Fastify keeps this very instance
// and sets statusCode 400 on it, which the error handler relies on.
export class RequestValidationError extends Error {
    statusCode = 400;

    constructor(message: string, readonly issues: ValidationIssue[]) {
        super(message);
        this.name = "RequestValidationError";
    }
}
