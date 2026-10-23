import { beforeEach, describe, expect, it } from "vitest";
import { OrderService } from "../../../server/src/application/OrderService.js";
import { OrderNotFoundError } from "../../../server/src/domain/order.js";
import type { OrderCodeGenerator } from "../../../server/src/domain/orderCode.js";
import { InMemoryOrderRepository } from "../../support/InMemoryOrderRepository.js";
import { makeOrder, validInput } from "../../support/fixtures.js";

// The use cases with no database and no HTTP: a fake repository and a fake code format.
class StubCodes implements OrderCodeGenerator {
    generate(id: number): string {
        return `T-${id}`;
    }
}

let repository: InMemoryOrderRepository;
let service: OrderService;

beforeEach(() => {
    repository = new InMemoryOrderRepository([
        makeOrder({ id: 1, code: "T-1", status: "completed" }),
        makeOrder({ id: 2, code: "T-2", status: "pending" }),
    ]);
    service = new OrderService(repository, new StubCodes());
});

describe("create", () => {
    it("assigns the next id, a code from the generator, and the pending status", async () => {
        const created = await service.create(validInput);

        expect(created).toMatchObject({ ...validInput, id: 3, code: "T-3", status: "pending" });
        expect(await repository.findById(3)).toEqual(created);
    });

    it("owns id, code and status: values a caller sneaks into the input are ignored", async () => {
        const sneaky = { ...validInput, id: 1, code: "HACK", status: "completed" } as typeof validInput;

        expect(await service.create(sneaky)).toMatchObject({ id: 3, code: "T-3", status: "pending" });
    });

    it("never reuses an id", async () => {
        const first = await service.create(validInput);
        await service.remove(first.id);
        expect((await service.create(validInput)).id).toBe(4);
    });

    it("lets the generator decide the format of the code", async () => {
        const custom = new OrderService(repository, { generate: (id) => `CUSTOM/${id}` });
        expect((await custom.create(validInput)).code).toBe("CUSTOM/3");
    });
});

describe("get and list", () => {
    it("lists every order", async () => {
        expect((await service.list()).map((o) => o.id)).toEqual([1, 2]);
    });

    it("gets one order", async () => {
        expect((await service.get(2)).code).toBe("T-2");
    });

    it("fails with OrderNotFoundError for an unknown id", async () => {
        await expect(service.get(99)).rejects.toBeInstanceOf(OrderNotFoundError);
        await expect(service.get(99)).rejects.toMatchObject({ orderId: 99 });
    });
});

describe("replace", () => {
    it("changes the editable fields and keeps id, code and status", async () => {
        const replaced = await service.replace(2, { ...validInput, client: "Nuevo" });

        expect(replaced).toMatchObject({ id: 2, code: "T-2", status: "pending", client: "Nuevo" });
    });

    it("applies a status when the body carries one", async () => {
        expect((await service.replace(2, { ...validInput, status: "cancelled" })).status).toBe("cancelled");
    });

    it("fails with OrderNotFoundError for an unknown id", async () => {
        await expect(service.replace(99, validInput)).rejects.toBeInstanceOf(OrderNotFoundError);
    });
});

describe("changeStatus", () => {
    it("changes only the status", async () => {
        const before = await service.get(2);

        expect(await service.changeStatus(2, "in_progress")).toEqual({ ...before, status: "in_progress" });
    });

    it("sends the repository only the status, so a field changed elsewhere in the meantime is not overwritten", async () => {
        const writes: Array<[number, object]> = [];
        const spying = new InMemoryOrderRepository([makeOrder({ id: 1 })]);
        const original = spying.update.bind(spying);
        spying.update = async (id, changes) => (writes.push([id, changes]), original(id, changes));

        await new OrderService(spying, new StubCodes()).changeStatus(1, "completed");

        expect(writes).toEqual([[1, { status: "completed" }]]);
    });

    it("fails with OrderNotFoundError for an unknown id", async () => {
        await expect(service.changeStatus(99, "completed")).rejects.toBeInstanceOf(OrderNotFoundError);
    });
});

describe("remove", () => {
    it("deletes the order", async () => {
        await service.remove(1);
        expect((await service.list()).map((o) => o.id)).toEqual([2]);
    });

    it("fails with OrderNotFoundError when there is nothing to delete", async () => {
        await expect(service.remove(99)).rejects.toBeInstanceOf(OrderNotFoundError);
    });
});
