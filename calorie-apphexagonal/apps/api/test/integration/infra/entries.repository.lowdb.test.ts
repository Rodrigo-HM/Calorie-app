import { withTempDb } from "../../helpers/withTempDb";

describe("EntriesRepositoryLowdb (integration)", () => {
  it(
    "findByDay filtra por prefijo YYYY-MM-DD (UTC)",
    withTempDb(async ({ requireModule }) => {
      const { db, initDb } = requireModule<typeof import("src/module/shared/infrastructure/db/database")>(
        "src/module/shared/infrastructure/db/database"
      );
      const { EntriesRepositoryLowdb } = requireModule<typeof import("src/module/entries/infrastructure/repository/EntriesRepositoryLowdb")>(
        "src/module/entries/infrastructure/repository/EntriesRepositoryLowdb"
      );

      initDb();
      db.read();
      db.data!.entries = []; // asegúrate de limpiar por si acaso
      (db.data!.entries as any[]).push(
        { id: "e1", userId: "u1", foodId: "f1", grams: 100, dateISO: "2025-10-21T00:00:00.000Z", createdAt: "now" },
        { id: "e2", userId: "u1", foodId: "f1", grams: 50,  dateISO: "2025-10-21T12:00:00.000Z", createdAt: "now" },
        { id: "e3", userId: "u1", foodId: "f1", grams: 30,  dateISO: "2025-10-22T00:00:00.000Z", createdAt: "now" },
      );
      db.write();

      const repo = new EntriesRepositoryLowdb();
      const out = await repo.findByDay("u1", "2025-10-21");

      expect(out.map((e: any) => e.id)).toEqual(["e1", "e2"]);
      expect(out.every((e: any) => e.dateISO.startsWith("2025-10-21"))).toBe(true);
    })
  );
});