import { withTempDb } from "../../helpers/withTempDb";

describe("WeightLogsRepositoryLowdb (legacy compat)", () => {
  it(
    "incluye registros legacy con solo 'date' (sin 'dateISO') y normaliza a dateISO",
    withTempDb(async ({ requireModule }) => {
      const { db, initDb } = requireModule<typeof import("src/module/shared/infrastructure/db/database")>(
        "src/module/shared/infrastructure/db/database"
      );
      const { WeightLogsRepositoryLowdb } = requireModule<typeof import("src/module/weightLogs/infrastructure/repository/WeightLogsRepositoryLowdb")>(
        "src/module/weightLogs/infrastructure/repository/WeightLogsRepositoryLowdb"
      );

      initDb();
      db.read();
      db.data!.weightLogs = [
        // Registro legacy: solo 'date'
        { id: "wl_legacy", userId: "u1", date: "2024-01-15T00:00:00.000Z", weightKg: 75, createdAt: "legacy" },
        // Registro moderno: tiene dateISO
        { id: "wl_new", userId: "u1", dateISO: "2024-02-01T00:00:00.000Z", weightKg: 76, createdAt: "new" },
      ] as any[];
      db.write();

      const repo = new WeightLogsRepositoryLowdb();
      const out = await repo.listByUser("u1");

      // Debe incluir ambos
      expect(out.map(w => w.id)).toEqual(["wl_legacy", "wl_new"]);
      // Debe normalizar siempre dateISO
      const legacy = out.find(w => w.id === "wl_legacy")!;
      expect(legacy).toHaveProperty("dateISO", "2024-01-15T00:00:00.000Z");
    })
  );
});