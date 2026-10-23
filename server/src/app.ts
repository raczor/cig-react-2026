import cors from "@fastify/cors";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import type { Authenticator } from "./application/Authenticator.js";
import type { OrderService } from "./application/OrderService.js";
import { authenticationHook } from "./http/authenticationHook.js";
import { handleError, handleNotFound } from "./http/errorHandler.js";
import { orderRoutes } from "./http/orderRoutes.js";
import { zodValidatorCompiler } from "./http/zodValidatorCompiler.js";

export interface AppDependencies {
    orders: OrderService;
    authenticator: Authenticator;
}

export interface AppOptions {
    logger?: FastifyServerOptions["logger"];
    /** Origins allowed to call the API from a browser; true reflects any origin. */
    corsOrigin?: string[] | true;
}

// Builds the HTTP server around the collaborators it is handed. It creates none of them, which
// keeps it testable with fakes and leaves the wiring to the composition root (createApplication).
export async function buildApp({ orders, authenticator }: AppDependencies, options: AppOptions = {}): Promise<FastifyInstance> {
    const app = Fastify({ logger: options.logger ?? false });

    app.setValidatorCompiler(zodValidatorCompiler);
    app.setErrorHandler(handleError);
    app.setNotFoundHandler(handleNotFound);

    // The default allows only GET, HEAD and POST: without PUT, PATCH and DELETE the browser's
    // preflight fails and edits, status changes and deletes never reach the API.
    await app.register(cors, {
        origin: options.corsOrigin ?? true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    });

    await app.register(
        async (api) => {
            api.get("/health", async () => ({ status: "ok" }));

            // Everything in this plugin needs a signed-in user: the hook is registered before the routes.
            await api.register(async (protectedApi) => {
                protectedApi.addHook("onRequest", authenticationHook(authenticator));
                await protectedApi.register(orderRoutes(orders));
            });
        },
        { prefix: "/api" }
    );

    return app;
}
