import { withTempDb } from "../../helpers/withTempDb";

describe("WeightLogsRepositoryLowdb (integration)", () => {
  it(
    "listByUser aplica from/to inclusivos con YYYY-MM-DD",
    withTempDb(async ({ requireModule }) => {
      // Carga aislada de módulos con DB_PATH propio
      const { db, initDb } = requireModule<typeof import("src/module/shared/infrastructure/db/database")>(
        "src/module/shared/infrastructure/db/database"
      );
      const { WeightLogsRepositoryLowdb } = requireModule<typeof import("src/module/weightLogs/infrastructure/repository/WeightLogsRepositoryLowdb")>(
        "src/module/weightLogs/infrastructure/repository/WeightLogsRepositoryLowdb"
      );

      // Inicializa y limpia
      initDb();
      db.read();
      db.data!.weightLogs = []; // ← IMPORTANTÍSIMO: limpia el array
      (db.data!.weightLogs as any[]).push(
        { id: "w1", userId: "u1", dateISO: "2025-10-19T23:59:59.999Z", weightKg: 80, createdAt: "now" },
        { id: "w2", userId: "u1", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 79, createdAt: "now" },
        { id: "w3", userId: "u1", dateISO: "2025-10-20T23:59:59.999Z", weightKg: 78, createdAt: "now" },
        { id: "w4", userId: "u1", dateISO: "2025-10-21T00:00:00.000Z", weightKg: 77, createdAt: "now" }
      );
      db.write();

      const repo = new WeightLogsRepositoryLowdb();

      // Act: rango inclusivo (solo día 20)
      const out = await repo.listByUser("u1", { from: "2025-10-20", to: "2025-10-20" });

      // Assert: solo w2 y w3 (los de ese día)
      expect(out.map(w => w.id)).toEqual(["w2", "w3"]);
    })
  );
});