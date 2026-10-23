import type { FastifyInstance } from "fastify";
import { buildApp, type AppOptions } from "../../server/src/app.js";
import { OrderService } from "../../server/src/application/OrderService.js";
import type { Authenticator } from "../../server/src/application/Authenticator.js";
import { YearlySequenceCodeGenerator } from "../../server/src/domain/orderCode.js";
import { AnonymousAuthenticator } from "../../server/src/infrastructure/auth/AnonymousAuthenticator.js";
import { createDatabase } from "../../server/src/infrastructure/database/createDatabase.js";
import type { Database } from "../../server/src/infrastructure/database/Database.js";
import { resetData } from "../../server/src/infrastructure/database/setup.js";
import { DrizzleOrderRepository } from "../../server/src/infrastructure/persistence/DrizzleOrderRepository.js";

export interface TestApp {
    app: FastifyInstance;
    db: Database;
    /** Back to the 24 seeded orders, ids restarted. Call it before every test. */
    reset(): Promise<void>;
    close(): Promise<void>;
}

// The real stack (Fastify, service, Drizzle repository) over a given database. Only authentication
// is chosen by the test: open by default, or any Authenticator.
export async function buildTestApp(
    db: Database,
    options: { authenticator?: Authenticator; logger?: AppOptions["logger"] } = {}
): Promise<FastifyInstance> {
    const orders = new OrderService(new DrizzleOrderRepository(db), new YearlySequenceCodeGenerator());
    return buildApp(
        { orders, authenticator: options.authenticator ?? new AnonymousAuthenticator() },
        options.logger === undefined ? {} : { logger: options.logger }
    );
}

// A fresh in-memory Postgres (PGlite) plus the app on top of it.
export async function createTestApp(options: { authenticator?: Authenticator; logger?: AppOptions["logger"] } = {}): Promise<TestApp> {
    const db = await createDatabase({});
    const app = await buildTestApp(db, options);
    return { app, db, reset: () => resetData(db), close: () => app.close() };
}
