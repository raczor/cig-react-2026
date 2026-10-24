// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../../server/src/app.js";
import { OrderService } from "../../../server/src/application/OrderService.js";
import { YearlySequenceCodeGenerator } from "../../../server/src/domain/orderCode.js";
import { AnonymousAuthenticator } from "../../../server/src/infrastructure/auth/AnonymousAuthenticator.js";
import { InMemoryOrderRepository } from "../../support/InMemoryOrderRepository.js";
import { validInput } from "../../support/fixtures.js";

// The whole HTTP layer on a fake repository: no database involved, so a failure can be staged.
class BrokenRepository extends InMemoryOrderRepository {
    override async findAll(): Promise<never> {
        throw new Error("connection to db-prod.internal refused (password=hunter2)");
    }
}

let app: FastifyInstance;
afterEach(() => app.close());

async function appOver(repository: InMemoryOrderRepository, lines: Array<Record<string, unknown>> = []) {
    const stream = { write: (line: string) => void lines.push(JSON.parse(line) as Record<string, unknown>) };
    app = await buildApp(
        { orders: new OrderService(repository, new YearlySequenceCodeGenerator()), authenticator: new AnonymousAuthenticator() },
        { logger: { level: "error", stream } }
    );
    return app;
}

describe("unexpected failures", () => {
    it("answer a generic 500 and never leak the internal error to the client", async () => {
        const response = await (await appOver(new BrokenRepository())).inject({ method: "GET", url: "/api/orders" });

        expect(response.statusCode).toBe(500);
        expect(response.json()).toEqual({ message: "Error interno del servidor." });
        expect(response.body).not.toContain("hunter2");
        expect(response.body).not.toContain("db-prod");
    });

    it("are logged with the real cause, for whoever operates the server", async () => {
        const lines: Array<Record<string, unknown>> = [];
        await (await appOver(new BrokenRepository(), lines)).inject({ method: "GET", url: "/api/orders" });

        expect(JSON.stringify(lines)).toContain("connection to db-prod.internal refused");
    });

    it("do not stop the server from answering the next request", async () => {
        const server = await appOver(new BrokenRepository());

        await server.inject({ method: "GET", url: "/api/orders" });

        expect((await server.inject({ method: "GET", url: "/api/health" })).statusCode).toBe(200);
    });
});

describe("client mistakes Fastify itself detects", () => {
    it("answers 400 for a body that is not JSON", async () => {
        const response = await (await appOver(new InMemoryOrderRepository())).inject({
            method: "POST",
            url: "/api/orders",
            headers: { "content-type": "application/json" },
            payload: "{not json",
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toHaveProperty("message");
    });

    it("answers 415 for a content type it cannot read, as a JSON message", async () => {
        const response = await (await appOver(new InMemoryOrderRepository())).inject({
            method: "POST",
            url: "/api/orders",
            headers: { "content-type": "text/xml" },
            payload: "<order/>",
        });

        expect(response.statusCode).toBe(415);
        expect(response.json()).toHaveProperty("message");
    });
});

describe("routes are thin: the service decides", () => {
    it("create answers 201 with what the service returned, including the code from its generator", async () => {
        const response = await (await appOver(new InMemoryOrderRepository())).inject({ method: "POST", url: "/api/orders", payload: { ...validInput } });

        expect(response.statusCode).toBe(201);
        expect(response.json()).toMatchObject({ id: 1, status: "pending", code: `OS-${new Date().getFullYear()}-001` });
    });

    it("an unknown order is a 404 whichever route asked for it", async () => {
        const server = await appOver(new InMemoryOrderRepository());

        for (const [method, url, payload] of [
            ["GET", "/api/orders/5"],
            ["PUT", "/api/orders/5", { ...validInput }],
            ["PATCH", "/api/orders/5", { status: "completed" }],
            ["DELETE", "/api/orders/5"],
        ] as const) {
            const response = await server.inject({ method, url, ...(payload ? { payload } : {}) });
            expect([method, response.statusCode, response.json().message]).toEqual([method, 404, "Orden no encontrada."]);
        }
    });
});
