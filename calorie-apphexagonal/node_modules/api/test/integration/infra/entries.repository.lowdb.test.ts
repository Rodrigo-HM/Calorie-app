import { EntriesRepositoryLowdb } from "src/module/entries/infrastructure/repository/EntriesRepositoryLowdb";
import { db } from "src/module/shared/infrastructure/db/database";

describe("EntriesRepositoryLowdb (integration)", () => {
  it("listByUserAndDay filtra por usuario y día", async () => {
    // Prepara DB (usa withTempDb si lo tienes)
    db.read();
    db.data!.entries = [
      { id: "e1", userId: "u1", foodId: "f1", grams: 100, dateISO: "2025-11-03T01:00:00.000Z", createdAt: "now" },
      { id: "e2", userId: "u1", foodId: "f1", grams: 50,  dateISO: "2025-11-04T01:00:00.000Z", createdAt: "now" },
      { id: "e3", userId: "u2", foodId: "f1", grams: 70,  dateISO: "2025-11-03T02:00:00.000Z", createdAt: "now" },
    ];
    db.write();

    const repo = new EntriesRepositoryLowdb();
    const out = await repo.listByUserAndDay("u1", "2025-11-03");
    expect(out.map(e => e.id)).toEqual(["e1"]);
  });
});