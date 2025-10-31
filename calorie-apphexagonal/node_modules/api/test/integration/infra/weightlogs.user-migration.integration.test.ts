import { withTempDb } from "../../helpers/withTempDb";

describe("DB migration: weightLogs userId legacy → único usuario", () => {
  it(
    "reasigna weightLogs con userId 'u1' o vacío al único usuario existente",
    withTempDb(async ({ requireModule }) => {
      const { db, initDb } = requireModule<typeof import("src/module/shared/infrastructure/db/database")>(
        "src/module/shared/infrastructure/db/database"
      );

      // Prepara DB con 1 usuario real y logs legacy
      initDb();
      db.read();
      db.data!.users = [
        { id: "U_REAL", email: "me@example.com", passwordHash: "x", createdAt: new Date().toISOString() },
      ];
      db.data!.weightLogs = [
        { id: "wl1", userId: "u1", date: "2024-01-15T00:00:00.000Z", weightKg: 75, createdAt: "legacy" }, // legacy u1
        { id: "wl2", userId: null as any, dateISO: "2024-02-01T00:00:00.000Z", weightKg: 76, createdAt: "legacy" }, // legacy vacío
        { id: "wl3", userId: "U_REAL", dateISO: "2024-03-01T00:00:00.000Z", weightKg: 77, createdAt: "ok" },       // ya correcto
      ] as any[];
      db.write();

      // Ejecuta la migración (esto debe existir y ser llamada en buildApp)
      const { migrateWeightLogsUserToSingleUser } = requireModule<
        typeof import("src/module/shared/infrastructure/db/database")
      >("src/module/shared/infrastructure/db/database");

      await migrateWeightLogsUserToSingleUser(); // ← test la requiere

      db.read();
      const logs = db.data!.weightLogs as any[];

      // Espera: wl1 y wl2 reasignados a U_REAL; wl3 se mantiene
      const m = Object.fromEntries(logs.map(w => [w.id, w.userId]));
      expect(m["wl1"]).toBe("U_REAL");
      expect(m["wl2"]).toBe("U_REAL");
      expect(m["wl3"]).toBe("U_REAL");
    })
  );
});