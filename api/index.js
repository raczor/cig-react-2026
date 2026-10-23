// Vercel function that serves the Fastify app under /api (see vercel.json).
// The app is built once per instance and reused by later requests.
import { buildApp } from "../server/app.js";

let ready;

export default async function handler(req, res) {
    // A failed start (for example the database was unreachable) must not be cached:
    // forget it so the next request tries again.
    ready ??= buildApp()
        .then(async (app) => {
            await app.ready();
            return app;
        })
        .catch((error) => {
            ready = undefined;
            throw error;
        });
    const app = await ready;
    app.server.emit("request", req, res);
}
