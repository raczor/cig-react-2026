import type { FastifyInstance } from "fastify";
import { buildApp, type AppOptions } from "./app.js";
import { OrderService } from "./application/OrderService.js";
import type { AppConfig } from "./config.js";
import { YearlySequenceCodeGenerator } from "./domain/orderCode.js";
import { createAuthenticator } from "./infrastructure/auth/createAuthenticator.js";
import { createDatabase } from "./infrastructure/database/createDatabase.js";
import { DrizzleOrderRepository } from "./infrastructure/persistence/DrizzleOrderRepository.js";

// The composition root: the only place that knows which concrete class implements each interface.
// Everything above it depends on abstractions; swapping an implementation is an edit here.
export async function createApplication(config: AppConfig, options: Omit<AppOptions, "corsOrigin"> = {}): Promise<FastifyInstance> {
    const database = await createDatabase(config.database);
    const orders = new OrderService(new DrizzleOrderRepository(database), new YearlySequenceCodeGenerator());
    const authenticator = createAuthenticator(config.auth);

    return buildApp({ orders, authenticator }, { ...options, corsOrigin: config.corsOrigin });
}
