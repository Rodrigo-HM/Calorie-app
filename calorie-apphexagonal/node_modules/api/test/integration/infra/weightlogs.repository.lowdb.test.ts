import { withTempDb } from "../../helpers/withTempDb";
import { db, initDb } from "src/module/shared/infrastructure/db/database";
import { WeightLogsRepositoryLowdb } from "src/module/weightLogs/infrastructure/repository/WeightLogsRepositoryLowdb";

describe("WeightLogsRepositoryLowdb (integration)", () => {
  it("listByUser aplica from/to inclusivos con YYYY-MM-DD", withTempDb(async () => {
    initDb();
    const repo = new WeightLogsRepositoryLowdb();
    db.read();
    (db.data!.weightLogs as any[]).push(
      { id: "w1", userId: "u1", dateISO: "2025-10-19T23:59:59.999Z", weightKg: 80, createdAt: "now" },
      { id: "w2", userId: "u1", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 79, createdAt: "now" },
      { id: "w3", userId: "u1", dateISO: "2025-10-20T23:59:59.999Z", weightKg: 78, createdAt: "now" }
    );
    db.write();

    const out = await repo.listByUser("u1", { from: "2025-10-20", to: "2025-10-20" });
    expect(out.map(w => w.id)).toEqual(["w2", "w3"]);
  }));
});