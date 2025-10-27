import { WeightLogsRepository } from "../../../src/module/weightLogs/infrastructure/repository/WeightLogsRepository";
import { db } from "../../../src/module/shared/infrastructure/db/database";

describe("WeightLogsRepository (infra)", () => {
  let repo: WeightLogsRepository;

  beforeEach(() => {
    db.read();
    (db.data as any).weightLogs = [];
    db.write();
    repo = new WeightLogsRepository();
  });

  it("sin rango devuelve todos los logs del usuario", async () => {
    await repo.create("u1", { id: "w1", dateISO: "2025-10-10T00:00:00.000Z", weightKg: 80, createdAt: "2025-10-10T00:00:00.000Z" });
    await repo.create("u1", { id: "w2", dateISO: "2025-10-20T12:00:00.000Z", weightKg: 79, createdAt: "2025-10-20T12:00:00.000Z" });
    await repo.create("u2", { id: "w3", dateISO: "2025-10-20T12:00:00.000Z", weightKg: 82, createdAt: "2025-10-20T12:00:00.000Z" });

    const out = await repo.listByUser("u1");
    expect(out.map(x => x.userId)).toEqual(["u1", "u1"]);
  });

  it("from YYYY-MM-DD → T00:00:00.000Z inclusivo", async () => {
    await repo.create("u1", { id: "w1", dateISO: "2025-10-19T23:59:59.999Z", weightKg: 80, createdAt: "2025-10-19T23:59:59.999Z" });
    await repo.create("u1", { id: "w2", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 79, createdAt: "2025-10-20T00:00:00.000Z" });
    await repo.create("u1", { id: "w3", dateISO: "2025-10-20T12:00:00.000Z", weightKg: 78, createdAt: "2025-10-20T12:00:00.000Z" });

    const out = await repo.listByUser("u1", { from: "2025-10-20" });
    expect(out.map(x => x.id)).toEqual(["w2", "w3"]);
  });

  it("to YYYY-MM-DD → T23:59:59.999Z inclusivo", async () => {
    await repo.create("u1", { id: "w1", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 80, createdAt: "2025-10-20T00:00:00.000Z" });
    await repo.create("u1", { id: "w2", dateISO: "2025-10-20T23:59:59.999Z", weightKg: 79, createdAt: "2025-10-20T23:59:59.999Z" });
    await repo.create("u1", { id: "w3", dateISO: "2025-10-21T00:00:00.000Z", weightKg: 78, createdAt: "2025-10-21T00:00:00.000Z" });

    const out = await repo.listByUser("u1", { to: "2025-10-20" });
    expect(out.map(x => x.id)).toEqual(["w1", "w2"]);
  });

  it("combina from y to (ambos inclusivos)", async () => {
    await repo.create("u1", { id: "w1", dateISO: "2025-10-10T00:00:00.000Z", weightKg: 80, createdAt: "2025-10-10T00:00:00.000Z" });
    await repo.create("u1", { id: "w2", dateISO: "2025-10-20T12:00:00.000Z", weightKg: 79, createdAt: "2025-10-20T12:00:00.000Z" });
    await repo.create("u1", { id: "w3", dateISO: "2025-10-30T23:59:59.999Z", weightKg: 78, createdAt: "2025-10-30T23:59:59.999Z" });
    await repo.create("u1", { id: "w4", dateISO: "2025-11-01T00:00:00.000Z", weightKg: 77, createdAt: "2025-11-01T00:00:00.000Z" });

    const out = await repo.listByUser("u1", { from: "2025-10-20", to: "2025-10-30" });
    expect(out.map(x => x.id)).toEqual(["w2", "w3"]);
  });
});
