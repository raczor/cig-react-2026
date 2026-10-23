import Fastify from "fastify";
import cors from "@fastify/cors";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { orderInputSchema, orderReplaceSchema, statusChangeSchema } from "../shared/order-schema.js";
import { createDb } from "./db.js";
import { orders } from "./schema.js";

const idParams = z.object({
    id: z.coerce.number({ error: "Id no válido." }).int("Id no válido.").positive("Id no válido."),
});

// What the API exposes: the table columns minus internal ones.
function toApi({ id, code, client, taxId, department, category, technician, date, hours, amount, status }) {
    return { id, code, client, taxId, department, category, technician, date, hours, amount, status };
}

// Lets Fastify validate with the Zod schemas in shared/. The parsed value replaces the
// raw one, so handlers receive trimmed, uppercased and coerced data.
function zodValidator({ schema }) {
    return (data) => {
        const result = schema.safeParse(data);
        if (result.success) return { value: result.data };
        const error = new Error(result.error.issues[0].message);
        error.issues = result.error.issues.map(({ path, message }) => ({ path: path.join("."), message }));
        return { error };
    };
}

export async function buildApp({ db, logger = false } = {}) {
    const database = db ?? (await createDb());
    const app = Fastify({ logger });

    app.setValidatorCompiler(zodValidator);
    // The default allows only GET, HEAD and POST: without PUT, PATCH and DELETE the browser's
    // preflight fails and edits, status changes and deletes never reach the API.
    await app.register(cors, {
        origin: process.env.CORS_ORIGIN?.split(",") ?? true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    });

    app.setErrorHandler((error, request, reply) => {
        const status = error.statusCode ?? 500;
        if (status >= 500) {
            request.log.error(error);
            return reply.code(500).send({ message: "Error interno del servidor." });
        }
        return reply.code(status).send({ message: error.message, issues: error.issues });
    });
    app.setNotFoundHandler((request, reply) => reply.code(404).send({ message: "Ruta no encontrada." }));

    const notFound = (reply) => reply.code(404).send({ message: "Orden no encontrada." });

    await app.register(
        async (api) => {
            api.get("/health", async () => ({ status: "ok" }));

            api.get("/orders", async () => {
                const rows = await database.select().from(orders).orderBy(orders.id);
                return rows.map(toApi);
            });

            api.get("/orders/:id", { schema: { params: idParams } }, async (request, reply) => {
                const [row] = await database.select().from(orders).where(eq(orders.id, request.params.id));
                return row ? toApi(row) : notFound(reply);
            });

            // The server owns id, code and status: whatever the client sends for them is ignored.
            // The id is taken from the sequence first so the code goes in with a single INSERT.
            api.post("/orders", { schema: { body: orderInputSchema } }, async (request, reply) => {
                const { rows } = await database.execute(sql`SELECT nextval(pg_get_serial_sequence('orders', 'id')) AS id`);
                const id = Number(rows[0].id);
                const code = `OS-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`;
                const [row] = await database
                    .insert(orders)
                    .values({ ...request.body, id, code, status: "pending" })
                    .returning();
                return reply.code(201).send(toApi(row));
            });

            // PUT replaces every editable field; id and code never change.
            api.put("/orders/:id", { schema: { params: idParams, body: orderReplaceSchema } }, async (request, reply) => {
                const [row] = await database.update(orders).set(request.body).where(eq(orders.id, request.params.id)).returning();
                return row ? toApi(row) : notFound(reply);
            });

            api.patch("/orders/:id", { schema: { params: idParams, body: statusChangeSchema } }, async (request, reply) => {
                const [row] = await database
                    .update(orders)
                    .set({ status: request.body.status })
                    .where(eq(orders.id, request.params.id))
                    .returning();
                return row ? toApi(row) : notFound(reply);
            });

            api.delete("/orders/:id", { schema: { params: idParams } }, async (request, reply) => {
                const rows = await database.delete(orders).where(eq(orders.id, request.params.id)).returning({ id: orders.id });
                return rows.length > 0 ? reply.code(204).send() : notFound(reply);
            });
        },
        { prefix: "/api" }
    );

    return app;
}
