import type { FastifySchemaCompiler } from "fastify";
import type { ZodType } from "zod";
import { RequestValidationError } from "./RequestValidationError.js";

// An Adapter between Fastify's validation hook and the Zod schemas in shared/. The parsed value
// replaces the raw one, so handlers receive trimmed, uppercased and coerced data.
export const zodValidatorCompiler: FastifySchemaCompiler<ZodType> =
    ({ schema }) =>
    (data) => {
        const result = schema.safeParse(data);
        if (result.success) return { value: result.data };

        const issues = result.error.issues.map(({ path, message }) => ({ path: path.join("."), message }));
        return { error: new RequestValidationError(issues[0]?.message ?? "Solicitud no válida.", issues) };
    };
