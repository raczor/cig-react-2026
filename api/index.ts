// Vercel function that serves the Fastify app under /api (see vercel.json).
// An Adapter: Vercel hands over a plain Node request and response, and the app answers them.
import type { IncomingMessage, ServerResponse } from "node:http";
import type { FastifyInstance } from "fastify";
import { loadConfig } from "../server/src/config.js";
import { createApplication } from "../server/src/createApplication.js";

// The app is built once per instance and reused by later requests.
let ready: Promise<FastifyInstance> | undefined;

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // A failed start (for example the database was unreachable) must not be cached:
    // forget it so the next request tries again.
    // Warnings (such as a rejected token and why) go to Vercel's runtime logs.
    ready ??= createApplication(loadConfig(), { logger: { level: "warn" } })
        .then(async (app) => {
            await app.ready();
            return app;
        })
        .catch((error: unknown) => {
            ready = undefined;
            throw error;
        });

    const app = await ready;
    app.server.emit("request", req, res);
}
