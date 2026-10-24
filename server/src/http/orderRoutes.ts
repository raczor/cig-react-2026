import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import {
    orderInputSchema,
    orderReplaceSchema,
    statusChangeSchema,
    type OrderInput,
    type OrderReplace,
    type StatusChange,
} from "../../../shared/order-schema.js";
import type { OrderService } from "../application/OrderService.js";

const idParams = z.object({
    id: z.coerce.number({ error: "Id no válido." }).int("Id no válido.").positive("Id no válido."),
});
type IdParams = { id: number };

// The HTTP face of OrderService: each handler reads the request, calls one use case, and answers.
// Rules live in the service and error answers in the error handler, so there is nothing else here.
export function orderRoutes(service: OrderService): FastifyPluginAsync {
    return async (api) => {
        api.get("/orders", () => service.list());

        api.get<{ Params: IdParams }>("/orders/:id", { schema: { params: idParams } }, (request) => service.get(request.params.id));

        api.post<{ Body: OrderInput }>("/orders", { schema: { body: orderInputSchema } }, async (request, reply) =>
            reply.code(201).send(await service.create(request.body))
        );

        api.put<{ Params: IdParams; Body: OrderReplace }>(
            "/orders/:id",
            { schema: { params: idParams, body: orderReplaceSchema } },
            (request) => service.replace(request.params.id, request.body)
        );

        api.patch<{ Params: IdParams; Body: StatusChange }>(
            "/orders/:id",
            { schema: { params: idParams, body: statusChangeSchema } },
            (request) => service.changeStatus(request.params.id, request.body.status)
        );

        api.delete<{ Params: IdParams }>("/orders/:id", { schema: { params: idParams } }, async (request, reply) => {
            await service.remove(request.params.id);
            return reply.code(204).send();
        });
    };
}
