import request from "supertest";
import { withTempDb } from "../../helpers/withTempDb";

describe("WeightLogs routes (legacy compat)", () => {
  it(
    "GET /api/users/me/weight-logs incluye registros legacy (solo 'date') y responde con 'date'",
    withTempDb(async ({ requireModule }) => {
      process.env.NODE_ENV = "test";
      process.env.AUTH_DISABLED = "true";

      const { db, initDb } = requireModule<typeof import("src/module/shared/infrastructure/db/database")>(
        "src/module/shared/infrastructure/db/database"
      );
      const { buildApp } = requireModule<typeof import("src/module/shared/infrastructure/http/express/AppBuilder")>(
        "src/module/shared/infrastructure/http/express/appBuilder"
      );

      initDb();
      // seed legacy y moderno
      db.read();
      db.data!.weightLogs = [
        { id: "wl_legacy", userId: "u1", date: "2024-01-15T00:00:00.000Z", weightKg: 75, createdAt: "legacy" },
        { id: "wl_new", userId: "u1", dateISO: "2024-02-01T00:00:00.000Z", weightKg: 76, createdAt: "new" },
      ] as any[];
      db.write();

      const app = buildApp();

      const res = await request(app).get("/api/users/me/weight-logs").expect(200);

      // Debe incluir ambos
      expect(res.body.map((w: any) => w.id)).toEqual(["wl_legacy", "wl_new"]);
      // Debe tener 'date' (alias), que el front usa
      const legacy = res.body.find((w: any) => w.id === "wl_legacy");
      expect(legacy).toHaveProperty("date", "2024-01-15T00:00:00.000Z");
    })
  );
});