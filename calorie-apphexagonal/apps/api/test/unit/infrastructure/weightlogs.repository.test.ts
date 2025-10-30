import { WeightLogsRepositoryLowdb } from "../../../src/module/weightLogs/infrastructure/repository/WeightLogsRepositoryLowdb";
import { db } from "../../../src/module/shared/infrastructure/db/database";
import type { StoredWeightLog } from "../../../src/module/weightLogs/aplication/ports/WeightLogsRepository";

describe("WeightLogsRepository (infra)", () => {
  let repo: WeightLogsRepositoryLowdb;

  beforeEach(() => {
    db.read();
    (db.data as any).weightLogs = [];
    db.write();
    repo = new WeightLogsRepositoryLowdb();
  });

  it("sin rango devuelve todos los logs del usuario", async () => {
    await repo.create("u1", { dateISO: "2025-10-10T00:00:00.000Z", weightKg: 80 });
    await repo.create("u1", { dateISO: "2025-10-20T12:00:00.000Z", weightKg: 79 });
    await repo.create("u2", { dateISO: "2025-10-20T12:00:00.000Z", weightKg: 82 });

    const out: StoredWeightLog[] = await repo.listByUser("u1");
    expect(out.map((x: StoredWeightLog) => x.userId)).toEqual(["u1", "u1"]);
  });

  it("from YYYY-MM-DD → T00:00:00.000Z inclusivo", async () => {
    await repo.create("u1", { dateISO: "2025-10-19T23:59:59.999Z", weightKg: 80 });
    await repo.create("u1", { dateISO: "2025-10-20T00:00:00.000Z", weightKg: 79 });
    await repo.create("u1", { dateISO: "2025-10-20T12:00:00.000Z", weightKg: 78 });

    const out: StoredWeightLog[] = await repo.listByUser("u1", { from: "2025-10-20" });
    const iso = out.map((x: StoredWeightLog) => x.dateISO);
    expect(iso).toEqual(["2025-10-20T00:00:00.000Z", "2025-10-20T12:00:00.000Z"]);
  });

  it("to YYYY-MM-DD → T23:59:59.999Z inclusivo", async () => {
    await repo.create("u1", { dateISO: "2025-10-20T00:00:00.000Z", weightKg: 80 });
    await repo.create("u1", { dateISO: "2025-10-20T23:59:59.999Z", weightKg: 79 });
    await repo.create("u1", { dateISO: "2025-10-21T00:00:00.000Z", weightKg: 78 });

    const out: StoredWeightLog[] = await repo.listByUser("u1", { to: "2025-10-20" });
    const iso = out.map((x: StoredWeightLog) => x.dateISO);
    expect(iso).toEqual(["2025-10-20T00:00:00.000Z", "2025-10-20T23:59:59.999Z"]);
  });

  it("combina from y to (ambos inclusivos)", async () => {
    await repo.create("u1", { dateISO: "2025-10-10T00:00:00.000Z", weightKg: 80 });
    await repo.create("u1", { dateISO: "2025-10-20T12:00:00.000Z", weightKg: 79 });
    await repo.create("u1", { dateISO: "2025-10-30T23:59:59.999Z", weightKg: 78 });
    await repo.create("u1", { dateISO: "2025-11-01T00:00:00.000Z", weightKg: 77 });

    const out: StoredWeightLog[] = await repo.listByUser("u1", { from: "2025-10-20", to: "2025-10-30" });
    const iso = out.map((x: StoredWeightLog) => x.dateISO);
    expect(iso).toEqual(["2025-10-20T12:00:00.000Z", "2025-10-30T23:59:59.999Z"]);
  });
});