import { ListWeightLogs } from "src/module/weightLogs/application/ListWeightLogs";
import { WeightLog, type WeightLogCreateProps } from "src/module/weightLogs/domain/WeightLog";

// Helper para construir WeightLog válidos
function makeLog(over: Partial<WeightLogCreateProps> & { userId: string; dateISO: string }) {
  return WeightLog.create({
    id: over.id ?? "wl_1",
    userId: over.userId,
    dateISO: over.dateISO,
    weightKg: over.weightKg ?? 80,
    bodyFat: over.bodyFat,
    createdAt: over.createdAt ?? "now",
  });
}

// Fake repo que cumple el contrato nuevo (dominio)
function makeRepo(data: WeightLog[]) {
  return {
    async listByUser(userId: string, range?: { from?: string; to?: string }) {
      const all = data.filter((x) => x.userId === userId);
      if (!range?.from && !range?.to) return all;

      // Inclusivo por día: YYYY-MM-DD → comparamos por prefijo de fecha (slice 0..10)
      return all.filter((w) => {
        const d = w.dateISO.slice(0, 10);
        return (!range.from || d >= range.from) && (!range.to || d <= range.to);
      });
    },

    // No se usa en este test, pero la interfaz real lo expone
    async create(log: WeightLog) {
      data.push(log);
      return log;
    },
  };
}

describe("ListWeightLogs (application)", () => {
  it("from > to → RANGE_INVALID", async () => {
    const uc = new ListWeightLogs(makeRepo([]) as any);
    await expect(
      uc.run({ userId: "u1", from: "2025-10-20", to: "2025-10-10" })
    ).rejects.toMatchObject({ code: "RANGE_INVALID" });
  });

  it("filtra inclusivo", async () => {
    const repo = makeRepo([
      makeLog({ userId: "u1", dateISO: "2025-10-10T00:00:00.000Z", weightKg: 80 }),
      makeLog({ userId: "u1", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 79 }),
      makeLog({ userId: "u1", dateISO: "2025-10-30T00:00:00.000Z", weightKg: 78 }),
      makeLog({ userId: "u2", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 82 }),
    ]);

    const uc = new ListWeightLogs(repo as any);
    const out = await uc.run({ userId: "u1", from: "2025-10-15", to: "2025-10-25" });

    // Comprobamos subset relevante para no depender de id/createdAt
    expect(out.map((x) => ({ userId: x.userId, dateISO: x.dateISO.slice(0, 10), weightKg: x.weightKg })))
      .toEqual([{ userId: "u1", dateISO: "2025-10-20", weightKg: 79 }]);
  });
});