import { withTempDb } from "../../helpers/withTempDb";
import { db, initDb } from "src/module/shared/infrastructure/db/database";
import { EntriesRepositoryLowdb } from "src/module/entries/infrastructure/repository/EntriesRepositoryLowdb";

describe("EntriesRepositoryLowdb (integration)", () => {
  it("findByDay filtra por prefijo YYYY-MM-DD (UTC)", withTempDb(async () => {
    initDb(); // usa DB_PATH temporal
    const repo = new EntriesRepositoryLowdb();

    // Arrange: insertamos directo en db para simular datos pre-existentes
    db.read();
    (db.data!.entries as any[]).push(
      { id: "e1", userId: "u1", foodId: "f1", grams: 100, dateISO: "2025-10-21T00:00:00.000Z", createdAt: "now" },
      { id: "e2", userId: "u1", foodId: "f1", grams: 50,  dateISO: "2025-10-21T12:00:00.000Z", createdAt: "now" },
      { id: "e3", userId: "u1", foodId: "f1", grams: 30,  dateISO: "2025-10-22T00:00:00.000Z", createdAt: "now" },
    );
    db.write();

    // Act
    const out = await repo.findByDay("u1", "2025-10-21");

    // Assert
    expect(out.map(e => e.id)).toEqual(["e1", "e2"]);
    expect(out.every(e => e.dateISO.startsWith("2025-10-21"))).toBe(true);
  }));
});